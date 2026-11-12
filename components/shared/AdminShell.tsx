'use client';

import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import AppSidebar from '@/components/shared/AppSidebar';
import AdminLogin from '@/components/system/AdminLogin';
import { readAdminSession, clearAdminSession } from '@/lib/adminSession';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [adminSession, setAdminSession] = useState<{ email: string; role: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (!isMounted) return;
      try {
        // localStorage + 30-day expiry, so closing the browser keeps you in.
        const session = readAdminSession();
        if (session) {
          setAdminSession(session);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setChecking(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    clearAdminSession();
    setAdminSession(null);
  };

  if (checking) {
    return (
      <div className="h-screen bg-[#151517] flex items-center justify-center text-xs text-[#80858e]">
        Verifying admin session...
      </div>
    );
  }

  if (!adminSession) {
    return <AdminLogin onSuccess={(admin) => setAdminSession(admin)} />;
  }

  return (
    <div className="h-screen overflow-hidden bg-[#151517] text-[#f0f2f5] flex font-['Nunito',sans-serif]">
      {/* Sidebar with independent scroll */}
      <AppSidebar
        mode="admin"
        user={{
          id: 'admin_1',
          name: 'Super Admin',
          email: adminSession.email || 'admin@fobign.com',
        }}
        onLogout={handleLogout}
        isMobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Viewport - No top navbar! */}
      <main className="flex-1 h-full overflow-y-auto max-w-7xl w-full bg-[#151517] p-4 sm:p-8 relative">
        {/* Mobile menu trigger */}
        <div className="md:hidden mb-4 flex items-center">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 bg-[#1B1B1C] border border-[#2E2E32] rounded-xl text-[#9ca3af] hover:text-white transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5 text-[#4d7cfe]" />
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}

