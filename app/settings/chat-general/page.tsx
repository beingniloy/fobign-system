'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Settings, MessageSquare, Sparkles, Cpu, Lock } from 'lucide-react';

export default function ChatGeneralSettingsPage() {
  const [enabled, setEnabled] = useState(true);
  const [enableThinking, setEnableThinking] = useState(true);
  const [allowGuest, setAllowGuest] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('You are Fobign AI, an intelligent, helpful, and concise conversational assistant.');
  const [greetingMessage, setGreetingMessage] = useState('Welcome to Fobign Chat! Please enter your email address to sign in or get started.');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

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
            setGreetingMessage(data.settings.greetingMessage || 'Welcome to Fobign Chat! Please enter your email address to sign in or get started.');
          }
        }
      } catch (err) {
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
      const data = await res.json();
      if (data.success) {
        setFeedback('AI Chat general configurations saved successfully.');
      }
    } catch (e: any) {
      setFeedback('Error saving settings: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#f54e00]">
          <Settings size={15} />
          <span>AI Chat Management</span>
        </div>
        <h1 className="text-xl font-bold text-white mt-1">General Chat & Persona Settings</h1>
        <p className="text-sm text-[#9ca3af] mt-0.5">
          Configure conversational authentication onboarding, default system persona, and thinking visualizer.
        </p>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#121214] border border-[#27272a] rounded-xl">
            <div>
              <div className="text-sm font-semibold text-white">Enable Chat Service</div>
              <div className="text-xs text-[#71717a]">
                Allow incoming requests and web traffic on chat.fobign.com
              </div>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-5 h-5 accent-[#f54e00] rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#121214] border border-[#27272a] rounded-xl">
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles size={15} className="text-[#f54e00]" />
                <span>Thinking Loader & Lattice Visualizer</span>
              </div>
              <div className="text-xs text-[#71717a]">
                Displays the React Bits LatticeLoader wave and ThoughtLine breakdown during inference.
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableThinking}
              onChange={(e) => setEnableThinking(e.target.checked)}
              className="w-5 h-5 accent-[#f54e00] rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#121214] border border-[#27272a] rounded-xl">
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <Lock size={15} className="text-[#f54e00]" />
                <span>Conversational Auth Mandatory</span>
              </div>
              <div className="text-xs text-[#71717a]">
                Requires users to sign in conversationally (AI prompts for email & password) before querying models.
              </div>
            </div>
            <input
              type="checkbox"
              checked={!allowGuest}
              onChange={(e) => setAllowGuest(!e.target.checked)}
              className="w-5 h-5 accent-[#f54e00] rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
            Conversational Greeting / Initial Message
          </label>
          <input
            type="text"
            value={greetingMessage}
            onChange={(e) => setGreetingMessage(e.target.value)}
            className="w-full bg-[#121214] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#f54e00]"
          />
          <p className="text-xs text-[#71717a]">
            First message uttered by the AI in chat when unauthenticated visitors arrive.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
            System Persona / Instructions
          </label>
          <textarea
            rows={4}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full bg-[#121214] border border-[#27272a] rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#f54e00] font-sans"
          />
          <p className="text-xs text-[#71717a]">
            Injected at the root of every chat conversation session.
          </p>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#27272a]">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#f54e00] hover:bg-[#d04200] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-md"
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save General Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
