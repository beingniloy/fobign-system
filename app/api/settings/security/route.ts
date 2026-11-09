import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const settings = db.getSecuritySettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = db.saveSecuritySettings(body);

    db.addAuditLog({
      admin_email: 'admin@fobign.com',
      action: 'SECURITY_SETTINGS_UPDATED',
      category: 'Security',
      details: 'Updated platform security, captcha protection, and CSRF configuration.',
    });

    return NextResponse.json({
      success: true,
      message: 'Security settings updated successfully.',
      settings: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
