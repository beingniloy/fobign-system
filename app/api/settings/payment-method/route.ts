import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const paymentMethods = await db.getPaymentMethods();
    return NextResponse.json({ success: true, payment_methods: paymentMethods });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await db.savePaymentMethods(body.payment_methods || body);
    return NextResponse.json({
      success: true,
      message: 'Payment methods updated successfully',
      payment_methods: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
