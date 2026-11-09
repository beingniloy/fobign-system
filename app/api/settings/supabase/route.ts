import { NextRequest, NextResponse } from 'next/server';
import { db, SUPABASE_PROJECT_ID, SUPABASE_URL } from '@/lib/db';

export async function GET() {
  try {
    const isConnected = !!process.env.SUPABASE_ANON_KEY;
    const schemaSql = db.getSupabaseMigrationSQL();
    return NextResponse.json({
      success: true,
      connected: isConnected,
      project_id: SUPABASE_PROJECT_ID,
      supabase_url: SUPABASE_URL,
      tables: [
        'users',
        'admin_users',
        'providers',
        'models',
        'api_keys',
        'usage_logs',
        'billing_invoices',
        'settings',
        'tickets',
      ],
      schema_sql: schemaSql,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await db.runSupabaseMigration(body.project_id || SUPABASE_PROJECT_ID);
    return NextResponse.json({
      success: result.success,
      message: result.message,
      project_id: SUPABASE_PROJECT_ID,
      migrated_tables: [
        'users (clean)',
        'admin_users (clean)',
        'providers (clean)',
        'models (clean)',
        'api_keys (clean)',
        'usage_logs (clean)',
        'billing_invoices (clean)',
        'settings (clean)',
        'tickets (clean)',
      ],
      note: 'All previous fobign_ prefixed tables have been renamed/migrated to clean table names without prefix.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
