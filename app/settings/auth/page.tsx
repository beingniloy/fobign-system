'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  KeyRound,
  ShieldCheck,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';
import type { AuthSettings } from '@/lib/types';

export default function AuthSettingsPage() {
  const [settings, setSettings] = useState<AuthSettings>({
    email_auth_enabled: true,
    email_verification_required: true,
    phone_auth_enabled: false,
    google_auth_enabled: true,
    google_client_id: '',
    google_client_secret: '',
    github_auth_enabled: true,
    github_client_id: '',
    github_client_secret: '',
    supabase_callback_url: 'https://oltjngakooyiysonlkqi.supabase.co/auth/v1/callback',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copiedCallback, setCopiedCallback] = useState(false);
  const [showGoogleSecret, setShowGoogleSecret] = useState(false);
  const [showGithubSecret, setShowGithubSecret] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings/auth');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setSettings(data.settings);
          }
        }
      } catch (err) {
        console.error('Failed to load auth settings', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCopyCallback = () => {
    navigator.clipboard.writeText(settings.supabase_callback_url);
    setCopiedCallback(true);
    setTimeout(() => setCopiedCallback(false), 2000);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/settings/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback('Authentication settings updated successfully.');
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback(data.error || 'Failed to update settings.');
      }
    } catch (err: any) {
      setFeedback('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 font-['Nunito',sans-serif]">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Authentication</h1>
          <p className="text-xs text-[#80858e] mt-0.5">
            Configure authentication methods and OAuth social login providers for Supabase Auth.
          </p>
        </div>
        <button
          onClick={() => handleSave()}
          disabled={saving || loading}
          className="bg-white hover:bg-neutral-200 text-black font-semibold px-5 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Supabase OAuth Callback URL Box */}
      <div className="bg-[#171719] border border-[#2E2E32] rounded-2xl p-4 sm:p-5 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-white" />
            <span>Supabase OAuth Redirect / Callback URL</span>
          </span>
          <span className="text-[10px] font-mono uppercase bg-[#242428] text-[#80858e] px-2 py-0.5 rounded-md">
            Production URI
          </span>
        </div>
        <p className="text-[11px] text-[#80858e]">
          Add this redirect URI to your Google Cloud OAuth 2.0 Client and GitHub OAuth Application settings.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            readOnly
            value={settings.supabase_callback_url}
            className="flex-1 bg-[#121214] border border-[#28282C] rounded-xl px-3.5 py-2 text-xs font-mono text-neutral-300 select-all focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCopyCallback}
            className="px-3.5 py-2 rounded-xl bg-[#242428] hover:bg-white hover:text-black text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
          >
            {copiedCallback ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#80858e]" />
                <span>Copy URL</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Auth Providers Stack */}
      <div className="space-y-4">
        {/* Email & Password Authentication */}
        <div className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs text-xs">
          <div className="flex items-center justify-between border-b border-[#2B2B2F] pb-3">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-white" />
              <div>
                <h2 className="text-sm font-bold text-white">Email &amp; Password</h2>
                <p className="text-[11px] text-[#80858e]">Standard credentials registration and sign-in</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, email_auth_enabled: !settings.email_auth_enabled })}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                settings.email_auth_enabled ? 'bg-white' : 'bg-[#2E2E32]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                  settings.email_auth_enabled ? 'bg-black translate-x-5' : 'bg-[#80858e] translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="font-semibold text-white">Require Email Verification</div>
              <div className="text-[#80858e] text-[11px]">
                Users must verify their email address before issuing API keys or accessing wallets.
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setSettings({
                  ...settings,
                  email_verification_required: !settings.email_verification_required,
                })
              }
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                settings.email_verification_required ? 'bg-white' : 'bg-[#2E2E32]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                  settings.email_verification_required ? 'bg-black translate-x-5' : 'bg-[#80858e] translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Phone Authentication */}
        <div className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-white" />
              <div>
                <h2 className="text-sm font-bold text-white">Phone Authentication (SMS OTP)</h2>
                <p className="text-[11px] text-[#80858e]">Enable users to log in using phone number and one-time password</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, phone_auth_enabled: !settings.phone_auth_enabled })}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                settings.phone_auth_enabled ? 'bg-white' : 'bg-[#2E2E32]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                  settings.phone_auth_enabled ? 'bg-black translate-x-5' : 'bg-[#80858e] translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Google OAuth Provider */}
        <div className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs text-xs">
          <div className="flex items-center justify-between border-b border-[#2B2B2F] pb-3">
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <div>
                <h2 className="text-sm font-bold text-white">Google OAuth</h2>
                <p className="text-[11px] text-[#80858e]">Allow developers to sign in with Google accounts</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, google_auth_enabled: !settings.google_auth_enabled })}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                settings.google_auth_enabled ? 'bg-white' : 'bg-[#2E2E32]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                  settings.google_auth_enabled ? 'bg-black translate-x-5' : 'bg-[#80858e] translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-[#80858e] font-medium block">Google Client ID</label>
              <input
                type="text"
                value={settings.google_client_id}
                onChange={(e) => setSettings({ ...settings, google_client_id: e.target.value })}
                placeholder="xxxx.apps.googleusercontent.com"
                className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white/50 font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#80858e] font-medium block">Google Client Secret</label>
              <div className="relative">
                <input
                  type={showGoogleSecret ? 'text' : 'password'}
                  value={settings.google_client_secret}
                  onChange={(e) => setSettings({ ...settings, google_client_secret: e.target.value })}
                  placeholder="GOCSPX-xxxx"
                  className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl pl-3.5 pr-10 py-2.5 text-white focus:outline-none focus:border-white/50 font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => setShowGoogleSecret(!showGoogleSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#80858e] hover:text-white"
                >
                  {showGoogleSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* GitHub OAuth Provider */}
        <div className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs text-xs">
          <div className="flex items-center justify-between border-b border-[#2B2B2F] pb-3">
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <div>
                <h2 className="text-sm font-bold text-white">GitHub OAuth</h2>
                <p className="text-[11px] text-[#80858e]">Allow developers to sign in with GitHub accounts</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, github_auth_enabled: !settings.github_auth_enabled })}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                settings.github_auth_enabled ? 'bg-white' : 'bg-[#2E2E32]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                  settings.github_auth_enabled ? 'bg-black translate-x-5' : 'bg-[#80858e] translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-[#80858e] font-medium block">GitHub Client ID</label>
              <input
                type="text"
                value={settings.github_client_id}
                onChange={(e) => setSettings({ ...settings, github_client_id: e.target.value })}
                placeholder="Ov23li..."
                className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white/50 font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#80858e] font-medium block">GitHub Client Secret</label>
              <div className="relative">
                <input
                  type={showGithubSecret ? 'text' : 'password'}
                  value={settings.github_client_secret}
                  onChange={(e) => setSettings({ ...settings, github_client_secret: e.target.value })}
                  placeholder="ghp_..."
                  className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl pl-3.5 pr-10 py-2.5 text-white focus:outline-none focus:border-white/50 font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => setShowGithubSecret(!showGithubSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#80858e] hover:text-white"
                >
                  {showGithubSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

