import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const keys = db.getAllApiKeys();
  const enrichedKeys = keys.map((k) => {
    const user = db.getUser(k.user_id);
    return {
      ...k,
      user_email: user?.email || 'unknown',
    };
  });
  return NextResponse.json({ keys: enrichedKeys });
}

export async function POST(req: NextRequest) {
  try {
    const { keyId, rpmLimit, tpmLimit, isActive } = await req.json();
    const key = db.apiKeys.get(keyId);
    if (!key) {
      return NextResponse.json({ error: 'API Key not found' }, { status: 404 });
    }

    if (rpmLimit !== undefined) key.rpm_limit = Number(rpmLimit);
    if (tpmLimit !== undefined) key.tpm_limit = Number(tpmLimit);
    if (isActive !== undefined) key.is_active = Boolean(isActive);

    return NextResponse.json({ success: true, key });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
