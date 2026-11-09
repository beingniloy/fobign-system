'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';

export default function AnnouncementSettingsPage() {
  const [enabled, setEnabled] = useState(true);
  const [text, setText] = useState('Unified multi-model API gateway is now live with enhanced latency and uptime.');
  const [linkText, setLinkText] = useState('View Details');
  const [linkUrl, setLinkUrl] = useState('/docs');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings/announcement');
        if (res.ok) {
          const data = await res.json();
          if (data.announcement) {
            setEnabled(Boolean(data.announcement.enabled));
            setText(data.announcement.text || '');
            setLinkText(data.announcement.link_text || 'View Details');
            setLinkUrl(data.announcement.link_url || '/docs');
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
      const res = await fetch('/api/settings/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled,
          text,
          link_text: linkText,
          link_url: linkUrl,
          bg_color: '#171719',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback('Notice banner configuration saved.');
      }
    } catch (e: any) {
      setFeedback('Error saving notice: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 font-['Nunito',sans-serif]">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Notice</h1>
      </div>

      {feedback && (
        <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white/90 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Live Banner Preview */}
      <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 shadow-sm space-y-3">
        <div className="text-xs text-[#80858e] font-semibold uppercase tracking-wider">
          Live Notice Appearance Preview
        </div>
        {enabled ? (
          <div className="px-4 py-2.5 rounded-xl text-xs flex items-center justify-between bg-[#222226] border border-[#323238] shadow-xs transition-colors">
            <div className="text-white truncate">
              {text || 'Notice announcement message text.'}
            </div>
            {linkText && (
              <span className="text-white underline font-semibold text-[11px] shrink-0 ml-3">
                {linkText}
              </span>
            )}
          </div>
        ) : (
          <div className="p-4 bg-[#101012] border border-[#232326] rounded-xl text-center text-xs text-[#80858e]">
            Notice bar is currently disabled (hidden from users)
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-4 shadow-sm text-xs">
        {/* Toggle */}
        <div className="p-4 rounded-xl bg-[#101012] border border-[#2B2B2F] flex items-center justify-between">
          <div>
            <div className="text-white font-bold">Display Announcement Banner</div>
            <div className="text-[#80858e] text-[11px]">Show notification banner to all connected users.</div>
          </div>
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              enabled ? 'bg-white' : 'bg-[#2B2B2F]'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full shadow-md transform transition-transform ${
                enabled ? 'bg-black translate-x-6' : 'bg-neutral-400 translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-[#80858e] font-medium block">Announcement Text</label>
          <textarea
            required
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Unified multi-model API gateway is now live with high performance inference endpoints."
            className="w-full bg-[#101012] border border-[#2B2B2F] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white/40"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[#80858e] font-medium block">Action Link Text</label>
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="View Details"
              className="w-full bg-[#101012] border border-[#2B2B2F] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#80858e] font-medium block">Action Link URL</label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="/docs"
              className="w-full bg-[#101012] border border-[#2B2B2F] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white/40"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#232326]">
          <button
            type="submit"
            disabled={saving}
            className="bg-white hover:bg-neutral-200 text-black font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Notice'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
