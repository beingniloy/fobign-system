import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId, currency } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    if (currency !== 'USD' && currency !== 'BDT') {
      return NextResponse.json({ success: false, error: 'Supported currencies are USD and BDT only' }, { status: 400 });
    }

    const updatedUser = await db.setUserCurrency(userId, currency);
    const exchangeSettings = await db.getExchangeRateSettings();

    return NextResponse.json({
      success: true,
      message: `Currency changed to ${currency} successfully`,
      user: updatedUser,
      current_rate: exchangeSettings.rate,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
