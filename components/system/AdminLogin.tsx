'use client';

import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import FobignLogo from '@/components/ui/FobignLogo';
import { writeAdminSession } from '@/lib/adminSession';

interface AdminLoginProps {
  onSuccess: (admin: any) => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/system/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        writeAdminSession(data.admin);
        onSuccess(data.admin);
      } else {
        setError(data.error || 'Invalid admin email or password.');
      }
    } catch (err: any) {
      setError(`Login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#151517] flex items-center justify-center p-4 font-['Nunito',sans-serif]">
      <div className="w-full max-w-sm bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl p-7 space-y-6 shadow-2xl">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <FobignLogo size="lg" showBadge={true} badgeText="System" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">System Control Portal</h2>
            <p className="text-xs text-[#80858e] mt-1">
              Protected administrative gateway. Enter authorized root credentials.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-[#80858e] font-medium mb-1.5">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#80858e] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fobign.com"
                className="w-full bg-[#101113] border border-[#2E2E32] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#555861] focus:outline-none focus:border-white/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#80858e] font-medium mb-1.5">Admin Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#80858e] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-[#101113] border border-[#2E2E32] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#555861] focus:outline-none focus:border-white/50 transition-colors"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-neutral-200 text-black font-bold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <span>Access System Portal</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
