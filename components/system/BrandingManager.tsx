'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, RotateCcw, Check, Sparkles, Sliders } from 'lucide-react';
import FobignLogo from '@/components/ui/FobignLogo';
import type { PlatformBranding } from '@/lib/types';

export default function BrandingManager() {
  const [branding, setBranding] = useState<PlatformBranding>({
    platform_name: 'fobign',
    custom_logo_url: null,
    accent_color: '#4d7cfe',
  });
  const [logoInputUrl, setLogoInputUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadBranding() {
      try {
        const res = await fetch('/api/system/branding');
        if (res.ok) {
          const data = await res.json();
          if (data.branding) {
            setBranding(data.branding);
            if (data.branding.custom_logo_url) {
              setLogoInputUrl(data.branding.custom_logo_url);
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadBranding();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result as string;
      setBranding((prev) => ({ ...prev, custom_logo_url: base64Url }));
      setLogoInputUrl(base64Url);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBranding = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/system/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    const resetBranding: PlatformBranding = {
      platform_name: 'fobign',
      custom_logo_url: null,
      accent_color: '#4d7cfe',
    };
    setBranding(resetBranding);
    setLogoInputUrl('');

    try {
      await fetch('/api/system/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetBranding),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Logo & Platform Branding</h2>
        <p className="text-xs text-[#80858e] mt-1">
          Customize the header logo and platform styling. The default uses an elegant typographic SVG wordmark (no square F box).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo Upload Form */}
        <div className="bg-[#16181b] border border-[#2b2d31] rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Upload or Change Logo</span>
          </h3>

          {/* File Upload Area */}
          <div>
            <label className="block text-xs text-[#9499a0] mb-2 font-medium">Upload Logo File (PNG, SVG, WebP)</label>
            <div className="border-2 border-dashed border-[#2b2d31] hover:border-indigo-500/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#111214]">
              <input
                type="file"
                id="logoFileInput"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="logoFileInput" className="cursor-pointer space-y-2 block">
                <div className="w-10 h-10 rounded-full bg-[#1c1d20] mx-auto flex items-center justify-center text-indigo-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="text-xs font-medium text-white">Click or drag &amp; drop your logo here</div>
                <div className="text-[11px] text-[#80858e]">Supports SVG, transparent PNG, WebP up to 5MB</div>
              </label>
            </div>
          </div>

          {/* Or Image URL */}
          <div>
            <label className="block text-xs text-[#9499a0] mb-1.5 font-medium">Or Image URL</label>
            <input
              type="text"
              placeholder="https://example.com/logo.png"
              value={logoInputUrl}
              onChange={(e) => {
                setLogoInputUrl(e.target.value);
                setBranding((prev) => ({ ...prev, custom_logo_url: e.target.value.trim() || null }));
              }}
              className="w-full bg-[#101113] border border-[#2b2d31] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Platform Name */}
          <div>
            <label className="block text-xs text-[#9499a0] mb-1.5 font-medium">Platform Wordmark Name</label>
            <input
              type="text"
              value={branding.platform_name}
              onChange={(e) => setBranding((prev) => ({ ...prev, platform_name: e.target.value }))}
              className="w-full bg-[#101113] border border-[#2b2d31] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#232528]">
            <button
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 text-xs text-[#80858e] hover:text-white px-3 py-2 rounded-xl hover:bg-[#1f2125] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default Wordmark</span>
            </button>

            <button
              onClick={handleSaveBranding}
              disabled={saving}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs px-5 py-2 rounded-xl transition-colors shadow-sm"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Branding Saved!</span>
                </>
              ) : (
                <span>{saving ? 'Saving...' : 'Save Branding'}</span>
              )}
            </button>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="bg-[#16181b] border border-[#2b2d31] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Live Sidebar Preview (#1B1B1C)</span>
          </h3>

          <p className="text-xs text-[#80858e]">
            This is how your brand logo will appear at the top of the developer console sidebar and admin header:
          </p>

          <div className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl p-6 flex flex-col items-start gap-4 shadow-inner">
            <div className="text-[10px] uppercase tracking-wider text-[#757a84] font-semibold">Sidebar Header View</div>
            <div className="p-3 bg-[#1B1B1C] rounded-xl border border-[#252528] w-full">
              <FobignLogo customLogoUrl={branding.custom_logo_url} size="lg" showBadge={true} />
            </div>

            <div className="text-[11px] text-[#9499a0] leading-relaxed pt-2">
              Status: {branding.custom_logo_url ? (
                <span className="text-emerald-400 font-medium">Custom Uploaded Logo Active</span>
              ) : (
                <span className="text-indigo-400 font-medium">Default Stylized Fobign SVG Wordmark Active</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
