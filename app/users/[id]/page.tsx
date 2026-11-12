'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Key,
  Layers,
  MessageSquare,
  Shield,
  Clock,
  Ban,
  Slash,
  CheckCircle2,
  AlertCircle,
  Save,
  Check,
  Calendar,
  Lock,
  Loader2,
  Plus,
  Minus,
  Gift,
  Wallet,
  Eye,
  EyeOff,
  Mail,
  Send,
} from 'lucide-react';
import BoringAvatar from '@/components/ui/BoringAvatar';
import ActivityStreak from '@/components/shared/ActivityStreak';
import type { User as UserType } from '@/lib/types';

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const userId = resolvedParams.id;

  const [user, setUser] = useState<UserType | null>(null);
  const [usage, setUsage] = useState<any[]>([]);
  const [keys, setKeys] = useState<any[]>([]);
  const [commLogs, setCommLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Credit / Debit states
  const [creditMode, setCreditMode] = useState<'credit' | 'debit'>('credit');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [isGrantedQuota, setIsGrantedQuota] = useState(true);
  const [adjusting, setAdjusting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('developer');
  const [status, setStatus] = useState('active');
  const [balance, setBalance] = useState('0');
  const [currency, setCurrency] = useState<'USD' | 'BDT'>('USD');

  // Password & Reset states
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch(`/api/system/users?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            setName(data.user.name || '');
            setUsername(data.user.username || '');
            setEmail(data.user.email || '');
            setRole(data.user.role || 'developer');
            setStatus(data.user.status || 'active');
            setBalance(String(data.user.balance ?? 0));
            setCurrency(data.user.currency || 'USD');
          }
          if (data.usage) setUsage(data.usage);
          if (data.keys) setKeys(data.keys);
          if (data.commLogs) setCommLogs(data.commLogs);
        } else {
          setFeedback('User not found.');
        }
      } catch (err: any) {
        setFeedback('Failed to load user: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [userId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/system/users`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name,
          username,
          email,
          role,
          status,
          balance: parseFloat(balance) || 0,
          currency,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setFeedback('User profile updated successfully.');
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback(data.error || 'Failed to update user profile.');
      }
    } catch (err: any) {
      setFeedback('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreditDebit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(adjustAmount);
    if (isNaN(val) || val <= 0) {
      setFeedback('Please enter a valid positive amount.');
      return;
    }
    setAdjusting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/system/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'credit_debit',
          mode: creditMode,
          amount: val,
          is_granted: isGrantedQuota,
          reason: adjustReason || (creditMode === 'credit' ? (isGrantedQuota ? 'Granted Quota Grant' : 'Wallet Credit') : 'Manual Adjustment'),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setBalance(String(data.user.balance ?? 0));
        setAdjustAmount('');
        setAdjustReason('');
        setFeedback(data.message || `Successfully applied ${creditMode.toUpperCase()}.`);
        setTimeout(() => setFeedback(null), 5000);
      } else {
        setFeedback(data.error || 'Failed to adjust balance.');
      }
    } catch (err: any) {
      setFeedback('Error: ' + err.message);
    } finally {
      setAdjusting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setFeedback('Password must be at least 6 characters.');
      return;
    }
    setUpdatingPassword(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/system/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'change_password',
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewPassword('');
        setFeedback(data.message || 'Password updated successfully.');
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback(data.error || 'Failed to update password.');
      }
    } catch (err: any) {
      setFeedback('Error: ' + err.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSendPasswordReset = async () => {
    setSendingReset(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/system/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'send_password_reset',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback(data.message || `Password reset email dispatched to ${email}.`);
        setTimeout(() => setFeedback(null), 5000);
      } else {
        setFeedback(data.error || 'Failed to send password reset email.');
      }
    } catch (err: any) {
      setFeedback('Error: ' + err.message);
    } finally {
      setSendingReset(false);
    }
  };

  // Generate 52 weeks GitHub-style activity grid (theme monochrome)
  const streakWeeks = Array.from({ length: 28 }, (_, wIdx) => {
    return Array.from({ length: 7 }, (_, dIdx) => {
      // Deterministic streak pattern based on user hash & week
      const seed = (wIdx * 7 + dIdx + (userId.charCodeAt(userId.length - 1) || 0)) % 10;
      let count = 0;
      if (seed > 6) count = (seed - 5) * 12;
      return { day: dIdx, count };
    });
  });

  const totalTokens = usage.reduce((sum, u) => sum + (u.total_tokens || 0), 0);
  const totalRequests = usage.length || commLogs.length;

  if (loading) {
    return (
      <div className="space-y-6 font-['Nunito',sans-serif]" skullet-loading="true">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-48 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4 font-['Nunito',sans-serif]">
        <Link href="/users" className="inline-flex items-center gap-1.5 text-xs text-[#80858e] hover:text-white">
          <ChevronLeft className="w-4 h-4" /> Back to Users
        </Link>
        <div className="p-8 text-center bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl">
          <AlertCircle className="w-8 h-8 text-[#80858e] mx-auto mb-2" />
          <h2 className="text-sm font-bold text-white">Developer Not Found</h2>
          <p className="text-xs text-[#80858e] mt-1">No user account found matching identifier "{userId}".</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-['Nunito',sans-serif]">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/users"
          className="inline-flex items-center gap-1.5 text-xs text-[#80858e] hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Users
        </Link>
        <span className="text-[10px] font-mono text-[#80858e]">UUID: {user.id}</span>
      </div>

      {feedback && (
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header Profile Bar */}
      <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <BoringAvatar name={user.name || user.email || 'User'} size={56} />
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">{user.name || 'Unnamed Developer'}</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#222226] text-neutral-300 border border-white/10 uppercase">
                {user.role || 'developer'}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20 capitalize">
                {user.status || 'active'}
              </span>
            </div>
            <div className="text-xs font-mono text-[#80858e]">{user.email}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-[#2B2B2F] pt-4 md:pt-0 md:pl-6">
          <div className="space-y-0.5">
            <div className="text-[10px] text-[#80858e] uppercase font-bold">Wallet Balance</div>
            <div className="text-xl font-bold text-white font-mono">
              ${(user.balance_usd ?? user.balance ?? 0).toFixed(2)} USD
            </div>
          </div>
          <div className="space-y-0.5 pl-4 border-l border-[#2B2B2F]">
            <div className="text-[10px] text-[#80858e] uppercase font-bold">Granted Quota</div>
            <div className="text-xl font-bold text-white font-mono">
              ${(user.granted_usd ?? 0).toFixed(2)} USD
            </div>
          </div>
          <div className="space-y-0.5 pl-4 border-l border-[#2B2B2F]">
            <div className="text-[10px] text-[#80858e] uppercase font-bold">Total Tokens</div>
            <div className="text-xl font-bold text-white font-mono">{totalTokens.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* GitHub-style Activity Streak */}
      <ActivityStreak totalRequests={totalRequests} recentLogs={usage} weeksCount={42} />

      {/* Grid: Edit Profile & Balance Adjustment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile & Status Card */}
        <form onSubmit={handleSaveProfile} className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#252528] pb-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Account Credentials &amp; Access</h2>
            <button
              type="submit"
              disabled={saving}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[#80858e] font-medium mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white/50"
              />
            </div>

            <div>
              <label className="block text-[#80858e] font-medium mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
                placeholder="login handle (letters, numbers, . _ -)"
                className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
              />
              <p className="text-[10px] text-[#80858e] mt-1">
                Used to sign in alongside the email address. Leave blank to disable.
              </p>
            </div>

            <div>
              <label className="block text-[#80858e] font-medium mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#80858e] font-medium mb-1">Developer Role</label>
                <select
                  value={role === 'admin' || role === 'administrator' ? 'developer' : role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white/50 cursor-pointer"
                >
                  <option value="developer">Developer (Standard)</option>
                  <option value="enterprise">Enterprise Tier</option>
                  <option value="team_member">Team Member</option>
                  <option value="viewer">Read-Only Viewer</option>
                </select>
              </div>

              <div>
                <label className="block text-[#80858e] font-medium mb-1">Account Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white/50 cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="restricted">Restricted (24h)</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#80858e] font-medium mb-1">Billing Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white/50 cursor-pointer"
              >
                <option value="USD">USD ($)</option>
                <option value="BDT">BDT (৳)</option>
              </select>
            </div>

            {/* Password Credentials & Reset */}
            <div className="pt-3 border-t border-[#252528] space-y-3">
              <div>
                <label className="block text-[#80858e] font-medium mb-1">Set New Password</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min. 6 chars)"
                      className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-white/50 pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-[#80858e] hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={updatingPassword || !newPassword || newPassword.length < 6}
                    className="px-3.5 py-2 rounded-xl bg-[#252528] hover:bg-[#303035] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer shrink-0"
                  >
                    {updatingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                    <span>Update Password</span>
                  </button>
                </div>
              </div>

              {/* Password Reset Email Button */}
              <div className="p-3 rounded-xl bg-[#101113] border border-[#252528] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-white font-semibold text-xs flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#80858e]" />
                    <span>Send Password Reset Link</span>
                  </div>
                  <div className="text-[10px] text-[#80858e]">
                    Dispatches a secure password reset link to <span className="font-mono text-neutral-300">{email}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSendPasswordReset}
                  disabled={sendingReset}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {sendingReset ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{sendingReset ? 'Sending...' : 'Send Reset Email'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Credit / Debit System Card */}
        <form onSubmit={handleCreditDebit} className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#252528] pb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-neutral-300" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Credit / Debit Balance</h2>
            </div>
            <span className="text-[10px] font-mono text-[#80858e]">Logged to Transactions</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#101113] border border-[#2B2B2F] rounded-xl">
              <button
                type="button"
                onClick={() => setCreditMode('credit')}
                className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  creditMode === 'credit'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-[#80858e] hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Credit (+)</span>
              </button>
              <button
                type="button"
                onClick={() => setCreditMode('debit')}
                className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  creditMode === 'debit'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'text-[#80858e] hover:text-white'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Debit (-)</span>
              </button>
            </div>

            {/* Amount input */}
            <div>
              <label className="block text-[#80858e] font-medium mb-1">Adjustment Amount ($ USD)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="e.g. 5.00"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
              />
            </div>

            {/* Reason / Reference note */}
            <div>
              <label className="block text-[#80858e] font-medium mb-1">Transaction Reason / Note</label>
              <input
                type="text"
                placeholder={creditMode === 'credit' ? 'e.g. Granted promotional trial quota' : 'e.g. Quota adjustment'}
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white/50"
              />
            </div>

            {/* Granted Quota Option */}
            {creditMode === 'credit' && (
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#101113] border border-[#252528] cursor-pointer hover:border-[#353538] transition-colors">
                <input
                  type="checkbox"
                  checked={isGrantedQuota}
                  onChange={(e) => setIsGrantedQuota(e.target.checked)}
                  className="accent-white rounded"
                />
                <div>
                  <span className="block text-white font-semibold text-xs">Mark as Granted Quota</span>
                  <span className="text-[10px] text-[#80858e]">
                    Appears in developer's /transactions page under the "Granted" tab.
                  </span>
                </div>
              </label>
            )}

            {/* Action Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={adjusting || !adjustAmount}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 ${
                  creditMode === 'credit'
                    ? 'bg-white hover:bg-neutral-200 text-black'
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
              >
                {adjusting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : creditMode === 'credit' ? (
                  <Plus className="w-3.5 h-3.5" />
                ) : (
                  <Minus className="w-3.5 h-3.5" />
                )}
                <span>{adjusting ? 'Applying...' : `Apply ${creditMode === 'credit' ? 'Credit' : 'Debit'}`}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

        {/* API Keys Card */}
        <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#252528] pb-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Provisioned API Keys</h2>
            <span className="text-[11px] font-mono text-[#80858e]">{keys.length} active keys</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {keys.length === 0 ? (
              <div className="p-4 text-center text-[#80858e] text-xs">No API keys provisioned for this user.</div>
            ) : (
              keys.map((k) => (
                <div
                  key={k.id}
                  className="p-3 rounded-xl bg-[#121214] border border-[#252528] flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{k.name || 'Unnamed Key'}</span>
                    </div>
                    <div className="text-[11px] font-mono text-[#80858e]">
                      {k.prefix || 'sk-fobign-'}••••••••{k.last_four || 'xxxx'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-mono">
                      {k.created_at ? new Date(k.created_at).toLocaleDateString() : 'Active'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      {/* Usage Telemetry & Invocations */}
      <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#252528] pb-3">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Recent Telemetry &amp; Invocations</h2>
          <span className="text-[11px] font-mono text-[#80858e]">{commLogs.length} logged calls</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#252528] text-[#80858e] text-[11px]">
                <th className="py-2.5 px-3">Model</th>
                <th className="py-2.5 px-3">Endpoint</th>
                <th className="py-2.5 px-3 text-right">Tokens</th>
                <th className="py-2.5 px-3 text-right">Latency</th>
                <th className="py-2.5 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202023] text-white font-mono text-[11px]">
              {commLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#80858e]">
                    No inference telemetry logged yet for this account.
                  </td>
                </tr>
              ) : (
                commLogs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="hover:bg-[#1E1E22]">
                    <td className="py-2.5 px-3 text-white font-sans font-semibold">{log.model}</td>
                    <td className="py-2.5 px-3 text-[#80858e]">{log.endpoint}</td>
                    <td className="py-2.5 px-3 text-right text-neutral-300">
                      {(log.total_tokens || 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#80858e]">{log.latency_ms || 240}ms</td>
                    <td className="py-2.5 px-3 text-right text-[#80858e]">
                      {log.created_at ? new Date(log.created_at).toLocaleTimeString() : 'Recent'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

