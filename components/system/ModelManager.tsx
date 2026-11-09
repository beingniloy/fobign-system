'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Cpu,
  Sparkles,
  RefreshCw,
  Percent,
  Sliders,
  Power,
  ShieldAlert,
  CheckSquare,
  Square,
  Filter,
  DollarSign,
} from 'lucide-react';
import type { ModelDefinition, ProviderDefinition } from '@/lib/types';
const USD_TO_BDT_RATE = 122.5;

export default function ModelManager() {
  const [models, setModels] = useState<ModelDefinition[]>([]);
  const [providers, setProviders] = useState<ProviderDefinition[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [viewPromptModel, setViewPromptModel] = useState<ModelDefinition | null>(null);

  // Batch selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [providerFilter, setProviderFilter] = useState<string>('ALL');

  // Bulk Price Adjustment Modal
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceAdjustmentPercent, setPriceAdjustmentPercent] = useState<number>(10);

  // Form state
  const [testLoading, setTestLoading] = useState(false);
  const [testFeedback, setTestFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const [form, setForm] = useState<Partial<ModelDefinition>>({
    id: '',
    display_name: '',
    provider_id: 'prov_gemini',
    provider: 'gemini',
    upstream_model: 'gemini-3.8-flash',
    cost_per_1k_input: 0.0002,
    cost_per_1k_output: 0.0006,
    cost_bdt_per_1k_input: 0.024,
    cost_bdt_per_1k_output: 0.072,
    context_window: 128000,
    description: '',
    is_enabled: true,
    supports_streaming: true,
    supports_tools: true,
    system_prompt: '',
  });

  const refreshData = async () => {
    try {
      const [modelsRes, provRes] = await Promise.all([
        fetch('/api/system/models'),
        fetch('/api/system/providers'),
      ]);
      if (modelsRes.ok) {
        const mData = await modelsRes.json();
        setModels(mData.models || []);
      }
      if (provRes.ok) {
        const pData = await provRes.json();
        setProviders(pData.providers || []);
      }
    } catch (err) {
      console.error('Error refreshing model data:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const [modelsRes, provRes] = await Promise.all([
          fetch('/api/system/models'),
          fetch('/api/system/providers'),
        ]);
        if (modelsRes.ok && isMounted) {
          const mData = await modelsRes.json();
          setModels(mData.models || []);
        }
        if (provRes.ok && isMounted) {
          const pData = await provRes.json();
          setProviders(pData.providers || []);
        }
      } catch (err) {
        console.error('Error loading model data:', err);
      } finally {
        if (isMounted) setDataLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered models
  const filteredModels = useMemo(() => {
    if (providerFilter === 'ALL') return models;
    return models.filter(
      (m) => m.provider.toLowerCase() === providerFilter.toLowerCase() || m.provider_id === providerFilter
    );
  }, [models, providerFilter]);

  // Batch Selection Handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredModels.length && filteredModels.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredModels.map((m) => m.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Bulk Operations
  const handleBulkToggle = async (enable: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch('/api/system/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_toggle',
          modelIds: selectedIds,
          is_enabled: enable,
        }),
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      console.error('Error performing bulk toggle:', err);
    }
  };

  const handleApplyBulkPriceAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/system/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_price_adjust',
          modelIds: selectedIds,
          percentage: priceAdjustmentPercent,
        }),
      });
      if (res.ok) {
        setShowPriceModal(false);
        refreshData();
      }
    } catch (err) {
      console.error('Error applying bulk price adjustment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkProviderToggle = async (provider: string, enable: boolean) => {
    if (!confirm(`Are you sure you want to ${enable ? 'enable' : 'disable'} all models for provider "${provider}"?`)) return;
    try {
      const res = await fetch('/api/system/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_provider_disable',
          provider,
          is_enabled: enable,
        }),
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected models?`)) return;

    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch('/api/system/models', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
          })
        )
      );
      setSelectedIds([]);
      refreshData();
    } catch (err) {
      console.error('Error performing bulk delete:', err);
    }
  };

  // Single Model Form Handlers
  const openAddModal = () => {
    setEditingModelId(null);
    setTestFeedback(null);
    setForm({
      id: '',
      display_name: '',
      provider_id: providers[0]?.id || 'prov_gemini',
      provider: (providers[0]?.type || 'gemini') as ModelDefinition['provider'],
      upstream_model: 'gemini-3.8-flash',
      cost_per_1k_input: 0.0002,
      cost_per_1k_output: 0.0006,
      cost_bdt_per_1k_input: 0.024,
      cost_bdt_per_1k_output: 0.072,
      context_window: 128000,
      description: '',
      is_enabled: true,
      supports_streaming: true,
      supports_tools: true,
      system_prompt: '',
    });
    setShowModal(true);
  };

  const openEditModal = (model: ModelDefinition) => {
    setEditingModelId(model.id);
    setTestFeedback(null);
    setForm({
      ...model,
      system_prompt: model.system_prompt || '',
    });
    setShowModal(true);
  };

  const handleProviderSelect = (providerId: string) => {
    const prov = providers.find((p) => p.id === providerId);
    if (!prov) return;

    let defaultUpstream = 'gemini-3.8-flash';
    if (prov.type === 'openai') defaultUpstream = 'gpt-4o';
    else if (prov.type === 'anthropic') defaultUpstream = 'claude-3-5-sonnet-20241022';
    else if (prov.type === 'deepseek') defaultUpstream = 'deepseek-chat';
    else if (prov.type === 'groq') defaultUpstream = 'llama-3.3-70b-versatile';
    else if (prov.type === 'custom') defaultUpstream = 'custom-model';

    setForm((prev) => ({
      ...prev,
      provider_id: prov.id,
      provider: prov.type as any,
      upstream_model: defaultUpstream,
    }));
  };

  const handleUsdPriceChange = (field: 'cost_per_1k_input' | 'cost_per_1k_output', val: number) => {
    const bdtField = field === 'cost_per_1k_input' ? 'cost_bdt_per_1k_input' : 'cost_bdt_per_1k_output';
    setForm((prev) => ({
      ...prev,
      [field]: val,
      [bdtField]: parseFloat((val * USD_TO_BDT_RATE).toFixed(4)),
    }));
  };

  const handleToggleModel = async (model: ModelDefinition) => {
    const updated = { ...model, is_enabled: !model.is_enabled };
    setModels((prev) =>
      prev.map((m) => (m.id === model.id ? { ...m, is_enabled: !m.is_enabled } : m))
    );

    try {
      const res = await fetch('/api/system/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        refreshData();
      }
    } catch {
      refreshData();
    }
  };

  const handleDeleteModel = async (id: string) => {
    if (!confirm(`Are you sure you want to remove model "${id}"?`)) return;
    try {
      const res = await fetch('/api/system/models', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const runModelTest = async (): Promise<boolean> => {
    if (!form.upstream_model?.trim()) {
      setTestFeedback({ success: false, message: 'Please provide Upstream Model ID before testing.' });
      return false;
    }
    setTestLoading(true);
    setTestFeedback(null);
    try {
      const res = await fetch('/api/system/models/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: form.provider_id,
          upstream_model: form.upstream_model,
          system_prompt: form.system_prompt,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestFeedback({
          success: true,
          message: data.message || `Test passed! Response latency: ${data.latency_ms}ms`,
        });
        return true;
      } else {
        setTestFeedback({
          success: false,
          message: data.error || 'Connection failed. Upstream model did not respond.',
        });
        return false;
      }
    } catch (err: any) {
      setTestFeedback({
        success: false,
        message: err.message || 'Model test request failed.',
      });
      return false;
    } finally {
      setTestLoading(false);
    }
  };

  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id || !form.display_name || !form.upstream_model) {
      setTestFeedback({ success: false, message: 'Please fill in all required fields (Model ID, Display Name, Upstream Model ID).' });
      return;
    }

    // Auto-test before save/update - only proceed if test passes!
    const testPassed = await runModelTest();
    if (!testPassed) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/system/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        refreshData();
      } else {
        setTestFeedback({ success: false, message: data.error || 'Failed to save model to database.' });
      }
    } catch (err: any) {
      setTestFeedback({ success: false, message: err.message || 'Save error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-['Nunito',sans-serif]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Models</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshData}
            className="p-2 bg-[#1c1d20] hover:bg-[#282a2e] border border-[#2b2d31] rounded-xl text-[#80858e] hover:text-white transition-colors"
            title="Refresh Models"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-white hover:bg-neutral-200 text-black font-semibold text-xs px-4 py-2 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Model</span>
          </button>
        </div>
      </div>

      {/* Provider Filter & Quick Actions */}
      <div className="bg-[#16181b] border border-[#2b2d31] rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#101113] border border-[#2b2d31] px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-[#7E828A]" />
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#16181b] text-white">All Upstream Providers</option>
              {providers.map((p) => (
                <option key={p.id} value={p.type} className="bg-[#16181b] text-white">
                  {p.name} ({p.type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-[#80858e]">
            Showing <strong className="text-white">{filteredModels.length}</strong> models
          </span>
        </div>

        {/* Quick Provider Bulk Toggle */}
        {providerFilter !== 'ALL' && (
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => handleBulkProviderToggle(providerFilter, false)}
              className="bg-[#28282C] hover:bg-[#323236] text-white border border-[#3E3E44] px-3 py-1.5 rounded-xl transition-colors font-medium flex items-center gap-1.5"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Disable All {providerFilter.toUpperCase()}</span>
            </button>
            <button
              onClick={() => handleBulkProviderToggle(providerFilter, true)}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1.5 rounded-xl transition-colors font-medium flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Enable All {providerFilter.toUpperCase()}</span>
            </button>
          </div>
        )}
      </div>

      {/* Floating Batch Selection Toolbar */}
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
              onClick={() => setShowPriceModal(true)}
              className="bg-white hover:bg-neutral-200 text-black font-semibold px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1 shadow-xs"
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Adjust Pricing (%)</span>
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

      {/* Models Table */}
      <div className="bg-[#16181b] border border-[#2b2d31] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2b2d31] text-[#80858e] bg-[#121316]">
                {/* Select All Checkbox */}
                <th className="py-3.5 px-4 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[#80858e] hover:text-white transition-colors"
                    title="Select / Deselect All"
                  >
                    {selectedIds.length > 0 && selectedIds.length === filteredModels.length ? (
                      <CheckSquare className="w-4 h-4 text-white" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4 font-normal">Model ID (API)</th>
                <th className="py-3.5 px-4 font-normal">Branded Display Name</th>
                <th className="py-3.5 px-4 font-normal">Upstream Provider &amp; Engine</th>
                <th className="py-3.5 px-4 font-normal">Custom System Prompt</th>
                <th className="py-3.5 px-4 font-normal">USD ($/1k)</th>
                <th className="py-3.5 px-4 font-normal">BDT (৳/1k)</th>
                <th className="py-3.5 px-4 font-normal text-center">Active / Inactive</th>
                <th className="py-3.5 px-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232528]">
              {dataLoading ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i} skullet-loading="true" className="animate-pulse">
                    <td className="py-3.5 px-4 text-center"><div className="w-4 h-4 bg-white/10 rounded mx-auto" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-28 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-24 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-16 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-16 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-16 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-12 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4 text-center"><div className="h-4 w-12 bg-white/10 rounded mx-auto" /></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-4 w-14 bg-white/10 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredModels.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-[#80858e]">
                    No models registered matching provider filter.
                  </td>
                </tr>
              ) : (
                filteredModels.map((m) => {
                  const isSelected = selectedIds.includes(m.id);
                  return (
                    <tr
                      key={m.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-white/5 text-white' : 'hover:bg-[#1c1d20]/60 text-white'
                      }`}
                    >
                      {/* Checkbox Row */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectRow(m.id)}
                          className="text-[#80858e] hover:text-white transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-white" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Model ID */}
                      <td className="py-3.5 px-4 font-mono text-white font-semibold whitespace-nowrap">
                        {m.id}
                      </td>

                      {/* Display Name */}
                      <td className="py-3.5 px-4 font-medium whitespace-nowrap text-white">
                        {m.display_name}
                      </td>

                      {/* Upstream Engine */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-neutral-300 border border-white/10">
                          {m.provider.toUpperCase()} : {m.upstream_model}
                        </span>
                      </td>

                      {/* System Prompt Indicator */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {m.system_prompt && m.system_prompt.trim() ? (
                          <button
                            onClick={() => setViewPromptModel(m)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 text-white border border-white/20 text-[10px] font-medium hover:bg-white/20 transition-colors"
                            title="Click to view custom system prompt"
                          >
                            <Sparkles className="w-3 h-3 text-white" />
                            <span>Active Prompt</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#656972] font-mono">None (Passthrough)</span>
                        )}
                      </td>

                      {/* USD Pricing */}
                      <td className="py-3.5 px-4 font-mono text-[#cbd5e1] whitespace-nowrap tabular-nums">
                        ${(m.cost_per_1k_input * 1000).toFixed(3)} / ${(m.cost_per_1k_output * 1000).toFixed(3)}
                      </td>

                      {/* BDT Pricing */}
                      <td className="py-3.5 px-4 font-mono text-white whitespace-nowrap tabular-nums">
                        ৳{((m.cost_bdt_per_1k_input ?? m.cost_per_1k_input * 122.5) * 1000).toFixed(2)} / ৳{((m.cost_bdt_per_1k_output ?? m.cost_per_1k_output * 122.5) * 1000).toFixed(2)}
                      </td>

                      {/* Animated Active/Inactive Toggle Switch */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleModel(m)}
                            className={`w-11 h-6 rounded-full p-1 transition-colors relative flex items-center ${
                              m.is_enabled ? 'bg-white' : 'bg-[#2b2d31]'
                            }`}
                            title={m.is_enabled ? 'Click to disable model' : 'Click to enable model'}
                          >
                            <div
                              className={`w-4 h-4 rounded-full shadow-xs transition-transform ${
                                m.is_enabled ? 'bg-black translate-x-5' : 'bg-[#80858e] translate-x-0'
                              }`}
                            />
                          </button>
                          <span className={`text-[10px] font-semibold ${m.is_enabled ? 'text-white' : 'text-[#80858e]'}`}>
                            {m.is_enabled ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(m)}
                            className="p-1.5 text-[#80858e] hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                            title="Edit model"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteModel(m.id)}
                            className="p-1.5 text-[#80858e] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete model"
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

      {/* Bulk Price Adjustment Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#16181b] border border-[#303236] rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2b2d31]">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Bulk Price Adjustment</h3>
              </div>
              <button onClick={() => setShowPriceModal(false)} className="text-[#80858e] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#9ca3af]">
              Adjust input/output token pricing by percentage for <strong className="text-white">{selectedIds.length}</strong> selected models.
            </div>

            <form onSubmit={handleApplyBulkPriceAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs text-[#9499a0] mb-1 font-medium">Price Adjustment Percentage (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={priceAdjustmentPercent}
                    onChange={(e) => setPriceAdjustmentPercent(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 10 for +10% or -5 for -5%"
                    className="w-full bg-[#101113] border border-[#2b2d31] rounded-xl pl-3 pr-8 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 font-bold">%</span>
                </div>
                <p className="text-[10px] text-[#656972] mt-1">
                  Use positive numbers to increase prices (e.g. <code className="text-emerald-400">+15%</code>) or negative numbers to discount (e.g. <code className="text-amber-400">-10%</code>).
                </p>
              </div>

              {/* Sample Calculation Preview */}
              <div className="bg-[#101113] border border-[#232528] rounded-xl p-3 space-y-1 font-mono text-[11px]">
                <div className="text-[#80858e]">Sample Impact ($0.0002 / 1k input):</div>
                <div className="text-white flex items-center gap-2">
                  <span>$0.000200</span>
                  <span className="text-[#80858e]">to</span>
                  <span className="text-emerald-400 font-bold">
                    ${(0.0002 * (1 + priceAdjustmentPercent / 100)).toFixed(6)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2b2d31]">
                <button
                  type="button"
                  onClick={() => setShowPriceModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#80858e] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2 rounded-xl transition-colors shadow-sm"
                >
                  {loading ? 'Applying...' : 'Apply Price Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Model Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#16181b] border border-[#2E2E32] rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2E2E32] pb-3">
              <h3 className="text-base font-bold text-white">
                {editingModelId ? 'Edit Model' : 'Add Model'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#80858e] hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModel} className="space-y-4 text-xs">
              {/* Upstream Provider Selection */}
              <div>
                <label className="block text-xs text-[#9499a0] mb-1 font-medium">Upstream Provider</label>
                <select
                  value={form.provider_id}
                  onChange={(e) => handleProviderSelect(e.target.value)}
                  className="w-full bg-[#101113] border border-[#2E2E32] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/50 cursor-pointer"
                >
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.type.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Model ID (API Endpoint) & Display Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#9499a0] mb-1 font-medium">
                    Model ID <span className="text-[10px] text-[#80858e]">(API Endpoint)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. kc/kilo-auto/free"
                    value={form.upstream_model}
                    onChange={(e) => setForm({ ...form, upstream_model: e.target.value })}
                    className="w-full bg-[#101113] border border-[#2E2E32] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#9499a0] mb-1 font-medium">
                    Display Name <span className="text-[10px] text-[#80858e]">(Frontend Branding)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Merin v1.0"
                    value={form.display_name}
                    onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                    className="w-full bg-[#101113] border border-[#2E2E32] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/50"
                  />
                </div>
              </div>

              {/* Upstream Model ID & Context Window */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#9499a0] mb-1 font-medium">
                    Upstream Model ID <span className="text-[10px] text-neutral-400">(Private Backend Engine)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. merin-v1.0"
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    className="w-full bg-[#101113] border border-[#2E2E32] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/50 font-mono"
                  />
                  <p className="text-[10px] text-[#80858e] mt-1">
                    Hidden from platform developers. Only Display Name is shown on frontend.
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-[#9499a0] mb-1 font-medium">Context Window</label>
                  <input
                    type="number"
                    value={form.context_window}
                    onChange={(e) => setForm({ ...form, context_window: parseInt(e.target.value) || 128000 })}
                    className="w-full bg-[#101113] border border-[#2E2E32] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/50 font-mono"
                  />
                </div>
              </div>

              {/* Token Pricing Matrix */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#9499a0] mb-1 font-medium">Input Price ($/1k)</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={form.cost_per_1k_input}
                    onChange={(e) => handleUsdPriceChange('cost_per_1k_input', parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#101113] border border-[#2E2E32] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-white/50"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#9499a0] mb-1 font-medium">Output Price ($/1k)</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={form.cost_per_1k_output}
                    onChange={(e) => handleUsdPriceChange('cost_per_1k_output', parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#101113] border border-[#2E2E32] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-white/50"
                  />
                </div>
              </div>

              {/* Custom System Prompt */}
              <div>
                <label className="block text-xs text-[#9499a0] mb-1 font-medium">Custom System Prompt (Optional)</label>
                <textarea
                  rows={3}
                  value={form.system_prompt || ''}
                  onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
                  placeholder="Optional system instructions prepended to requests..."
                  className="w-full bg-[#101113] border border-[#2E2E32] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-white/50 font-sans leading-relaxed"
                />
              </div>

              {/* Live Test Feedback Banner */}
              {testFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                    testFeedback.success
                      ? 'bg-neutral-900 border-white/20 text-white'
                      : 'bg-[#1a1415] border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {testFeedback.success ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <X className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                  <div className="leading-relaxed break-words flex-1">
                    <span className="font-semibold block mb-0.5">
                      {testFeedback.success ? 'Model Connectivity Verified' : 'Model Test Failed'}
                    </span>
                    <span>{testFeedback.message}</span>
                  </div>
                </div>
              )}

              {/* Submit / Test / Cancel Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#2E2E32]">
                <button
                  type="button"
                  onClick={() => runModelTest()}
                  disabled={testLoading || loading}
                  className="bg-[#202023] hover:bg-[#2A2A2E] border border-[#3E3E44] text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-colors inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Cpu className="w-3.5 h-3.5 text-neutral-300" />
                  <span>{testLoading ? 'Testing Connectivity...' : 'Test Model'}</span>
                </button>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-[#80858e] hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || testLoading}
                    className="bg-white hover:bg-neutral-200 text-black font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Validating & Saving...' : editingModelId ? 'Update Model' : 'Save Model'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect System Prompt Modal */}
      {viewPromptModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#16181b] border border-[#2E2E32] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2E2E32]">
              <h3 className="text-sm font-bold text-white">
                System Prompt: {viewPromptModel.display_name}
              </h3>
              <button onClick={() => setViewPromptModel(null)} className="text-[#80858e] hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-[#80858e] font-mono text-[11px]">
                API Identifier: <span className="text-white font-semibold">{viewPromptModel.id}</span>
              </div>
              <div className="bg-[#101113] border border-[#2E2E32] rounded-xl p-3.5 text-neutral-200 font-sans leading-relaxed whitespace-pre-wrap">
                {viewPromptModel.system_prompt || 'No custom system prompt defined.'}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#2E2E32]">
              <button
                onClick={() => setViewPromptModel(null)}
                className="bg-[#222225] hover:bg-[#2A2A2E] text-white font-medium text-xs px-4 py-2 rounded-xl transition-colors border border-[#2E2E32]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
