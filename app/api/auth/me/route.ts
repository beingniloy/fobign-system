import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const user = db.getUser(userId);

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found in database' }, { status: 404 });
    }

    if (user.status === 'banned' || user.status === 'suspended') {
      return NextResponse.json({
        success: false,
        error: `Account is ${user.status}. Please contact support.`,
        status: user.status,
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        balance: user.balance ?? user.balance_usd ?? 0,
        currency: user.currency || 'USD',
        balance_usd: user.balance_usd ?? user.balance ?? 0,
        balance_bdt: user.balance_bdt ?? ((user.balance_usd || 0) * 122.5),
        granted_usd: user.granted_usd ?? 0,
        status: user.status || 'active',
        role: user.role || 'user',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
