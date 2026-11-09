import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { ProviderDefinition } from '@/lib/types';

export async function GET() {
  const providers = db.getAllProviders();
  // Mask api keys for security
  const safeProviders = providers.map((p) => ({
    ...p,
    api_key: p.api_key ? (p.api_key.length > 8 ? `${p.api_key.slice(0, 4)}...${p.api_key.slice(-4)}` : '••••••••') : '',
  }));
  return NextResponse.json({ providers: safeProviders });
}

export async function POST(req: NextRequest) {
  try {
    const body: any = await req.json();

    if (body.action === 'bulk_toggle' && Array.isArray(body.providerIds)) {
      body.providerIds.forEach((pId: string) => {
        const p = db.getProvider(pId);
        if (p) {
          p.is_active = !!body.is_active;
          db.upsertProvider(p);
        }
      });
      return NextResponse.json({ success: true });
    }

    if (!body.name) {
      return NextResponse.json({ error: 'Provider name is required' }, { status: 400 });
    }

    const providerId = body.id || `prov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const existing = body.id ? db.getProvider(body.id) : undefined;
    const isMaskedOrEmpty = !body.api_key || body.api_key.includes('••••') || body.api_key.includes('...');
    const resolvedApiKey = !isMaskedOrEmpty ? body.api_key : (existing?.api_key || '');

    const newProvider: ProviderDefinition = {
      id: providerId,
      name: body.name,
      type: body.type || existing?.type || 'custom',
      base_url: body.base_url || existing?.base_url || 'https://api.openai.com/v1',
      api_key: resolvedApiKey,
      is_active: body.is_active !== undefined ? body.is_active : (existing?.is_active ?? true),
      created_at: existing?.created_at || new Date().toISOString().split('T')[0],
    };

    db.upsertProvider(newProvider);

    return NextResponse.json({ success: true, provider: newProvider });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = body.id || req.nextUrl.searchParams.get('id');
    const ids = Array.isArray(body.ids) ? body.ids : (id ? [id] : []);

    if (ids.length === 0) return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });

    ids.forEach((pId: string) => db.deleteProvider(pId));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
