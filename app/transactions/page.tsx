'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  Copy,
  Check,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Filter,
  Loader2,
  X,
} from 'lucide-react';
import { Billing } from '@/lib/types';
import { generateReceiptPdf } from '@/lib/receiptPdf';

export default function AdminBillingPage() {
  const [invoices, setInvoices] = useState<Billing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Success' | 'Refunded'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'topped-up' | 'granted'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadBillings() {
      try {
        const res = await fetch('/api/billing?all=true');
        if (res.ok) {
          const data = await res.json();
          setInvoices(data.invoices || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBillings();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((curr) => (curr === id ? null : curr));
    }, 2000);
  };

  const [refundDialog, setRefundDialog] = useState<{
    isOpen: boolean;
    type: 'single' | 'bulk';
    invoiceNo?: string;
    invoiceNos?: string[];
  }>({
    isOpen: false,
    type: 'single',
  });

  const handleOpenRefundModal = (invoiceNo: string) => {
    setRefundDialog({
      isOpen: true,
      type: 'single',
      invoiceNo,
    });
  };

  const handleOpenBulkRefundModal = () => {
    if (selectedIds.length === 0) return;
    setRefundDialog({
      isOpen: true,
      type: 'bulk',
      invoiceNos: selectedIds,
    });
  };

  const executeRefund = async () => {
    if (!refundDialog.isOpen) return;
    setActionLoading(true);

    try {
      if (refundDialog.type === 'single' && refundDialog.invoiceNo) {
        const invoiceNo = refundDialog.invoiceNo;
        const res = await fetch('/api/billing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'refund', invoice_no: invoiceNo }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setInvoices((prev) =>
            prev.map((i) => (i.invoice_no === invoiceNo ? { ...i, status: 'Refunded' } : i))
          );
          setFeedback(`Invoice ${invoiceNo} refunded successfully.`);
          setRefundDialog({ isOpen: false, type: 'single' });
          setTimeout(() => setFeedback(null), 4000);
        } else {
          setFeedback(data.error || 'Refund failed.');
        }
      } else if (refundDialog.type === 'bulk' && refundDialog.invoiceNos) {
        const invoiceNos = refundDialog.invoiceNos;
        const res = await fetch('/api/billing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'bulk_refund', invoice_nos: invoiceNos }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setInvoices((prev) =>
            prev.map((i) => (invoiceNos.includes(i.invoice_no) ? { ...i, status: 'Refunded' } : i))
          );
          setFeedback(`Refunded ${invoiceNos.length} invoices successfully.`);
          setSelectedIds([]);
          setRefundDialog({ isOpen: false, type: 'bulk' });
          setTimeout(() => setFeedback(null), 4000);
        } else {
          setFeedback(data.error || 'Bulk refund failed.');
        }
      }
    } catch (err: any) {
      setFeedback('Error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCsv = () => {
    const rows = filteredInvoices.map((i) => ({
      'Invoice No': i.invoice_no,
      'Trx ID': i.trx_id || i.id,
      User: (i as any).user_email || i.user_id,
      Amount: i.amount,
      Currency: i.currency,
      'Payment Method': i.payment_method,
      Status: i.status,
      Type: i.type,
      Created: i.created_at,
    }));

    if (rows.length === 0) return;
    const header = Object.keys(rows[0]).join(',');
    const csvContent = [header, ...rows.map((r) => Object.values(r).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `billing_export_${Date.now()}.csv`;
    link.click();
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((i) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        i.invoice_no.toLowerCase().includes(q) ||
        (i.trx_id && i.trx_id.toLowerCase().includes(q)) ||
        i.user_id.toLowerCase().includes(q) ||
        ((i as any).user_email && (i as any).user_email.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'all' || i.status === statusFilter;
      const matchType = typeFilter === 'all' || i.type === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [invoices, search, statusFilter, typeFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredInvoices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInvoices.map((i) => i.invoice_no));
    }
  };

  const toggleSelectOne = (invoiceNo: string) => {
    if (selectedIds.includes(invoiceNo)) {
      setSelectedIds((prev) => prev.filter((id) => id !== invoiceNo));
    } else {
      setSelectedIds((prev) => [...prev, invoiceNo]);
    }
  };

  const totalVolume = invoices
    .filter((i) => i.status === 'Success')
    .reduce((sum, curr) => sum + curr.amount, 0);

  return (
    <div className="space-y-6 font-['Nunito',sans-serif]">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-1.5 rounded-xl bg-[#202024] hover:bg-[#28282D] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#2E2E32] cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-300" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-1">
          <div className="text-[11px] text-[#80858e] font-medium uppercase tracking-wider">Total Revenue</div>
          <div className="text-2xl font-bold text-white font-mono">${totalVolume.toFixed(2)} USD</div>
          <div className="text-[11px] text-[#80858e]">Settled developer top-ups</div>
        </div>

        <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-1">
          <div className="text-[11px] text-[#80858e] font-medium uppercase tracking-wider">Invoices Issued</div>
          <div className="text-2xl font-bold text-white font-mono">{invoices.length}</div>
          <div className="text-[11px] text-[#80858e]">Across all platform accounts</div>
        </div>

        <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-5 space-y-1">
          <div className="text-[11px] text-[#80858e] font-medium uppercase tracking-wider">Refunded</div>
          <div className="text-2xl font-bold text-white font-mono">
            {invoices.filter((i) => i.status === 'Refunded').length}
          </div>
          <div className="text-[11px] text-[#80858e]">Reversed transactions</div>
        </div>
      </div>

      {/* Controls Bar: Search, Filters & Bulk Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-[#80858e] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Invoice No, Trx ID, email..."
              className="w-full bg-[#171719] border border-[#2B2B2F] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-[#555861] focus:outline-none focus:border-white/50"
            />
          </div>

          {/* Status Pills */}
          <div className="inline-flex bg-[#171719] border border-[#2B2B2F] rounded-xl p-1 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-[#252529] text-white shadow-xs' : 'text-[#80858e] hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('Success')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === 'Success' ? 'bg-[#252529] text-white shadow-xs' : 'text-[#80858e] hover:text-white'
              }`}
            >
              Success
            </button>
            <button
              onClick={() => setStatusFilter('Refunded')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === 'Refunded' ? 'bg-[#252529] text-white shadow-xs' : 'text-[#80858e] hover:text-white'
              }`}
            >
              Refunded
            </button>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-[#202024] border border-[#2E2E32] px-3 py-1.5 rounded-xl text-xs">
            <span className="text-white font-semibold">{selectedIds.length} selected</span>
            <button
              onClick={handleOpenBulkRefundModal}
              disabled={actionLoading}
              className="px-2.5 py-1 rounded-lg bg-white text-black hover:bg-neutral-200 font-semibold cursor-pointer text-[11px]"
            >
              Bulk Refund
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-[#80858e] hover:text-white text-[11px] underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Billings Table */}
      <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2B2B2F] text-[#80858e] font-normal text-[11px] bg-[#121214]">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredInvoices.length > 0 && selectedIds.length === filteredInvoices.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded bg-[#1C1C1F] border-[#2E2E32] text-white focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4 font-normal">Invoice No.</th>
                <th className="py-3.5 px-4 font-normal">Transaction ID (Trx ID)</th>
                <th className="py-3.5 px-4 font-normal">User / Account</th>
                <th className="py-3.5 px-4 font-normal">Amount</th>
                <th className="py-3.5 px-4 font-normal">Payment Method</th>
                <th className="py-3.5 px-4 font-normal">Status</th>
                <th className="py-3.5 px-4 font-normal">Created</th>
                <th className="py-3.5 px-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232326] text-white">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i} skullet-loading="true" className="animate-pulse">
                    <td className="py-3.5 px-4"><div className="h-4 w-4 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-40 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-28 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-32 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-16 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-20 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-16 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-24 bg-white/10 rounded" /></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-4 w-16 bg-white/10 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#80858e]">
                    No billing records found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isSelected = selectedIds.includes(inv.invoice_no);
                  const isSuccess = inv.status === 'Success';
                  const isRefunded = inv.status === 'Refunded';

                  return (
                    <tr
                      key={inv.id || inv.invoice_no}
                      className={`hover:bg-[#1E1E22] transition-colors ${
                        isSelected ? 'bg-[#222226]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(inv.invoice_no)}
                          className="rounded bg-[#1C1C1F] border-[#2E2E32] text-white focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Invoice No (UUIDv4) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-white">
                          <span>{inv.invoice_no}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(inv.invoice_no, `inv-${inv.invoice_no}`)}
                            title="Copy Invoice No"
                            className="p-1 rounded hover:bg-[#28282C] text-[#80858e] hover:text-white transition-colors"
                          >
                            {copiedId === `inv-${inv.invoice_no}` ? (
                              <Check className="w-3 h-3 text-white" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Trx ID (12-char alphanumeric) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-300">
                          <span>{inv.trx_id || inv.id}</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(inv.trx_id || inv.id, `trx-${inv.invoice_no}`)
                            }
                            title="Copy Transaction ID"
                            className="p-1 rounded hover:bg-[#28282C] text-[#80858e] hover:text-white transition-colors"
                          >
                            {copiedId === `trx-${inv.invoice_no}` ? (
                              <Check className="w-3 h-3 text-white" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Developer */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-white font-semibold truncate max-w-[150px]">
                          {(inv as any).user_email || inv.user_id}
                        </div>
                        <div className="text-[10px] text-[#80858e] font-mono">{inv.user_id}</div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-semibold tabular-nums text-white">
                        {inv.currency === 'BDT' ? `৳${inv.amount.toFixed(0)}` : `$${inv.amount.toFixed(0)}`}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[#9ca3af]">
                        {inv.payment_method}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isSuccess && (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Success</span>
                          </span>
                        )}
                        {isRefunded && (
                          <span className="inline-flex items-center gap-1.5 text-neutral-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                            <span>Refunded</span>
                          </span>
                        )}
                        {!isSuccess && !isRefunded && (
                          <span className="inline-flex items-center gap-1.5 text-neutral-400 font-medium">
                            <span>{inv.status}</span>
                          </span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[#80858e] font-mono text-[11px] tabular-nums">
                        {inv.created_at}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Download PDF Receipt: receipt_[invoice_no].pdf */}
                          <button
                            type="button"
                            onClick={() => generateReceiptPdf(inv)}
                            className="p-1.5 rounded-lg bg-[#222226] hover:bg-white hover:text-black text-[#9ca3af] transition-colors cursor-pointer"
                            title="Download PDF Receipt (receipt_[invoice_no].pdf)"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Refund action */}
                          {isSuccess && (
                            <button
                              type="button"
                              onClick={() => handleOpenRefundModal(inv.invoice_no)}
                              disabled={actionLoading}
                              className="px-2 py-1 rounded-lg bg-[#222226] hover:bg-neutral-300 hover:text-black text-[#9ca3af] transition-colors text-[11px] font-semibold cursor-pointer"
                              title="Refund this transaction"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Confirmation Refund Dialog Modal */}
      {refundDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-['Nunito',sans-serif]">
          <div className="bg-[#1C1C1E] border border-[#2E2E32] rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-tight">
                {refundDialog.type === 'single' ? 'Confirm Refund' : 'Confirm Bulk Refund'}
              </h3>
              <button
                type="button"
                onClick={() => setRefundDialog({ isOpen: false, type: 'single' })}
                disabled={actionLoading}
                className="text-[#80858e] hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#9ca3af] leading-relaxed">
              {refundDialog.type === 'single'
                ? `Are you sure you want to refund invoice ${refundDialog.invoiceNo}? This will mark the transaction as Refunded and update the client ledger.`
                : `Are you sure you want to refund ${refundDialog.invoiceNos?.length} selected invoice(s)? This will process refunds for all selected records.`}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRefundDialog({ isOpen: false, type: 'single' })}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl border border-[#2E2E32] bg-[#151517] hover:bg-[#252529] text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeRefund}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />}
                <span>{actionLoading ? 'Processing...' : 'Confirm Refund'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

