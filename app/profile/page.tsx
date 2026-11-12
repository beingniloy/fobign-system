'use client';

import React, { useState, useEffect } from 'react';
import ProfileView from '@/components/platform/ProfileView';
import { readAdminSession, writeAdminSession, clearAdminSession } from '@/lib/adminSession';

interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export default function AdminProfilePage() {
  const [adminUser, setAdminUser] = useState<AdminProfile>({
    id: 'adm_01',
    name: 'Super Admin',
    email: 'admin@fobign.com',
    role: 'superadmin',
  });
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    const session = readAdminSession();
    if (!session) return;
    setAdminUser((prev) => ({
      ...prev,
      id: session.id || prev.id,
      name: session.name || prev.name,
      email: session.email || prev.email,
      role: session.role,
    }));
  }, []);

  const handleLogout = () => {
    clearAdminSession();
    window.location.href = '/';
  };

  /**
   * Name/email edits from the inline pencil -> input -> tick affordance.
   * The API takes the current email to locate the record, plus the new email
   * under a separate key so we never send an ambiguous "email" field.
   */
  const handleSaveProfile = async (patch: { name?: string; email?: string }) => {
    setPageError('');
    const res = await fetch('/api/system/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminUser.email,
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.email !== undefined ? { newEmail: patch.email } : {}),
      }),
    });

    const data = await res.json().catch(() => ({} as any));
    if (!res.ok || !data.success) {
      const message = data.error || 'Could not save your changes.';
      setPageError(message);
      throw new Error(message);
    }

    const next: AdminProfile = {
      ...adminUser,
      name: data.admin.name ?? adminUser.name,
      email: data.admin.email ?? adminUser.email,
      role: data.admin.role ?? adminUser.role,
    };
    setAdminUser(next);

    // Re-stamp the session so a changed email is what future logins validate.
    const session = readAdminSession();
    if (session) {
      writeAdminSession({ ...session, email: next.email, name: next.name });
    }
  };

  /** Password change — current password is required by the API. */
  const handleSavePassword = async (newPassword: string) => {
    setPageError('');
    const currentPassword = window.prompt(
      'Enter your CURRENT admin password to confirm the change:'
    );
    if (currentPassword === null) {
      throw new Error('Password change cancelled.');
    }

    const res = await fetch('/api/system/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminUser.email,
        currentPassword,
        newPassword,
      }),
    });

    const data = await res.json().catch(() => ({} as any));
    if (!res.ok || !data.success) {
      const message = data.error || 'Could not update your password.';
      setPageError(message);
      throw new Error(message);
    }
  };

  return (
    <div className="w-full">
      {pageError && (
        <div className="max-w-2xl mx-auto mb-4 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300">
          {pageError}
        </div>
      )}
      <ProfileView
        user={{
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          balance: 0,
          currency: 'USD',
        }}
        onLogout={handleLogout}
        onSaveProfile={handleSaveProfile}
        onSavePassword={handleSavePassword}
      />
    </div>
  );
}
