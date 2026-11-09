'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  X,
  ExternalLink,
  Key,
  Globe,
  DollarSign,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import { PaymentMethodItem } from '@/lib/types';

export default function PaymentMethodSettingsPage() {
  const [methods, setMethods] = useState<PaymentMethodItem[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<PaymentMethodItem | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings/payment-method');
        if (res.ok) {
          const data = await res.json();
          if (data.payment_methods) {
            setMethods(data.payment_methods);
          }
        }
      } catch (e) {
        // fallback
      }
    }
    load();
  }, []);

  const toggleMethod = (id: string) => {
    setMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this payment gateway?')) {
      setMethods((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleOpenEdit = (item: PaymentMethodItem) => {
    setEditingItem({ ...item });
    setIsNew(false);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file must be smaller than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl && editingItem) {
        setEditingItem({ ...editingItem, logo_url: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAdd = () => {
    setEditingItem({
      id: `gateway_${Date.now()}`,
      name: '',
      type: 'both',
      enabled: true,
      fee_percent: 1.85,
      instructions: '',
      logo_url: '',
      api_key: '',
      base_url: 'https://paymently.link',
      return_type: 'POST',
      currency: 'BDT',
    });
    setIsNew(true);
  };

  const handleSaveItemModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editingItem.name.trim()) {
      alert('Gateway name is required');
      return;
    }

    let updatedList: PaymentMethodItem[];
    if (isNew) {
      updatedList = [...methods, editingItem];
    } else {
      updatedList = methods.map((m) => (m.id === editingItem.id ? editingItem : m));
    }
    setMethods(updatedList);
    setEditingItem(null);

    // Auto-save to server immediately
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/settings/payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_methods: updatedList }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback('Payment gateway saved successfully.');
      }
    } catch (e: any) {
      setFeedback('Error saving: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/settings/payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_methods: methods }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback('Payment gateways updated successfully.');
      }
    } catch (e: any) {
      setFeedback('Error saving payment methods: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Payments</h1>
        </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="bg-[#222225] hover:bg-[#2A2A2E] text-white font-medium px-4 py-2 rounded-xl text-xs flex items-center gap-2 border border-[#2E2E32] transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Add Gateway</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-white hover:bg-neutral-200 text-black font-semibold px-5 py-2 rounded-xl text-xs transition-colors flex items-center gap-2 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Payment Methods List */}
        <div className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl overflow-hidden shadow-xs text-xs">
          <div className="divide-y divide-[#2E2E32]">
            {methods.map((method) => (
              <div
                key={method.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#1E1E20] transition-colors"
              >
                {/* Left info & logo */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#252528] flex items-center justify-center shrink-0 border border-[#323236] overflow-hidden p-1.5">
                    {method.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={method.logo_url}
                        alt={method.name}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <CreditCard className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{method.name}</div>
                    <div className="text-[11px] text-[#80858e] font-mono mt-0.5">
                      Fee: <span className="text-white font-medium">{method.fee_percent}%</span>
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Edit button */}
                  <button
                    onClick={() => handleOpenEdit(method)}
                    className="p-2 text-[#9ca3af] hover:text-white bg-[#252528] hover:bg-[#2e2e32] rounded-lg transition-colors"
                    title="Edit Gateway Settings"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="p-2 text-[#9ca3af] hover:text-white bg-[#252528] hover:bg-[#2e2e32] rounded-lg transition-colors"
                    title="Delete Gateway"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Toggle button */}
                  <button
                    onClick={() => toggleMethod(method.id)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      method.enabled ? 'bg-white' : 'bg-[#2E2E32]'
                    }`}
                    title={method.enabled ? 'Enabled' : 'Disabled'}
                  >
                    <div
                      className={`w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                        method.enabled ? 'bg-black translate-x-5' : 'bg-[#80858e] translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit / Add Modal */}
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-[#2E2E32] pb-3">
                <h3 className="text-base font-bold text-white">
                  {isNew ? 'Add Payment Gateway' : `Configure ${editingItem.name || 'Gateway'}`}
                </h3>
                <button
                  onClick={() => setEditingItem(null)}
                  className="text-[#80858e] hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveItemModal} className="space-y-4 text-xs">
                {/* Gateway Identifier & Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#9ca3af] mb-1 font-medium">Gateway Name</label>
                    <input
                      type="text"
                      required
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      placeholder="e.g. Paymently (MFS & Card)"
                      className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[#9ca3af] mb-1 font-medium">Supported Currency</label>
                    <select
                      value={editingItem.type}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          type: e.target.value as 'usd' | 'bdt' | 'both',
                        })
                      }
                      className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white/50"
                    >
                      <option value="both">Both USD &amp; BDT</option>
                      <option value="bdt">BDT Only (Bangladesh)</option>
                      <option value="usd">USD Only (International)</option>
                    </select>
                  </div>
                </div>

                {/* Fee % and Logo Options */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[#9ca3af] mb-1 font-medium">Transaction Fee (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editingItem.fee_percent}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          fee_percent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-white/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[#9ca3af] mb-1 font-medium">Gateway Logo (Upload or URL)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className="flex items-center justify-center gap-2 bg-[#151517] hover:bg-[#202024] border border-[#2E2E32] hover:border-white/40 rounded-xl px-3 py-2 text-white cursor-pointer transition-colors text-center">
                        <Upload className="w-3.5 h-3.5 text-white" />
                        <span>Upload Logo File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFileUpload}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={editingItem.logo_url || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, logo_url: e.target.value })}
                        placeholder="Or paste Logo URL"
                        className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white/50"
                      />
                    </div>
                  </div>

                  {/* Preset logo choices & preview */}
                  <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-[#80858e]">Preset Logos:</span>
                      {[
                        { name: 'Paymently', url: 'https://paymently.link/logo.png' },
                        { name: 'bKash', url: 'https://cdn.iconscout.com/icon/free/png-256/free-bkash-3384872-2822959.png' },
                        { name: 'Nagad', url: 'https://cdn.iconscout.com/icon/free/png-256/free-nagad-3384873-2822960.png' },
                        { name: 'Rocket', url: 'https://seeklogo.com/images/D/dutch-bangla-rocket-logo-B4D1CC458D-seeklogo.com.png' },
                        { name: 'Stripe', url: 'https://cdn.iconscout.com/icon/free/png-256/free-stripe-logo-icon-download-in-svg-png-gif-file-formats--payment-gateway-fintech-logos-icons-226456.png' },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setEditingItem({ ...editingItem, logo_url: preset.url })}
                          className="px-2 py-0.5 rounded-md bg-[#252528] hover:bg-[#323236] text-[10px] text-white transition-colors"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                    {editingItem.logo_url && (
                      <div className="flex items-center gap-2 bg-[#151517] border border-[#2E2E32] px-2.5 py-1.5 rounded-lg">
                        <span className="text-[10px] text-[#80858e]">Preview:</span>
                        <img
                          src={editingItem.logo_url}
                          alt="logo"
                          className="w-5 h-5 object-contain rounded"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setEditingItem({ ...editingItem, logo_url: '' })}
                          className="text-[10px] text-neutral-400 hover:text-white"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>


                {/* API Credentials Section */}
                <div className="pt-2 border-t border-[#2E2E32] space-y-3">
                  <div className="font-semibold text-white text-[11px]">
                    API Credentials
                  </div>

                  <div>
                    <label className="block text-[#9ca3af] mb-1 font-medium">API Key (e.g. mh-piprapay-api-key)</label>
                    <input
                      type="password"
                      value={editingItem.api_key || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, api_key: e.target.value })}
                      placeholder="Enter Paymently API Key"
                      className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-white/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#9ca3af] mb-1 font-medium">Base URL</label>
                      <input
                        type="text"
                        value={editingItem.base_url || 'https://paymently.link'}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, base_url: e.target.value })
                        }
                        placeholder="https://paymently.link"
                        className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-white/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[#9ca3af] mb-1 font-medium">Return Type</label>
                      <select
                        value={editingItem.return_type || 'POST'}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            return_type: e.target.value as 'POST' | 'GET',
                          })
                        }
                        className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white/50"
                      >
                        <option value="POST">POST</option>
                        <option value="GET">GET</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#2E2E32]">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 rounded-xl text-xs text-[#9ca3af] hover:text-white hover:bg-[#28282C] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-white hover:bg-neutral-200 text-black font-semibold px-5 py-2 rounded-xl text-xs transition-colors"
                  >
                    Apply to Gateway List
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }
