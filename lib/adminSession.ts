'use client';

/**
 * Admin session persistence.
 *
 * The session used to live in `sessionStorage`, which is wiped the moment the
 * browser closes — that is why admins were being signed out between visits.
 * It now lives in `localStorage` with a rolling 30-day expiry, so a signed-in
 * admin stays signed in for at least a month unless they log out explicitly.
 */

export const ADMIN_SESSION_KEY = 'fobign_admin_session';

/** 30 days, in milliseconds. */
export const ADMIN_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface AdminSession {
  id: string;
  email: string;
  name?: string;
  role: string;
  token?: string;
  /** Epoch ms at which this session stops being valid. */
  expiresAt?: number;
}

/** Reads the admin session, returning null when absent or expired. */
export function readAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed || typeof parsed !== 'object' || !parsed.email) {
      window.localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }

    // Sessions written before expiry existed get stamped now, so they earn a
    // fresh 30 days instead of being dropped on upgrade.
    if (typeof parsed.expiresAt !== 'number') {
      parsed.expiresAt = Date.now() + ADMIN_SESSION_TTL_MS;
      window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(parsed));
    } else if (parsed.expiresAt <= Date.now()) {
      window.localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/** Writes the session and stamps a fresh 30-day expiry. */
export function writeAdminSession(admin: Omit<AdminSession, 'expiresAt'>): AdminSession {
  const session: AdminSession = { ...admin, expiresAt: Date.now() + ADMIN_SESSION_TTL_MS };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      // Drop any stale copy in sessionStorage from the previous implementation.
      window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // Storage unavailable (private mode) — session just won't persist.
    }
  }
  return session;
}

/** Clears the session from both storage areas. */
export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    // ignore
  }
}
