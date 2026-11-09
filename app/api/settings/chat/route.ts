import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const settings = db.getChatSettings();
    const models = db.getAllModels();
    return NextResponse.json({ success: true, settings, models });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = db.saveChatSettings(body);
    return NextResponse.json({
      success: true,
      message: 'AI Chat settings updated successfully',
      settings: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
