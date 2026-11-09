import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const logs = db.getAuditLogs();
    return NextResponse.json({ auditLogs: logs });
  } catch (error) {
    console.error('Error fetching admin audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, category, target_resource, details, admin_email, admin_id, ip_address } = body;

    if (!action || !category || !details) {
      return NextResponse.json(
        { error: 'Action, category, and details are required for audit log entries' },
        { status: 400 }
      );
    }

    const newLog = db.addAuditLog({
      admin_id,
      admin_email,
      action,
      category,
      target_resource,
      details,
      ip_address: ip_address || req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, auditLog: newLog });
  } catch (error) {
    console.error('Error creating admin audit log:', error);
    return NextResponse.json({ error: 'Failed to create audit log entry' }, { status: 500 });
  }
}
