import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPaymentlyPayment } from '@/lib/payments/paymently';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ error: 'Missing body payload' }, { status: 400 });
    }

    // Check API Key from headers (case-insensitive)
    const headers = req.headers;
    const receivedKey =
      headers.get('mh-piprapay-api-key') ||
      headers.get('Mh-Piprapay-Api-Key') ||
      headers.get('MH-PIPRAPAY-API-KEY') ||
      '';

    const paymentMethods = db.getPaymentMethods();
    const paymentlyMethod = paymentMethods.find((m) => m.id === 'paymently');
    const configuredKey = paymentlyMethod?.api_key || process.env.PAYMENTLY_API_KEY || '';

    if (configuredKey && receivedKey !== configuredKey) {
      return NextResponse.json({ error: 'Invalid API Key' }, { status: 401 });
    }

    const invoiceId = rawBody.metadata?.invoiceid;
    const ppId = rawBody.pp_id;
    const status = (rawBody.status || '').toLowerCase();

    if (!invoiceId || !ppId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Verify status with Paymently server
    let isCompleted = status === 'completed';
    if (!isCompleted && configuredKey) {
      const verifyRes = await verifyPaymentlyPayment(
        ppId,
        configuredKey,
        paymentlyMethod?.base_url || 'https://paymently.link'
      );
      if (verifyRes.success && verifyRes.status === 'completed') {
        isCompleted = true;
      }
    }

    if (isCompleted) {
      // Find the invoice in billings
      const allBillings = db.getAllBillings();
      const invoice = allBillings.find((b) => b.invoice_no === invoiceId);

      if (invoice && invoice.status !== 'Success') {
        invoice.status = 'Success';
        db.updateUserBalance(invoice.user_id, invoice.amount, invoice.currency);
      }

      return NextResponse.json({ success: true, message: 'Payment verified and balance credited.' });
    }

    return NextResponse.json({ success: false, message: 'Payment status not completed.' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Webhook processing error' }, { status: 500 });
  }
}
