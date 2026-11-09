'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';

export default function TaxSettingsPage() {
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState(15.0);
  const [taxName, setTaxName] = useState('VAT / Sales Tax');
  const [taxIdNumber, setTaxIdNumber] = useState('BIN-98472918471');
  const [inclusive, setInclusive] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings/tax');
        if (res.ok) {
          const data = await res.json();
          if (data.tax) {
            setTaxEnabled(Boolean(data.tax.enabled));
            setTaxRate(data.tax.rate_percent || 15.0);
            setTaxName(data.tax.tax_name || 'VAT / Sales Tax');
            setTaxIdNumber(data.tax.tax_id_number || '');
            setInclusive(Boolean(data.tax.inclusive));
          }
        }
      } catch (e) {
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
      const res = await fetch('/api/settings/tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: taxEnabled,
          rate_percent: Number(taxRate),
          tax_name: taxName,
          tax_id_number: taxIdNumber,
          inclusive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback('Tax configuration saved.');
      }
    } catch (e: any) {
      setFeedback('Error saving: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 font-['Nunito',sans-serif]">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Tax</h1>
      </div>

      {feedback && (
        <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white/90 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-4 shadow-sm text-xs">
        {/* Enable Tax Collection */}
        <div className="p-4 rounded-xl bg-[#101012] border border-[#2B2B2F] flex items-center justify-between">
          <div>
            <div className="text-white font-bold">Collect Tax on Wallet Top-ups</div>
            <div className="text-[#80858e] text-[11px]">
              Automatically calculate and append tax line-item to billing invoices.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTaxEnabled(!taxEnabled)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              taxEnabled ? 'bg-white' : 'bg-[#2B2B2F]'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full shadow-md transform transition-transform ${
                taxEnabled ? 'bg-black translate-x-6' : 'bg-neutral-400 translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[#80858e] font-medium block">Tax / VAT Display Label</label>
            <input
              type="text"
              required
              value={taxName}
              onChange={(e) => setTaxName(e.target.value)}
              placeholder="e.g. VAT or Sales Tax"
              className="w-full bg-[#101012] border border-[#2B2B2F] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#80858e] font-medium block">Tax Rate Percentage (%)</label>
            <input
              type="number"
              step="0.01"
              required
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#101012] border border-[#2B2B2F] rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-white/40"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[#80858e] font-medium block">Official Tax ID / BIN / EIN Number</label>
          <input
            type="text"
            value={taxIdNumber}
            onChange={(e) => setTaxIdNumber(e.target.value)}
            placeholder="e.g. BIN-00294829472"
            className="w-full bg-[#101012] border border-[#2B2B2F] rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-white/40"
          />
        </div>

        <div className="flex justify-end pt-3 border-t border-[#232326]">
          <button
            type="submit"
            disabled={saving}
            className="bg-white hover:bg-neutral-200 text-black font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Tax Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
