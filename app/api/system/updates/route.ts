import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { PlatformUpdate } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const onlyPublished = searchParams.get('published') === 'true';
  const updates = db.getAllUpdates(onlyPublished);
  return NextResponse.json({ updates });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, description, category, version, is_published } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const updateId = id || `up_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const existing = id ? db.getUpdate(id) : undefined;

    const newUpdate: PlatformUpdate = {
      id: updateId,
      title: title.trim(),
      description: description || '',
      category: category || 'Feature',
      version: version || '',
      is_published: is_published !== undefined ? Boolean(is_published) : (existing?.is_published ?? true),
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.upsertUpdate(newUpdate);

    db.addAuditLog({
      admin_email: 'admin@fobign.com',
      action: existing ? 'UPDATE_EDIT' : 'UPDATE_CREATE',
      category: 'System',
      target_resource: `update:${newUpdate.id}`,
      details: `${existing ? 'Edited' : 'Created'} platform update: "${newUpdate.title}" (${newUpdate.category})`,
    });

    return NextResponse.json({ success: true, update: newUpdate });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Update id is required' }, { status: 400 });
    }

    const update = db.getUpdate(id);
    db.deleteUpdate(id);

    if (update) {
      db.addAuditLog({
        admin_email: 'admin@fobign.com',
        action: 'UPDATE_DELETE',
        category: 'System',
        target_resource: `update:${id}`,
        details: `Deleted platform update: "${update.title}"`,
      });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

