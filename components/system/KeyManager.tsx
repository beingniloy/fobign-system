'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldAlert, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface KeyItem {
  id: string;
  name: string;
  tracking_id: string;
  key_preview: string;
  user_email: string;
  rpm_limit: number;
  tpm_limit: number;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export default function KeyManager() {
  const [keys, setKeys] = useState<KeyItem[]>([]);

  const refreshKeys = async () => {
    try {
      const res = await fetch('/api/system/keys');
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await fetch('/api/system/keys');
        if (res.ok && isMounted) {
          const data = await res.json();
          setKeys(data.keys || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleKeyStatus = async (key: KeyItem) => {
    try {
      const res = await fetch('/api/system/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: key.id,
          isActive: !key.is_active,
        }),
      });
      if (res.ok) {
        refreshKeys();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLimits = async (key: KeyItem, newRpm: number, newTpm: number) => {
    try {
      const res = await fetch('/api/system/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: key.id,
          rpmLimit: newRpm,
          tpmLimit: newTpm,
        }),
      });
      if (res.ok) {
        refreshKeys();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">API Key Inspector & Rate Limiter</h2>
          <p className="text-xs text-[#80858e] mt-1">
            Global monitoring of developer Bearer keys. Enforce Requests Per Minute (RPM) and Tokens Per Minute (TPM) limits.
          </p>
        </div>
        <button
          onClick={refreshKeys}
          className="p-2 bg-[#1c1d20] hover:bg-[#282a2e] border border-[#2b2d31] rounded-xl text-[#80858e] hover:text-white transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-[#16181b] border border-[#2b2d31] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2b2d31] text-[#80858e] bg-[#121316]">
                <th className="py-3.5 px-5 font-normal">Key Name</th>
                <th className="py-3.5 px-5 font-normal">Developer Email</th>
                <th className="py-3.5 px-5 font-normal">Masked Preview</th>
                <th className="py-3.5 px-5 font-normal">Tracking ID</th>
                <th className="py-3.5 px-5 font-normal">Rate Limits</th>
                <th className="py-3.5 px-5 font-normal">Status</th>
                <th className="py-3.5 px-5 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232528]">
              {keys.map((k, idx) => (
                <tr key={`${k.id}-${idx}`} className="hover:bg-[#1c1d20]/60 transition-colors text-white">
                  <td className="py-3.5 px-5 font-medium whitespace-nowrap">
                    {k.name}
                  </td>
                  <td className="py-3.5 px-5 text-[#80858e] whitespace-nowrap">
                    {k.user_email}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-[11px] text-indigo-400 whitespace-nowrap">
                    {k.key_preview}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-[11px] text-[#757a84] whitespace-nowrap">
                    {k.tracking_id}
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <span className="text-[11px] text-neutral-300 font-mono">
                      {k.rpm_limit} RPM · {(k.tpm_limit / 1000).toFixed(0)}k TPM
                    </span>
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] ${k.is_active ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {k.is_active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{k.is_active ? 'Active' : 'Revoked'}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleToggleKeyStatus(k)}
                      className={`text-[11px] px-3 py-1 rounded-lg font-medium transition-colors ${
                        k.is_active
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {k.is_active ? 'Revoke Key' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
