import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = db.getUser(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const usage = db.getUserUsage(id);
    const keys = db.getUserApiKeys(id);
    const commLogs = db.getUserCommunicationLogs(id);
    const tickets = db.getTickets().filter((t) => t.user_id === id);

    return NextResponse.json({
      user,
      usage,
      keys,
      commLogs,
      tickets,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const user = db.getUser(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (body.name !== undefined) user.name = body.name;
    if (body.email !== undefined) user.email = body.email;
    if (body.role !== undefined) user.role = body.role;
    if (body.balance !== undefined) {
      user.balance = Number(body.balance);
      user.balance_usd = Number(body.balance);
    }
    if (body.currency !== undefined) user.currency = body.currency;
    if (body.status !== undefined) {
      user.status = body.status;
      if (body.status === 'active') {
        user.restricted_until = null;
        user.restriction_reason = null;
      }
    }

    db.persist();

    db.addAuditLog({
      admin_email: 'admin@fobign.com',
      action: 'USER_PROFILE_UPDATE',
      category: 'Access',
      target_resource: `${user.id} (${user.email})`,
      details: `Updated user profile details`,
    });

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
