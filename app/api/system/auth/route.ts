import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminPassword, hashAdminPassword } from '@/lib/adminPassword';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const admin = db.adminUsers.get(normalizedEmail);

    if (admin) {
      // Preferred path: a password has been set on this admin record.
      const stored = (admin as any).password_hash;
      if (stored) {
        if (!verifyAdminPassword(password, stored)) {
          return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
        }
      } else if (!verifyLegacyFallback(normalizedEmail, password)) {
        // No password on record yet: accept the seeded credential once, then
        // persist it so the next login uses the stored hash.
        return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
      } else {
        (admin as any).password_hash = hashAdminPassword(password);
        db.persist();
      }

      return NextResponse.json({
        success: true,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name || 'Super Admin',
          role: admin.role,
          token: 'adm_jwt_token_secure_fobign_root_session',
        },
      });
    }

    // No admin record yet — fall back to the seeded root credentials.
    if (verifyLegacyFallback(normalizedEmail, password)) {
      return NextResponse.json({
        success: true,
        admin: {
          id: 'adm_fobign_root',
          email: normalizedEmail,
          name: 'Admin Fobign',
          role: 'superadmin',
          token: 'adm_jwt_token_secure_fobign_root_session',
        },
      });
    }

    return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** The originally seeded admin credential, kept for first-run bootstrap. */
function verifyLegacyFallback(email: string, password: string): boolean {
  return email === 'admin@fobign.com' && password === 'Admin@123';
}
