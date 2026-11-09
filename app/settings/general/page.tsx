'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  ShieldAlert,
  Sliders,
  Building2,
  Link2,
  Loader2,
  Mail,
  Phone,
  MessageCircle,
} from 'lucide-react';
import type { BusinessDetails, ContactSocialDetails } from '@/lib/types';

export default function GeneralSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'business' | 'contact'>('general');

  // General Core Settings
  const [platformName, setPlatformName] = useState('Fobign');
  const [platformDescription, setPlatformDescription] = useState('Unified Multi-Model API Gateway');
  const [supportEmail, setSupportEmail] = useState('api-service@fobign.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowSignups, setAllowSignups] = useState(true);
  const [defaultCredits, setDefaultCredits] = useState(0.00);

  // Business Details (for receipts & documentation)
  const [business, setBusiness] = useState<BusinessDetails>({
    street_address: '12F, Galaxy International Building',
    city: 'Dhaka',
    zip_code: '1216',
    country: 'Bangladesh',
  });

  // Contact & Social Profiles
  const [contactSocial, setContactSocial] = useState<ContactSocialDetails>({
    support_phone: '123-456-7890',
    support_email: 'api-service@fobign.com',
    support_website: 'dash.serverfest.com/submitticket.php',
    facebook: 'serverfest',
    messenger: 'serverfest',
    whatsapp: '+1234567890',
    telegram: 'serverfest',
    youtube: '@ServerFest',
  });

  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings/general');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setPlatformName(data.settings.platform_name || 'Fobign');
            setPlatformDescription(data.settings.platform_description || '');
            setSupportEmail(data.settings.support_email || 'api-service@fobign.com');
            setMaintenanceMode(Boolean(data.settings.maintenance_mode));
            setAllowSignups(data.settings.allow_signups ?? true);
            setDefaultCredits(data.settings.default_credits ?? 0.00);

            if (data.settings.business) {
              setBusiness((prev) => ({
                ...prev,
                ...data.settings.business,
              }));
            }
            if (data.settings.contact_social) {
              setContactSocial((prev) => ({
                ...prev,
                ...data.settings.contact_social,
              }));
            }
          }
        }
      } catch (e) {
        // fallback
      }
    }
    load();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/settings/general', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform_name: platformName,
          platform_description: platformDescription,
          support_email: supportEmail,
          maintenance_mode: maintenanceMode,
          allow_signups: allowSignups,
          default_credits: Number(defaultCredits),
          business,
          contact_social: contactSocial,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback('General settings saved successfully.');
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback(data.error || 'Failed to save settings.');
      }
    } catch (e: any) {
      setFeedback('Error saving: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 font-['Nunito',sans-serif]">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">General</h1>
          <p className="text-xs text-[#80858e] mt-0.5">
            Configure platform parameters, official business address, and customer contact channels.
          </p>
        </div>
        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="bg-white hover:bg-neutral-200 text-black font-semibold px-5 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Styled Tabs Navigation - Exactly matching user screenshot */}
      <div className="bg-[#171719] border border-[#2B2B2F] p-1.5 rounded-2xl inline-flex items-center gap-1 shadow-xs">
        {/* Tab 1: General (Core) */}
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'general'
              ? 'bg-[#222226] text-white shadow-xs border border-white/10'
              : 'text-[#80858e] hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 shrink-0" />
          <span>General</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#2563eb]/20 text-[#60a5fa] border border-[#2563eb]/30">
            Core
          </span>
        </button>

        {/* Tab 2: Business Details */}
        <button
          type="button"
          onClick={() => setActiveTab('business')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'business'
              ? 'bg-[#222226] text-white shadow-xs border border-white/10'
              : 'text-[#80858e] hover:text-white hover:bg-white/5'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span>Business Details</span>
        </button>

        {/* Tab 3: Contact & Social */}
        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'contact'
              ? 'bg-[#222226] text-[#38bdf8] shadow-xs border border-white/10'
              : 'text-[#80858e] hover:text-white hover:bg-white/5'
          }`}
        >
          <Link2 className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'contact' ? 'text-[#38bdf8]' : ''}`} />
          <span>Contact &amp; Social</span>
        </button>
      </div>

      {/* Tab 1: General (Core) Content */}
      {activeTab === 'general' && (
        <form onSubmit={handleSave} className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs text-xs">
          <div className="space-y-1.5">
            <label className="text-[#80858e] font-medium block">Platform Brand Name</label>
            <input
              type="text"
              required
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#80858e] font-medium block">Platform Description</label>
            <input
              type="text"
              value={platformDescription}
              onChange={(e) => setPlatformDescription(e.target.value)}
              className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[#80858e] font-medium block">Support Contact Email</label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#80858e] font-medium block">Default Sign-up Granted Credits ($ USD)</label>
              <input
                type="number"
                step="0.01"
                value={defaultCredits}
                onChange={(e) => setDefaultCredits(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-white/50"
              />
            </div>
          </div>

          {/* Maintenance Mode Switch */}
          <div className="p-4 rounded-xl bg-[#151517] border border-[#2E2E32] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-white" />
              <div>
                <div className="text-white font-bold">Maintenance Mode</div>
                <div className="text-[#80858e] text-[11px]">
                  When active, only system administrators can access APIs and dashboard.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                maintenanceMode ? 'bg-white' : 'bg-[#2E2E32]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                  maintenanceMode ? 'bg-black translate-x-5' : 'bg-[#80858e] translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Allow Signups Switch */}
          <div className="p-4 rounded-xl bg-[#151517] border border-[#2E2E32] flex items-center justify-between">
            <div>
              <div className="text-white font-bold">Public Developer Sign-ups</div>
              <div className="text-[#80858e] text-[11px]">
                Allow new developers to register self-service API accounts.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAllowSignups(!allowSignups)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                allowSignups ? 'bg-white' : 'bg-[#2E2E32]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                  allowSignups ? 'bg-black translate-x-5' : 'bg-[#80858e] translate-x-0'
                }`}
              />
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Business Details Content */}
      {activeTab === 'business' && (
        <form onSubmit={handleSave} className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs text-xs">
          <div className="border-b border-[#2B2B2F] pb-4">
            <h2 className="text-sm font-bold text-white tracking-tight">Business Details: Company Information</h2>
            <p className="text-[#80858e] text-[11px] mt-0.5">
              Enter your business details for invoices and documentation.
            </p>
          </div>

          {/* Street Address */}
          <div className="space-y-1">
            <label className="text-white font-semibold block">Street Address</label>
            <input
              type="text"
              value={business.street_address}
              onChange={(e) => setBusiness({ ...business, street_address: e.target.value })}
              placeholder="12F, Galaxy International Building"
              className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white/50"
            />
            <p className="text-[#80858e] text-[11px]">Street address including building/suite number</p>
          </div>

          {/* City / Town & Postal Code Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-white font-semibold block">City/Town</label>
              <input
                type="text"
                value={business.city}
                onChange={(e) => setBusiness({ ...business, city: e.target.value })}
                placeholder="Dhaka"
                className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white/50"
              />
              <p className="text-[#80858e] text-[11px]">City or town name</p>
            </div>

            <div className="space-y-1">
              <label className="text-white font-semibold block">Postal/ZIP Code</label>
              <input
                type="text"
                value={business.zip_code}
                onChange={(e) => setBusiness({ ...business, zip_code: e.target.value })}
                placeholder="1216"
                className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white/50"
              />
              <p className="text-[#80858e] text-[11px]">Postal or ZIP code</p>
            </div>
          </div>

          {/* Country Dropdown */}
          <div className="space-y-1">
            <label className="text-white font-semibold block">Country</label>
            <select
              value={business.country}
              onChange={(e) => setBusiness({ ...business, country: e.target.value })}
              className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white/50"
            >
              <option value="Bangladesh">Bangladesh</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Singapore">Singapore</option>
              <option value="Germany">Germany</option>
              <option value="Netherlands">Netherlands</option>
              <option value="India">India</option>
              <option value="Japan">Japan</option>
              <option value="United Arab Emirates">United Arab Emirates</option>
              <option value="China">China</option>
            </select>
            <p className="text-[#80858e] text-[11px]">Country where your business is registered</p>
          </div>

          {/* Preview of Invoices Address */}
          <div className="mt-4 p-4 rounded-xl bg-[#141416] border border-[#26262A] space-y-1 text-xs">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#80858e]">Receipt Address Preview</span>
            <div className="font-bold text-white text-sm">Fobign</div>
            <div className="text-neutral-400">Unified AI Gateway Infrastructure</div>
            <div className="text-neutral-300 font-mono text-[11px]">
              {business.street_address || '12F, Galaxy International Building'}
            </div>
            <div className="text-neutral-300 font-mono text-[11px]">
              {business.city || 'Dhaka'}, {business.country || 'Bangladesh'}
            </div>
            <div className="text-neutral-400 font-mono text-[11px]">
              {contactSocial.support_email || 'api-service@fobign.com'}
            </div>
          </div>
        </form>
      )}

      {/* Tab 3: Contact & Social Content */}
      {activeTab === 'contact' && (
        <form onSubmit={handleSave} className="bg-[#1B1B1C] border border-[#2E2E32] rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs text-xs">
          {/* Section 1: Support Contact Information */}
          <div className="space-y-4">
            <div className="border-b border-[#2B2B2F] pb-3">
              <h2 className="text-sm font-bold text-white tracking-tight">Contact &amp; Social: Support Contact Information</h2>
              <p className="text-[#80858e] text-[11px] mt-0.5">
                Configure support channels for your customers.
              </p>
            </div>

            {/* Support Phone */}
            <div className="space-y-1">
              <label className="text-white font-semibold block">Support Phone Number</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-[#80858e] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={contactSocial.support_phone}
                  onChange={(e) => setContactSocial({ ...contactSocial, support_phone: e.target.value })}
                  placeholder="123-456-7890"
                  className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl pl-9 pr-3.5 py-2.5 text-white focus:outline-none focus:border-white/50"
                />
              </div>
              <p className="text-[#80858e] text-[11px]">Customer service phone number (with country code)</p>
            </div>

            {/* Support Email */}
            <div className="space-y-1">
              <label className="text-white font-semibold block">Support Email Address</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[#80858e] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={contactSocial.support_email}
                  onChange={(e) => setContactSocial({ ...contactSocial, support_email: e.target.value })}
                  placeholder="support@serverfest.com"
                  className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl pl-9 pr-3.5 py-2.5 text-white focus:outline-none focus:border-white/50"
                />
              </div>
              <p className="text-[#80858e] text-[11px]">Primary contact email for support inquiries</p>
            </div>

            {/* Support Website */}
            <div className="space-y-1">
              <label className="text-white font-semibold block">Support Website</label>
              <div className="flex rounded-xl overflow-hidden border border-[#2E2E32] bg-[#151517] focus-within:border-white/50">
                <span className="px-3.5 py-2.5 bg-[#202024] text-[#80858e] font-mono text-[11px] select-none border-r border-[#2E2E32]">
                  https://
                </span>
                <input
                  type="text"
                  value={contactSocial.support_website}
                  onChange={(e) => setContactSocial({ ...contactSocial, support_website: e.target.value })}
                  placeholder="dash.serverfest.com/submitticket.php"
                  className="flex-1 bg-transparent px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>
              <p className="text-[#80858e] text-[11px]">Link to your support portal or help center</p>
            </div>
          </div>

          {/* Section 2: Social Media Profiles */}
          <div className="space-y-4 pt-2">
            <div className="border-b border-[#2B2B2F] pb-3">
              <h3 className="text-sm font-bold text-white tracking-tight">Social Media Profiles</h3>
              <p className="text-[#80858e] text-[11px] mt-0.5">
                Link your business social media accounts.
              </p>
            </div>

            {/* Facebook Page */}
            <div className="space-y-1">
              <label className="text-white font-semibold block">Facebook Page</label>
              <div className="flex rounded-xl overflow-hidden border border-[#2E2E32] bg-[#151517] focus-within:border-white/50">
                <span className="px-3.5 py-2.5 bg-[#202024] text-[#80858e] font-mono text-[11px] select-none border-r border-[#2E2E32]">
                  https://facebook.com/
                </span>
                <input
                  type="text"
                  value={contactSocial.facebook}
                  onChange={(e) => setContactSocial({ ...contactSocial, facebook: e.target.value })}
                  placeholder="serverfest"
                  className="flex-1 bg-transparent px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>
              <p className="text-[#80858e] text-[11px]">Your Facebook page username</p>
            </div>

            {/* Facebook Messenger */}
            <div className="space-y-1">
              <label className="text-white font-semibold block">Facebook Messenger</label>
              <div className="flex rounded-xl overflow-hidden border border-[#2E2E32] bg-[#151517] focus-within:border-white/50">
                <span className="px-3.5 py-2.5 bg-[#202024] text-[#80858e] font-mono text-[11px] select-none border-r border-[#2E2E32]">
                  https://m.me/
                </span>
                <input
                  type="text"
                  value={contactSocial.messenger}
                  onChange={(e) => setContactSocial({ ...contactSocial, messenger: e.target.value })}
                  placeholder="serverfest"
                  className="flex-1 bg-transparent px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>
              <p className="text-[#80858e] text-[11px]">Your Facebook Messenger username</p>
            </div>

            {/* WhatsApp Number */}
            <div className="space-y-1">
              <label className="text-white font-semibold block">WhatsApp Number</label>
              <div className="relative">
                <MessageCircle className="w-3.5 h-3.5 text-[#80858e] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={contactSocial.whatsapp}
                  onChange={(e) => setContactSocial({ ...contactSocial, whatsapp: e.target.value })}
                  placeholder="+1234567890"
                  className="w-full bg-[#151517] border border-[#2E2E32] rounded-xl pl-9 pr-3.5 py-2.5 text-white focus:outline-none focus:border-white/50 font-mono"
                />
              </div>
              <p className="text-[#80858e] text-[11px]">WhatsApp number with country code</p>
            </div>

            {/* Telegram */}
            <div className="space-y-1">
              <label className="text-white font-semibold block">Telegram</label>
              <div className="flex rounded-xl overflow-hidden border border-[#2E2E32] bg-[#151517] focus-within:border-white/50">
                <span className="px-3.5 py-2.5 bg-[#202024] text-[#80858e] font-mono text-[11px] select-none border-r border-[#2E2E32]">
                  https://t.me/
                </span>
                <input
                  type="text"
                  value={contactSocial.telegram}
                  onChange={(e) => setContactSocial({ ...contactSocial, telegram: e.target.value })}
                  placeholder="serverfest"
                  className="flex-1 bg-transparent px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>
              <p className="text-[#80858e] text-[11px]">Your Telegram username</p>
            </div>

            {/* YouTube Channel */}
            <div className="space-y-1">
              <label className="text-white font-semibold block">YouTube Channel</label>
              <div className="flex rounded-xl overflow-hidden border border-[#2E2E32] bg-[#151517] focus-within:border-white/50">
                <span className="px-3.5 py-2.5 bg-[#202024] text-[#80858e] font-mono text-[11px] select-none border-r border-[#2E2E32]">
                  https://youtube.com/
                </span>
                <input
                  type="text"
                  value={contactSocial.youtube}
                  onChange={(e) => setContactSocial({ ...contactSocial, youtube: e.target.value })}
                  placeholder="@ServerFest"
                  className="flex-1 bg-transparent px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>
              <p className="text-[#80858e] text-[11px]">Your YouTube channel ID or handle</p>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
