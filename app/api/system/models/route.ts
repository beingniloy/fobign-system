import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { ModelDefinition } from '@/lib/types';

export async function GET() {
  const models = db.getAllModels();
  return NextResponse.json({ models });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Bulk Batch Operations
    if (body.action === 'bulk_toggle') {
      const { modelIds, is_enabled } = body;
      if (!Array.isArray(modelIds)) {
        return NextResponse.json({ error: 'modelIds array is required' }, { status: 400 });
      }

      modelIds.forEach((id: string) => {
        const m = db.getModel(id);
        if (m) {
          m.is_enabled = Boolean(is_enabled);
          db.upsertModel(m);
        }
      });

      db.addAuditLog({
        admin_email: 'admin@fobign.com',
        action: 'MODEL_UPDATE',
        category: 'System',
        target_resource: `models:${modelIds.length}_items`,
        details: `Bulk ${is_enabled ? 'enabled' : 'disabled'} ${modelIds.length} models: ${modelIds.join(', ')}`,
      });

      return NextResponse.json({ success: true, updatedCount: modelIds.length });
    }

    if (body.action === 'bulk_price_adjust') {
      const { modelIds, percentage } = body;
      if (!Array.isArray(modelIds) || typeof percentage !== 'number') {
        return NextResponse.json({ error: 'modelIds array and percentage number are required' }, { status: 400 });
      }

      const factor = 1 + percentage / 100;
      let count = 0;

      modelIds.forEach((id: string) => {
        const m = db.getModel(id);
        if (m) {
          m.cost_per_1k_input = parseFloat((m.cost_per_1k_input * factor).toFixed(6));
          m.cost_per_1k_output = parseFloat((m.cost_per_1k_output * factor).toFixed(6));
          m.cost_bdt_per_1k_input = parseFloat((m.cost_per_1k_input * 122.5).toFixed(4));
          m.cost_bdt_per_1k_output = parseFloat((m.cost_per_1k_output * 122.5).toFixed(4));
          db.upsertModel(m);
          count++;
        }
      });

      db.addAuditLog({
        admin_email: 'admin@fobign.com',
        action: 'MODEL_UPDATE',
        category: 'Financial',
        target_resource: `models:${count}_items`,
        details: `Bulk adjusted pricing by ${percentage >= 0 ? '+' : ''}${percentage}% for ${count} models.`,
      });

      return NextResponse.json({ success: true, updatedCount: count });
    }

    if (body.action === 'bulk_provider_disable') {
      const { provider, is_enabled } = body;
      const allModels = db.getAllModels();
      const targetModels = allModels.filter((m) => m.provider.toLowerCase() === (provider || '').toLowerCase() || m.provider_id === provider);

      targetModels.forEach((m) => {
        m.is_enabled = Boolean(is_enabled);
        db.upsertModel(m);
      });

      db.addAuditLog({
        admin_email: 'admin@fobign.com',
        action: 'MODEL_UPDATE',
        category: 'System',
        target_resource: `provider:${provider}`,
        details: `Bulk ${is_enabled ? 'enabled' : 'disabled'} all ${targetModels.length} models for provider "${provider}".`,
      });

      return NextResponse.json({ success: true, updatedCount: targetModels.length });
    }

    // 2. Single Model Creation / Update
    if (!body.id || !body.display_name) {
      return NextResponse.json({ error: 'Model ID and display name are required' }, { status: 400 });
    }

    const modelToSave: ModelDefinition = {
      id: body.id.trim().toLowerCase(),
      display_name: body.display_name,
      provider_id: body.provider_id,
      provider: body.provider || 'gemini',
      upstream_model: body.upstream_model || 'gemini-3.8-flash',
      cost_per_1k_input: Number(body.cost_per_1k_input) || 0.0002,
      cost_per_1k_output: Number(body.cost_per_1k_output) || 0.0005,
      cost_bdt_per_1k_input: body.cost_bdt_per_1k_input !== undefined ? Number(body.cost_bdt_per_1k_input) : undefined,
      cost_bdt_per_1k_output: body.cost_bdt_per_1k_output !== undefined ? Number(body.cost_bdt_per_1k_output) : undefined,
      description: body.description || '',
      context_window: Number(body.context_window) || 128000,
      is_enabled: body.is_enabled !== undefined ? body.is_enabled : true,
      supports_streaming: body.supports_streaming !== undefined ? body.supports_streaming : true,
      supports_tools: body.supports_tools !== undefined ? body.supports_tools : true,
      system_prompt: body.system_prompt ? body.system_prompt.trim() : undefined,
    };

    db.upsertModel(modelToSave);

    db.addAuditLog({
      admin_email: 'admin@fobign.com',
      action: 'MODEL_UPDATE',
      category: 'System',
      target_resource: `model:${modelToSave.id} (${modelToSave.display_name})`,
      details: `Saved model configuration mapping to upstream ${modelToSave.provider}:${modelToSave.upstream_model}.${modelToSave.system_prompt ? ' Custom system prompt attached.' : ''}`,
    });

    return NextResponse.json({
      success: true,
      model: modelToSave,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Model ID is required' }, { status: 400 });
    }
    db.deleteModel(id);

    db.addAuditLog({
      admin_email: 'admin@fobign.com',
      action: 'MODEL_UPDATE',
      category: 'System',
      target_resource: `model:${id}`,
      details: `Deleted model entry from API gateway.`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
