'use client';

import React, { useState, useEffect } from 'react';
import ProfileView from '@/components/platform/ProfileView';

export default function AdminProfilePage() {
  const [adminUser, setAdminUser] = useState<{
    id: string;
    email: string;
    name: string;
    balance?: number;
    currency?: 'USD' | 'BDT';
  }>({
    id: 'adm_01',
    name: 'Super Admin',
    email: 'admin@fobign.com',
    balance: 0,
    currency: 'USD',
  });

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('fobign_admin_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        setAdminUser({
          id: 'adm_01',
          name: parsed.name || 'Super Admin',
          email: parsed.email || 'admin@fobign.com',
          balance: 0,
          currency: 'USD',
        });
      }
    } catch (e) {
      // fallback
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('fobign_admin_session');
    window.location.href = '/';
  };

  return (
    <div className="w-full">
      <ProfileView user={adminUser} onLogout={handleLogout} />
    </div>
  );
}

