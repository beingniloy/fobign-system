import { NextResponse } from 'next/server';
import { SUPABASE_SCHEMA_SQL, SUPABASE_PROJECT_ID, SUPABASE_URL } from '@/lib/db';

export async function GET() {
  return NextResponse.json({
    supabaseUrl: SUPABASE_URL,
    projectId: SUPABASE_PROJECT_ID,
    schemaSql: SUPABASE_SCHEMA_SQL.trim(),
    requiredCredentials: [
      {
        name: 'SUPABASE_URL',
        description: 'Your Supabase project URL (e.g. https://oltjngakooyiysonlkqi.supabase.co)',
        status: 'Configured',
      },
      {
        name: 'SUPABASE_ANON_KEY',
        description: 'Client-side public anonymous key from Project Settings > API',
        status: process.env.SUPABASE_ANON_KEY ? 'Configured' : 'Missing (using local fallback engine)',
      },
      {
        name: 'SUPABASE_SERVICE_ROLE_KEY',
        description: 'Server-side secret key from Project Settings > API for admin bypassing RLS',
        status: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configured' : 'Missing (using local fallback engine)',
      },
    ],
  });
}
