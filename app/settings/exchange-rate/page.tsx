'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, Save } from 'lucide-react';

export default function ExchangeRateSettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [currentRate, setCurrentRate] = useState<number>(122.50);
  const [manualRate, setManualRate] = useState('122.50');
  const [source, setSource] = useState('exchangerate-api.com');
  const [lastUpdated, setLastUpdated] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings/exchange-rate');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            const rawRate = Number(data.settings.rate);
            const safeRate = !isNaN(rawRate) && rawRate > 0 ? rawRate : 122.50;
            setApiKey(data.settings.api_key || '');
            setCurrentRate(safeRate);
            setManualRate(String(safeRate));
            setSource(data.settings.source || 'exchangerate-api.com');
            setLastUpdated(data.settings.last_updated || new Date().toISOString());
            setAutoRefresh(data.settings.auto_refresh ?? true);
          }
        }
      } catch (err) {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveAndSync = async (isSyncNow = false) => {
    if (isSyncNow) setSyncing(true);
    setFeedback(null);
    try {
      const parsedManual = parseFloat(manualRate);
      const safeManual = !isNaN(parsedManual) && parsedManual > 0 ? parsedManual : 122.50;

      const res = await fetch('/api/settings/exchange-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          manual_rate: safeManual,
          auto_refresh: autoRefresh,
          sync_now: isSyncNow,
        }),
      });
      const data = await res.json();
      if (data.success && data.settings) {
        const rawRate = Number(data.settings.rate);
        const safeRate = !isNaN(rawRate) && rawRate > 0 ? rawRate : safeManual;
        setApiKey(data.settings.api_key !== undefined ? data.settings.api_key : apiKey);
        setCurrentRate(safeRate);
        setManualRate(String(safeRate));
        setSource(data.settings.source || 'Manual Override');
        setLastUpdated(data.settings.last_updated || new Date().toISOString());
        setFeedback(
          isSyncNow
            ? `Live rate synced: 1 USD = ৳${safeRate.toFixed(2)} BDT.`
            : 'Exchange rate configuration saved successfully.'
        );
      } else {
        setFeedback(data.error || 'Failed to update exchange rate.');
      }
    } catch (err: any) {
      setFeedback('Error updating exchange rate: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const safeRateNumber = typeof currentRate === 'number' && !isNaN(currentRate) ? currentRate : 122.50;
  const formattedDate = (() => {
    if (!lastUpdated) return 'Just now';
    try {
      const d = new Date(lastUpdated);
      return isNaN(d.getTime()) ? lastUpdated : d.toLocaleTimeString();
    } catch {
      return 'Just now';
    }
  })();

  if (loading) {
    return (
      <div skullet-loading="true" className="w-full max-w-4xl mx-auto space-y-6 font-['Nunito',sans-serif]">
        <div className="h-8 w-44 bg-white/10 rounded-lg animate-pulse" />
        <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-3">
          <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
          <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-4">
          <div className="h-5 w-40 bg-white/10 rounded animate-pulse" />
          <div className="h-10 w-full bg-white/10 rounded-xl animate-pulse" />
          <div className="h-10 w-full bg-white/10 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 font-['Nunito',sans-serif]">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Exchange Rate</h1>
      </div>

      {feedback && (
        <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white/90 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Current Live Rate Banner */}
      <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-[#80858e] font-semibold">
            Current Conversion Rate
          </div>
          <div className="text-2xl font-black text-white mt-1 tabular-nums flex items-baseline gap-2">
            <span>$1.00 USD</span>
            <span className="text-[#80858e] font-normal text-sm">=</span>
            <span>৳{safeRateNumber.toFixed(2)} BDT</span>
          </div>
          <div className="text-[11px] text-[#80858e] mt-1 flex items-center gap-2">
            <span>Source: <strong className="text-white">{source}</strong></span>
            <span>&bull;</span>
            <span>Updated: {formattedDate}</span>
          </div>
        </div>

        <button
          onClick={() => handleSaveAndSync(true)}
          disabled={syncing}
          className="bg-[#202024] hover:bg-[#28282C] border border-[#2B2B2F] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-white ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing...' : 'Sync Live Rate'}</span>
        </button>
      </div>

      {/* API Key Configuration Form */}
      <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-4 shadow-sm text-xs">
        <h2 className="text-sm font-bold text-white">
          ExchangeRate-API Credentials
        </h2>

        <div className="space-y-1.5">
          <label className="text-[#80858e] font-medium block">
            ExchangeRate-API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API Key (e.g. 8f4b...)"
            className="w-full bg-[#101012] border border-[#2B2B2F] rounded-xl px-3.5 py-2.5 text-white font-mono placeholder:text-[#555861] focus:outline-none focus:border-white/40"
          />
          <p className="text-[11px] text-[#80858e]">
            If left blank, the system maintains the standard configured conversion rate.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-[#80858e] font-medium block">
              Manual Override Rate (1 USD = ? BDT)
            </label>
            <input
              type="number"
              step="0.01"
              value={manualRate}
              onChange={(e) => setManualRate(e.target.value)}
              className="w-full bg-[#101012] border border-[#2B2B2F] rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-white/40"
            />
            <span className="text-[11px] text-[#80858e]">Fallback value when automated feed is unreachable</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#80858e] font-medium block">
              Automated Schedule
            </label>
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="auto_refresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded bg-[#101012] border-[#2B2B2F] text-white focus:ring-0 w-4 h-4 cursor-pointer accent-white"
              />
              <label htmlFor="auto_refresh" className="text-white cursor-pointer">
                Sync daily at 00:00 UTC automatically
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#232326]">
          <button
            onClick={() => handleSaveAndSync(false)}
            className="bg-white hover:bg-neutral-200 text-black font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
