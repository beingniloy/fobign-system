'use client';

import React, { useState, useEffect } from 'react';
import FobignLogo from '@/components/ui/FobignLogo';
import { Save, CheckCircle2, Upload } from 'lucide-react';

export default function BrandingSettingsPage() {
  const [platformName, setPlatformName] = useState('Fobign');
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [pwaIconUrl, setPwaIconUrl] = useState('');
  const [fontFamily, setFontFamily] = useState('Nunito');
  const [accentColor, setAccentColor] = useState('#FFFFFF');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings/branding');
        if (res.ok) {
          const data = await res.json();
          if (data.branding) {
            setPlatformName(data.branding.platform_name || 'Fobign');
            setCustomLogoUrl(data.branding.custom_logo_url || '');
            setFaviconUrl(data.branding.favicon_url || '');
            setPwaIconUrl(data.branding.pwa_icon_url || '');
            setFontFamily(data.branding.font_family || 'Nunito');
            setAccentColor(data.branding.accent_color || '#FFFFFF');
          }
        }
      } catch (e) {
        // fallback
      }
    }
    load();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'favicon' | 'pwa') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        if (target === 'logo') setCustomLogoUrl(base64);
        if (target === 'favicon') setFaviconUrl(base64);
        if (target === 'pwa') setPwaIconUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/settings/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform_name: platformName,
          custom_logo_url: customLogoUrl || null,
          favicon_url: faviconUrl || null,
          pwa_icon_url: pwaIconUrl || null,
          font_family: fontFamily,
          accent_color: accentColor,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback('Branding settings saved successfully! Logo and styles updated.');
      }
    } catch (e: any) {
      setFeedback('Error saving branding: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Branding</h1>
      </div>

      {feedback && (
        <div className="p-4 bg-white/10 border border-white/20 rounded-xl text-xs text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Live Logo Preview Box */}
      <div className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl p-5 shadow-sm space-y-3">
        <div className="text-xs text-[#80858e] font-semibold uppercase tracking-wider">
          Live Header &amp; Sidebar Logo Preview
        </div>
        <div className="p-6 bg-[#151517] border border-[#2E2E32] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FobignLogo customLogoUrl={customLogoUrl || null} size="lg" showBadge={true} />
          </div>
          {customLogoUrl && (
            <button
              type="button"
              onClick={() => setCustomLogoUrl('')}
              className="text-xs text-white/60 hover:text-white hover:underline cursor-pointer"
            >
              Reset to default typography SVG
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl p-5 space-y-5 shadow-sm text-xs">
        {/* Logo Upload & URL */}
        <div className="space-y-2">
          <label className="text-[#80858e] font-medium block">Custom Brand Logo (SVG or PNG)</label>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <input
              type="text"
              value={customLogoUrl}
              onChange={(e) => setCustomLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.svg or data:image/..."
              className="flex-1 bg-[#151517] border border-[#2E2E32] rounded-xl px-3.5 py-2.5 text-white font-mono placeholder:text-[#555861] focus:outline-none focus:border-white/40"
            />
            <label className="bg-[#202023] hover:bg-[#28282C] border border-[#2E2E32] text-white px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 transition-colors shrink-0">
              <Upload className="w-4 h-4 text-white" />
              <span>Upload File</span>
              <input
                type="file"
                accept="image/svg+xml,image/png,image/jpeg,image/webp"
                onChange={(e) => handleFileUpload(e, 'logo')}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Favicon & PWA Icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[#80858e] font-medium block">Favicon URL / File</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
                placeholder="/favicon.ico"
                className="flex-1 bg-[#151517] border border-[#2E2E32] rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-white/40"
              />
              <label className="bg-[#202023] hover:bg-[#28282C] border border-[#2E2E32] text-white p-2.5 rounded-xl cursor-pointer flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'favicon')}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#80858e] font-medium block">PWA App Icon (512x512)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={pwaIconUrl}
                onChange={(e) => setPwaIconUrl(e.target.value)}
                placeholder="/icon-512.png"
                className="flex-1 bg-[#151517] border border-[#2E2E32] rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-white/40"
              />
              <label className="bg-[#202023] hover:bg-[#28282C] border border-[#2E2E32] text-white p-2.5 rounded-xl cursor-pointer flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'pwa')}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Font and Theme Color */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[#80858e] font-medium block">Platform Typography Font</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white/40"
            >
              <option value="Nunito">Nunito (Default Official Font)</option>
              <option value="Inter">Inter</option>
              <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
              <option value="Roboto">Roboto</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#80858e] font-medium block">Monochrome Theme Style</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value="Strict Monochrome (Dark / Light)"
                readOnly
                className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3.5 py-2.5 text-white font-mono cursor-not-allowed text-[#80858e]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#252528]">
          <button
            type="submit"
            disabled={saving}
            className="bg-white hover:bg-neutral-200 text-black font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Branding'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
