import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, tokens, type CmsUser, type LoginResult } from '../lib/api';

type AuthStatus = 'restoring' | 'authenticated' | 'anonymous';

type AuthContextValue = {
  status: AuthStatus;
  user: CmsUser | null;
  /** Resolves to the raw API result so the login screen can branch on 2FA. */
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyMfa: (mfaToken: string, code: string) => Promise<CmsUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  can: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('restoring');
  const [user, setUser] = useState<CmsUser | null>(null);

  // Pick the session back up after a reload using the stored refresh token.
  useEffect(() => {
    let cancelled = false;

    api.auth
      .restore()
      .then((restored) => {
        if (cancelled) return;
        setUser(restored);
        setStatus(restored ? 'authenticated' : 'anonymous');
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
        setStatus('anonymous');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // The API client tells us when the server has ended the session underneath us.
  useEffect(() => {
    tokens.onSessionLost(() => {
      setUser(null);
      setStatus('anonymous');
    });
    return () => tokens.onSessionLost(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.auth.login(email, password);
    if (!result.mfa_required) {
      tokens.set(result.tokens);
      setUser(result.user);
      setStatus('authenticated');
    }
    return result;
  }, []);

  const verifyMfa = useCallback(async (mfaToken: string, code: string) => {
    const result = await api.auth.verifyMfa(mfaToken, code);
    tokens.set(result.tokens);
    setUser(result.user);
    setStatus('authenticated');
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // Signing out locally must succeed even if the server cannot be reached.
    } finally {
      tokens.clear();
      setUser(null);
      setStatus('anonymous');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      setUser(await api.auth.me());
    } catch {
      tokens.clear();
      setUser(null);
      setStatus('anonymous');
    }
  }, []);

  const can = useCallback(
    (permission: string) => user?.permissions.includes(permission) ?? false,
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, verifyMfa, logout, refreshUser, can }),
    [status, user, login, verifyMfa, logout, refreshUser, can]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
