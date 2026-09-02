import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { getSessionToken, setSessionToken, clearSessionToken } from "@/lib/session";

type Business = {
  id: number;
  name: string;
  industry: string;
  moduleChoice: "stock" | "jobs" | "both";
} | null;

type User = { id: number; fullName: string; phone: string; email: string | null } | null;

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: User;
  business: Business;
  setSession: (token: string, user: NonNullable<User>, business: Business) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User>(null);
  const [business, setBusiness] = useState<Business>(null);
  const utils = trpc.useUtils();

  useEffect(() => {
    (async () => {
      const token = await getSessionToken();
      if (!token) {
        setStatus("unauthenticated");
        return;
      }
      try {
        const me = await utils.client.auth.me.query();
        setUser(me.user);
        setBusiness((me.business as Business) ?? null);
        setStatus("authenticated");
      } catch {
        await clearSessionToken();
        setStatus("unauthenticated");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSession = useCallback(async (token: string, nextUser: NonNullable<User>, nextBusiness: Business) => {
    await setSessionToken(token);
    setUser(nextUser);
    setBusiness(nextBusiness);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    await clearSessionToken();
    setUser(null);
    setBusiness(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(() => ({ status, user, business, setSession, logout }), [status, user, business, setSession, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSession(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useSession must be used within AuthProvider");
  return ctx;
}
