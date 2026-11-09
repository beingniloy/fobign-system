'use client';

import React, { useState, useEffect } from 'react';
import { Save, Check } from 'lucide-react';

interface ModelItem {
  id: string;
  display_name: string;
  provider: string;
}

export default function ChatModelsSettingsPage() {
  const [allowedModels, setAllowedModels] = useState<string[]>([]);
  const [defaultModel, setDefaultModel] = useState<string>('merin-v1.0');
  const [allModels, setAllModels] = useState<ModelItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings/chat');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setAllowedModels(data.settings.allowedModels || []);
            setDefaultModel(data.settings.defaultModel || 'merin-v1.0');
          }
          if (data.models && Array.isArray(data.models)) {
            setAllModels(data.models);
          }
        }
      } catch (err) {
        // pass
      }
    }
    load();
  }, []);

  const toggleModel = (id: string) => {
    if (allowedModels.includes(id)) {
      if (allowedModels.length === 1) return;
      const next = allowedModels.filter((m) => m !== id);
      setAllowedModels(next);
      if (defaultModel === id) {
        setDefaultModel(next[0] || '');
      }
    } else {
      setAllowedModels([...allowedModels, id]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/settings/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowedModels, defaultModel }),
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
        <h1 className="text-xl font-semibold tracking-tight text-white">Chat Models</h1>
      </div>

      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 space-y-5">
        <div>
          <label className="block text-xs font-medium text-[#a1a1aa] mb-2">Default Model</label>
          <select
            value={defaultModel}
            onChange={(e) => setDefaultModel(e.target.value)}
            className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white"
          >
            {allowedModels.map((id) => {
              const info = allModels.find((m) => m.id === id);
              return (
                <option key={id} value={id}>
                  {info?.display_name || id}
                </option>
              );
            })}
          </select>
        </div>

        <div className="border-t border-[#27272a] pt-4">
          <label className="block text-xs font-medium text-[#a1a1aa] mb-3">Available Models</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {allModels.map((m) => {
              const active = allowedModels.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => toggleModel(m.id)}
                  className={`cursor-pointer p-3.5 rounded-lg border transition-colors flex items-center justify-between select-none ${
                    active
                      ? 'bg-[#202023] border-[#3f3f46] text-white'
                      : 'bg-[#121214] border-[#27272a] text-[#71717a] hover:border-[#3f3f46]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border text-xs ${
                        active ? 'bg-white border-white text-black' : 'border-[#3f3f46] bg-[#18181b]'
                      }`}
                    >
                      {active && <Check size={12} strokeWidth={3} />}
                    </div>
                    <span className="text-sm font-medium">{m.display_name}</span>
                  </div>
                  <span className="text-xs font-mono text-[#71717a]">{m.id}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#27272a]">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-white text-black hover:bg-[#e4e4e7] px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save size={14} />
            <span>{saving ? 'Saving...' : saved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
