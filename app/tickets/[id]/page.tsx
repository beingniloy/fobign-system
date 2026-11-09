'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import BoringAvatar from '@/components/ui/BoringAvatar';
import type { SupportTicket, User as UserType } from '@/lib/types';

interface TicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminTicketDetailPage({ params }: TicketDetailPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const loadTicket = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${encodeURIComponent(ticketId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.ticket) {
          setTicket(data.ticket);
          setUser(data.user || null);
        } else {
          setError('Ticket not found');
        }
      } else {
        setError('Ticket not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSendingReply(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets/${encodeURIComponent(ticketId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reply',
          reply_message: replyMessage.trim(),
          author: 'Support Staff',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send reply');
      }

      setReplyMessage('');
      setTicket(data.ticket);
    } catch (err: any) {
      setError(err.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/tickets/${encodeURIComponent(ticketId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'status',
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTicket(data.ticket);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px]" skullet-loading="true">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="space-y-4 font-['Nunito',sans-serif]">
        <Link
          href="/tickets"
          className="inline-flex items-center gap-1.5 text-xs text-[#80858e] hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Tickets</span>
        </Link>
        <div className="p-8 text-center bg-[#171719] border border-[#2B2B2F] rounded-2xl text-xs space-y-2">
          <p className="font-semibold text-white">Ticket Not Found</p>
          <p className="text-[#80858e]">{error || 'No ticket matching this identifier.'}</p>
        </div>
      </div>
    );
  }

  const ticketNumber = (ticket as any).ticket_no || `#TCK-${ticket.id.slice(0, 6)}`;
  const replies = Array.isArray(ticket.replies)
    ? ticket.replies.filter((r, idx) => !(idx === 0 && r.message.trim() === ticket.message.trim()))
    : [];

  return (
    <div className="max-w-4xl space-y-6 font-['Nunito',sans-serif]">
      {/* Top Breadcrumb & Status Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/tickets"
            className="p-1.5 rounded-xl bg-[#222225] hover:bg-[#2A2A2E] text-[#9ca3af] hover:text-white border border-[#2E2E32] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#80858e] font-semibold">{ticketNumber}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#222225] text-neutral-300 border border-[#2E2E32]">
                {ticket.priority || 'Medium'} Priority
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-0.5">{ticket.subject}</h1>
          </div>
        </div>

        {/* Status Dropdown / Actions */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#80858e] font-medium">Status:</span>
          <select
            value={ticket.status || 'Open'}
            disabled={updatingStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-[#1C1D20] text-white border border-[#2B2D31] rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-white transition-colors cursor-pointer"
          >
            <option value="Open">Open</option>
            <option value="Answered">Answered</option>
            <option value="Customer-Reply">Customer-Reply</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* User Info Bar */}
      <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <BoringAvatar name={user?.name || ticket.user_id || 'User'} size={32} />
          <div>
            <div className="text-white font-semibold flex items-center gap-2">
              <span>{user?.name || ticket.user_id || 'Developer'}</span>
              <span className="text-[11px] text-[#80858e] font-mono">({ticket.user_id})</span>
            </div>
            <div className="text-[11px] text-[#80858e]">{user?.email || 'Registered Developer'}</div>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4 text-[11px] text-[#9ca3af]">
            <div>
              Balance: <span className="font-bold text-white">${(user.balance || 0).toFixed(2)}</span>
            </div>
            <Link
              href={`/users/${user.id}`}
              className="text-white hover:underline font-semibold"
            >
              View Profile &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* Conversation Thread */}
      <div className="space-y-4">
        {/* Initial Ticket Message */}
        <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#252528] pb-3 text-xs">
            <div className="flex items-center gap-2">
              <BoringAvatar name={ticket.user_id} size={22} />
              <span className="font-semibold text-white">{user?.name || ticket.user_id}</span>
              <span className="text-[10px] text-[#71717A] bg-[#222225] px-1.5 py-0.5 rounded">Author</span>
            </div>
            <span className="text-[11px] text-[#71717A] tabular-nums">{ticket.created_at || 'Initial Message'}</span>
          </div>
          <div className="text-xs text-[#E4E4E7] whitespace-pre-wrap leading-relaxed">
            {ticket.message}
          </div>
        </div>

        {/* Replies */}
        {replies.map((reply, index) => {
          const isStaff = reply.is_staff;
          return (
            <div
              key={index}
              className={`rounded-2xl p-5 space-y-3 border transition-colors ${
                isStaff
                  ? 'bg-[#1C1C20] border-[#3F3F46]'
                  : 'bg-[#171719] border-[#2B2B2F]'
              }`}
            >
              <div className="flex items-center justify-between border-b border-[#252528] pb-3 text-xs">
                <div className="flex items-center gap-2">
                  {isStaff ? (
                    <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center font-bold text-[10px]">
                      F
                    </div>
                  ) : (
                    <BoringAvatar name={reply.author || 'User'} size={20} />
                  )}
                  <span className="font-semibold text-white">{reply.author || (isStaff ? 'Support Staff' : 'User')}</span>
                  {isStaff && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white text-black">
                      Staff
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#71717A] tabular-nums">{reply.created_at || 'Just now'}</span>
              </div>
              <div className="text-xs text-[#E4E4E7] whitespace-pre-wrap leading-relaxed">
                {reply.message}
              </div>
            </div>
          );
        })}
      </div>

      {/* Staff Reply Box */}
      <form onSubmit={handleSendReply} className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#252528] pb-3">
          <label className="text-xs font-bold text-white tracking-wide">
            Staff Reply
          </label>
          <span className="text-[11px] text-[#80858e]">Your message will be marked as official Staff reply</span>
        </div>

        <textarea
          rows={5}
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          placeholder="Type your response to the user..."
          className="w-full bg-[#121214] border border-[#2E2E32] rounded-xl p-3.5 text-xs text-white placeholder-[#52525B] focus:outline-none focus:border-white transition-colors resize-y font-sans"
        />

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => handleStatusChange('Closed')}
            className="text-xs text-[#80858e] hover:text-red-400 font-semibold transition-colors"
          >
            Close Ticket Without Reply
          </button>

          <button
            type="submit"
            disabled={sendingReply || !replyMessage.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold text-xs tracking-wide transition-all shadow-sm disabled:opacity-50 cursor-pointer min-w-[140px]"
          >
            {sendingReply ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Reply</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

