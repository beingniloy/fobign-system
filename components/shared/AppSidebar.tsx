'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SolidHomeIcon,
  SolidBarChartIcon,
  SolidKeySearchIcon,
  SolidCreditCardIcon,
  SolidBillingInboxIcon,
  SolidDocsIcon,
  SolidHelpBubbleIcon,
  SolidPriceTagIcon,
  SolidChatDotsIcon,
  SolidExchangeIcon,
  SolidSlidersIcon,
  SolidPaletteIcon,
  SolidMegaphoneIcon,
  SolidWalletIcon,
  SolidPercentIcon,
  SolidDatabaseIcon,
  SolidUsersIcon,
  SolidRolesShieldIcon,
  SolidTicketIcon,
  SolidServerIcon,
  SolidLayersIcon,
} from '@/components/ui/SidebarIcons';
import FobignLogo from '@/components/ui/FobignLogo';
import BoringAvatar from '@/components/ui/BoringAvatar';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  LogOut,
  User as UserIcon,
  Shield,
  ShieldAlert,
  Layers,
  Sparkles,
  Mail,
  MessageSquare,
  Database,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export interface AppSidebarProps {
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
  user?: {
    id: string;
    email: string;
    name: string;
    balance?: number;
    currency?: 'USD' | 'BDT';
    balance_usd?: number;
    balance_bdt?: number;
    role?: string;
  };
  onOpenAuth?: () => void;
  onLogout?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  mode?: 'platform' | 'admin' | 'all';
}

export default function AppSidebar({
  currentTab,
  onSelectTab,
  user,
  onOpenAuth,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
  mode: initialMode = 'all',
}: AppSidebarProps) {
  const pathname = usePathname() || '/';
  const router = useRouter();

  const activeMode: 'platform' | 'admin' =
    initialMode === 'admin'
      ? 'admin'
      : initialMode === 'platform'
      ? 'platform'
      : pathname.startsWith('/admin') ||
        pathname.startsWith('/settings') ||
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/usage') ||
        pathname.startsWith('/billing') ||
        pathname.startsWith('/transactions') ||
        pathname.startsWith('/providers') ||
        pathname.startsWith('/models') ||
        pathname.startsWith('/users') ||
        pathname.startsWith('/roles') ||
        pathname.startsWith('/audit-logs')
      ? 'admin'
      : 'platform';

  const [settingsExpanded, setSettingsExpanded] = useState(
    pathname.startsWith('/settings') && !pathname.startsWith('/settings/chat-')
  );
  const [chatExpanded, setChatExpanded] = useState(
    pathname.startsWith('/settings/chat-')
  );
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [siteName, setSiteName] = useState('Fobign');

  useEffect(() => {
    async function loadBranding() {
      try {
        const res = await fetch('/api/settings/branding');
        if (res.ok) {
          const data = await res.json();
          if (data.branding?.custom_logo_url) {
            setCustomLogo(data.branding.custom_logo_url);
          }
          if (data.branding?.platform_name) {
            setSiteName(data.branding.platform_name);
          }
        }
      } catch (err) {
        // silent fallback
      }
    }
    loadBranding();
  }, []);

  // Handle navigation
  const handleNavigate = (slug: string, tabId: string, external?: boolean) => {
    if (external || slug.startsWith('http')) {
      window.open(slug, '_blank');
      return;
    }
    if (onSelectTab) {
      onSelectTab(tabId);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
    if (pathname !== slug) {
      router.push(slug);
    }
  };

  // Check if item is active by pathname or tab
  const isItemActive = (slug: string, tabId: string) => {
    // Exact match for current route
    if (pathname === slug) return true;

    if (activeMode === 'admin') {
      if (slug === '/dashboard' && (pathname === '/' || pathname === '/dashboard' || pathname === '/admin' || pathname === '/admin/dashboard')) {
        return true;
      }
      if (slug === '/usage' && (pathname === '/usage' || pathname === '/admin/usage')) return true;
      if (slug === '/transactions' && (pathname === '/transactions' || pathname === '/billing' || pathname === '/admin/transactions')) return true;
      if (slug === '/billing' && (pathname === '/billing' || pathname === '/transactions' || pathname === '/admin/billing')) return true;
      if (slug === '/providers' && (pathname === '/providers' || pathname === '/admin/providers')) return true;
      if (slug === '/models' && (pathname === '/models' || pathname === '/admin/models')) return true;
      if (slug === '/users' && (pathname === '/users' || pathname === '/admin/users')) return true;
      if (slug === '/roles' && (pathname === '/roles' || pathname === '/admin/roles')) return true;
      if (slug === '/audit-logs' && (pathname === '/audit-logs' || pathname === '/admin/audit-logs')) return true;
    } else {
      if (slug === '/') {
        return pathname === '/' || currentTab === 'home';
      }
      if (slug === '/usage') {
        return pathname === '/usage' || currentTab === 'usage';
      }
    }

    // Explicit currentTab prop matching
    if (currentTab && currentTab === tabId) return true;

    return false;
  };

  // Developer Platform nav items
  const platformNavItems = [
    { id: 'home', label: 'Home', slug: '/', icon: SolidHomeIcon },
    { id: 'usage', label: 'Usage', slug: '/usage', icon: SolidBarChartIcon },
    { id: 'apikeys', label: 'Keys', slug: '/api-keys', icon: SolidKeySearchIcon },
    { id: 'topup', label: 'Top up', slug: '/top-up', icon: SolidCreditCardIcon },
    { id: 'transactions', label: 'Transactions', slug: '/transactions', icon: SolidBillingInboxIcon },
    { id: 'tickets', label: 'Tickets', slug: '/tickets', icon: SolidTicketIcon },
  ];

  const platformBottomNavItems = [
    { id: 'docs', label: 'Docs', slug: '/docs', icon: SolidDocsIcon },
    { id: 'help', label: 'Help', slug: '/help', icon: SolidHelpBubbleIcon },
    { id: 'pricing', label: 'Pricing', slug: '/pricing', icon: SolidPriceTagIcon },
    { id: 'chat', label: 'Chat', slug: 'https://chat.fobign.com', icon: SolidChatDotsIcon, external: true },
  ];

  // Admin & Settings items
  const adminNavItems = [
    { id: 'system_overview', label: 'Dashboard', slug: '/dashboard', icon: SolidBarChartIcon },
    { id: 'admin_usage', label: 'Usage', slug: '/usage', icon: SolidBarChartIcon },
    { id: 'admin_transactions', label: 'Transactions', slug: '/transactions', icon: SolidBillingInboxIcon },
    { id: 'system_providers', label: 'Providers', slug: '/providers', icon: SolidServerIcon },
    { id: 'system_models', label: 'Models', slug: '/models', icon: SolidLayersIcon },
    { id: 'admin_users', label: 'Users', slug: '/users', icon: SolidUsersIcon },
    { id: 'admin_tickets', label: 'Tickets', slug: '/tickets', icon: SolidTicketIcon },
    { id: 'admin_roles', label: 'Roles', slug: '/roles', icon: SolidRolesShieldIcon },
    { id: 'admin_audit', label: 'Audit Logs', slug: '/audit-logs', icon: ShieldAlert },
  ];

  const adminChatItems = [
    { id: 'chat_models', label: 'Models', slug: '/settings/chat-models', icon: SolidLayersIcon },
    { id: 'chat_limits', label: 'Limits & Quota', slug: '/settings/chat-limits', icon: SolidSlidersIcon },
    { id: 'chat_general', label: 'Chat Behavior', slug: '/settings/chat-general', icon: Sparkles },
  ];

  const adminSettingsItems = [
    { id: 'settings_general', label: 'General', slug: '/settings/general', icon: SolidSlidersIcon },
    { id: 'settings_branding', label: 'Branding', slug: '/settings/branding', icon: SolidPaletteIcon },
    { id: 'settings_updates', label: 'Updates', slug: '/settings/updates', icon: SolidMegaphoneIcon },
    { id: 'settings_exchange', label: 'Exchange', slug: '/settings/exchange-rate', icon: SolidExchangeIcon },
    { id: 'settings_announcement', label: 'Notice', slug: '/settings/announcement', icon: SolidMegaphoneIcon },
    { id: 'settings_payment', label: 'Payments', slug: '/settings/payment-method', icon: SolidWalletIcon },
    { id: 'settings_security', label: 'Security', slug: '/settings/security', icon: ShieldCheck },
    { id: 'settings_credit', label: 'Credit', slug: '/settings/credit', icon: SolidCreditCardIcon },
    { id: 'settings_tax', label: 'Tax', slug: '/settings/tax', icon: SolidPercentIcon },
    { id: 'settings_mail', label: 'Mail', slug: '/settings/mail', icon: Mail },
    { id: 'settings_sms', label: 'SMS', slug: '/settings/sms', icon: MessageSquare },
    { id: 'settings_backup', label: 'Backup & Reset', slug: '/settings/backup', icon: Database },
    { id: 'settings_supabase', label: 'Supabase', slug: '/settings/supabase', icon: SolidDatabaseIcon },
  ];

  const sidebarBody = (
    <div className="flex flex-col h-full text-xs font-['Nunito',sans-serif] overflow-hidden">
      {/* Top Header & Branding (Fixed) */}
      <div className="shrink-0 px-4 py-3.5 flex items-center justify-between border-b border-[#252528] bg-[#1B1B1C]">
        <div className="flex items-center gap-3">
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 -ml-1 text-[#9ca3af] hover:text-white rounded-lg hover:bg-[#202023] transition-colors"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div
            className="cursor-pointer transition-opacity hover:opacity-90 flex items-center"
            onClick={() => handleNavigate(activeMode === 'admin' ? '/dashboard' : '/', activeMode === 'admin' ? 'dashboard' : 'home')}
          >
            <FobignLogo customLogoUrl={customLogo} size="md" showBadge={true} />
          </div>
        </div>
      </div>

      {/* Middle Navigation list (Independently Scrollable) */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 overscroll-contain">
        {activeMode === 'platform' ? (
          <>
            {platformNavItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.slug, item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.slug, item.id)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    active ? 'bg-[#2D2D30] text-white shadow-xs' : 'text-[#9ca3af] hover:text-white hover:bg-[#222225]'
                  }`}
                >
                  <Icon size={18} className={active ? 'text-white' : 'text-[#7E828A]'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </>
        ) : (
          <>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.slug, item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.slug, item.id)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    active ? 'bg-[#2D2D30] text-white shadow-xs' : 'text-[#9ca3af] hover:text-white hover:bg-[#222225]'
                  }`}
                >
                  <Icon size={18} className={active ? 'text-white' : 'text-[#7E828A]'} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            {/* AI Chat Management Group */}
            <div className="pt-2">
              <button
                onClick={() => setChatExpanded(!chatExpanded)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  pathname.startsWith('/settings/chat-') ? 'text-white bg-[#222225]' : 'text-[#9ca3af] hover:text-white hover:bg-[#222225]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <SolidChatDotsIcon size={18} className={pathname.startsWith('/settings/chat-') ? 'text-[#f54e00]' : 'text-[#7E828A]'} />
                  <span>AI Chat</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[#7E828A] transition-transform duration-200 ${chatExpanded ? 'rotate-180' : ''}`} />
              </button>

              {chatExpanded && (
                <div className="pl-4 pr-1 py-1 space-y-0.5 border-l border-[#2E2E32] ml-5 mt-1">
                  {adminChatItems.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(item.slug, item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.slug, item.id)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                          active ? 'bg-[#2D2D30] text-white font-bold' : 'text-[#858993] hover:text-white hover:bg-[#222225]'
                        }`}
                      >
                        <Icon size={14} className={active ? 'text-[#f54e00]' : 'text-[#7E828A]'} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-1">
              <button
                onClick={() => setSettingsExpanded(!settingsExpanded)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  pathname.startsWith('/settings') ? 'text-white bg-[#222225]' : 'text-[#9ca3af] hover:text-white hover:bg-[#222225]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <SolidSlidersIcon size={18} className={pathname.startsWith('/settings') ? 'text-white' : 'text-[#7E828A]'} />
                  <span>Settings</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[#7E828A] transition-transform duration-200 ${settingsExpanded ? 'rotate-180' : ''}`} />
              </button>

              {settingsExpanded && (
                <div className="pl-4 pr-1 py-1 space-y-0.5 border-l border-[#2E2E32] ml-5 mt-1">
                  {adminSettingsItems.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(item.slug, item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.slug, item.id)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                          active ? 'bg-[#2D2D30] text-white font-bold' : 'text-[#858993] hover:text-white hover:bg-[#222225]'
                        }`}
                      >
                        <Icon size={14} className={active ? 'text-white' : 'text-[#7E828A]'} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Bottom Area (Fixed) */}
      <div className="shrink-0 px-3 pb-3 space-y-2 mt-auto border-t border-[#252528] bg-[#1B1B1C] pt-2">
        {activeMode === 'platform' && (
          <div className="space-y-0.5 pt-2 border-t border-[#252528]">
            {platformBottomNavItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.slug, item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.slug, item.id, (item as any).external)}
                  className={`w-full flex items-center gap-3.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    active ? 'bg-[#2D2D30] text-white' : 'text-[#828790] hover:text-white hover:bg-[#222225]'
                  }`}
                >
                  <Icon size={16} className="text-[#7E828A]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* User Card */}
        <div className="pt-2 border-t border-[#252528]">
          {activeMode === 'admin' ? (
            <div className="flex items-center p-1">
              <Link
                href="/profile"
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[#222225] transition-colors group flex-1 min-w-0"
              >
                <BoringAvatar name={user?.name || user?.email || 'Super Admin'} size={30} />
                <div className="text-xs font-semibold text-white truncate">
                  {user?.name || 'Super Admin'}
                </div>
              </Link>
            </div>
          ) : user && user.id !== 'usr_guest' ? (
            <div className="flex items-center p-1">
              <Link
                href="/profile"
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[#222225] transition-colors group flex-1 min-w-0"
              >
                <BoringAvatar name={user.name || user.email || 'Developer'} size={30} />
                <div className="text-xs font-semibold text-white truncate">
                  {user.name}
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-1">
              <Link
                href="/login"
                className="flex-1 text-center bg-white text-[#131415] hover:bg-neutral-200 font-semibold text-xs py-2 rounded-xl transition-colors shadow-xs"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="flex-1 text-center bg-[#222225] text-white hover:bg-[#2a2a2e] border border-[#2E2E32] font-semibold text-xs py-2 rounded-xl transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed Independent Sidebar
          Crucial rule: h-screen sticky top-0 overflow-y-auto overscroll-contain
          This ensures page scrolling DOES NOT scroll the sidebar at all.
          Only scrolling when the cursor is positioned directly over the sidebar scrolls the sidebar!
      */}
      <aside className="hidden md:flex w-64 bg-[#1B1B1C] border-r border-[#2E2E32] flex-col shrink-0 select-none h-screen sticky top-0 z-20 overflow-hidden">
        {sidebarBody}
      </aside>

      {/* 2. Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-300"
            onClick={onCloseMobile}
          />
          <div className="relative w-4/5 max-w-xs bg-[#1B1B1C] border-r border-[#2E2E32] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 overflow-y-auto">
            {sidebarBody}
          </div>
        </div>
      )}
    </>
  );
}
