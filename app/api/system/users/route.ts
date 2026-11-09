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

    // 0. Action: Create User (does not require existing userId)
    if (action === 'create_user') {
      const { name, email, role, status, balance, currency: userCurrency, password } = body;
      if (!email || !email.includes('@')) {
        return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (db.getUser(normalizedEmail)) {
        return NextResponse.json({ error: 'A developer account with this email address already exists' }, { status: 400 });
      }

      const newId = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const initialBalance = parseFloat(balance) || 0;
      const sanitizedRole = (role === 'admin' || role === 'administrator') ? 'developer' : (role || 'developer');

      const newUser = {
        id: newId,
        name: name?.trim() || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: sanitizedRole,
        status: status || 'active',
        balance: initialBalance,
        balance_usd: initialBalance,
        balance_bdt: initialBalance * (db.exchangeRateSettings?.rate || 122.5),
        granted_usd: 0,
        currency: (userCurrency || 'USD') as 'USD' | 'BDT',
        password_hash: password ? `plain:${password}` : undefined,
        created_at: new Date().toISOString(),
        restricted_until: null,
        restriction_reason: null,
      };

      db.users.set(newUser.id, newUser as any);
      db.users.set(newUser.email, newUser as any);
      db.persist();

      db.addAuditLog({
        admin_email: 'admin@fobign.com',
        action: 'USER_CREATED',
        category: 'Access',
        target_resource: `${newUser.id} (${newUser.email})`,
        details: `Created new developer account with role ${newUser.role} and starting balance $${initialBalance.toFixed(2)} ${newUser.currency}.`,
      });

      return NextResponse.json({ success: true, user: newUser });
    }

    const user = db.getUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Password Update Action
    if (action === 'change_password') {
      const { new_password } = body;
      if (!new_password || new_password.trim().length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
      }
      user.password_hash = `plain:${new_password.trim()}`;
      db.persist();

      db.addAuditLog({
        admin_email: 'admin@fobign.com',
        action: 'PASSWORD_CHANGED',
        category: 'Security',
        target_resource: `${user.id} (${user.email})`,
        details: `Administrator changed password credentials for user ${user.email}.`,
      });

      return NextResponse.json({ success: true, message: 'Password updated successfully.' });
    }

    // Password Reset Email Dispatch Action
    if (action === 'send_password_reset') {
      const mailSettings = db.getMailSettings();
      const resetToken = crypto.randomUUID();
      const resetUrl = `https://platform.fobign.com/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
      const mailSubject = 'Reset Your Fobign Developer Password';
      const mailText = `Hello ${user.name || 'Developer'},\n\nA password reset request was initiated for your Fobign account.\n\nClick the link below to set a new password:\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.\n\n— Fobign Security Team`;

      let mailStatus: 'sent' | 'failed' = 'sent';
      let mailErr: string | undefined = undefined;

      const apiKey = mailSettings.resend?.api_key?.trim() || mailSettings.api_key?.trim();
      if (apiKey) {
        try {
          const fromEmail = mailSettings.resend?.from_email?.trim() || mailSettings.sender_email || 'noreply@fobign.com';
          const fromName = mailSettings.resend?.from_name?.trim() || mailSettings.sender_name || 'Fobign Platform';
          const r = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: `${fromName} <${fromEmail}>`,
              to: [user.email],
              subject: mailSubject,
              text: mailText,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #ffffff; color: #111111; border: 1px solid #e5e5e5; border-radius: 12px;">
                  <div style="font-weight: 800; font-size: 18px; margin-bottom: 12px; letter-spacing: -0.5px;">FOBIGN</div>
                  <h3 style="font-size: 16px; margin: 0 0 12px; color: #111;">${mailSubject}</h3>
                  <p style="font-size: 14px; color: #333; line-height: 1.6;">Hello ${user.name || 'Developer'},</p>
                  <p style="font-size: 14px; color: #333; line-height: 1.6;">A password reset request was initiated for your Fobign account.</p>
                  <div style="margin: 20px 0;">
                    <a href="${resetUrl}" style="background: #000000; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">Reset Password</a>
                  </div>
                  <p style="font-size: 12px; color: #666;">Or copy this URL into your browser:<br/><code style="word-break: break-all;">${resetUrl}</code></p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                  <p style="font-size: 11px; color: #888;">If you did not request this, please disregard this email.</p>
                </div>
              `,
            }),
          });
          if (!r.ok) {
            const ed = await r.json();
            mailStatus = 'failed';
            mailErr = ed.message || `HTTP ${r.status}`;
          }
        } catch (e: any) {
          mailStatus = 'failed';
          mailErr = e.message;
        }
      }

      db.addMailLog({
        to: user.email,
        subject: mailSubject,
        body: mailText,
        provider: mailSettings.active_provider || 'resend',
        status: mailStatus,
        error: mailErr,
      });

      db.addAuditLog({
        admin_email: 'admin@fobign.com',
        action: 'PASSWORD_RESET_DISPATCHED',
        category: 'Security',
        target_resource: `${user.id} (${user.email})`,
        details: `Sent password reset email to ${user.email}. Status: ${mailStatus}${mailErr ? ` (${mailErr})` : ''}`,
      });

      return NextResponse.json({
        success: true,
        message: mailStatus === 'sent'
          ? `Password reset email dispatched to ${user.email}.`
          : `Password reset link generated and logged to mail records. (Mail gateway status: ${mailErr || 'logged'})`,
        reset_url: resetUrl,
      });
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
    if (body.role !== undefined) {
      user.role = (body.role === 'admin' || body.role === 'administrator') ? 'developer' : body.role;
    }
    if (body.password) {
      user.password_hash = `plain:${body.password.trim()}`;
    }
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
