import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const roles = await db.getRoles();
    return NextResponse.json({ success: true, roles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const role = await db.saveRole(body);

    db.addAuditLog({
      admin_email: 'admin@fobign.com',
      action: 'ROLE_CHANGE',
      category: 'Roles',
      target_resource: role.id || role.name,
      details: `Updated role configuration for "${role.name}": Assigned ${role.permissions?.length || 0} permissions.`,
    });

    return NextResponse.json({ success: true, message: 'Role saved successfully', role });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
