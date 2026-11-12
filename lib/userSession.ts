'use client';

/**
 * Shared helpers for the `fobign_user_session` record kept in localStorage.
 *
 * Two things matter here:
 *
 * 1. **Expiry.** The session is stamped with a rolling 30-day `expiresAt` so a
 *    signed-in user stays signed in for at least a month rather than being
 *    dropped on the next page load.
 *
 * 2. **Not logging people out on a bad request.** A session is only discarded
 *    when the server definitively says the account is gone or disabled. A 500,
 *    a rate limit, or a dropped connection must NOT wipe the session — that
 *    transient failure is what previously signed users out at random.
 */

export const USER_SESSION_KEY = 'fobign_user_session';

/** 30 days, in milliseconds. */
export const USER_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** True when an HTTP status means "this session can never work again". */
export function isDefinitiveRejection(status: number): boolean {
  // 404 = user no longer exists, 403 = banned/suspended.
  return status === 404 || status === 403;
}

/** Reads and parses the stored session, honoring the 30-day expiry. */
export function readUserSession<T extends { id?: string } = any>(): (T & { expiresAt?: number }) | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(USER_SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.id) {
      window.localStorage.removeItem(USER_SESSION_KEY);
      return null;
    }

    if (typeof parsed.expiresAt !== 'number') {
      // Written before expiry existed — stamp a fresh 30 days instead of
      // treating every pre-upgrade session as expired.
      parsed.expiresAt = Date.now() + USER_SESSION_TTL_MS;
      window.localStorage.setItem(USER_SESSION_KEY, JSON.stringify(parsed));
    } else if (parsed.expiresAt <= Date.now()) {
      window.localStorage.removeItem(USER_SESSION_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/** Writes the session with a fresh 30-day expiry. */
export function writeUserSession(value: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      USER_SESSION_KEY,
      JSON.stringify({ ...value, expiresAt: Date.now() + USER_SESSION_TTL_MS })
    );
  } catch {
    // Storage unavailable — the UI state still holds the session.
  }
}

/** Merges a patch into the stored session, preserving its expiry window. */
export function patchUserSession(patch: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(USER_SESSION_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    window.localStorage.setItem(
      USER_SESSION_KEY,
      JSON.stringify({ ...parsed, ...patch, expiresAt: Date.now() + USER_SESSION_TTL_MS })
    );
  } catch {
    // ignore
  }
}

export function clearUserSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(USER_SESSION_KEY);
  } catch {
    // ignore
  }
}
