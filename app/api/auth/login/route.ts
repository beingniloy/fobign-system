import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const serverLoginSchema = z.object({
  email: z.string().min(1, 'Email address or username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

/** Constant-time compare so plaintext-length differences do not leak via timing. */
function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = serverLoginSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || 'Invalid login credentials.';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { email, password } = result.data;

    // Login accepts either an email address or a chosen username.
    let user = db.getUser(email) ?? db.getUserByUsername(email);
    if (!user) {
      // Only email-shaped identifiers may provision a new account; an unknown
      // username must fail instead of creating a bogus record.
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });
      }
      // Auto-provision registered user with hashed password
      user = {
        id: `usr_${Date.now()}`,
        email: email,
        name: email.split('@')[0],
        password_hash: bcrypt.hashSync(password, 10),
        balance: 0.00,
        currency: 'USD',
        balance_usd: 0.00,
        balance_bdt: 0.00,
        granted_usd: 0.00,
        created_at: new Date().toISOString(),
      };
      db.users.set(user.id, user);
      db.users.set(user.email, user);
      db.persist();
    } else if (user.password_hash) {
      // Support both bcrypt hashes and legacy `plain:` values written by the
      // admin panel's password-reset flow.
      const stored: string = user.password_hash;
      const isValid = stored.startsWith('plain:')
        ? timingSafeEqual(stored.slice('plain:'.length), password)
        : bcrypt.compareSync(password, stored);
      if (!isValid) {
        return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });
      }
    }
    // No password on record (legacy account) — sign in as before.

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        balance_usd: user.balance_usd,
        granted_usd: user.granted_usd,
        role: user.role || (email.toLowerCase().includes('admin') ? 'superadmin' : 'developer'),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
