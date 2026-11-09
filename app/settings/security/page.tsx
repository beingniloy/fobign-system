'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Check } from 'lucide-react';
import type { SecuritySettings } from '@/lib/types';

export default function SecuritySettingsPage() {
  const [settings, setSettings] = useState<SecuritySettings>({
    email_verification: true,
    captcha_protection: 'unauthenticated',
    captcha_type: 'cloudflare',
    cloudflare_site_key: '',
    cloudflare_secret_key: '',
    captcha_forms: {
      client_registration: true,
      contact_form: true,
      ticket_submission: true,
      login_forms: true,
    },
    csrf_tokens: 'enabled',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings/security');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setSettings(data.settings);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load security settings');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/settings/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save settings');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]" skullet-loading="true">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 font-['Nunito',sans-serif]">
      {/* Title strictly text, no description, no icon */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Security</h1>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-200">
          {error}
        </div>
      )}

      {saved && (
        <div className="p-3 bg-[#1E2024] border border-[#3A3D45] rounded-xl text-xs text-white flex items-center gap-2">
          <Check className="w-4 h-4 text-white" />
          <span>Security settings saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Email Verification Card */}
        <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-white tracking-wide">
                Email Verification
              </label>
              <p className="text-xs text-[#80858e]">
                Request users to confirm their email address on signup or change of email address
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSettings((s) => ({ ...s, email_verification: !s.email_verification }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.email_verification ? 'bg-white' : 'bg-[#27272A]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#121214] shadow-lg ring-0 transition duration-200 ease-in-out ${
                  settings.email_verification ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Captcha Form Protection Card */}
        <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-5">
          <div>
            <label className="text-xs font-bold text-white tracking-wide block mb-3">
              Captcha Form Protection
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'always', label: 'Always Enabled' },
                { id: 'unauthenticated', label: 'Enabled for Unauthenticated Visitors Only' },
                { id: 'disabled', label: 'Always Disabled' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    settings.captcha_protection === opt.id
                      ? 'bg-[#202024] border-white text-white'
                      : 'bg-[#141416] border-[#2E2E32] text-[#9ca3af] hover:border-[#3E3E42]'
                  }`}
                >
                  <input
                    type="radio"
                    name="captcha_protection"
                    value={opt.id}
                    checked={settings.captcha_protection === opt.id}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        captcha_protection: e.target.value as any,
                      }))
                    }
                    className="mt-0.5 text-white accent-white bg-black border-[#3F3F46]"
                  />
                  <span className="text-xs font-semibold leading-relaxed">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Captcha Type: Cloudflare Turnstile */}
          {settings.captcha_protection !== 'disabled' && (
            <div className="pt-4 border-t border-[#252528] space-y-4">
              <div>
                <label className="text-xs font-bold text-white tracking-wide block mb-1">
                  Captcha Type
                </label>
                <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#222225] border border-[#2E2E32] text-xs font-semibold text-white">
                  Cloudflare Turnstile
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#80858e] uppercase tracking-wider mb-1.5">
                    Cloudflare Site Key
                  </label>
                  <input
                    type="text"
                    value={settings.cloudflare_site_key || ''}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, cloudflare_site_key: e.target.value }))
                    }
                    placeholder="0x4AAAAAA..."
                    className="w-full bg-[#121214] border border-[#2E2E32] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#52525B] focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#80858e] uppercase tracking-wider mb-1.5">
                    Cloudflare Secret Key
                  </label>
                  <input
                    type="password"
                    value={settings.cloudflare_secret_key || ''}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, cloudflare_secret_key: e.target.value }))
                    }
                    placeholder="0x4AAAAAA..."
                    className="w-full bg-[#121214] border border-[#2E2E32] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#52525B] focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>

              {/* Captcha for Select Forms */}
              <div className="pt-3">
                <label className="text-xs font-bold text-white tracking-wide block mb-3">
                  Captcha for Select Forms
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'client_registration', label: 'Client Registration' },
                    { key: 'contact_form', label: 'Contact Form' },
                    { key: 'ticket_submission', label: 'Ticket Submission' },
                    { key: 'login_forms', label: 'Login Forms' },
                  ].map((form) => {
                    const active = (settings.captcha_forms as any)?.[form.key] ?? true;
                    return (
                      <div
                        key={form.key}
                        onClick={() =>
                          setSettings((s) => ({
                            ...s,
                            captcha_forms: {
                              ...s.captcha_forms,
                              [form.key]: !active,
                            },
                          }))
                        }
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                          active
                            ? 'bg-[#1E1E22] border-[#3F3F46]'
                            : 'bg-[#121214] border-[#252528] opacity-70'
                        }`}
                      >
                        <span className="text-xs font-semibold text-white">{form.label}</span>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            active ? 'bg-white border-white text-black' : 'border-[#3F3F46] bg-transparent'
                          }`}
                        >
                          {active && <Check className="w-3 h-3 text-black stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CSRF Tokens: General Card */}
        <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-4">
          <label className="text-xs font-bold text-white tracking-wide block">
            CSRF Tokens: General
          </label>
          <p className="text-xs text-[#80858e]">
            Check to enable general use of CSRF tokens for all public and clientarea forms (Highly Recommended)
          </p>
          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-white">
              <input
                type="radio"
                name="csrf_tokens"
                value="enabled"
                checked={settings.csrf_tokens === 'enabled'}
                onChange={() => setSettings((s) => ({ ...s, csrf_tokens: 'enabled' }))}
                className="text-white accent-white"
              />
              <span>Enabled (Default)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#80858e] hover:text-white">
              <input
                type="radio"
                name="csrf_tokens"
                value="disabled"
                checked={settings.csrf_tokens === 'disabled'}
                onChange={() => setSettings((s) => ({ ...s, csrf_tokens: 'disabled' }))}
                className="text-white accent-white"
              />
              <span>Disabled</span>
            </label>
          </div>
        </div>

        {/* Submit Button with Loader */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold text-xs tracking-wide transition-all shadow-sm disabled:opacity-50 cursor-pointer min-w-[140px]"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

