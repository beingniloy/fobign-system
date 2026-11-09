'use client';

import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Gift, RefreshCw, X } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name: string;
  balance_usd: number;
  granted_usd: number;
  total_tokens: number;
  api_keys_count: number;
  created_at: string;
}

export default function UserManager() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [adjustingUser, setAdjustingUser] = useState<UserData | null>(null);
  const [balanceAdd, setBalanceAdd] = useState('10.00');
  const [grantedAdd, setGrantedAdd] = useState('0.00');

  const refreshUsers = async () => {
    try {
      const res = await fetch('/api/system/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await fetch('/api/system/users');
        if (res.ok && isMounted) {
          const data = await res.json();
          setUsers(data.users || []);
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

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingUser) return;

    try {
      const res = await fetch('/api/system/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: adjustingUser.id,
          balanceAdjustment: parseFloat(balanceAdd) || 0,
          grantedAdjustment: parseFloat(grantedAdd) || 0,
        }),
      });

      if (res.ok) {
        setAdjustingUser(null);
        refreshUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Developer Accounts & Balances</h2>
          <p className="text-xs text-[#80858e] mt-1">
            Separated `fobign_users` table managed under strict admin control. Adjust wallet balances and promotional credits.
          </p>
        </div>
        <button
          onClick={refreshUsers}
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
                <th className="py-3.5 px-5 font-normal">Developer</th>
                <th className="py-3.5 px-5 font-normal">Topped-up Balance</th>
                <th className="py-3.5 px-5 font-normal">Granted Credits</th>
                <th className="py-3.5 px-5 font-normal">Processed Tokens</th>
                <th className="py-3.5 px-5 font-normal">API Keys</th>
                <th className="py-3.5 px-5 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232528]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#1c1d20]/60 transition-colors text-white">
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <div className="font-medium text-white">{u.name}</div>
                    <div className="text-[11px] text-[#80858e]">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap font-mono tabular-nums">
                    <span className={u.balance_usd < 0 ? 'text-amber-400' : 'text-emerald-400'}>
                      ${u.balance_usd.toFixed(2)} USD
                    </span>
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap font-mono tabular-nums text-purple-400">
                    ${u.granted_usd.toFixed(2)} USD
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap font-mono text-[#cbd5e1] tabular-nums">
                    {u.total_tokens.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap text-[#80858e] tabular-nums">
                    {u.api_keys_count} keys
                  </td>
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <button
                      onClick={() => setAdjustingUser(u)}
                      className="bg-[#282a2e] hover:bg-[#32353a] text-white text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Adjust Funds</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Funds Modal */}
      {adjustingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#16181b] border border-[#303236] rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Adjust Developer Balance</h3>
              <button onClick={() => setAdjustingUser(null)} className="text-[#80858e] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#9499a0] pb-1 border-b border-[#2b2d31]">
              Target: <span className="text-white font-medium">{adjustingUser.email}</span> (Current: ${adjustingUser.balance_usd.toFixed(2)})
            </div>

            <form onSubmit={handleAdjustBalance} className="space-y-4">
              <div>
                <label className="block text-xs text-[#9499a0] mb-1 font-medium">Add Topped-up Balance ($ USD)</label>
                <input
                  type="number"
                  step="1"
                  value={balanceAdd}
                  onChange={(e) => setBalanceAdd(e.target.value)}
                  placeholder="e.g. 10.00"
                  className="w-full bg-[#101113] border border-[#2b2d31] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9499a0] mb-1 font-medium">Add Free Granted Credits ($ USD)</label>
                <input
                  type="number"
                  step="1"
                  value={grantedAdd}
                  onChange={(e) => setGrantedAdd(e.target.value)}
                  placeholder="e.g. 5.00"
                  className="w-full bg-[#101113] border border-[#2b2d31] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingUser(null)}
                  className="px-4 py-2 rounded-xl text-xs text-[#80858e] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-5 py-2 rounded-xl transition-colors"
                >
                  Confirm Credit Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
