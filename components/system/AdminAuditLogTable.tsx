'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  RefreshCw,
  Filter,
  Sliders,
  Eye,
  X,
  Clock,
  ArrowUpDown,
} from 'lucide-react';
import type { AdminAuditLog } from '@/lib/types';

export default function AdminAuditLogTable() {
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [inspectLog, setInspectLog] = useState<AdminAuditLog | null>(null);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.auditLogs || []);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadLogs() {
      try {
        const res = await fetch('/api/admin/audit-logs');
        if (res.ok && isMounted) {
          const data = await res.json();
          setAuditLogs(data.auditLogs || []);
        }
      } catch (err) {
        console.error('Failed to fetch audit logs:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadLogs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & Search Logic
  const filteredLogs = useMemo(() => {
    return auditLogs
      .filter((log) => {
        // Category filter
        if (selectedCategory !== 'ALL' && log.category.toUpperCase() !== selectedCategory.toUpperCase()) {
          return false;
        }

        // Action type filter
        if (selectedAction !== 'ALL' && log.action !== selectedAction) {
          return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesAction = log.action.toLowerCase().includes(q);
          const matchesAdmin = log.admin_email.toLowerCase().includes(q);
          const matchesTarget = (log.target_resource || '').toLowerCase().includes(q);
          const matchesDetails = log.details.toLowerCase().includes(q);
          const matchesCategory = log.category.toLowerCase().includes(q);
          const matchesIp = (log.ip_address || '').toLowerCase().includes(q);

          return matchesAction || matchesAdmin || matchesTarget || matchesDetails || matchesCategory || matchesIp;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [auditLogs, searchQuery, selectedCategory, selectedAction, sortOrder]);

  // KPI Metrics
  const stats = useMemo(() => {
    const total = auditLogs.length;
    const financial = auditLogs.filter((l) => l.category === 'Financial' || l.action === 'BALANCE_ADJUSTMENT').length;
    const securityRoles = auditLogs.filter((l) => l.category === 'Roles' || l.category === 'Security' || l.action === 'ROLE_CHANGE').length;
    const uniqueAdmins = new Set(auditLogs.map((l) => l.admin_email)).size;

    return { total, financial, securityRoles, uniqueAdmins };
  }, [auditLogs]);

  // CSV Export handler
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ['ID', 'Timestamp', 'Admin Email', 'Action', 'Category', 'Target Resource', 'Details', 'IP Address'];
    const rows = filteredLogs.map((log) => [
      `"${log.id}"`,
      `"${log.created_at}"`,
      `"${log.admin_email}"`,
      `"${log.action}"`,
      `"${log.category}"`,
      `"${(log.target_resource || '').replace(/"/g, '""')}"`,
      `"${log.details.replace(/"/g, '""')}"`,
      `"${log.ip_address || '127.0.0.1'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `admin_audit_logs_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-['Nunito',sans-serif]">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Audit Logs</h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAuditLogs}
            disabled={loading}
            className="p-2.5 bg-[#171719] hover:bg-[#202024] border border-[#2B2B2F] rounded-xl text-[#80858e] hover:text-white transition-colors flex items-center justify-center disabled:opacity-50 cursor-pointer"
            title="Refresh Audit Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="bg-white hover:bg-neutral-200 text-black font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-4 space-y-1">
          <div className="text-xs text-[#80858e] font-medium">
            Total Logged Actions
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">{stats.total}</div>
        </div>

        <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-4 space-y-1">
          <div className="text-xs text-[#80858e] font-medium">
            Balance Adjustments
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">{stats.financial}</div>
        </div>

        <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-4 space-y-1">
          <div className="text-xs text-[#80858e] font-medium">
            Role &amp; Security Changes
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">{stats.securityRoles}</div>
        </div>

        <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-4 space-y-1">
          <div className="text-xs text-[#80858e] font-medium">
            Active Administrators
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">{stats.uniqueAdmins}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#7E828A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit trail by action, admin, user, details, or IP..."
              className="w-full bg-[#101012] border border-[#2B2B2F] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#656972] focus:outline-none focus:border-white/40 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#80858e] hover:text-white text-xs cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Category Select */}
            <div className="flex items-center gap-1.5 bg-[#101012] border border-[#2B2B2F] px-3 py-1.5 rounded-xl">
              <Filter className="w-3.5 h-3.5 text-[#7E828A]" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#171719] text-white">All Categories</option>
                <option value="Financial" className="bg-[#171719] text-white">Financial</option>
                <option value="Roles" className="bg-[#171719] text-white">Roles</option>
                <option value="Security" className="bg-[#171719] text-white">Security</option>
                <option value="Access" className="bg-[#171719] text-white">Access</option>
                <option value="System" className="bg-[#171719] text-white">System</option>
              </select>
            </div>

            {/* Action Select */}
            <div className="flex items-center gap-1.5 bg-[#101012] border border-[#2B2B2F] px-3 py-1.5 rounded-xl">
              <Sliders className="w-3.5 h-3.5 text-[#7E828A]" />
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#171719] text-white">All Action Types</option>
                <option value="BALANCE_ADJUSTMENT" className="bg-[#171719] text-white">Balance Adjustments</option>
                <option value="ROLE_CHANGE" className="bg-[#171719] text-white">Role Changes</option>
                <option value="USER_STATUS_CHANGE" className="bg-[#171719] text-white">User Status</option>
                <option value="PROVIDER_UPDATE" className="bg-[#171719] text-white">Provider Updates</option>
                <option value="SETTING_CHANGE" className="bg-[#171719] text-white">Setting Changes</option>
                <option value="KEY_REVOCATION" className="bg-[#171719] text-white">Key Revocations</option>
              </select>
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="flex items-center gap-1.5 bg-[#101012] border border-[#2B2B2F] hover:border-white/30 px-3 py-2 rounded-xl text-[#9ca3af] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#7E828A]" />
              <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Audit Log Table */}
      <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2B2B2F] text-[#80858e] bg-[#121214]">
                <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                <th className="py-3.5 px-4 font-semibold">Admin</th>
                <th className="py-3.5 px-4 font-semibold">Action</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Target Resource</th>
                <th className="py-3.5 px-4 font-semibold">Details</th>
                <th className="py-3.5 px-4 font-semibold">IP Address</th>
                <th className="py-3.5 px-4 font-semibold text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232326]">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} skullet-loading="true" className="animate-pulse">
                    <td className="py-3.5 px-4"><div className="h-4 w-32 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-28 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-20 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-16 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-36 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-40 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-24 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-4 w-12 bg-white/10 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#80858e]">
                    <p className="text-sm font-medium text-[#9ca3af]">No audit log entries match your filter.</p>
                    <p className="text-xs mt-1">Try resetting your search query or category options.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#1E1E22] transition-colors text-white">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-[#9ca3af] font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#656972]" />
                        <span>{log.created_at}</span>
                      </div>
                    </td>

                    {/* Admin */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{log.admin_email}</div>
                      <div className="text-[10px] text-[#656972] font-mono">{log.admin_id}</div>
                    </td>

                    {/* Action Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white/10 text-white border border-white/15">
                        {log.action}
                      </span>
                    </td>

                    {/* Category Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#252528] text-neutral-300">
                        {log.category}
                      </span>
                    </td>

                    {/* Target Resource */}
                    <td className="py-3.5 px-4 whitespace-nowrap max-w-[200px] truncate font-mono text-neutral-300">
                      {log.target_resource || 'System Global'}
                    </td>

                    {/* Details Summary */}
                    <td className="py-3.5 px-4 max-w-xs truncate text-[#d1d5db]">
                      {log.details}
                    </td>

                    {/* IP Address */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-[#80858e]">
                      {log.ip_address || '127.0.0.1'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setInspectLog(log)}
                        className="bg-[#242428] hover:bg-[#303036] text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Inspect full details"
                      >
                        <Eye className="w-3.5 h-3.5 text-neutral-400" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Detail Modal */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#171719] border border-[#303036] rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2B2B2F]">
              <h3 className="text-base font-bold text-white">Audit Log Entry Details</h3>
              <button
                onClick={() => setInspectLog(null)}
                className="text-[#80858e] hover:text-white p-1 rounded-lg hover:bg-[#252528] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#101012] p-3.5 rounded-xl border border-[#232326]">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#7E828A]">Log ID</div>
                  <div className="font-mono text-white mt-0.5">{inspectLog.id}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#7E828A]">Recorded Timestamp</div>
                  <div className="font-mono text-white mt-0.5">{inspectLog.created_at}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#7E828A]">Administrator Email</div>
                  <div className="font-semibold text-neutral-200 mt-0.5">{inspectLog.admin_email}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#7E828A]">Origin IP Address</div>
                  <div className="font-mono text-white mt-0.5">{inspectLog.ip_address || '127.0.0.1'}</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-[#7E828A] mb-1">Action &amp; Target</div>
                <div className="p-3 bg-[#101012] rounded-xl border border-[#232326] flex items-center justify-between">
                  <span className="font-mono font-bold text-white">{inspectLog.action}</span>
                  <span className="text-neutral-400 font-mono text-[11px]">{inspectLog.target_resource || 'System Global'}</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-[#7E828A] mb-1">Details &amp; Metadata</div>
                <div className="p-3 bg-[#101012] rounded-xl border border-[#232326] text-[#d1d5db] font-mono leading-relaxed whitespace-pre-wrap">
                  {inspectLog.details}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectLog(null)}
                className="bg-white hover:bg-neutral-200 text-black font-semibold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
