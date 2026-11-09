import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const serverLoginSchema = z.object({
  email: z.string().min(1, 'Email address or username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = serverLoginSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || 'Invalid login credentials.';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { email } = result.data;

    // Default regular user login
    let user = db.getUser(email);
    if (!user) {
      // Auto-provision demo user if email is entered
      user = {
        id: `usr_${Date.now()}`,
        email: email,
        name: email.split('@')[0],
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
    }

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
