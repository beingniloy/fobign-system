'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Edit2,
  CheckCircle2,
  Shield,
  Clock,
  Ban,
  Slash,
  MessageSquare,
  Lock,
  X,
  AlertTriangle,
  RotateCcw,
  Check,
  MoreVertical,
  Eye,
} from 'lucide-react';
import BoringAvatar from '@/components/ui/BoringAvatar';
import { User as UserType } from '@/lib/types';

interface DecryptedCommLog {
  id: string;
  user_id: string;
  user_email?: string;
  endpoint: string;
  model: string;
  prompt: any;
  response: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number;
  status_code: number;
  client_ip?: string;
  created_at: string;
  is_e2ee: boolean;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionModalUser, setActionModalUser] = useState<UserType | null>(null);

  // Modals state
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [editCurrency, setEditCurrency] = useState<'USD' | 'BDT'>('USD');

  // Restrict Modal
  const [restrictModalUser, setRestrictModalUser] = useState<UserType | null>(null);
  const [restrictHours, setRestrictHours] = useState('24');
  const [restrictReason, setRestrictReason] = useState('');

  // Logs Modal
  const [logsModalUser, setLogsModalUser] = useState<UserType | null>(null);
  const [commLogs, setCommLogs] = useState<DecryptedCommLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/system/users');
        if (res.ok) {
          const data = await res.json();
          if (data.users) {
            setUsers(data.users);
          }
        }
      } catch (e) {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdateBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const res = await fetch('/api/system/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'adjust_balance',
          userId: selectedUser.id,
          new_balance: parseFloat(editBalance),
          currency: editCurrency,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id
              ? { ...u, balance: parseFloat(editBalance), balance_usd: parseFloat(editBalance), currency: editCurrency }
              : u
          )
        );
        setFeedback(`Updated balance for ${selectedUser.name} to ${editCurrency === 'USD' ? '$' : '৳'}${editBalance}`);
        setSelectedUser(null);
      }
    } catch (e: any) {
      setFeedback('Error updating user balance: ' + e.message);
    }
  };

  const handleApplyRestriction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restrictModalUser) return;
    try {
      const res = await fetch('/api/system/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restrict',
          userId: restrictModalUser.id,
          duration_hours: Number(restrictHours),
          reason: restrictReason || `Restricted for ${restrictHours} hours`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const restrictedUntil = new Date(Date.now() + Number(restrictHours) * 60 * 60 * 1000).toISOString();
        setUsers((prev) =>
          prev.map((u) =>
            u.id === restrictModalUser.id
              ? { ...u, status: 'restricted', restricted_until: restrictedUntil }
              : u
          )
        );
        setFeedback(`Applied ${restrictHours}h restriction to ${restrictModalUser.name}`);
        setRestrictModalUser(null);
      }
    } catch (e: any) {
      setFeedback('Failed to restrict user: ' + e.message);
    }
  };

  const handleSetStatus = async (user: UserType, status: 'suspend' | 'ban' | 'activate') => {
    try {
      const res = await fetch('/api/system/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: status,
          userId: user.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const newStatus = status === 'suspend' ? 'suspended' : status === 'ban' ? 'banned' : 'active';
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, status: newStatus, restricted_until: null } : u
          )
        );
        setFeedback(`Updated ${user.name} status to ${newStatus.toUpperCase()}`);
      }
    } catch (e: any) {
      setFeedback('Status update error: ' + e.message);
    }
  };

  const handleOpenLogs = async (user: UserType) => {
    setLogsModalUser(user);
    setLogsLoading(true);
    setCommLogs([]);
    try {
      const res = await fetch(`/api/system/users/logs?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setCommLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load communication logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 font-['Nunito',sans-serif]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Users</h1>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#80858e] absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user or email..."
            className="w-full bg-[#1B1B1C] border border-[#2E2E32] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-[#555861] focus:outline-none focus:border-white/50"
          />
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-white/5 border border-white/15 rounded-xl text-xs text-white flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-[#80858e] hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          /* Skullet Skeleton loading state */
          <div skullet-loading="true" className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-[#252528] last:border-none">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-3 w-28 bg-white/10 rounded animate-pulse" />
                    <div className="h-2.5 w-16 bg-white/5 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
                <div className="h-7 w-20 bg-white/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#171718] text-[#80858e] border-b border-[#2E2E32] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5 font-bold">User</th>
                  <th className="px-5 py-3.5 font-bold">Email</th>
                  <th className="px-5 py-3.5 font-bold">Balance</th>
                  <th className="px-5 py-3.5 font-bold">Status</th>
                  <th className="px-5 py-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252528] text-white">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-[#80858e]">
                      No developers found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const status = user.status || 'active';
                    return (
                      <tr key={user.id} className="hover:bg-[#202023] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <BoringAvatar name={user.name || user.email || 'Developer'} size={32} />
                            <div>
                              <div className="font-bold text-white">{user.name}</div>
                              <div className="text-[10px] text-[#80858e] font-mono">{user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-[#9ca3af]">
                          {user.email}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-mono font-bold text-white">
                            {user.currency === 'BDT'
                              ? `৳${(user.balance_bdt ?? user.balance ?? 0).toFixed(2)}`
                              : `$${(user.balance_usd ?? user.balance ?? 0).toFixed(2)}`}
                          </div>
                          <div className="text-[10px] text-[#80858e] uppercase font-bold">
                            {user.currency || 'USD'}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {status === 'active' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              Active
                            </span>
                          )}
                          {status === 'restricted' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              <Clock className="w-3 h-3" />
                              Restricted
                            </span>
                          )}
                          {status === 'suspended' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-neutral-700/50 text-neutral-300 border border-neutral-600">
                              <Slash className="w-3 h-3" />
                              Suspended
                            </span>
                          )}
                          {status === 'banned' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                              <Ban className="w-3 h-3" />
                              Banned
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setActionModalUser(user)}
                            className="p-1.5 rounded-lg hover:bg-[#2A2A2E] text-[#9ca3af] hover:text-white transition-colors cursor-pointer"
                            title="Open Actions Modal"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Balance Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-[#2E2E32] pb-3">
              <h3 className="text-sm font-bold text-white">Adjust Developer Wallet</h3>
              <button onClick={() => setSelectedUser(null)} className="text-[#80858e] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateBalance} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[#80858e]">New Balance Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#80858e]">Currency</label>
                <select
                  value={editCurrency}
                  onChange={(e) => setEditCurrency(e.target.value as 'USD' | 'BDT')}
                  className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white/50"
                >
                  <option value="USD">USD ($)</option>
                  <option value="BDT">BDT (৳)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl text-[#80858e] hover:text-white hover:bg-[#252528] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 cursor-pointer shadow-xs"
                >
                  Save Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restrict Duration Modal */}
      {restrictModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-[#2E2E32] pb-3">
              <h3 className="text-sm font-bold text-white">Restrict API Access</h3>
              <button onClick={() => setRestrictModalUser(null)} className="text-[#80858e] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyRestriction} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[#80858e]">Restriction Duration</label>
                <select
                  value={restrictHours}
                  onChange={(e) => setRestrictHours(e.target.value)}
                  className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white/50"
                >
                  <option value="1">1 Hour</option>
                  <option value="6">6 Hours</option>
                  <option value="24">24 Hours (1 Day)</option>
                  <option value="72">72 Hours (3 Days)</option>
                  <option value="168">7 Days (1 Week)</option>
                  <option value="720">30 Days (1 Month)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[#80858e]">Reason / Internal Audit Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Rate limit abuse cooldown"
                  value={restrictReason}
                  onChange={(e) => setRestrictReason(e.target.value)}
                  className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestrictModalUser(null)}
                  className="px-4 py-2 rounded-xl text-[#80858e] hover:text-white hover:bg-[#252528] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold hover:bg-amber-300 cursor-pointer shadow-xs"
                >
                  Apply Restriction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* E2EE Encrypted Communication Logs Modal */}
      {logsModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#171719] border border-[#2E2E32] rounded-2xl w-full max-w-3xl p-6 space-y-4 shadow-2xl text-xs max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2E2E32] pb-3 shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Communication Logs</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/15">
                    AES-256-GCM Decrypted
                  </span>
                </div>
                <div className="text-[11px] text-[#80858e] font-mono">
                  {logsModalUser.name} ({logsModalUser.email}) · User ID: {logsModalUser.id}
                </div>
              </div>

              <button
                onClick={() => setLogsModalUser(null)}
                className="text-[#80858e] hover:text-white p-1 rounded-lg hover:bg-[#252528] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Note about secrecy and knowledgebase */}
            <div className="bg-[#121214] border border-[#232326] p-3 rounded-xl flex items-center justify-between text-[11px] text-[#9ca3af] shrink-0">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-neutral-400" />
                <span>Archived via zero-knowledge E2EE pipeline. Ready for Knowledgebase Indexing &amp; Cache System.</span>
              </div>
              <span className="text-[10px] text-[#80858e] font-mono">User unaware of audit</span>
            </div>

            {/* Content pane */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {logsLoading ? (
                <div skullet-loading="true" className="space-y-3 py-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-[#1B1B1C] border border-[#2E2E32] rounded-xl p-4 space-y-2 animate-pulse">
                      <div className="h-3 w-48 bg-white/10 rounded" />
                      <div className="h-10 w-full bg-white/5 rounded" />
                    </div>
                  ))}
                </div>
              ) : commLogs.length === 0 ? (
                <div className="text-center py-12 text-[#80858e] space-y-1">
                  <MessageSquare className="w-8 h-8 text-[#45484f] mx-auto stroke-1" />
                  <div className="text-xs font-semibold text-white">No Communication Logs Recorded Yet</div>
                  <div className="text-[11px]">When this user sends requests to the Gateway, prompts and completions will appear here decrypted.</div>
                </div>
              ) : (
                commLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-[#1B1B1C] border border-[#2E2E32] rounded-xl p-4 space-y-3 hover:border-white/20 transition-all text-xs"
                  >
                    {/* Log metadata bar */}
                    <div className="flex items-center justify-between text-[11px] border-b border-[#28282C] pb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                          {log.endpoint}
                        </span>
                        <span className="text-white font-semibold">{log.model}</span>
                        <span className="text-emerald-400">HTTP {log.status_code}</span>
                      </div>
                      <div className="text-[#80858e] font-mono text-[10px]">
                        {new Date(log.created_at).toLocaleString()} · {log.latency_ms}ms · {log.total_tokens} tokens
                      </div>
                    </div>

                    {/* Prompt section */}
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-[#80858e] tracking-wider">
                        Decrypted Request Prompt
                      </div>
                      <div className="bg-[#121214] p-3 rounded-lg border border-[#232326] font-mono text-[11px] text-[#cbd5e1] whitespace-pre-wrap max-h-36 overflow-y-auto">
                        {typeof log.prompt === 'string'
                          ? log.prompt
                          : JSON.stringify(log.prompt, null, 2)}
                      </div>
                    </div>

                    {/* Response section */}
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-[#80858e] tracking-wider">
                        Decrypted Gateway Output
                      </div>
                      <div className="bg-[#121214] p-3 rounded-lg border border-[#232326] font-mono text-[11px] text-white whitespace-pre-wrap max-h-36 overflow-y-auto">
                        {log.response}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top of Screen 3-Dot User Actions Modal */}
      {actionModalUser && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#1C1C1F] border border-[#2E2E32] rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#2A2A2E] pb-3">
              <div className="flex items-center gap-3">
                <BoringAvatar name={actionModalUser.name || actionModalUser.email || 'User'} size={36} />
                <div>
                  <div className="font-bold text-white text-xs">{actionModalUser.name || 'Developer'}</div>
                  <div className="text-[10px] text-[#80858e] font-mono">{actionModalUser.email}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActionModalUser(null)}
                className="text-[#80858e] hover:text-white p-1 rounded-lg hover:bg-[#252529] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <Link
                href={`/users/${actionModalUser.id}`}
                onClick={() => setActionModalUser(null)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#141416] hover:bg-[#232327] border border-[#27272A] text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Eye className="w-4 h-4 text-neutral-300" />
                  <span className="font-semibold">View &amp; Edit Details</span>
                </div>
                <span className="text-[10px] text-[#80858e]">Profile, stats, streaks &rarr;</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  const u = actionModalUser;
                  setActionModalUser(null);
                  setSelectedUser(u);
                  setEditBalance(String(u.balance ?? 0));
                  setEditCurrency(u.currency || 'USD');
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#141416] hover:bg-[#232327] border border-[#27272A] text-white transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Edit2 className="w-4 h-4 text-neutral-300" />
                  <span className="font-semibold">Adjust Balance</span>
                </div>
                <span className="text-[10px] text-[#80858e]">USD / BDT wallet</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const u = actionModalUser;
                  setActionModalUser(null);
                  handleOpenLogs(u);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#141416] hover:bg-[#232327] border border-[#27272A] text-white transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-neutral-300" />
                  <span className="font-semibold">Inference Telemetry Logs</span>
                </div>
                <span className="text-[10px] text-[#80858e]">E2EE prompts &amp; latency</span>
              </button>

              {actionModalUser.status !== 'banned' && (
                <button
                  type="button"
                  onClick={() => {
                    const u = actionModalUser;
                    setActionModalUser(null);
                    setRestrictModalUser(u);
                    setRestrictHours('24');
                    setRestrictReason('');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#141416] hover:bg-[#232327] border border-[#27272A] text-[#9ca3af] hover:text-white transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold">Restrict Account</span>
                  </div>
                  <span className="text-[10px] text-[#80858e]">Temporary (24h)</span>
                </button>
              )}

              {actionModalUser.status !== 'suspended' && actionModalUser.status !== 'banned' ? (
                <button
                  type="button"
                  onClick={() => {
                    const u = actionModalUser;
                    setActionModalUser(null);
                    handleSetStatus(u, 'suspend');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#141416] hover:bg-[#232327] border border-[#27272A] text-[#9ca3af] hover:text-white transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Slash className="w-4 h-4 text-neutral-400" />
                    <span className="font-semibold">Suspend Account</span>
                  </div>
                  <span className="text-[10px] text-[#80858e]">Hold API access</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const u = actionModalUser;
                    setActionModalUser(null);
                    handleSetStatus(u, 'activate');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#141416] hover:bg-[#232327] border border-[#27272A] text-white transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <RotateCcw className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold">Reactivate Account</span>
                  </div>
                  <span className="text-[10px] text-emerald-400">Restore access</span>
                </button>
              )}

              {actionModalUser.status !== 'banned' ? (
                <button
                  type="button"
                  onClick={() => {
                    const u = actionModalUser;
                    setActionModalUser(null);
                    handleSetStatus(u, 'ban');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#141416] hover:bg-[#232327] border border-[#27272A] text-neutral-400 hover:text-white transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Ban className="w-4 h-4 text-rose-400" />
                    <span className="font-semibold">Ban Account</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">Permanently revoke access</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const u = actionModalUser;
                    setActionModalUser(null);
                    handleSetStatus(u, 'activate');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#141416] hover:bg-[#232327] border border-[#27272A] text-white transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <RotateCcw className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold">Unban User</span>
                  </div>
                  <span className="text-[10px] text-emerald-400">Remove ban</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
