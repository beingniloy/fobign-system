import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { ApiKey, FobignUser } from '@/lib/types';
import { z } from 'zod';

const serverSignupSchema = z.object({
  name: z.string().optional(),
  email: z.string().min(1, 'Email address is required.').email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = serverSignupSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || 'Invalid registration parameters.';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { email, name } = result.data;

    const newUser: FobignUser = {
      id: `usr_${Date.now()}`,
      email: email,
      name: name || email.split('@')[0],
      balance: 2.0, // Initial welcome bonus $2.00
      currency: 'USD',
      balance_usd: 2.0,
      balance_bdt: 245.0,
      granted_usd: 0.0,
      created_at: new Date().toISOString(),
    };

    db.users.set(newUser.id, newUser);
    db.users.set(newUser.email, newUser);

    // Automatically create first API key
    const rawKey = `sk-${Math.random().toString(36).substring(2, 7)}${Math.random().toString(36).substring(2, 7)}${Math.random().toString(36).substring(2, 7)}`;
    const trackingId = `${Math.random().toString(36).substring(2, 10)} ... ${Math.random().toString(36).substring(2, 10)}`;
    const firstKey: ApiKey = {
      id: `key_${Date.now()}`,
      user_id: newUser.id,
      name: 'Default Key',
      key_hash: rawKey,
      key_preview: `sk-${rawKey.slice(3, 8)}*****${rawKey.slice(-4)}`,
      raw_key: rawKey,
      tracking_id: trackingId,
      rpm_limit: 60,
      tpm_limit: 100000,
      is_active: true,
      created_at: new Date().toISOString().split('T')[0],
      last_used_at: null,
    };
    db.addApiKey(firstKey);

    return NextResponse.json({
      success: true,
      user: newUser,
      apiKey: firstKey,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
