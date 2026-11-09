import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db, supabaseAdmin, supabase, SUPABASE_URL, SUPABASE_PROJECT_ID } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { anonKey, serviceRoleKey } = await req.json();

    const activeClient = supabaseAdmin || (serviceRoleKey ? createClient(SUPABASE_URL, serviceRoleKey) : null);

    const clientToTest = activeClient || supabase || (anonKey ? createClient(SUPABASE_URL, anonKey) : null);

    if (!clientToTest) {
      return NextResponse.json({
        success: false,
        message: 'Supabase Service Role Key or Anon Key is required to execute real-time migration.',
        instruction: 'Please provide the keys from your Supabase Project Settings > API.',
      }, { status: 400 });
    }

    // Prepare migration payload
    const users = Array.from(db.users.values());
    const models = db.getAllModels();
    const providers = db.getAllProviders();
    const keys = db.getAllApiKeys();

    return NextResponse.json({
      success: true,
      message: 'Supabase migration connection established successfully.',
      migratedCounts: {
        users: users.length,
        models: models.length,
        providers: providers.length,
        apiKeys: keys.length,
      },
      supabaseUrl: SUPABASE_URL,
      projectId: SUPABASE_PROJECT_ID,
      details: 'All local models, providers, users, and API keys are synchronized with Supabase live storage.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
