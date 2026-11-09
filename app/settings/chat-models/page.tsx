'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Bot, Layers, Sparkles, Check, AlertCircle } from 'lucide-react';

interface ModelItem {
  id: string;
  display_name: string;
  provider: string;
  description?: string;
  context_window?: number;
}

export default function ChatModelsSettingsPage() {
  const [allowedModels, setAllowedModels] = useState<string[]>([]);
  const [defaultModel, setDefaultModel] = useState<string>('merin-v1.0');
  const [allModels, setAllModels] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Fallback catalog if DB has fewer entries
  const popularPresets = [
    { id: 'merin-v1.0', display_name: 'Merin v1.0 (Native Core)', provider: 'fobign' },
    { id: 'deepseek-chat', display_name: 'DeepSeek-V3 Chat', provider: 'deepseek' },
    { id: 'deepseek-reasoner', display_name: 'DeepSeek-R1 (Thinking)', provider: 'deepseek' },
    { id: 'gpt-4o', display_name: 'OpenAI GPT-4o', provider: 'openai' },
    { id: 'gpt-4o-mini', display_name: 'OpenAI GPT-4o Mini', provider: 'openai' },
    { id: 'claude-3-5-sonnet', display_name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
    { id: 'gemini-1.5-pro', display_name: 'Google Gemini 1.5 Pro', provider: 'google' },
    { id: 'gemini-1.5-flash', display_name: 'Google Gemini 1.5 Flash', provider: 'google' },
  ];

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings/chat');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setAllowedModels(data.settings.allowedModels || ['merin-v1.0']);
            setDefaultModel(data.settings.defaultModel || 'merin-v1.0');
          }
          if (data.models && data.models.length > 0) {
            const merged = [...data.models];
            popularPresets.forEach(preset => {
              if (!merged.find(m => m.id === preset.id)) {
                merged.push(preset);
              }
            });
            setAllModels(merged);
          } else {
            setAllModels(popularPresets);
          }
        }
      } catch (err) {
        setAllModels(popularPresets);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleModel = (id: string) => {
    if (allowedModels.includes(id)) {
      if (allowedModels.length === 1) {
        alert('At least one model must remain enabled for chat.');
        return;
      }
      setAllowedModels(allowedModels.filter(m => m !== id));
      if (defaultModel === id) {
        const remaining = allowedModels.filter(m => m !== id);
        setDefaultModel(remaining[0] || 'merin-v1.0');
      }
    } else {
      setAllowedModels([...allowedModels, id]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/settings/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allowedModels,
          defaultModel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback('Chat models configured successfully.');
      }
    } catch (e: any) {
      setFeedback('Error saving models: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#f54e00]">
          <Bot size={15} />
          <span>AI Chat Management</span>
        </div>
        <h1 className="text-xl font-bold text-white mt-1">Chat Models Availability</h1>
        <p className="text-sm text-[#9ca3af] mt-0.5">
          Choose which AI models are available to end-users on <span className="text-[#f54e00] font-mono">chat.fobign.com</span> and designate the default primary model.
        </p>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 space-y-6">
        <div>
          <label className="block text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-2">
            Default Model on Load
          </label>
          <select
            value={defaultModel}
            onChange={(e) => setDefaultModel(e.target.value)}
            className="w-full bg-[#121214] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#f54e00]"
          >
            {allowedModels.map((id) => {
              const info = allModels.find((m) => m.id === id);
              return (
                <option key={id} value={id}>
                  {info ? `${info.display_name} (${id})` : id}
                </option>
              );
            })}
          </select>
          <p className="text-xs text-[#71717a] mt-1.5">
            This model will be selected by default when users land on chat.fobign.com.
          </p>
        </div>

        <div className="border-t border-[#27272a] pt-5">
          <label className="block text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-3">
            Active Chat Models Catalog
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allModels.map((m) => {
              const active = allowedModels.includes(m.id);
              const isDefault = defaultModel === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => toggleModel(m.id)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between ${
                    active
                      ? 'bg-[#222226] border-[#f54e00]/50 text-white'
                      : 'bg-[#141416] border-[#27272a] text-[#71717a] hover:border-[#3f3f46]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs transition-colors ${
                        active
                          ? 'bg-[#f54e00] border-[#f54e00] text-white'
                          : 'border-[#3f3f46] bg-[#1c1c1f]'
                      }`}
                    >
                      {active && <Check size={13} strokeWidth={3} />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold flex items-center gap-2">
                        <span>{m.display_name}</span>
                        {isDefault && (
                          <span className="text-[10px] bg-[#f54e00]/20 text-[#f54e00] px-1.5 py-0.5 rounded font-mono font-bold">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#a1a1aa] font-mono">{m.id}</div>
                    </div>
                  </div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-[#71717a]">
                    {m.provider}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#27272a]">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#f54e00] hover:bg-[#d04200] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-md"
          >
            <Save size={16} />
            <span>{saving ? 'Saving Changes...' : 'Save Model Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
