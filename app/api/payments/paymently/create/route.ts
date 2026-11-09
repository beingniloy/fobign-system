import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createPaymentlyCharge } from '@/lib/payments/paymently';
import type { Billing } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { amount, currency = 'BDT', userId, fullName, email } = body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ success: false, error: 'Valid payment amount is required' }, { status: 400 });
    }

    const effectiveUserId = userId || 'usr_guest';
    const user = db.getUser(effectiveUserId);

    // Get Paymently settings from db
    const paymentMethods = db.getPaymentMethods();
    const paymentlyMethod = paymentMethods.find((m) =>
      m.id === 'paymently' ||
      m.id?.toLowerCase().includes('paymently') ||
      m.name?.toLowerCase().includes('paymently') ||
      m.base_url?.includes('paymently') ||
      (m.api_key && m.enabled)
    );

    let apiKey = (paymentlyMethod?.api_key || process.env.PAYMENTLY_API_KEY || '').trim();
    if (!apiKey) {
      try {
        const fs = require('fs');
        const path = require('path');
        const sharedPath = path.resolve(process.cwd(), '..', 'shared_payment_methods.json');
        if (fs.existsSync(sharedPath)) {
          const list = JSON.parse(fs.readFileSync(sharedPath, 'utf-8'));
          const found = list.find((m: any) =>
            m.id === 'paymently' ||
            m.name?.toLowerCase().includes('paymently') ||
            m.api_key
          );
          if (found && found.api_key) {
            apiKey = String(found.api_key).trim();
          }
        }
      } catch (e) {}
    }
    const baseUrl = paymentlyMethod?.base_url || 'https://paymently.link';

    let origin = 'https://platform.fobign.com';
    try {
      if (req.nextUrl && req.nextUrl.origin) {
        origin = req.nextUrl.origin;
      }
    } catch {
      // fallback
    }

    const invoiceNo = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Create a pending billing invoice record in DB
    const newInvoice: Billing = {
      id: `inv_${Date.now()}`,
      invoice_no: invoiceNo,
      user_id: effectiveUserId,
      amount: parseFloat(Number(amount).toFixed(2)),
      currency: currency === 'USD' ? 'USD' : 'BDT',
      payment_method: 'Paymently',
      status: 'Pending',
      type: 'topped-up',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    db.addBilling(newInvoice);

    // If API key is configured, create real Paymently charge
    if (apiKey) {
      const charge = await createPaymentlyCharge({
        apiKey,
        baseUrl,
        fullName: fullName || user?.name || 'Developer',
        emailOrMobile: email || user?.email || 'developer@fobign.com',
        amount: parseFloat(Number(amount).toFixed(2)),
        invoiceId: invoiceNo,
        redirectUrl: `${origin}/billing?payment_success=${invoiceNo}`,
        cancelUrl: `${origin}/top-up?payment_canceled=1`,
        webhookUrl: `${origin}/api/payments/paymently/webhook`,
        returnType: paymentlyMethod?.return_type || 'POST',
        currency,
      });

      if (charge.success && charge.paymentUrl) {
        return NextResponse.json({
          success: true,
          paymentUrl: charge.paymentUrl,
          invoiceNo,
        });
      }

      // If gateway returned an error message
      return NextResponse.json({
        success: false,
        error: charge.message || 'Paymently gateway could not initiate payment URL.',
        invoiceNo,
      }, { status: 400 });
    }

    // When Paymently API key is not configured, do not fake a success
    newInvoice.status = 'Pending';
    return NextResponse.json({
      success: false,
      error: 'Paymently API key is not configured. Please configure your Paymently API Key in Admin Settings > Payment Methods.',
      invoiceNo,
    }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
