'use client';

import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function ChatGeneralSettingsPage() {
  const [enabled, setEnabled] = useState(true);
  const [enableThinking, setEnableThinking] = useState(true);
  const [allowGuest, setAllowGuest] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('You are Fobign AI, an intelligent, helpful, and concise conversational assistant.');
  const [greetingMessage, setGreetingMessage] = useState('Welcome to Fobign Chat! Please enter your email address to continue.');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings/chat');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setEnabled(data.settings.enabled ?? true);
            setEnableThinking(data.settings.enableThinking ?? true);
            setAllowGuest(data.settings.allowGuest ?? false);
            setSystemPrompt(data.settings.systemPrompt || 'You are Fobign AI, an intelligent, helpful, and concise conversational assistant.');
            setGreetingMessage(data.settings.greetingMessage || 'Welcome to Fobign Chat! Please enter your email address to continue.');
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
          enabled,
          enableThinking,
          allowGuest,
          systemPrompt,
          greetingMessage,
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
        <h1 className="text-xl font-semibold tracking-tight text-white">General Chat Settings</h1>
      </div>

      <form onSubmit={handleSave} className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 space-y-5">
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3.5 bg-[#121214] border border-[#27272a] rounded-lg cursor-pointer">
            <span className="text-sm font-medium text-white">Enable Chat Service</span>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 accent-white rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 bg-[#121214] border border-[#27272a] rounded-lg cursor-pointer">
            <span className="text-sm font-medium text-white">Lattice Thinking Visualizer</span>
            <input
              type="checkbox"
              checked={enableThinking}
              onChange={(e) => setEnableThinking(e.target.checked)}
              className="w-4 h-4 accent-white rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 bg-[#121214] border border-[#27272a] rounded-lg cursor-pointer">
            <span className="text-sm font-medium text-white">Require Login</span>
            <input
              type="checkbox"
              checked={!allowGuest}
              onChange={(e) => setAllowGuest(!e.target.checked)}
              className="w-4 h-4 accent-white rounded"
            />
          </label>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[#a1a1aa]">Greeting Message</label>
          <input
            type="text"
            value={greetingMessage}
            onChange={(e) => setGreetingMessage(e.target.value)}
            className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[#a1a1aa]">System Persona</label>
          <textarea
            rows={4}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full bg-[#121214] border border-[#27272a] rounded-lg p-3.5 text-sm text-white focus:outline-none focus:border-white font-sans"
          />
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
