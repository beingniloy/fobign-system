import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const settings = db.getCreditSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = db.saveCreditSettings({
      enabled: Boolean(body.enabled),
      min_deposit: Number(body.min_deposit ?? 10.0),
      max_deposit: Number(body.max_deposit ?? 10000.0),
      max_balance: Number(body.max_balance ?? 30000.0),
    });

    db.addAuditLog({
      admin_email: 'admin@fobign.com',
      action: 'CREDIT_SETTINGS_UPDATED',
      category: 'Financial',
      details: `Updated credit deposit limits: Min $${updated.min_deposit}, Max $${updated.max_deposit}, Max Balance $${updated.max_balance}. Enabled: ${updated.enabled}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Credit settings updated successfully.',
      settings: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
