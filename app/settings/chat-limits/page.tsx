'use client';

import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function ChatLimitsSettingsPage() {
  const [freeTokenLimit, setFreeTokenLimit] = useState<number>(50000);
  const [resetHours, setResetHours] = useState<number>(24);
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState<number>(20);
  const [maxOutputTokens, setMaxOutputTokens] = useState<number>(4096);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
      } catch {
        // pass
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
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
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // pass
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl space-y-6 text-[#f4f4f5]">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-white">Usage & Limits</h1>
      </div>

      <form onSubmit={handleSave} className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#a1a1aa]">Free Token Limit</label>
            <input
              type="number"
              min="1000"
              value={freeTokenLimit}
              onChange={(e) => setFreeTokenLimit(Number(e.target.value))}
              className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#a1a1aa]">Reset Interval (Hours)</label>
            <input
              type="number"
              min="1"
              value={resetHours}
              onChange={(e) => setResetHours(Number(e.target.value))}
              className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#a1a1aa]">Rate Limit (RPM)</label>
            <input
              type="number"
              min="1"
              value={rateLimitPerMinute}
              onChange={(e) => setRateLimitPerMinute(Number(e.target.value))}
              className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#a1a1aa]">Max Output Tokens</label>
            <input
              type="number"
              min="256"
              value={maxOutputTokens}
              onChange={(e) => setMaxOutputTokens(Number(e.target.value))}
              className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#27272a]">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-white text-black hover:bg-[#e4e4e7] px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save size={14} />
            <span>{saving ? 'Saving...' : saved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
