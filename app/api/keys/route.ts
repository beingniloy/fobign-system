import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { ApiKey } from '@/lib/types';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') || 'usr_guest';
  const keys = db.getUserApiKeys(userId);

  // Strip raw_key from list for security
  const safeKeys = keys.map((k) => ({
    id: k.id,
    name: k.name,
    tracking_id: k.tracking_id,
    key_preview: k.key_preview,
    created_at: k.created_at,
    last_used_at: k.last_used_at,
    is_active: k.is_active,
  }));

  return NextResponse.json({ keys: safeKeys });
}

export async function POST(req: NextRequest) {
  try {
    const { name, userId } = await req.json();
    const effectiveUserId = userId || 'usr_guest';

    // Generate realistic DeepSeek-format API key
    const randomHex = Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);
    const rawKey = `sk-${randomHex}${Math.random().toString(36).substring(2, 8)}`;
    const preview = `${rawKey.slice(0, 8)}*****${rawKey.slice(-4)}`;
    const trackingId = `${Math.random().toString(16).substring(2, 10)}-${Math.random().toString(16).substring(2, 5)} ... ${Math.random().toString(16).substring(2, 14)}`;

    const newKey: ApiKey = {
      id: `key_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: effectiveUserId,
      name: name || 'API Key',
      key_hash: rawKey,
      key_preview: preview,
      raw_key: rawKey,
      tracking_id: trackingId,
      rpm_limit: 60,
      tpm_limit: 100000,
      is_active: true,
      created_at: new Date().toISOString().split('T')[0],
      last_used_at: null,
    };

    db.addApiKey(newKey);

    return NextResponse.json({
      success: true,
      key: newKey, // includes raw_key once
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { keyId } = await req.json();
    if (!keyId) {
      return NextResponse.json({ error: 'keyId is required' }, { status: 400 });
    }
    db.deleteApiKey(keyId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
