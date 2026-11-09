'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Check,
  X,
  Server,
  RefreshCw,
  Globe,
  Key,
  Edit2,
  CheckSquare,
  Square,
  Power,
  Sliders,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import type { ProviderDefinition } from '@/lib/types';
import ProviderSvglIcon from '@/components/ui/ProviderSvglIcon';

interface PopularPreset {
  id: string;
  name: string;
  type: ProviderDefinition['type'];
  base_url: string;
  popular_models: string[];
  docs_url: string;
}

const POPULAR_PRESETS: PopularPreset[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai',
    base_url: 'https://api.openai.com/v1',
    popular_models: ['gpt-4o', 'gpt-4o-mini', 'o1', 'o3-mini'],
    docs_url: 'https://platform.openai.com',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    type: 'anthropic',
    base_url: 'https://api.anthropic.com/v1',
    popular_models: ['claude-3-5-sonnet', 'claude-3-5-haiku', 'claude-3-opus'],
    docs_url: 'https://console.anthropic.com',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    type: 'gemini',
    base_url: 'https://generativelanguage.googleapis.com',
    popular_models: ['gemini-2.0-flash', 'gemini-1.5-pro'],
    docs_url: 'https://aistudio.google.com',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    type: 'deepseek',
    base_url: 'https://api.deepseek.com/v1',
    popular_models: ['deepseek-chat', 'deepseek-reasoner'],
    docs_url: 'https://platform.deepseek.com',
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    type: 'groq',
    base_url: 'https://api.groq.com/openai/v1',
    popular_models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
    docs_url: 'https://console.groq.com',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    type: 'custom',
    base_url: 'https://api.mistral.ai/v1',
    popular_models: ['mistral-large-latest', 'codestral-latest'],
    docs_url: 'https://console.mistral.ai',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'openai',
    base_url: 'https://openrouter.ai/api/v1',
    popular_models: ['auto', 'anthropic/claude-3.5-sonnet'],
    docs_url: 'https://openrouter.ai',
  },
  {
    id: 'ollama',
    name: 'Local Ollama / vLLM',
    type: 'custom',
    base_url: 'http://localhost:11434/v1',
    popular_models: ['llama3.2', 'qwen2.5-coder'],
    docs_url: 'https://ollama.com',
  },
];

export default function ProviderManager() {
  const [providers, setProviders] = useState<ProviderDefinition[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Sheet / Drawer state
  const [showPresetSheet, setShowPresetSheet] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ProviderDefinition | null>(null);

  const [form, setForm] = useState<Partial<ProviderDefinition>>({
    name: '',
    type: 'openai',
    base_url: 'https://api.openai.com/v1',
    api_key: '',
    is_active: true,
  });

  const refreshProviders = async () => {
    try {
      setDataLoading(true);
      const res = await fetch('/api/system/providers');
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    refreshProviders();
  }, []);

  const handleSelectPreset = (preset: PopularPreset) => {
    setForm({
      name: preset.name,
      type: preset.type,
      base_url: preset.base_url,
      api_key: '',
      is_active: true,
    });
    setShowPresetSheet(false);
    setEditingProvider(null);
    setShowConfigModal(true);
  };

  const handleSaveProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.base_url) return;

    setLoading(true);
    try {
      const payload: Partial<ProviderDefinition> = {
        id: editingProvider ? editingProvider.id : `prov_${form.type}_${Date.now().toString(36)}`,
        name: form.name,
        type: form.type || 'openai',
        base_url: form.base_url,
        api_key: form.api_key || '',
        is_active: form.is_active ?? true,
      };

      const res = await fetch('/api/system/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowConfigModal(false);
        setEditingProvider(null);
        refreshProviders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p: ProviderDefinition) => {
    setEditingProvider(p);
    setForm({
      name: p.name,
      type: p.type,
      base_url: p.base_url,
      api_key: p.api_key || '',
      is_active: p.is_active,
    });
    setShowConfigModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this provider?')) return;
    try {
      const res = await fetch('/api/system/providers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setSelectedIds((prev) => prev.filter((i) => i !== id));
        refreshProviders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (p: ProviderDefinition) => {
    try {
      const res = await fetch('/api/system/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...p, is_active: !p.is_active }),
      });
      if (res.ok) {
        refreshProviders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedIds.length === providers.length && providers.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(providers.map((p) => p.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkToggle = async (enable: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch('/api/system/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_toggle',
          providerIds: selectedIds,
          is_active: enable,
        }),
      });
      if (res.ok) {
        refreshProviders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected providers?`)) return;
    try {
      const res = await fetch('/api/system/providers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (res.ok) {
        setSelectedIds([]);
        refreshProviders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5 font-['Nunito',sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Providers</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshProviders}
            className="p-2 bg-[#1c1d20] hover:bg-[#282a2e] border border-[#2b2d31] rounded-xl text-[#80858e] hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowPresetSheet(true)}
            className="flex items-center gap-1.5 bg-white hover:bg-neutral-200 text-black font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Provider</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-[#202023] border border-[#2E2E32] rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-2 text-xs text-white">
            <span className="font-semibold bg-white/10 border border-white/20 px-2.5 py-1 rounded-lg text-white">
              {selectedIds.length} Selected
            </span>
            <span className="text-[#9ca3af]">Bulk operations:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => handleBulkToggle(true)}
              className="bg-[#28282C] hover:bg-[#323236] border border-[#3E3E44] text-white font-medium px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1"
            >
              <Power className="w-3.5 h-3.5 text-white" />
              <span>Enable Selected</span>
            </button>

            <button
              onClick={() => handleBulkToggle(false)}
              className="bg-[#28282C] hover:bg-[#323236] border border-[#3E3E44] text-white font-medium px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1"
            >
              <Power className="w-3.5 h-3.5 text-[#80858e]" />
              <span>Disable Selected</span>
            </button>

            <button
              onClick={handleBulkDelete}
              className="bg-[#28282C] hover:bg-[#323236] border border-[#3E3E44] text-white font-medium px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#80858e]" />
              <span>Delete</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="text-[#9ca3af] hover:text-white px-2 py-1"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Providers Table */}
      <div className="bg-[#16181b] border border-[#2b2d31] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2b2d31] text-[#80858e] bg-[#121316]">
                <th className="py-3.5 px-4 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[#80858e] hover:text-white transition-colors"
                    title="Select / Deselect All"
                  >
                    {selectedIds.length > 0 && selectedIds.length === providers.length ? (
                      <CheckSquare className="w-4 h-4 text-white" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4 font-normal">Provider</th>
                <th className="py-3.5 px-4 font-normal">Type</th>
                <th className="py-3.5 px-4 font-normal">Base URL</th>
                <th className="py-3.5 px-4 font-normal">API Key</th>
                <th className="py-3.5 px-4 font-normal text-center">Status</th>
                <th className="py-3.5 px-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232528]">
              {dataLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} skullet-loading="true" className="animate-pulse">
                    <td className="py-3.5 px-4 text-center"><div className="w-4 h-4 bg-white/10 rounded mx-auto" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-32 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-16 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-48 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-28 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4 text-center"><div className="h-4 w-14 bg-white/10 rounded mx-auto" /></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-4 w-16 bg-white/10 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : providers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#80858e]">
                    No providers configured yet. Click &quot;Add Provider&quot; to choose from popular presets.
                  </td>
                </tr>
              ) : (
                providers.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-white/5 text-white' : 'hover:bg-[#1c1d20]/60 text-white'
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectRow(p.id)}
                          className="text-[#80858e] hover:text-white transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-white" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2.5">
                          <ProviderSvglIcon providerIdOrType={p.type} name={p.name} size={18} className="text-white shrink-0" />
                          <span>{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-neutral-300 border border-white/10">
                          {p.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#cbd5e1] truncate max-w-xs">
                        {p.base_url}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#80858e]">
                        {p.api_key ? (p.api_key.includes('••••') ? p.api_key : '••••••••') : 'No key'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggle(p)}
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
                            p.is_active
                              ? 'bg-white/10 text-white border-white/20'
                              : 'bg-neutral-800 text-neutral-500 border-neutral-700'
                          }`}
                        >
                          {p.is_active ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(p)}
                            className="p-1.5 text-[#80858e] hover:text-white hover:bg-[#24262b] rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 text-[#80858e] hover:text-white hover:bg-[#24262b] rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popular Models Preset Sheet (Drawer) */}
      {showPresetSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#16181b] border-l border-[#2b2d31] h-full overflow-y-auto p-6 space-y-5 shadow-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#24262b]">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Popular Providers</h3>
                  <p className="text-xs text-[#80858e]">Select a provider sheet to configure and add to your gateway.</p>
                </div>
                <button
                  onClick={() => setShowPresetSheet(false)}
                  className="p-1.5 text-[#80858e] hover:text-white rounded-lg hover:bg-[#24262b]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {POPULAR_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className="p-4 rounded-xl bg-[#1c1d20] border border-[#2b2d31] hover:border-white/40 transition-all cursor-pointer group flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#252528] flex items-center justify-center shrink-0 border border-[#323236] p-1.5 mt-0.5">
                        <ProviderSvglIcon providerIdOrType={preset.type} name={preset.name} size={20} className="text-white" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-xs">{preset.name}</span>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 text-neutral-300 border border-white/10">
                            {preset.type}
                          </span>
                        </div>
                        <div className="font-mono text-[11px] text-[#80858e] truncate max-w-xs">{preset.base_url}</div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {preset.popular_models.map((m) => (
                            <span
                              key={m}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-[#24262b] text-[#cbd5e1]"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#80858e] group-hover:text-white transition-colors shrink-0 mt-2" />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#24262b]">
              <button
                onClick={() => {
                  setForm({
                    name: 'Custom Provider',
                    type: 'custom',
                    base_url: 'https://',
                    api_key: '',
                    is_active: true,
                  });
                  setShowPresetSheet(false);
                  setEditingProvider(null);
                  setShowConfigModal(true);
                }}
                className="w-full text-center text-xs text-[#80858e] hover:text-white py-2"
              >
                + Configure custom HTTP endpoint manually
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provider Configure / Edit Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#16181b] border border-[#303236] rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#24262b]">
              <h3 className="text-base font-bold text-white">
                {editingProvider ? 'Edit Provider' : 'Configure Provider'}
              </h3>
              <button onClick={() => setShowConfigModal(false)} className="text-[#80858e] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProvider} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs text-[#9499a0] mb-1 font-medium">Provider Name</label>
                <input
                  type="text"
                  required
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. OpenAI Official"
                  className="w-full bg-[#101113] border border-[#2b2d31] rounded-xl px-3.5 py-2.5 text-white placeholder-[#555a64] focus:outline-none focus:border-white/50"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9499a0] mb-1 font-medium">Provider Type</label>
                <select
                  value={form.type || 'openai'}
                  onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                  className="w-full bg-[#101113] border border-[#2b2d31] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white/50 cursor-pointer"
                >
                  <option value="openai">OpenAI (or OpenAI-compatible)</option>
                  <option value="anthropic">Anthropic Claude</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="groq">Groq Cloud</option>
                  <option value="custom">Custom Endpoint</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#9499a0] mb-1 font-medium">Base URL</label>
                <input
                  type="url"
                  required
                  value={form.base_url || ''}
                  onChange={(e) => setForm({ ...form, base_url: e.target.value })}
                  placeholder="https://api.openai.com/v1"
                  className="w-full bg-[#101113] border border-[#2b2d31] rounded-xl px-3.5 py-2.5 text-white placeholder-[#555a64] font-mono focus:outline-none focus:border-white/50"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9499a0] mb-1 font-medium">
                  API Key {editingProvider && <span className="text-[#80858e] font-normal">(leave blank to keep unchanged)</span>}
                </label>
                <input
                  type="password"
                  value={form.api_key || ''}
                  onChange={(e) => setForm({ ...form, api_key: e.target.value })}
                  placeholder={editingProvider ? '••••••••' : 'sk-... or Bearer Token'}
                  className="w-full bg-[#101113] border border-[#2b2d31] rounded-xl px-3.5 py-2.5 text-white placeholder-[#555a64] font-mono focus:outline-none focus:border-white/50"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="prov_is_active"
                  checked={form.is_active ?? true}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded text-white accent-white focus:ring-0 bg-[#101113] border-[#2b2d31]"
                />
                <label htmlFor="prov_is_active" className="text-white text-xs font-medium cursor-pointer">
                  Enable provider in multi-model routing
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#24262b]">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 bg-[#202225] hover:bg-[#282a2e] text-[#cbd5e1] rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-semibold transition-colors shadow-xs"
                >
                  {loading ? 'Saving...' : 'Save Provider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
