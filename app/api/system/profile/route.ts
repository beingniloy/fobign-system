import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminPassword, hashAdminPassword, verifySeededAdmin } from '@/lib/adminPassword';

/**
 * GET /api/system/profile — fetch the signed-in admin's own profile.
 * Body/query: ?email=<admin email>
 */
export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email');
    if (!email) {
      return NextResponse.json({ success: false, error: 'Admin email is required.' }, { status: 400 });
    }

    const admin = db.adminUsers.get(email);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Admin not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name || 'Super Admin',
        role: admin.role,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH /api/system/profile — update the signed-in admin's name / email / password.
 * Body: { email, name?, newEmail?, currentPassword?, newPassword? }
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const currentEmail = body.email;

    if (!currentEmail) {
      return NextResponse.json({ success: false, error: 'Admin email is required.' }, { status: 400 });
    }

    const admin = db.adminUsers.get(currentEmail);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Admin not found.' }, { status: 404 });
    }

    // Password change always requires the current password.
    const wantsPassword =
      body.newPassword !== undefined && body.newPassword !== null && body.newPassword !== '';

    if (wantsPassword) {
      if (!body.currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Enter your current password to set a new one.' },
          { status: 400 }
        );
      }
      const stored = (admin as any).password_hash;
      // No password on record yet → the seeded first-run credential still
      // confirms the change (the new password is stored hashed below).
      const confirmed = stored
        ? verifyAdminPassword(body.currentPassword, stored)
        : verifySeededAdmin(currentEmail, body.currentPassword);
      if (!confirmed) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect.' },
          { status: 401 }
        );
      }
      if (String(body.newPassword).length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters.' },
          { status: 400 }
        );
      }
    }

    const nextName =
      body.name !== undefined ? String(body.name).trim().slice(0, 80) : admin.name;

    let nextEmail = currentEmail;
    if (body.newEmail !== undefined && body.newEmail !== '') {
      const candidate = String(body.newEmail).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate)) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid email address.' },
          { status: 400 }
        );
      }
      if (candidate !== currentEmail && db.adminUsers.has(candidate)) {
        return NextResponse.json(
          { success: false, error: 'That email address is already in use.' },
          { status: 409 }
        );
      }
      nextEmail = candidate;
    }

    // Re-key the map when the email changes so login keeps resolving.
    if (nextEmail !== currentEmail) {
      db.adminUsers.delete(currentEmail);
    }

    const updated = {
      ...admin,
      name: nextName,
      email: nextEmail,
      password_hash: wantsPassword
        ? hashAdminPassword(String(body.newPassword))
        : (admin as any).password_hash,
    };
    db.adminUsers.set(nextEmail, updated);
    db.persist();

    return NextResponse.json({
      success: true,
      admin: {
        id: updated.id,
        email: updated.email,
        name: updated.name || 'Super Admin',
        role: updated.role,
      },
      // Lets the client rewrite its stored session when the email changed.
      emailChanged: nextEmail !== currentEmail,
      previousEmail: nextEmail !== currentEmail ? currentEmail : undefined,
      passwordChanged: wantsPassword,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
