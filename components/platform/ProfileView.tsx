'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ShieldCheck } from 'lucide-react';
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
}

export default function ProfileView({ user, onLogout }: ProfileViewProps) {
  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [language, setLanguage] = useState('System');
  const [theme, setTheme] = useState('Dark');

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
        <div className="space-y-1.5">
          <label className="text-[#80858e] text-xs font-medium">Name</label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{user.name}</span>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-[#80858e] text-xs font-medium">Email address</label>
          <div className="text-sm font-mono text-white">{getMaskedEmail(user.email)}</div>
        </div>

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
