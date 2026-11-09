'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Save,
  RotateCcw,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Archive,
  RefreshCw,
  Layers,
  Flame,
} from 'lucide-react';
import SquishSwitch from '@/components/ui/SquishSwitch';
import HoldButton from '@/components/ui/HoldButton';
import VerifyYourselfModal from '@/components/shared/VerifyYourselfModal';

interface BackupItem {
  filename: string;
  type: 'hourly' | 'daily_7d' | 'daily_14d' | 'daily_30d' | 'manual';
  size_bytes: number;
  size_formatted: string;
  created_at: string;
  timestamp: number;
}

interface BackupConfig {
  hourly_enabled: boolean;
  max_hourly_backups: number;
  retention_7d_enabled: boolean;
  retention_14d_enabled: boolean;
  retention_30d_enabled: boolean;
  admin_notification_email: string;
}

export default function BackupResetPage() {
  const [loading, setLoading] = useState(true);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [config, setConfig] = useState<BackupConfig>({
    hourly_enabled: true,
    max_hourly_backups: 3,
    retention_7d_enabled: true,
    retention_14d_enabled: true,
    retention_30d_enabled: true,
    admin_notification_email: 'admin@fobign.com',
  });

  const [savingConfig, setSavingConfig] = useState(false);
  const [takingBackup, setTakingBackup] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  // Reset states
  const [resetType, setResetType] = useState<'full' | 'partial' | 'custom'>('partial');
  const [customTargets, setCustomTargets] = useState<string[]>([
    'users',
    'apikeys',
    'billings',
    'tickets',
    'communicationlogs',
    'auditlogs',
  ]);

  // Security Verification Modal
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedCode, setVerifiedCode] = useState('');
  const [resetting, setResetting] = useState(false);

  // Restore confirm
  const [restoringFile, setRestoringFile] = useState<string | null>(null);

  const fetchBackupData = async () => {
    try {
      const res = await fetch('/api/settings/backup');
      if (res.ok) {
        const data = await res.json();
        if (data.config) setConfig(data.config);
        if (data.backups) setBackups(data.backups);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackupData();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await fetch('/api/settings/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_config',
          config,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback('Retention policy saved successfully.');
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err: any) {
      setErrorFeedback('Error saving configuration: ' + err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleBackupNow = async (tag: string = 'manual') => {
    setTakingBackup(true);
    try {
      const res = await fetch('/api/settings/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'backup_now',
          tag,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback(data.message);
        if (data.backups) setBackups(data.backups);
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err: any) {
      setErrorFeedback('Failed to create backup snapshot: ' + err.message);
    } finally {
      setTakingBackup(false);
    }
  };

  const handleRestore = async (filename: string) => {
    try {
      const res = await fetch('/api/settings/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore',
          filename,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRestoringFile(null);
        setFeedback(data.message);
        setTimeout(() => setFeedback(null), 5000);
      } else {
        setErrorFeedback(data.error || 'Restore failed.');
      }
    } catch (err: any) {
      setErrorFeedback('Restore error: ' + err.message);
    }
  };

  const handleDelete = async (filename: string) => {
    try {
      const res = await fetch('/api/settings/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          filename,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.backups) setBackups(data.backups);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  // Step 1: Request OTP and trigger VerifyYourselfModal
  const handleInitiateReset = async () => {
    setErrorFeedback(null);
    try {
      const res = await fetch('/api/settings/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_reset_otp' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVerificationCode(data.dev_code || '');
        setShowVerifyModal(true);
      } else {
        setErrorFeedback(data.error || 'Failed to dispatch verification code.');
      }
    } catch (err: any) {
      setErrorFeedback('Error requesting OTP: ' + err.message);
    }
  };

  // Step 2: Handle successful code entry from VerifyYourselfModal
  const handleVerifySuccess = (code?: string) => {
    setIsVerified(true);
    setVerifiedCode(code || verificationCode);
    setShowVerifyModal(false);
  };

  // Step 3: Trigger destructive reset execution via HoldButton
  const handleExecuteReset = async () => {
    setResetting(true);
    setErrorFeedback(null);
    try {
      const res = await fetch('/api/settings/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          reset_type: resetType,
          targets: customTargets,
          verification_code: verifiedCode || verificationCode,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback(`${data.message} A safety backup was saved as ${data.safety_backup}.`);
        setIsVerified(false);
        setVerifiedCode('');
        if (data.backups) setBackups(data.backups);
        setTimeout(() => setFeedback(null), 7000);
      } else {
        setErrorFeedback(data.error || 'Reset execution failed.');
      }
    } catch (err: any) {
      setErrorFeedback('Reset execution error: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  const toggleCustomTarget = (target: string) => {
    setCustomTargets((prev) =>
      prev.includes(target) ? prev.filter((t) => t !== target) : [...prev, target]
    );
  };

  return (
    <div className="space-y-6 font-['Nunito',sans-serif] max-w-4xl">
      {/* Title strictly without description or icon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Backup & Reset</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleBackupNow('manual')}
            disabled={takingBackup}
            className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Archive className="w-4 h-4" />
            <span>{takingBackup ? 'Saving Snapshot...' : 'Backup Now'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {errorFeedback && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorFeedback}</span>
        </div>
      )}

      {/* Retention Policy Configuration */}
      <form onSubmit={handleSaveConfig} className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-6 space-y-4">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#252528] pb-3">
          Retention & Rolling Backup Policy
        </h2>

        <div className="space-y-4 text-xs">
          {/* Hourly Backups */}
          <div className="flex items-center justify-between p-3 bg-[#101113] border border-[#252528] rounded-xl">
            <div>
              <span className="font-semibold text-white block">Hourly Rolling Backups</span>
              <span className="text-[11px] text-[#80858e]">
                Automatically generates snapshots every hour. Retains the latest {config.max_hourly_backups} snapshots and auto-purges older ones.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#80858e]">Keep latest:</span>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={config.max_hourly_backups}
                  onChange={(e) => setConfig({ ...config, max_hourly_backups: Number(e.target.value) || 3 })}
                  className="w-14 bg-[#171719] border border-[#2E2E32] rounded-lg px-2 py-1 text-center text-white font-mono text-xs focus:outline-none"
                />
              </div>
              <SquishSwitch
                checked={config.hourly_enabled}
                onChange={(checked) => setConfig({ ...config, hourly_enabled: checked })}
              />
            </div>
          </div>

          {/* Daily 7D, 14D, 30D Retention */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-[#101113] border border-[#252528] rounded-xl flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">7-Day Snapshot</span>
                <span className="text-[10px] text-[#80858e]">Retain weekly state</span>
              </div>
              <SquishSwitch
                checked={config.retention_7d_enabled}
                onChange={(checked) => setConfig({ ...config, retention_7d_enabled: checked })}
              />
            </div>

            <div className="p-3 bg-[#101113] border border-[#252528] rounded-xl flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">14-Day Snapshot</span>
                <span className="text-[10px] text-[#80858e]">Retain bi-weekly state</span>
              </div>
              <SquishSwitch
                checked={config.retention_14d_enabled}
                onChange={(checked) => setConfig({ ...config, retention_14d_enabled: checked })}
              />
            </div>

            <div className="p-3 bg-[#101113] border border-[#252528] rounded-xl flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">30-Day Snapshot</span>
                <span className="text-[10px] text-[#80858e]">Retain monthly state</span>
              </div>
              <SquishSwitch
                checked={config.retention_30d_enabled}
                onChange={(checked) => setConfig({ ...config, retention_30d_enabled: checked })}
              />
            </div>
          </div>

          {/* Admin Email for Security OTP */}
          <div className="pt-2 border-t border-[#252528] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="block text-white font-semibold text-xs mb-0.5">Admin Security Email</label>
              <span className="text-[11px] text-[#80858e]">
                6-digit verification codes for database reset are sent to this address.
              </span>
            </div>
            <input
              type="email"
              required
              value={config.admin_notification_email}
              onChange={(e) => setConfig({ ...config, admin_notification_email: e.target.value })}
              className="w-full sm:w-64 bg-[#101113] border border-[#2B2B2F] rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-white/50"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingConfig}
            className="px-4 py-2 rounded-xl bg-[#202024] hover:bg-[#28282D] text-white text-xs font-semibold flex items-center gap-2 border border-[#2E2E32] transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingConfig ? 'Saving...' : 'Save Policy'}</span>
          </button>
        </div>
      </form>

      {/* Existing Database Snapshots */}
      <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#252528] pb-3">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Available Database Snapshots
          </h2>
          <span className="text-[11px] font-mono text-[#80858e]">
            {backups.length} stored {backups.length === 1 ? 'file' : 'files'}
          </span>
        </div>

        {backups.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#80858e]">
            No database backups created yet. Click "Backup Now" to take a snapshot.
          </div>
        ) : (
          <div className="divide-y divide-[#252528]">
            {backups.map((b) => (
              <div key={b.filename} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white text-xs font-semibold">{b.filename}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                        b.type === 'hourly'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : b.type === 'manual'
                          ? 'bg-white/10 text-white border border-white/10'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {b.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#80858e] font-mono">
                    {b.created_at} &bull; {b.size_formatted}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRestoringFile(b.filename)}
                    className="px-3 py-1.5 rounded-lg bg-[#202024] hover:bg-[#28282D] text-white text-xs font-semibold flex items-center gap-1.5 border border-[#2E2E32] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-neutral-300" />
                    <span>Restore</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(b.filename)}
                    className="p-1.5 rounded-lg bg-[#202024] hover:bg-rose-950/40 text-[#80858e] hover:text-rose-400 border border-[#2E2E32] hover:border-rose-900 transition-colors cursor-pointer"
                    title="Delete snapshot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reset Database Section */}
      <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-6 space-y-4">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#252528] pb-3">
          Reset Database
        </h2>

        {/* Reset Type Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <button
            type="button"
            onClick={() => {
              setResetType('full');
              setIsVerified(false);
            }}
            className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
              resetType === 'full'
                ? 'bg-[#202024] border-white text-white'
                : 'bg-[#101113] border-[#252528] text-[#80858e] hover:text-white'
            }`}
          >
            <div className="font-bold text-xs uppercase mb-1 text-white">Full Factory Reset</div>
            <div className="text-[11px] text-[#9ca3af]">
              Completely clears and resets all data to clean factory defaults.
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setResetType('partial');
              setIsVerified(false);
            }}
            className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
              resetType === 'partial'
                ? 'bg-[#202024] border-white text-white'
                : 'bg-[#101113] border-[#252528] text-[#80858e] hover:text-white'
            }`}
          >
            <div className="font-bold text-xs uppercase mb-1 text-white">Partial Reset</div>
            <div className="text-[11px] text-[#9ca3af]">
              Clears users, usages, billings, and logs. Preserves providers, models, and settings.
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setResetType('custom');
              setIsVerified(false);
            }}
            className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
              resetType === 'custom'
                ? 'bg-[#202024] border-white text-white'
                : 'bg-[#101113] border-[#252528] text-[#80858e] hover:text-white'
            }`}
          >
            <div className="font-bold text-xs uppercase mb-1 text-white">Custom Selection</div>
            <div className="text-[11px] text-[#9ca3af]">
              Select exactly which collections or tables to wipe clean.
            </div>
          </button>
        </div>

        {/* Custom Target Selection Checkboxes */}
        {resetType === 'custom' && (
          <div className="p-4 bg-[#101113] border border-[#252528] rounded-xl space-y-2">
            <span className="text-[11px] font-semibold text-[#80858e] uppercase tracking-wider block">
              Select Components to Clear:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { id: 'users', label: 'Users & Developers' },
                { id: 'apikeys', label: 'API Keys' },
                { id: 'billings', label: 'Billing Invoices' },
                { id: 'tickets', label: 'Support Tickets' },
                { id: 'communicationlogs', label: 'Communication Logs' },
                { id: 'auditlogs', label: 'Audit Logs' },
                { id: 'updates', label: 'Changelog / Updates' },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#171719] border border-[#252528] cursor-pointer hover:border-[#353538]"
                >
                  <input
                    type="checkbox"
                    checked={customTargets.includes(item.id)}
                    onChange={() => toggleCustomTarget(item.id)}
                    className="accent-white rounded"
                  />
                  <span className="text-white text-xs">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Verification and Execution Flow */}
        <div className="pt-4 border-t border-[#252528] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-[#80858e]">
            {isVerified ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Security Verified. Hold the button to execute reset.
              </span>
            ) : (
              <span>Requires 6-digit email OTP verification before execution.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isVerified ? (
              <button
                type="button"
                onClick={handleInitiateReset}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Initiate Reset
              </button>
            ) : (
              <HoldButton
                holdTime={2.0}
                onHold={handleExecuteReset}
                fillColor="#dc2626"
                className="text-xs font-bold px-4 py-2"
                doneLabel="Reset Executed"
              >
                Hold to Reset Database ({resetType.toUpperCase()})
              </HoldButton>
            )}
          </div>
        </div>
      </div>

      {/* VerifyYourselfModal with CodeSlots */}
      <VerifyYourselfModal
        isOpen={showVerifyModal}
        title="Verify Reset Operation"
        actionName={`Database ${resetType.toUpperCase()} Reset`}
        description={`To confirm this sensitive database reset, please enter the 6-digit security code sent to ${config.admin_notification_email}.`}
        presetCode={verificationCode}
        onSuccess={handleVerifySuccess}
        onCancel={() => setShowVerifyModal(false)}
      />

      {/* Restore Confirmation Modal */}
      {restoringFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-['Nunito',sans-serif]">
          <div className="bg-[#171719] border border-[#2E2E32] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Restore Database</h3>
                <span className="text-[11px] font-mono text-[#80858e]">{restoringFile}</span>
              </div>
            </div>

            <p className="text-xs text-[#9ca3af] leading-relaxed">
              Restoring from this snapshot will replace current database state with the state recorded in this backup file.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setRestoringFile(null)}
                className="px-4 py-2 rounded-xl bg-[#202024] hover:bg-[#28282D] text-white text-xs font-semibold border border-[#2E2E32] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRestore(restoringFile)}
                className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Confirm Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
