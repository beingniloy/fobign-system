import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const invoiceNo = body.invoiceNo || body.invoice_no;
    const userId = body.userId || body.user_id;

    if (!invoiceNo) {
      return NextResponse.json({ success: false, error: 'Invoice number is required' }, { status: 400 });
    }

    const billings = db.getAllBillings();
    let invoice = billings.find((b) => b.invoice_no === invoiceNo || b.id === invoiceNo);

    const targetUserId = invoice?.user_id || userId || 'usr_dev_1';

    if (!invoice) {
      const amount = Number(body.amount) || 10;
      const currency = body.currency === 'BDT' ? 'BDT' : 'USD';
      invoice = {
        id: invoiceNo,
        invoice_no: invoiceNo,
        user_id: targetUserId,
        amount: amount,
        currency: currency,
        payment_method: 'Paymently',
        status: 'Success',
        type: 'topped-up',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      db.addBilling(invoice);
      db.updateUserBalance(targetUserId, invoice.amount, invoice.currency);
      db.persist();
    } else if (invoice.status !== 'Success') {
      invoice.status = 'Success';
      db.updateUserBalance(targetUserId, invoice.amount, invoice.currency);
      db.persist();
    }

    const updatedUser = db.getUser(targetUserId);

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed and wallet balance credited.',
      invoice,
      user: updatedUser,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
