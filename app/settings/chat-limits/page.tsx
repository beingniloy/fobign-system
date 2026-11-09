'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Gauge, Clock, ShieldCheck, Zap } from 'lucide-react';

export default function ChatLimitsSettingsPage() {
  const [freeTokenLimit, setFreeTokenLimit] = useState<number>(50000);
  const [resetHours, setResetHours] = useState<number>(24);
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState<number>(20);
  const [maxOutputTokens, setMaxOutputTokens] = useState<number>(4096);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings/chat');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setFreeTokenLimit(data.settings.freeTokenLimit ?? 50000);
            setResetHours(data.settings.resetHours ?? 24);
            setRateLimitPerMinute(data.settings.rateLimitPerMinute ?? 20);
            setMaxOutputTokens(data.settings.maxOutputTokens ?? 4096);
          }
        }
      } catch (err) {
        // fallback
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/settings/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freeTokenLimit: Number(freeTokenLimit),
          resetHours: Number(resetHours),
          rateLimitPerMinute: Number(rateLimitPerMinute),
          maxOutputTokens: Number(maxOutputTokens),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback('Chat quota & token limits updated successfully.');
      }
    } catch (e: any) {
      setFeedback('Error saving limits: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#f54e00]">
          <Gauge size={15} />
          <span>AI Chat Management</span>
        </div>
        <h1 className="text-xl font-bold text-white mt-1">Quota & Usage Limits</h1>
        <p className="text-sm text-[#9ca3af] mt-0.5">
          Configure free tier token allocations, quota replenishment intervals, and anti-abuse speed limits.
        </p>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
              <Zap size={14} className="text-[#f54e00]" />
              <span>Free Token Quota (Per Cycle)</span>
            </label>
            <input
              type="number"
              min="1000"
              step="5000"
              value={freeTokenLimit}
              onChange={(e) => setFreeTokenLimit(Number(e.target.value))}
              className="w-full bg-[#121214] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#f54e00] font-mono"
            />
            <p className="text-xs text-[#71717a]">
              Total tokens granted to standard/free users before requiring a platform balance or top-up.
            </p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
              <Clock size={14} className="text-[#f54e00]" />
              <span>Quota Reset Interval (Hours)</span>
            </label>
            <input
              type="number"
              min="1"
              max="720"
              value={resetHours}
              onChange={(e) => setResetHours(Number(e.target.value))}
              className="w-full bg-[#121214] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#f54e00] font-mono"
            />
            <p className="text-xs text-[#71717a]">
              How many hours until the user's free token quota automatically restores (e.g. 24h = daily reset).
            </p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
              <ShieldCheck size={14} className="text-[#f54e00]" />
              <span>Rate Limit (Messages / Min)</span>
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={rateLimitPerMinute}
              onChange={(e) => setRateLimitPerMinute(Number(e.target.value))}
              className="w-full bg-[#121214] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#f54e00] font-mono"
            />
            <p className="text-xs text-[#71717a]">
              Throttles continuous message bursts to safeguard gateway capacity.
            </p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
              <Zap size={14} className="text-[#f54e00]" />
              <span>Max Generation Tokens</span>
            </label>
            <input
              type="number"
              min="256"
              max="16384"
              step="512"
              value={maxOutputTokens}
              onChange={(e) => setMaxOutputTokens(Number(e.target.value))}
              className="w-full bg-[#121214] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#f54e00] font-mono"
            />
            <p className="text-xs text-[#71717a]">
              Hard ceiling for response token length on the chat endpoint.
            </p>
          </div>
        </div>

        <div className="p-4 bg-[#121214] border border-[#27272a] rounded-xl flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Summary for Users</div>
            <div className="text-xs text-[#a1a1aa] mt-0.5">
              Each user receives <span className="text-[#f54e00] font-bold">{freeTokenLimit.toLocaleString()} free tokens</span> every <span className="text-[#f54e00] font-bold">{resetHours} hours</span>.
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-semibold">
            Active Policy
          </span>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#27272a]">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#f54e00] hover:bg-[#d04200] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-md"
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Limit Policy'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
