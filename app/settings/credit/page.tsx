'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Check } from 'lucide-react';
import type { CreditSettings } from '@/lib/types';

export default function CreditSettingsPage() {
  const [settings, setSettings] = useState<CreditSettings>({
    enabled: true,
    min_deposit: 10.0,
    max_deposit: 10000.0,
    max_balance: 30000.0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings/credit');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setSettings(data.settings);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load credit settings');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/settings/credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save settings');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]" skullet-loading="true">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 font-['Nunito',sans-serif]">
      {/* Title strictly text, no description, no icon */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Credit</h1>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-200">
          {error}
        </div>
      )}

      {saved && (
        <div className="p-3 bg-[#1E2024] border border-[#3A3D45] rounded-xl text-xs text-white flex items-center gap-2">
          <Check className="w-4 h-4 text-white" />
          <span>Credit settings saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Enable / Disable Card */}
        <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-white tracking-wide">
                Enable/Disable
              </label>
              <p className="text-xs text-[#80858e]">
                Check to enable adding of funds by clients from the client area
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSettings((s) => ({ ...s, enabled: !s.enabled }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.enabled ? 'bg-white' : 'bg-[#27272A]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#121214] shadow-lg ring-0 transition duration-200 ease-in-out ${
                  settings.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Deposit Limits Card */}
        <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-5">
          {/* Minimum Deposit */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white tracking-wide block">
              Minimum Deposit
            </label>
            <div className="relative max-w-sm">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#80858e]">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={settings.min_deposit}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, min_deposit: parseFloat(e.target.value) || 0 }))
                }
                className="w-full bg-[#121214] border border-[#2E2E32] rounded-xl pl-7 pr-3.5 py-2.5 text-xs text-white placeholder-[#52525B] focus:outline-none focus:border-white transition-colors tabular-nums"
              />
            </div>
            <p className="text-xs text-[#80858e]">
              Enter the minimum amount a client can add in a single transaction
            </p>
          </div>

          <div className="border-t border-[#252528]" />

          {/* Maximum Deposit */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white tracking-wide block">
              Maximum Deposit
            </label>
            <div className="relative max-w-sm">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#80858e]">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={settings.max_deposit}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, max_deposit: parseFloat(e.target.value) || 0 }))
                }
                className="w-full bg-[#121214] border border-[#2E2E32] rounded-xl pl-7 pr-3.5 py-2.5 text-xs text-white placeholder-[#52525B] focus:outline-none focus:border-white transition-colors tabular-nums"
              />
            </div>
            <p className="text-xs text-[#80858e]">
              Enter the maximum amount a client can add in a single transaction
            </p>
          </div>

          <div className="border-t border-[#252528]" />

          {/* Maximum Balance */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white tracking-wide block">
              Maximum Balance
            </label>
            <div className="relative max-w-sm">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#80858e]">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={settings.max_balance}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, max_balance: parseFloat(e.target.value) || 0 }))
                }
                className="w-full bg-[#121214] border border-[#2E2E32] rounded-xl pl-7 pr-3.5 py-2.5 text-xs text-white placeholder-[#52525B] focus:outline-none focus:border-white transition-colors tabular-nums"
              />
            </div>
            <p className="text-xs text-[#80858e]">
              Enter the maximum balance that a client can add in credit
            </p>
          </div>
        </div>

        {/* Submit Button with Loader */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold text-xs tracking-wide transition-all shadow-sm disabled:opacity-50 cursor-pointer min-w-[140px]"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

