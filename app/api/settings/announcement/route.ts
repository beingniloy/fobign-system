import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const announcement = await db.getAnnouncement();
    return NextResponse.json({ success: true, announcement });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await db.saveAnnouncement(body);
    return NextResponse.json({
      success: true,
      message: 'Announcement updated successfully',
      announcement: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
