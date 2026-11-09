'use client';

import React, { useState, useEffect } from 'react';
import { Database, Copy, Check, ExternalLink, ShieldCheck, KeyRound, Play, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function SchemaViewer() {
  const [data, setData] = useState<{
    supabaseUrl: string;
    projectId: string;
    schemaSql: string;
    requiredCredentials: Array<{ name: string; description: string; status: string }>;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [anonKey, setAnonKey] = useState('');
  const [serviceRoleKey, setServiceRoleKey] = useState('');
  const [migrationStatus, setMigrationStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
    counts?: any;
  }>({ loading: false });

  useEffect(() => {
    async function loadSchema() {
      try {
        const res = await fetch('/api/system/schema');
        if (res.ok) {
          const resData = await res.json();
          setData(resData);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadSchema();
  }, []);

  const handleCopy = () => {
    if (data?.schemaSql) {
      navigator.clipboard.writeText(data.schemaSql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRunMigration = async () => {
    setMigrationStatus({ loading: true });
    try {
      const res = await fetch('/api/system/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonKey, serviceRoleKey }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setMigrationStatus({
          loading: false,
          success: true,
          message: result.message || 'Supabase live sync verified and connected successfully!',
          counts: result.migratedCounts,
        });
      } else {
        setMigrationStatus({
          loading: false,
          success: false,
          message: result.message || result.error || 'Failed to connect. Please ensure SQL is run in Supabase SQL Editor.',
        });
      }
    } catch (err: any) {
      setMigrationStatus({
        loading: false,
        success: false,
        message: err.message || 'Connection error',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Supabase Database Integration &amp; Migration</h2>
        <p className="text-xs text-[#80858e] mt-1">
          Production PostgreSQL schema with strict user/admin table isolation, Row Level Security (RLS) policies, and live synchronization.
        </p>
      </div>

      {/* Migration Trigger Card */}
      <div className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Database Migration Engine</span>
            </h3>
            <p className="text-xs text-[#9499a0]">
              Synchronize registered users, AI providers, custom models, and API keys with your Supabase PostgreSQL database.
            </p>
          </div>

          <button
            onClick={handleRunMigration}
            disabled={migrationStatus.loading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shrink-0"
          >
            {migrationStatus.loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing Database...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Migrate &amp; Sync with Supabase</span>
              </>
            )}
          </button>
        </div>

        {/* Live Status Feedback */}
        {migrationStatus.message && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
              migrationStatus.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            {migrationStatus.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-semibold">{migrationStatus.message}</div>
              {migrationStatus.counts && (
                <div className="text-[11px] opacity-90">
                  Synced: {migrationStatus.counts.providers} Providers &bull; {migrationStatus.counts.models} Models &bull; {migrationStatus.counts.apiKeys} API Keys &bull; {migrationStatus.counts.users} Users.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Credentials Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
            <Database className="w-4 h-4" />
            <span>Supabase Instance</span>
          </div>
          <div className="text-xs font-mono text-white truncate">
            {data?.supabaseUrl || 'https://oltjngakooyiysonlkqi.supabase.co'}
          </div>
          <div className="text-[11px] text-[#80858e]">
            Project ID: <span className="font-mono text-white">oltjngakooyiysonlkqi</span>
          </div>
        </div>

        <div className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <KeyRound className="w-4 h-4" />
            <span>SUPABASE_ANON_KEY</span>
          </div>
          <div className="text-[11px] text-[#9499a0] leading-relaxed">
            Public key for browser client queries. Obtain from Supabase Project Settings &gt; API.
          </div>
          <div className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded inline-block">
            Optional: Fallback engine active
          </div>
        </div>

        <div className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>SUPABASE_SERVICE_ROLE_KEY</span>
          </div>
          <div className="text-[11px] text-[#9499a0] leading-relaxed">
            Server-side secret key for admin authentication and RLS bypass during gateway proxying.
          </div>
          <div className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded inline-block">
            Server-only secret
          </div>
        </div>
      </div>

      {/* SQL Setup Steps */}
      <div className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl p-5 space-y-3">
        <div className="text-xs font-semibold text-white uppercase tracking-wider">How to Deploy Schema in Supabase (1-Minute Setup)</div>
        <ol className="text-xs text-[#9499a0] space-y-1.5 list-decimal list-inside leading-relaxed">
          <li>
            Open your Supabase Project:{' '}
            <a
              href="https://supabase.com/dashboard/project/oltjngakooyiysonlkqi"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              <span>supabase.com/dashboard/project/oltjngakooyiysonlkqi</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </li>
          <li>Click <strong className="text-white">SQL Editor</strong> in the left sidebar menu.</li>
          <li>Click <strong className="text-white">New Query</strong>, paste the complete SQL schema below, and click <strong className="text-white">Run</strong>.</li>
          <li>All tables (<code className="text-indigo-300">fobign_users</code>, <code className="text-indigo-300">fobign_admin_users</code>, <code className="text-indigo-300">fobign_providers</code>, <code className="text-indigo-300">fobign_models</code>, <code className="text-indigo-300">fobign_api_keys</code>, <code className="text-indigo-300">fobign_usage_logs</code>, <code className="text-indigo-300">fobign_billing_invoices</code>) and RLS security policies will be automatically provisioned!</li>
        </ol>
      </div>

      {/* SQL Viewer Box */}
      <div className="bg-[#131415] border border-[#2E2E32] rounded-2xl overflow-hidden">
        <div className="bg-[#18191b] px-5 py-3 border-b border-[#2E2E32] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-mono font-medium text-white">supabase_schema_fobign.sql</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-1.5 rounded-lg transition-colors shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy SQL Schema'}</span>
          </button>
        </div>

        <pre className="p-5 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[480px] leading-relaxed">
          <code>{data?.schemaSql || '-- Loading schema...'}</code>
        </pre>
      </div>
    </div>
  );
}
