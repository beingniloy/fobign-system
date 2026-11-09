'use client';

import React, { useState, useEffect } from 'react';
import { Play, Copy, Check, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

export default function SupabaseSettingsPage() {
  const [projectId, setProjectId] = useState('oltjngakooyiysonlkqi');
  const [supabaseUrl, setSupabaseUrl] = useState('https://oltjngakooyiysonlkqi.supabase.co');
  const [sqlSchema, setSqlSchema] = useState('');
  const [copied, setCopied] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings/supabase');
        if (res.ok) {
          const data = await res.json();
          if (data.schema_sql) setSqlSchema(data.schema_sql);
          if (data.project_id) setProjectId(data.project_id);
          if (data.supabase_url) setSupabaseUrl(data.supabase_url);
        }
      } catch (e) {
        // fallback
      }
    }
    load();
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setFeedback({ success: true, message: 'SQL schema copied to clipboard.' });
    setTimeout(() => {
      setCopied(false);
      setFeedback(null);
    }, 3000);
  };

  const handleRunMigration = async () => {
    setMigrating(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/settings/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      });
      const data = await res.json();
      setFeedback({
        success: data.success,
        message: data.success ? 'Migration completed successfully.' : (data.error || 'Migration failed.'),
      });
    } catch (e: any) {
      setFeedback({
        success: false,
        message: 'Migration error: ' + e.message,
      });
    } finally {
      setMigrating(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">Supabase</h1>
        <a
          href={`https://supabase.com/dashboard/project/${projectId}/sql`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-[#9ca3af] hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <span>SQL Editor</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {feedback && (
        <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white flex items-center gap-2">
          {feedback.success ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-neutral-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Connection & Configuration */}
      <div className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl p-5 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-[#151517] border border-[#2E2E32] rounded-xl space-y-1">
            <div className="text-[10px] text-[#80858e] uppercase tracking-wider font-semibold">Project ID</div>
            <div className="text-white font-mono font-medium">{projectId}</div>
          </div>

          <div className="p-3 bg-[#151517] border border-[#2E2E32] rounded-xl space-y-1">
            <div className="text-[10px] text-[#80858e] uppercase tracking-wider font-semibold">Database URL</div>
            <div className="text-white font-mono text-[11px] truncate">{supabaseUrl}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={handleRunMigration}
            disabled={migrating}
            className="bg-white hover:bg-neutral-200 text-black font-semibold px-5 py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${migrating ? 'animate-spin' : ''}`} />
            <span>{migrating ? 'Running Migration...' : 'Run Migration'}</span>
          </button>

          <button
            onClick={handleCopySql}
            className="bg-[#222225] hover:bg-[#2A2A2E] border border-[#2E2E32] text-white font-medium px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-[#9ca3af]" />}
            <span>{copied ? 'Copied' : 'Copy SQL Schema'}</span>
          </button>
        </div>
      </div>

      {/* SQL Script View */}
      <div className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl overflow-hidden shadow-xs text-xs">
        <div className="px-5 py-3 border-b border-[#2E2E32] flex items-center justify-between bg-[#171718]">
          <span className="font-semibold text-white">Database Schema</span>
          <button
            onClick={handleCopySql}
            className="text-xs text-[#9ca3af] hover:text-white flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <div className="p-4 bg-[#111113] max-h-72 overflow-y-auto font-mono text-[11px] text-[#9ca3af] leading-relaxed whitespace-pre-wrap select-all">
          {sqlSchema}
        </div>
      </div>
    </div>
  );
}
