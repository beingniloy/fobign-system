'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

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
        sessionStorage.setItem('fobign_admin_session', JSON.stringify(data.admin));
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
    <div className="min-h-screen bg-[#0e0f11] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#16181b] border border-[#2b2d31] rounded-2xl p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#4d7cfe]/10 border border-[#4d7cfe]/20 text-[#4d7cfe] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">System Admin</h2>
          <p className="text-xs text-[#80858e]">
            Restricted Control Panel. Enter your credentials to access system management.
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-[#9499a0] font-medium mb-1.5">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#4d7cfe] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                className="w-full bg-[#101113] border border-[#2b2d31] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#555a64] focus:outline-none focus:border-[#4d7cfe] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#9499a0] font-medium mb-1.5">Admin Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#4d7cfe] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-[#101113] border border-[#2b2d31] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#555a64] focus:outline-none focus:border-[#4d7cfe] transition-colors"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4d7cfe] hover:bg-[#3d6cee] text-white font-medium text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <span>Access System Console</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
