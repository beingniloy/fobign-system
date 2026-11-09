import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  return NextResponse.json({ branding: db.getBranding() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    db.updateBranding({
      platform_name: body.platform_name || 'fobign',
      custom_logo_url: body.custom_logo_url !== undefined ? body.custom_logo_url : null,
      accent_color: body.accent_color || '#4d7cfe',
    });
    return NextResponse.json({ success: true, branding: db.getBranding() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
