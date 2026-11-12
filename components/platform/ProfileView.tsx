'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ShieldCheck, Pencil, Check, X, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import DevicesModal from './DevicesModal';
import TwoFactorAuthModal from './TwoFactorAuthModal';
import BoringAvatar from '@/components/ui/BoringAvatar';

interface ProfileViewProps {
  user: {
    id: string;
    email: string;
    name: string;
    balance?: number;
    currency?: 'USD' | 'BDT';
    balance_usd?: number;
    balance_bdt?: number;
  };
  onLogout: () => void;
  /** Persists name/email edits. Omit to hide the edit affordances. */
  onSaveProfile?: (patch: { name?: string; email?: string }) => Promise<void>;
  /** Persists a new password. Omit to hide the password section. */
  onSavePassword?: (newPassword: string) => Promise<void>;
}

const inputCls =
  'w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/50';

/**
 * Read-only value that swaps into an input on edit; the pencil turns into a
 * tick while editing so the affordance never disappears mid-change.
 */
function EditableField({
  label,
  value,
  type = 'text',
  mono = false,
  placeholder,
  onSave,
}: {
  label: string;
  value: string;
  type?: string;
  mono?: boolean;
  placeholder?: string;
  onSave: (next: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const cancel = () => {
    setDraft(value);
    setError('');
    setEditing(false);
  };

  const commit = async () => {
    const next = draft.trim();
    if (!next) {
      setError('Value cannot be empty.');
      return;
    }
    if (next === value.trim()) {
      setEditing(false);
      setError('');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(next);
      setEditing(false);
    } catch (err: any) {
      setError(err?.message || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[#80858e] text-xs font-medium">{label}</label>
      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <input
              autoFocus
              type={type}
              value={draft}
              placeholder={placeholder}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commit();
                }
                if (e.key === 'Escape') cancel();
              }}
              className={`${inputCls} ${mono ? 'font-mono' : ''} flex-1`}
            />
            <button
              type="button"
              onClick={commit}
              disabled={saving}
              aria-label={`Save ${label}`}
              className="p-2 rounded-xl bg-white text-black hover:bg-neutral-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={saving}
              aria-label={`Cancel ${label} edit`}
              className="p-2 rounded-xl bg-[#202023] border border-[#2E2E32] text-[#80858e] hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <span
              className={`flex-1 text-sm text-white break-all ${
                mono ? 'font-mono' : 'font-semibold'
              }`}
            >
              {value}
            </span>
            <button
              type="button"
              onClick={() => {
                setDraft(value);
                setError('');
                setEditing(true);
              }}
              aria-label={`Edit ${label}`}
              className="p-2 rounded-xl bg-[#202023] border border-[#2E2E32] text-[#80858e] hover:text-white hover:border-white/30 transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
      {error && <p className="text-[11px] text-rose-400">{error}</p>}
    </div>
  );
}

export default function ProfileView({ user, onLogout, onSaveProfile, onSavePassword }: ProfileViewProps) {
  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [language, setLanguage] = useState('System');
  const [theme, setTheme] = useState('Dark');

  // Password change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordOk, setPasswordOk] = useState(false);

  const handleSavePassword = async () => {
    setPasswordError('');
    setPasswordOk(false);
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    if (!onSavePassword) return;
    setSavingPassword(true);
    try {
      await onSavePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordOk(true);
    } catch (err: any) {
      setPasswordError(err?.message || 'Could not update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const applyThemeClass = (selectedTheme: string) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    if (selectedTheme === 'Light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else if (selectedTheme === 'Dark') {
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.remove('light');
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('fobign_theme') || 'Dark';
      Promise.resolve().then(() => {
        setTheme(savedTheme);
        applyThemeClass(savedTheme);
      });
    }
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fobign_theme', newTheme);
    }
    applyThemeClass(newTheme);
  };

  const getMaskedEmail = (email: string) => {
    const parts = email.split('@');
    if (parts !== undefined && parts.length === 2) {
      const name = parts[0];
      const domain = parts[1];
      if (name.length <= 5) return email;
      const start = name.substring(0, 5);
      const end = name.substring(name.length - 4);
      return `${start}*********${end}@${domain}`;
    }
    return email;
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7 font-['Nunito',sans-serif]">
      {/* Title */}
      <h1 className="text-2xl font-bold text-white tracking-tight">Profile</h1>

      {/* User Avatar with local Boring Avatar Marble variant */}
      <div className="flex items-center gap-4">
        <BoringAvatar name={user.name || user.email} size={60} />
        <div>
          <div className="text-base font-bold text-white">{user.name}</div>
          <div className="text-xs text-[#80858e] font-mono">{user.id}</div>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-5 text-xs">
        {/* Name */}
        {onSaveProfile ? (
          <EditableField
            label="Name"
            value={user.name}
            onSave={(next) => onSaveProfile({ name: next })}
          />
        ) : (
          <div className="space-y-1.5">
            <label className="text-[#80858e] text-xs font-medium">Name</label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{user.name}</span>
            </div>
          </div>
        )}

        {/* Email */}
        {onSaveProfile ? (
          <EditableField
            label="Email address"
            value={user.email}
            type="email"
            mono
            onSave={(next) => onSaveProfile({ email: next })}
          />
        ) : (
          <div className="space-y-1.5">
            <label className="text-[#80858e] text-xs font-medium">Email address</label>
            <div className="text-sm font-mono text-white">{getMaskedEmail(user.email)}</div>
          </div>
        )}

        {/* Language Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[#80858e] text-xs font-medium">Language</label>
          <div className="relative w-48">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-[#1B1B1C] border border-[#2E2E32] rounded-xl px-3 py-2 text-xs text-white appearance-none pr-8 focus:outline-none focus:border-white cursor-pointer"
            >
              <option value="System">System</option>
              <option value="English">English</option>
              <option value="Bengali">বাংলা (Bengali)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#80858e] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Theme Dropdown (Arrow icon inside box) */}
        <div className="space-y-1.5">
          <label className="text-[#80858e] text-xs font-medium block">
            Theme
          </label>
          <div className="relative w-48">
            <select
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value)}
              className="w-full bg-[#1B1B1C] border border-[#2E2E32] rounded-xl px-3 py-2 text-xs text-white appearance-none pr-8 focus:outline-none focus:border-white cursor-pointer"
            >
              <option value="Dark">Dark</option>
              <option value="Light">Light</option>
              <option value="System">System</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#80858e] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Password */}
      {onSavePassword && (
        <div className="space-y-2 pt-2 border-t border-[#2A2A2E]">
          <label className="text-[#80858e] text-xs font-medium">Password</label>
          <div className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5 text-white border border-[#2E2E32] shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Change password</div>
                <div className="text-[11px] text-[#80858e]">
                  Use at least 6 characters. You stay signed in after changing it.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordOk(false);
                  }}
                  placeholder="New password"
                  className={`${inputCls} pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-2.5 text-[#80858e] hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordOk(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSavePassword();
                }}
                placeholder="Confirm password"
                className={inputCls}
              />
            </div>

            {(passwordError || passwordOk) && (
              <p className={`text-[11px] ${passwordError ? 'text-rose-400' : 'text-emerald-400'}`}>
                {passwordError || 'Password updated successfully.'}
              </p>
            )}

            <button
              type="button"
              onClick={handleSavePassword}
              disabled={savingPassword || !newPassword || !confirmPassword}
              className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {savingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
              <span>{savingPassword ? 'Updating...' : 'Update password'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2FA Two-Factor Authentication Section */}
      <div className="space-y-2 pt-2 border-t border-[#2A2A2E]">
        <label className="text-[#80858e] text-xs font-medium flex items-center justify-between">
          <span>Two-Factor Authentication</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${is2FAEnabled ? 'bg-white/10 text-white border-white/20' : 'bg-neutral-800 text-neutral-400 border-neutral-700'}`}>
            {is2FAEnabled ? 'ENABLED' : 'DISABLED'}
          </span>
        </label>
        <div className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/5 text-white border border-[#2E2E32]">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Authenticator</div>
              <div className="text-[11px] text-[#80858e]">
                {is2FAEnabled ? 'Your account is secured with 2FA authenticator codes.' : 'Add an extra layer of security to your account.'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShow2FAModal(true)}
            className="bg-white hover:bg-neutral-200 text-black font-semibold text-xs px-4 py-2 rounded-xl transition-colors shadow-xs shrink-0"
          >
            {is2FAEnabled ? 'Manage 2FA' : 'Enable 2FA'}
          </button>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="pt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={onLogout}
          className="px-5 py-2 rounded-xl bg-[#202023] border border-[#2E2E32] text-white hover:bg-[#28282C] text-xs font-semibold transition-colors"
        >
          Log out
        </button>

        <button
          onClick={() => setShowDevicesModal(true)}
          className="px-5 py-2 rounded-xl bg-[#202023] border border-[#2E2E32] text-white hover:bg-[#28282C] text-xs font-semibold transition-colors"
        >
          Devices management
        </button>
      </div>

      {showDevicesModal && (
        <DevicesModal
          isOpen={showDevicesModal}
          onClose={() => setShowDevicesModal(false)}
          onLogoutAll={onLogout}
        />
      )}

      {show2FAModal && (
        <TwoFactorAuthModal
          isOpen={show2FAModal}
          onClose={() => setShow2FAModal(false)}
          userEmail={user.email}
          is2FAEnabled={is2FAEnabled}
          onStatusChange={(enabled) => setIs2FAEnabled(enabled)}
        />
      )}
    </div>
  );
}
