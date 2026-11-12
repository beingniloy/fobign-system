'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  readUserSession,
  writeUserSession,
  patchUserSession,
  clearUserSession,
  isDefinitiveRejection,
} from '@/lib/userSession';

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  balance: number;
  currency: 'USD' | 'BDT';
  balance_usd: number;
  balance_bdt: number;
  granted_usd: number;
  role?: string;
}

export const DEFAULT_GUEST: CurrentUser = {
  id: 'usr_guest',
  email: 'developer@fobign.com',
  name: 'Developer',
  balance: 0.00,
  currency: 'USD',
  balance_usd: 0.00,
  balance_bdt: 0.00,
  granted_usd: 0.00,
};

interface UserContextType {
  user: CurrentUser | null;
  setUser: React.Dispatch<React.SetStateAction<CurrentUser | null>>;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(() => {
    const stored = readUserSession();
    if (stored) {
      return {
        id: stored.id,
        email: stored.email || 'user@fobign.com',
        name: stored.name || 'Developer',
        balance: stored.balance ?? stored.balance_usd ?? 0,
        currency: stored.currency || 'USD',
        balance_usd: stored.balance_usd ?? stored.balance ?? 0,
        balance_bdt: stored.balance_bdt ?? ((stored.balance_usd || 0) * 122.5),
        granted_usd: stored.granted_usd ?? 0,
      };
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function validateAndLoadUser() {
      if (typeof window === 'undefined') {
        if (isMounted) setIsLoading(false);
        return;
      }

      // readUserSession enforces the 30-day expiry and stamps legacy sessions.
      const parsed = readUserSession();
      if (!parsed) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(`/api/auth/me?userId=${encodeURIComponent(parsed.id)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            const validUser: CurrentUser = {
              id: data.user.id,
              email: data.user.email || parsed.email || 'developer@fobign.com',
              name: data.user.name || parsed.name || 'Developer',
              balance: data.user.balance ?? data.user.balance_usd ?? 0,
              currency: data.user.currency || 'USD',
              balance_usd: data.user.balance_usd ?? data.user.balance ?? 0,
              balance_bdt: data.user.balance_bdt ?? ((data.user.balance_usd || 0) * 122.5),
              granted_usd: data.user.granted_usd ?? 0,
              role: data.user.role,
            };
            if (isMounted) {
              setUser(validUser);
              // Successful check re-stamps the rolling 30-day expiry.
              writeUserSession(validUser);
            }
            return;
          }
        }

        // Only a definitive rejection (404 = account gone, 403 = banned or
        // suspended) may end the session. 5xx, rate limits and malformed
        // responses keep the cached session — a flaky server must never sign
        // the user out.
        if (isDefinitiveRejection(res.status)) {
          clearUserSession();
          if (isMounted) {
            setUser(null);
          }
        } else {
          console.warn(`Session check returned ${res.status}; keeping cached session.`);
        }
      } catch (err) {
        // Network failure — keep the cached session instead of logging out.
        console.error('Session validation error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    validateAndLoadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshUser = useCallback(async () => {
    const activeUserId = user?.id;
    if (!activeUserId) return;
    try {
      const res = await fetch(`/api/usage?userId=${activeUserId}`);
      if (res.ok) {
        const data = await res.json();
        setUser((prev) => {
          if (!prev) return null;
          const updated: CurrentUser = {
            ...prev,
            balance: data.balance?.topped_up_balance ?? prev.balance,
            balance_usd: data.balance?.topped_up_balance ?? prev.balance_usd,
            currency: (data.balance?.currency || prev.currency) as 'USD' | 'BDT',
            balance_bdt: (data.balance?.topped_up_balance ?? prev.balance_usd) * 122.5,
          };
          patchUserSession({ ...updated });
          return updated;
        });
      }
    } catch {
      // ignore
    }
  }, [user]);

  const logout = useCallback(() => {
    clearUserSession();
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: user !== null,
        refreshUser,
        logout,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isAuthModalOpen,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    return {
      user: null,
      setUser: () => { },
      isAuthenticated: false,
      refreshUser: async () => { },
      logout: () => { },
      openAuthModal: () => { },
      closeAuthModal: () => { },
      isAuthModalOpen: false,
      isLoading: false,
      loginAsDemo: () => { },
    };
  }
  return ctx;
}
