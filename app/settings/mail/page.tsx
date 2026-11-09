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
  Loader2,
} from 'lucide-react';
import SquishSwitch from '@/components/ui/SquishSwitch';

export default function MailSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  const [activeProvider, setActiveProvider] = useState<'smtp' | 'resend' | 'sendgrid' | 'mailgun'>('smtp');
  const [testEmail, setTestEmail] = useState('admin@fobign.com');

  // Provider configs
  const [smtp, setSmtp] = useState({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    username: '',
    password: '',
    from_email: 'noreply@fobign.com',
    from_name: 'Fobign Platform',
  });

  const [resend, setResend] = useState({
    api_key: '',
    from_email: 'onboarding@resend.dev',
    from_name: 'Fobign Security',
  });

  const [sendgrid, setSendgrid] = useState({
    api_key: '',
    from_email: 'noreply@fobign.com',
  });

  const [mailgun, setMailgun] = useState({
    api_key: '',
    domain: '',
    from_email: 'noreply@fobign.com',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/settings/mail');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setActiveProvider(data.settings.active_provider || 'smtp');
            if (data.settings.smtp) setSmtp((prev) => ({ ...prev, ...data.settings.smtp }));
            if (data.settings.resend) setResend((prev) => ({ ...prev, ...data.settings.resend }));
            if (data.settings.sendgrid) setSendgrid((prev) => ({ ...prev, ...data.settings.sendgrid }));
            if (data.settings.mailgun) setMailgun((prev) => ({ ...prev, ...data.settings.mailgun }));
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
      const res = await fetch('/api/settings/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          settings: {
            active_provider: activeProvider,
            smtp,
            resend,
            sendgrid,
            mailgun,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback('Mail provider configurations updated successfully.');
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err: any) {
      setFeedback('Error saving mail settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) return;
    setTesting(true);
    try {
      const res = await fetch('/api/settings/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_test',
          test_email: testEmail,
          subject: 'Fobign Security OTP Test Dispatch',
          message: 'This is a test notification verifying your dynamic mail engine configuration.',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback(data.message || 'Test email dispatched successfully.');
        if (data.log) setLogs((prev) => [data.log, ...prev]);
        setTimeout(() => setFeedback(null), 5000);
      } else {
        setFeedback(data.error || 'Failed to dispatch test email.');
      }
    } catch (err: any) {
      setFeedback('Test email error: ' + err.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 font-['Nunito',sans-serif] max-w-4xl">
      {/* Title strictly without description or icon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Mail</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLogsModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#202024] hover:bg-[#28282D] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#2E2E32] cursor-pointer shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-neutral-300" />
            <span>Mail Logs</span>
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
        {(['smtp', 'resend', 'sendgrid', 'mailgun'] as const).map((prov) => (
          <button
            key={prov}
            type="button"
            onClick={() => setActiveProvider(prov)}
            className={`px-4 py-1.5 rounded-lg font-semibold uppercase text-[11px] transition-all cursor-pointer ${
              activeProvider === prov ? 'bg-[#252529] text-white shadow-xs' : 'text-[#80858e] hover:text-white'
            }`}
          >
            {prov}
          </button>
        ))}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* SMTP Configuration */}
        {activeProvider === 'smtp' && (
          <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#252528] pb-3">
              SMTP Server Configuration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[#80858e] font-medium mb-1">Host Server</label>
                <input
                  type="text"
                  required
                  placeholder="smtp.gmail.com or mail.domain.com"
                  value={smtp.host}
                  onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                  className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>

              <div>
                <label className="block text-[#80858e] font-medium mb-1">Port</label>
                <input
                  type="number"
                  required
                  value={smtp.port}
                  onChange={(e) => setSmtp({ ...smtp, port: parseInt(e.target.value) || 587 })}
                  className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#121214] rounded-xl border border-[#252528] text-xs">
              <div>
                <span className="font-semibold text-white block">Secure Connection (SSL / TLS)</span>
                <span className="text-[11px] text-[#80858e]">Enable for port 465 (SSL), leave off for port 587 (STARTTLS).</span>
              </div>
              <SquishSwitch
                checked={smtp.secure}
                onChange={(checked) => setSmtp({ ...smtp, secure: checked })}
                trackColor="#252528"
                trackOnColor="#ffffff"
                thumbColor="#3E3E44"
                thumbOnColor="#000000"
                width={54}
                height={28}
                radius={14}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#80858e] font-medium mb-1">Username / Auth Email</label>
                <input
                  type="text"
                  placeholder="user@domain.com"
                  value={smtp.username}
                  onChange={(e) => setSmtp({ ...smtp, username: e.target.value })}
                  className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>

              <div>
                <label className="block text-[#80858e] font-medium mb-1">Password / App Key</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  value={smtp.password}
                  onChange={(e) => setSmtp({ ...smtp, password: e.target.value })}
                  className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#80858e] font-medium mb-1">From Email Address</label>
                <input
                  type="email"
                  value={smtp.from_email}
                  onChange={(e) => setSmtp({ ...smtp, from_email: e.target.value })}
                  className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>

              <div>
                <label className="block text-[#80858e] font-medium mb-1">Sender Name (Branding)</label>
                <input
                  type="text"
                  value={smtp.from_name}
                  onChange={(e) => setSmtp({ ...smtp, from_name: e.target.value })}
                  className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white/50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Resend Configuration */}
        {activeProvider === 'resend' && (
          <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#252528] pb-3">
              Resend API Configuration
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#80858e] font-medium mb-1">API Key</label>
                <input
                  type="password"
                  required
                  placeholder="re_••••••••••••••••"
                  value={resend.api_key}
                  onChange={(e) => setResend({ ...resend, api_key: e.target.value })}
                  className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#80858e] font-medium mb-1">From Email</label>
                  <input
                    type="text"
                    value={resend.from_email}
                    onChange={(e) => setResend({ ...resend, from_email: e.target.value })}
                    className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
                  />
                </div>

                <div>
                  <label className="block text-[#80858e] font-medium mb-1">Sender Name</label>
                  <input
                    type="text"
                    value={resend.from_name}
                    onChange={(e) => setResend({ ...resend, from_name: e.target.value })}
                    className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white/50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SendGrid Configuration */}
        {activeProvider === 'sendgrid' && (
          <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#252528] pb-3">
              SendGrid API Configuration
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#80858e] font-medium mb-1">API Key</label>
                <input
                  type="password"
                  required
                  placeholder="SG.••••••••••••••••"
                  value={sendgrid.api_key}
                  onChange={(e) => setSendgrid({ ...sendgrid, api_key: e.target.value })}
                  className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>

              <div>
                <label className="block text-[#80858e] font-medium mb-1">From Email</label>
                <input
                  type="email"
                  value={sendgrid.from_email}
                  onChange={(e) => setSendgrid({ ...sendgrid, from_email: e.target.value })}
                  className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Mailgun Configuration */}
        {activeProvider === 'mailgun' && (
          <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#252528] pb-3">
              Mailgun API Configuration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#80858e] font-medium mb-1">API Key</label>
                <input
                  type="password"
                  required
                  placeholder="key-••••••••••••••••"
                  value={mailgun.api_key}
                  onChange={(e) => setMailgun({ ...mailgun, api_key: e.target.value })}
                  className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>

              <div>
                <label className="block text-[#80858e] font-medium mb-1">Domain</label>
                <input
                  type="text"
                  placeholder="mg.yourdomain.com"
                  value={mailgun.domain}
                  onChange={(e) => setMailgun({ ...mailgun, domain: e.target.value })}
                  className="w-full bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-[#80858e]">
            Configured provider: <span className="text-white font-semibold uppercase">{activeProvider}</span>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>

      {/* Test Email Section */}
      <div className="bg-[#171719] border border-[#2B2B2F] rounded-2xl p-6 space-y-3">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider">Test Mail Delivery</h2>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter test recipient email..."
            className="w-full sm:flex-1 bg-[#101113] border border-[#2B2B2F] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-white/50"
          />
          <button
            type="button"
            onClick={handleSendTest}
            disabled={testing || !testEmail}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#222226] hover:bg-white hover:text-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#2E2E32] disabled:opacity-50"
          >
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>{testing ? 'Sending...' : 'Send Test Email'}</span>
          </button>
        </div>
      </div>

      {/* Mail Logs Modal / Drawer */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#171719] border border-[#2E2E32] rounded-2xl w-full max-w-3xl p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#252528] pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Mail Logs</h3>
                <span className="text-[11px] text-[#80858e]">Audit trail of dispatched emails and security verification codes.</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLogsModal(false)}
                className="text-[#80858e] hover:text-white p-1 rounded-lg hover:bg-[#252528]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#252528] text-[#80858e] text-[11px]">
                    <th className="py-2.5 px-3">Provider</th>
                    <th className="py-2.5 px-3">Recipient</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202023] text-white">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#80858e]">
                        No emails dispatched yet.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#1E1E22]">
                        <td className="py-2.5 px-3 uppercase font-mono font-bold text-[10px] text-neutral-400">
                          {log.provider}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">{log.to}</td>
                        <td className="py-2.5 px-3 font-medium text-white max-w-[200px] truncate">{log.subject}</td>
                        <td className="py-2.5 px-3">
                          <span className="text-emerald-400 font-semibold">{log.status}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#80858e] font-mono text-[11px]">
                          {log.created_at}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

