import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const tax = await db.getTaxSettings();
    return NextResponse.json({ success: true, tax });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await db.saveTaxSettings(body);
    return NextResponse.json({
      success: true,
      message: 'Tax settings updated successfully',
      tax: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
