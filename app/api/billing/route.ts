import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Billing } from '@/lib/types';

function generate12CharTrxId(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = 'TRX';
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateUuidV4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  const all = req.nextUrl.searchParams.get('all') === 'true' || !userId;

  let billings: Billing[] = [];
  if (all) {
    billings = db.getAllBillings();
  } else {
    billings = db.getUserBillings(userId);
  }

  // Ensure every billing has a 12-char trx_id and uuidv4 invoice_no
  billings = billings.map((b) => {
    let updated = false;
    if (!b.trx_id) {
      b.trx_id = generate12CharTrxId();
      updated = true;
    }
    if (!b.invoice_no || !b.invoice_no.includes('-')) {
      b.invoice_no = generateUuidV4();
      updated = true;
    }
    const user = db.getUser(b.user_id);
    return {
      ...b,
      user_email: user?.email || b.user_id,
      user_name: user?.name || 'Developer',
    };
  });

  return NextResponse.json({
    invoices: billings,
    total: billings.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, invoice_no, invoice_nos, amount, currency, paymentMethod, userId, billing_address } = body;

    // Refund Action
    if (action === 'refund') {
      const billing = db.billings.find((b) => b.invoice_no === invoice_no || b.id === invoice_no);
      if (!billing) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
      billing.status = 'Refunded';
      // Deduct from balance
      db.updateUserBalance(billing.user_id, -billing.amount, billing.currency);
      db.persist();

      db.addAuditLog({
        admin_email: 'admin@fobign.com',
        action: 'INVOICE_REFUND',
        category: 'Financial',
        target_resource: billing.invoice_no,
        details: `Refunded invoice for $${billing.amount} ${billing.currency}`,
      });

      return NextResponse.json({ success: true, billing });
    }

    // Bulk Refund Action
    if (action === 'bulk_refund' && Array.isArray(invoice_nos)) {
      invoice_nos.forEach((invNo) => {
        const b = db.billings.find((item) => item.invoice_no === invNo || item.id === invNo);
        if (b && b.status !== 'Refunded') {
          b.status = 'Refunded';
          db.updateUserBalance(b.user_id, -b.amount, b.currency);
        }
      });
      db.persist();
      return NextResponse.json({ success: true, count: invoice_nos.length });
    }

    // Update Billing Address
    if (action === 'update_address' && invoice_no && billing_address) {
      const billing = db.billings.find((b) => b.invoice_no === invoice_no || b.id === invoice_no);
      if (billing) {
        billing.billing_address = billing_address;
        db.persist();
      }
      return NextResponse.json({ success: true, billing });
    }

    // Create New Billing Top-Up
    const effectiveUserId = userId || 'usr_guest';
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    const uuid = generateUuidV4();
    const trxId = generate12CharTrxId();

    const newInvoice: Billing = {
      id: `inv_${Date.now()}`,
      invoice_no: uuid,
      trx_id: trxId,
      user_id: effectiveUserId,
      amount: parseFloat(Number(amount).toFixed(2)),
      currency: currency || 'USD',
      payment_method: paymentMethod || 'Card',
      status: 'Success',
      type: 'topped-up',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      billing_address,
    };

    db.addBilling(newInvoice);
    const user = db.getUser(effectiveUserId);

    return NextResponse.json({
      success: true,
      invoice: newInvoice,
      newBalance: user?.balance_usd || 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
