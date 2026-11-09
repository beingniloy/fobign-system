'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('fobign_user_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object' && parsed.id) {
            return {
              id: parsed.id,
              email: parsed.email || 'user@fobign.com',
              name: parsed.name || 'Developer',
              balance: parsed.balance ?? parsed.balance_usd ?? 0,
              currency: parsed.currency || 'USD',
              balance_usd: parsed.balance_usd ?? parsed.balance ?? 0,
              balance_bdt: parsed.balance_bdt ?? ((parsed.balance_usd || 0) * 122.5),
              granted_usd: parsed.granted_usd ?? 0,
            };
          }
        }
      } catch {
        // ignore
      }
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

      const stored = localStorage.getItem('fobign_user_session');
      if (!stored) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      let parsed: any = null;
      try {
        parsed = JSON.parse(stored);
      } catch {
        localStorage.removeItem('fobign_user_session');
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      if (!parsed?.id) {
        localStorage.removeItem('fobign_user_session');
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
              localStorage.setItem('fobign_user_session', JSON.stringify(validUser));
            }
            return;
          }
        }

        localStorage.removeItem('fobign_user_session');
        if (isMounted) {
          setUser(null);
        }
      } catch (err) {
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
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('fobign_user_session', JSON.stringify(updated));
            } catch {
              // ignore
            }
          }
          return updated;
        });
      }
    } catch {
      // ignore
    }
  }, [user]);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fobign_user_session');
    }
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
