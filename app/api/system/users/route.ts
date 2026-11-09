import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (userId) {
    const user = db.getUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const usage = db.getUserUsage(userId);
    const keys = db.getUserApiKeys(userId);
    const commLogs = db.getUserCommunicationLogs(userId);
    const tickets = db.getTickets().filter((t) => t.user_id === userId);
    return NextResponse.json({ user, usage, keys, commLogs, tickets });
  }

  const users = Array.from(db.users.values());
  const uniqueMap = new Map();
  users.forEach((u) => uniqueMap.set(u.id, u));
  const uniqueUsers = Array.from(uniqueMap.values());

  const enrichedUsers = uniqueUsers.map((u) => {
    const usage = db.getUserUsage(u.id);
    const totalTokens = usage.reduce((acc, curr) => acc + curr.total_tokens, 0);
    const keys = db.getUserApiKeys(u.id);
    const commLogs = db.getUserCommunicationLogs(u.id);
    return {
      ...u,
      total_tokens: totalTokens,
      api_keys_count: keys.length,
      communication_logs_count: commLogs.length,
    };
  });

  return NextResponse.json({ users: enrichedUsers });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, action, new_balance, currency, balanceAdjustment, grantedAdjustment, duration_hours, reason } = body;

    const user = db.getUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let changeSummary: string[] = [];

    // Credit / Debit Operation
    if (action === 'credit_debit') {
      const mode = (body.mode || 'credit') as 'credit' | 'debit';
      const amount = Math.abs(Number(body.amount) || 0);
      const isGranted = body.is_granted === true || body.type === 'granted';
      const reason = body.reason || (mode === 'credit' ? (isGranted ? 'Granted Promotional Quota' : 'Wallet Credit Top-up') : 'Account Balance Deduction');

      if (amount <= 0) {
        return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
      }

      if (mode === 'credit') {
        user.balance_usd = parseFloat(((user.balance_usd ?? 0) + amount).toFixed(4));
        user.balance = user.balance_usd;
        if (isGranted) {
          user.granted_usd = parseFloat(((user.granted_usd ?? 0) + amount).toFixed(4));
        }
      } else {
        user.balance_usd = parseFloat(((user.balance_usd ?? 0) - amount).toFixed(4));
        user.balance = user.balance_usd;
        if (isGranted && (user.granted_usd ?? 0) > 0) {
          user.granted_usd = Math.max(0, parseFloat(((user.granted_usd ?? 0) - amount).toFixed(4)));
        }
      }

      // Add to billings record so it appears in Billing / Transactions page (Granted tab if isGranted)
      const newInvoiceId = `inv_${Date.now()}`;
      const newInvoiceNo = crypto.randomUUID();
      const billingRecord = {
        id: newInvoiceId,
        invoice_no: newInvoiceNo,
        user_id: user.id,
        amount: amount,
        currency: 'USD' as const,
        payment_method: mode === 'credit' ? (isGranted ? 'System Grant' : 'Admin Credit') : 'Admin Debit',
        status: 'Success' as const,
        type: isGranted ? ('granted' as const) : ('topped-up' as const),
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };

      db.billings.unshift(billingRecord);
      db.persist();

      db.addAuditLog({
        admin_email: 'admin@fobign.com',
        action: mode === 'credit' ? (isGranted ? 'CREDIT_GRANTED' : 'BALANCE_CREDITED') : 'BALANCE_DEBITED',
        category: 'Financial',
        target_resource: `${user.id} (${user.email})`,
        details: `${mode === 'credit' ? 'Credited' : 'Debited'} $${amount.toFixed(2)} USD (${isGranted ? 'Granted Quota' : 'Wallet Balance'}). Reason: ${reason}. Invoice No: ${newInvoiceNo}`,
      });

      return NextResponse.json({
        success: true,
        message: `Successfully ${mode === 'credit' ? 'credited' : 'debited'} $${amount.toFixed(2)} USD. Transaction recorded in ${isGranted ? 'Granted' : 'Topped-up'} logs.`,
        user,
        billing: billingRecord,
      });
    }

    // 1. Balance adjustments
    if (balanceAdjustment !== undefined && Number(balanceAdjustment) !== 0) {
      user.balance_usd = parseFloat(((user.balance_usd ?? 0) + Number(balanceAdjustment)).toFixed(4));
      user.balance = user.balance_usd;
      changeSummary.push(`Balance adjustment: ${Number(balanceAdjustment) >= 0 ? '+' : ''}$${Number(balanceAdjustment).toFixed(2)} USD`);
    }

    if (grantedAdjustment !== undefined && Number(grantedAdjustment) !== 0) {
      user.granted_usd = parseFloat(((user.granted_usd ?? 0) + Number(grantedAdjustment)).toFixed(4));
      changeSummary.push(`Granted credits adjustment: ${Number(grantedAdjustment) >= 0 ? '+' : ''}$${Number(grantedAdjustment).toFixed(2)} USD`);
    }

    if (action === 'adjust_balance' && new_balance !== undefined) {
      user.balance = Number(new_balance);
      user.balance_usd = Number(new_balance);
      if (currency) {
        user.currency = currency;
      }
      changeSummary.push(`Set total balance directly to $${Number(new_balance).toFixed(2)} ${currency || 'USD'}`);
    }

    // 2. User status actions (restrict, suspend, ban, activate)
    if (action === 'restrict') {
      const hours = Number(duration_hours) || 24;
      const restrictedUntil = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
      db.updateUserStatus(userId, 'restricted', restrictedUntil, reason || `Restricted for ${hours} hours`);
      changeSummary.push(`Account restricted for ${hours} hours until ${restrictedUntil}`);
    } else if (action === 'suspend') {
      db.updateUserStatus(userId, 'suspended', null, reason || 'Account suspended by administrator');
      changeSummary.push(`Account suspended`);
    } else if (action === 'ban') {
      db.updateUserStatus(userId, 'banned', null, reason || 'Account permanently banned');
      changeSummary.push(`Account permanently banned`);
    } else if (action === 'activate') {
      db.updateUserStatus(userId, 'active', null, null);
      changeSummary.push(`Account reactivated/unbanned`);
    }

    db.persist();

    if (changeSummary.length > 0) {
      db.addAuditLog({
        admin_email: 'admin@fobign.com',
        action: action === 'adjust_balance' ? 'BALANCE_ADJUSTMENT' : 'USER_STATUS_CHANGE',
        category: action === 'adjust_balance' ? 'Financial' : 'Access',
        target_resource: `${user.id} (${user.email})`,
        details: changeSummary.join('; '),
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || req.nextUrl.searchParams.get('userId');
    const user = db.getUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (body.name !== undefined) user.name = body.name;
    if (body.email !== undefined) user.email = body.email;
    if (body.role !== undefined) user.role = body.role;
    if (body.balance !== undefined) {
      user.balance = Number(body.balance);
      user.balance_usd = Number(body.balance);
    }
    if (body.currency !== undefined) user.currency = body.currency;
    if (body.status !== undefined) {
      user.status = body.status;
      if (body.status === 'active') {
        user.restricted_until = null;
        user.restriction_reason = null;
      }
    }

    db.persist();

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
