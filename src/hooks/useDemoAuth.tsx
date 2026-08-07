import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { DEMO_USERS, type DemoUser } from '../data/admin/demoUsers';

type AuthContextValue = {
  user: DemoUser | null;
  validateCredentials: (
    email: string,
    password: string
  ) => { ok: boolean; user?: DemoUser; error?: string };
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'icon-cms-demo-user';

function readStoredUser(): DemoUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { email: string };
    return DEMO_USERS.find((u) => u.email === parsed.email) ?? null;
  } catch {
    return null;
  }
}

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(() => readStoredUser());

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      validateCredentials: (email, password) => {
        const match = DEMO_USERS.find(
          (u) =>
            u.email.toLowerCase() === email.trim().toLowerCase() &&
            u.password === password
        );
        if (!match) {
          return { ok: false, error: 'Invalid email or password.' };
        }
        return { ok: true, user: match };
      },
      login: (email, password) => {
        const match = DEMO_USERS.find(
          (u) =>
            u.email.toLowerCase() === email.trim().toLowerCase() &&
            u.password === password
        );
        if (!match) {
          return { ok: false, error: 'Invalid email or password.' };
        }
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ email: match.email }));
        setUser(match);
        return { ok: true };
      },
      logout: () => {
        sessionStorage.removeItem(STORAGE_KEY);
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useDemoAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useDemoAuth must be used within DemoAuthProvider');
  }
  return ctx;
}
