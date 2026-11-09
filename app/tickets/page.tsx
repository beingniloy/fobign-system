'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Check,
  Loader2,
  ChevronRight,
  Filter,
} from 'lucide-react';
import BoringAvatar from '@/components/ui/BoringAvatar';
import type { SupportTicket } from '@/lib/types';

export default function AdminTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'answered' | 'customer-reply' | 'closed'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionPending, setBulkActionPending] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tickets');
      if (res.ok) {
        const data = await res.json();
        if (data.tickets && Array.isArray(data.tickets)) {
          setTickets(data.tickets);
        }
      }
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatus = async (status: string) => {
    if (selectedIds.length === 0) return;
    setBulkActionPending(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'batch_status',
          ticket_ids: selectedIds,
          status,
        }),
      });
      if (res.ok) {
        setSelectedIds([]);
        loadTickets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBulkActionPending(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const rawStatus = (t.status || 'Open').toLowerCase();
    if (statusFilter === 'open' && rawStatus !== 'open') return false;
    if (statusFilter === 'answered' && rawStatus !== 'answered') return false;
    if (statusFilter === 'customer-reply' && !rawStatus.includes('customer') && !rawStatus.includes('reply')) return false;
    if (statusFilter === 'closed' && rawStatus !== 'closed' && rawStatus !== 'resolved') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSubject = t.subject?.toLowerCase().includes(q);
      const matchNo = ((t as any).ticket_no || t.id)?.toLowerCase().includes(q);
      const matchUser = t.user_id?.toLowerCase().includes(q);
      return matchSubject || matchNo || matchUser;
    }
    return true;
  });

  const counts = {
    all: tickets.length,
    open: tickets.filter((t) => (t.status || '').toLowerCase() === 'open').length,
    answered: tickets.filter((t) => (t.status || '').toLowerCase() === 'answered').length,
    closed: tickets.filter((t) => {
      const s = (t.status || '').toLowerCase();
      return s === 'closed' || s === 'resolved';
    }).length,
  };

  const getStatusBadge = (status: string) => {
    const s = (status || 'Open').toLowerCase();
    if (s === 'open') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Open
        </span>
      );
    }
    if (s === 'answered') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-950/60 text-blue-300 border border-blue-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          Answered
        </span>
      );
    }
    if (s.includes('customer') || s.includes('reply') || s === 'pending') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Customer-Reply
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-neutral-900 text-neutral-400 border border-neutral-800">
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
        Closed
      </span>
    );
  };

  const getPriorityBadge = (priority?: string) => {
    const p = (priority || 'medium').toLowerCase();
    if (p === 'urgent' || p === 'high') {
      return <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">{priority}</span>;
    }
    if (p === 'low') {
      return <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{priority}</span>;
    }
    return <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-300">{priority || 'Medium'}</span>;
  };

  return (
    <div className="space-y-6 font-['Nunito',sans-serif]">
      {/* Title strictly text, no description, no icon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tickets</h1>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-[#1C1D20] border border-[#2B2D31] px-3 py-1.5 rounded-xl">
            <span className="text-xs text-[#9499a0] font-semibold">{selectedIds.length} selected</span>
            <button
              onClick={() => handleBulkStatus('Closed')}
              disabled={bulkActionPending}
              className="text-xs text-white hover:text-red-400 px-2 py-1 rounded-lg hover:bg-[#252529] font-medium transition-colors"
            >
              Close Selected
            </button>
            <button
              onClick={() => handleBulkStatus('Open')}
              disabled={bulkActionPending}
              className="text-xs text-white hover:text-emerald-400 px-2 py-1 rounded-lg hover:bg-[#252529] font-medium transition-colors"
            >
              Reopen Selected
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Tickets', count: counts.all },
          { label: 'Open', count: counts.open },
          { label: 'Answered', count: counts.answered },
          { label: 'Closed', count: counts.closed },
        ].map((stat, i) => (
          <div key={i} className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-4 space-y-1">
            <div className="text-[11px] font-semibold text-[#80858e] uppercase tracking-wider">{stat.label}</div>
            <div className="text-2xl font-bold text-white tabular-nums">{stat.count}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#171719] border border-[#2B2B2F] p-3 rounded-2xl">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'open', label: 'Open' },
            { id: 'answered', label: 'Answered' },
            { id: 'customer-reply', label: 'Customer Reply' },
            { id: 'closed', label: 'Closed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-white text-black'
                  : 'text-[#80858e] hover:text-white hover:bg-[#222225]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets or user..."
            className="w-full bg-[#121214] border border-[#2E2E32] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-white transition-colors"
          />
        </div>
      </div>

      {/* Ticket List Table */}
      <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#80858e] space-y-2" skullet-loading="true">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-neutral-400" />
            <p>Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#80858e] space-y-2">
            <p className="font-semibold text-white">No tickets found</p>
            <p>No user support tickets match your filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#252528] bg-[#141416] text-[#71717A] uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredTickets.length && filteredTickets.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(filteredTickets.map((t) => t.id));
                        else setSelectedIds([]);
                      }}
                      className="accent-white bg-black border-[#3F3F46] rounded"
                    />
                  </th>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232326]">
                {filteredTickets.map((ticket) => {
                  const isSelected = selectedIds.includes(ticket.id);
                  const ticketNumber = (ticket as any).ticket_no || `#TCK-${ticket.id.slice(0, 6)}`;
                  const repliesCount = Array.isArray(ticket.replies) ? ticket.replies.length : 0;

                  return (
                    <tr
                      key={ticket.id}
                      className="hover:bg-[#1B1B1E] transition-colors group cursor-pointer"
                      onClick={() => router.push(`/tickets/${ticket.id}`)}
                    >
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds([...selectedIds, ticket.id]);
                            else setSelectedIds(selectedIds.filter((id) => id !== ticket.id));
                          }}
                          className="accent-white bg-black border-[#3F3F46] rounded"
                        />
                      </td>

                      <td className="py-3 px-4 min-w-[200px]">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-[#80858e] font-semibold">{ticketNumber}</span>
                            {repliesCount > 0 && (
                              <span className="text-[10px] bg-[#222225] text-[#9ca3af] px-1.5 py-0.5 rounded-md font-semibold">
                                {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}
                              </span>
                            )}
                          </div>
                          <div className="text-white font-semibold text-xs group-hover:text-neutral-200 transition-colors line-clamp-1">
                            {ticket.subject}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 min-w-[150px]">
                        <div className="flex items-center gap-2">
                          <BoringAvatar name={ticket.user_id || 'User'} size={22} />
                          <span className="text-white font-medium truncate max-w-[140px]">
                            {ticket.user_id || 'Guest'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {getPriorityBadge(ticket.priority)}
                      </td>

                      <td className="py-3 px-4">
                        {getStatusBadge(ticket.status)}
                      </td>

                      <td className="py-3 px-4 text-[#80858e] whitespace-nowrap text-[11px] tabular-nums">
                        {ticket.updated_at || ticket.created_at || 'Recently'}
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={`/tickets/${ticket.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#222225] hover:bg-white hover:text-black border border-[#2E2E32] text-xs font-semibold text-white transition-all shadow-xs"
                        >
                          <span>Reply</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

