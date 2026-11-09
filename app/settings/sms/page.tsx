'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  RefreshCw,
  Wallet,
  Loader2,
} from 'lucide-react';
import SquishSwitch from '@/components/ui/SquishSwitch';

export default function SmsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [checkingBalance, setCheckingBalance] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  const [activeProvider, setActiveProvider] = useState<'mimsms' | 'twilio' | 'custom'>('mimsms');
  const [testPhone, setTestPhone] = useState('+8801700000000');
  const [testMessage, setTestMessage] = useState('Fobign Security OTP: 849201. Valid for 10 minutes.');

  // Provider configs
  const [mimsms, setMimsms] = useState({
    server_url: 'https://api.mimsms.com/api',
    user_name: '',
    api_key: '',
    sender_name: 'FOBIGN',
    is_masking: true,
  });

  const [twilio, setTwilio] = useState({
    account_sid: '',
    auth_token: '',
    from_number: '',
  });

  const [custom, setCustom] = useState({
    endpoint: '',
    api_key: '',
    method: 'POST',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/settings/sms');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setActiveProvider(data.settings.active_provider || 'mimsms');
            if (data.settings.mimsms) setMimsms((prev) => ({ ...prev, ...data.settings.mimsms }));
            if (data.settings.twilio) setTwilio((prev) => ({ ...prev, ...data.settings.twilio }));
            if (data.settings.custom) setCustom((prev) => ({ ...prev, ...data.settings.custom }));
          }
          if (data.logs) setLogs(data.logs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          settings: {
            active_provider: activeProvider,
            mimsms,
            twilio,
            custom,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback('SMS gateway configurations updated successfully.');
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err: any) {
      setFeedback('Error saving SMS settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCheckBalance = async () => {
    setCheckingBalance(true);
    try {
      const res = await fetch('/api/settings/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check_balance' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBalance(data.balance);
        if (data.note) {
          setFeedback(data.note);
          setTimeout(() => setFeedback(null), 6000);
        }
      }
    } catch (err: any) {
      setBalance('Error checking balance');
    } finally {
      setCheckingBalance(false);
    }
  };

  const handleSendTest = async () => {
    if (!testPhone) return;
    setTesting(true);
    try {
      const res = await fetch('/api/settings/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_test',
          phone_number: testPhone,
          message: testMessage,
          sender_name: mimsms.sender_name,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback(data.message || 'Test SMS dispatched successfully.');
        if (data.log) setLogs((prev) => [data.log, ...prev]);
        setTimeout(() => setFeedback(null), 5000);
      } else {
        setFeedback(data.error || 'Failed to dispatch test SMS.');
      }
    } catch (err: any) {
      setFeedback('Test SMS error: ' + err.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 font-['Nunito',sans-serif] max-w-4xl">
      {/* Title strictly without description or icon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">SMS</h1>
        </div>

        <div className="flex items-center gap-2">
          {activeProvider === 'mimsms' && (
            <button
              type="button"
              onClick={handleCheckBalance}
              disabled={checkingBalance}
              className="px-3.5 py-1.5 rounded-xl bg-[#202024] hover:bg-[#28282D] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#2E2E32] cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Wallet className="w-3.5 h-3.5 text-neutral-300" />
              <span>{checkingBalance ? 'Checking...' : balance ? `Balance: ${balance}` : 'Check Balance'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowLogsModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#202024] hover:bg-[#28282D] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#2E2E32] cursor-pointer shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-neutral-300" />
            <span>SMS Logs</span>
            {logs.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-mono">
                {logs.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Provider Selector Tabs */}
      <div className="inline-flex bg-[#171719] border border-[#2B2B2F] rounded-xl p-1 text-xs">
        {(['mimsms', 'twilio', 'custom'] as const).map((prov) => (
          <button
            key={prov}
            type="button"
            onClick={() => setActiveProvider(prov)}
            className={`px-4 py-1.5 rounded-lg font-semibold uppercase text-[11px] transition-all cursor-pointer ${
              activeProvider === prov ? 'bg-[#252529] text-white shadow-xs' : 'text-[#80858e] hover:text-white'
            }`}
          >
            {prov === 'mimsms' ? 'MiMSMS (v2)' : prov}
          </button>
        ))}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* MiMSMS v2 Configuration */}
        {activeProvider === 'mimsms' && (
          <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#252528] pb-3">
              MiMSMS Gateway Configuration (API v2)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#80858e] font-medium mb-1">Server URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://api.mimsms.com/api"
                  value={mimsms.server_url}
                  onChange={(e) => setMimsms({ ...mimsms, server_url: e.target.value })}
                  className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>

              <div>
                <label className="block text-[#80858e] font-medium mb-1">User Name (Account / Email)</label>
                <input
                  type="text"
                  placeholder="e.g. user@fobign.com"
                  value={mimsms.user_name}
                  onChange={(e) => setMimsms({ ...mimsms, user_name: e.target.value })}
                  className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>

              <div>
                <label className="block text-[#80858e] font-medium mb-1">API Key</label>
                <input
                  type="password"
                  placeholder="Enter MiMSMS API key"
                  value={mimsms.api_key}
                  onChange={(e) => setMimsms({ ...mimsms, api_key: e.target.value })}
                  className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>

              <div>
                <label className="block text-[#80858e] font-medium mb-1">Sender Name (Masking/Brand ID)</label>
                <input
                  type="text"
                  placeholder="e.g. FOBIGN"
                  value={mimsms.sender_name}
                  onChange={(e) => setMimsms({ ...mimsms, sender_name: e.target.value })}
                  className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>

              <div className="sm:col-span-2 pt-2 flex items-center justify-between border-t border-[#252528]">
                <div>
                  <span className="block text-white font-semibold text-xs">Enable Masking Sender ID</span>
                  <span className="text-[11px] text-[#80858e]">
                    Sends SMS with approved brand name instead of numeric shortcode.
                  </span>
                </div>
                <SquishSwitch
                  checked={mimsms.is_masking}
                  onChange={(checked) => setMimsms({ ...mimsms, is_masking: checked })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Twilio Configuration */}
        {activeProvider === 'twilio' && (
          <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#252528] pb-3">
              Twilio SMS Configuration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#80858e] font-medium mb-1">Account SID</label>
                <input
                  type="text"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={twilio.account_sid}
                  onChange={(e) => setTwilio({ ...twilio, account_sid: e.target.value })}
                  className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>

              <div>
                <label className="block text-[#80858e] font-medium mb-1">Auth Token</label>
                <input
                  type="password"
                  placeholder="Enter Twilio Auth Token"
                  value={twilio.auth_token}
                  onChange={(e) => setTwilio({ ...twilio, auth_token: e.target.value })}
                  className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#80858e] font-medium mb-1">From Phone Number or Alphanumeric Sender ID</label>
                <input
                  type="text"
                  placeholder="+1234567890 or FOBIGN"
                  value={twilio.from_number}
                  onChange={(e) => setTwilio({ ...twilio, from_number: e.target.value })}
                  className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Custom Webhook Configuration */}
        {activeProvider === 'custom' && (
          <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#252528] pb-3">
              Custom HTTP Gateway Configuration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[#80858e] font-medium mb-1">HTTP Endpoint</label>
                <input
                  type="url"
                  placeholder="https://api.sms-provider.com/v1/send"
                  value={custom.endpoint}
                  onChange={(e) => setCustom({ ...custom, endpoint: e.target.value })}
                  className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>

              <div>
                <label className="block text-[#80858e] font-medium mb-1">API Key / Bearer Token</label>
                <input
                  type="password"
                  placeholder="Enter API token"
                  value={custom.api_key}
                  onChange={(e) => setCustom({ ...custom, api_key: e.target.value })}
                  className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>

              <div>
                <label className="block text-[#80858e] font-medium mb-1">HTTP Method</label>
                <select
                  value={custom.method}
                  onChange={(e) => setCustom({ ...custom, method: e.target.value })}
                  className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white/50"
                >
                  <option value="POST">POST</option>
                  <option value="GET">GET</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>

      {/* Test SMS Dispatch Card */}
      <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-6 space-y-4">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#252528] pb-3">
          Test SMS Dispatch
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-[#80858e] font-medium mb-1">Recipient Mobile Number</label>
            <input
              type="tel"
              placeholder="+8801700000000"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[#80858e] font-medium mb-1">Message Body</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="flex-1 bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-white/50"
              />
              <button
                type="button"
                onClick={handleSendTest}
                disabled={testing || !testPhone}
                className="px-4 py-2 rounded-xl bg-[#202024] hover:bg-[#28282D] text-white text-xs font-semibold flex items-center gap-2 border border-[#2E2E32] transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{testing ? 'Sending...' : 'Send Test SMS'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SMS Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-4 border-b border-[#252528]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold text-white">SMS Logs</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLogsModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-[#80858e] text-xs">
                  No SMS logs recorded yet.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-[#101113] border border-[#252528] rounded-xl text-xs space-y-1.5 font-mono"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-white uppercase">{log.provider}</span>
                      <span className="text-[#80858e]">{log.created_at}</span>
                    </div>
                    <div className="text-[#a0a5b0] text-xs">
                      To: <span className="text-white">{log.to}</span> | Sender: <span className="text-white">{log.sender_id || 'DEFAULT'}</span>
                    </div>
                    <div className="p-2 bg-black/40 rounded-lg text-neutral-300 text-[11px] font-sans">
                      {log.message}
                    </div>
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          log.status === 'Delivered'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : log.status === 'Sent'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {log.status}
                      </span>
                      {log.response_msg && (
                        <span className="text-[#80858e] text-[10px] truncate max-w-xs">
                          {log.response_msg}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-[#252528] flex justify-end">
              <button
                type="button"
                onClick={() => setShowLogsModal(false)}
                className="px-4 py-1.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors cursor-pointer"
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

