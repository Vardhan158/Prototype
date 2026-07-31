import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type AppRole = "Administrator" | "Data Steward" | "Wave Planner" | "Production Manager" | "Inventory Controller" | "Warehouse Supervisor";
export type ModuleKey = "arrival" | "master" | "wave" | "workcraft" | "inventory" | "warehouse";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  modules: ModuleKey[];
  dashboard: string;
}
type SeededUser = AuthUser & { password: string };

export const SEEDED_USERS: SeededUser[] = [
  {
    id: "ADM-0001",
    name: "Nexus Administrator",
    email: "admin@nexuswms.com",
    password: "Admin@2026",
    role: "Administrator",
    modules: ["arrival", "master", "wave", "workcraft", "inventory", "warehouse"],
    dashboard: "/dashboard",
  },
  {
    id: "DST-1001",
    name: "Amara Okafor",
    email: "amara@nexuswms.com",
    password: "master@2026",
    role: "Data Steward",
    modules: ["master"],
    dashboard: "/master-core",
  },
  {
    id: "WAV-1001",
    name: "Karan Arora",
    email: "karan@nexuswms.com",
    password: "wave@2026",
    role: "Wave Planner",
    modules: ["wave"],
    dashboard: "/wave-flow",
  },
  {
    id: "PRD-1001",
    name: "Ana Fernandes",
    email: "ana@nexuswms.com",
    password: "work@2026",
    role: "Production Manager",
    modules: ["workcraft"],
    dashboard: "/work-craft",
  },
  {
    id: "INV-1001",
    name: "R. Krishnan",
    email: "krishnan@nexuswms.com",
    password: "inventory@2026",
    role: "Inventory Controller",
    modules: ["inventory"],
    dashboard: "/inventory-flow",
  },
  {
    id: "WHS-1001",
    name: "Anjali Sharma",
    email: "anjali@nexuswms.com",
    password: "warehouse@2026",
    role: "Warehouse Supervisor",
    modules: ["warehouse"],
    dashboard: "/warehouse-flow",
  },
];

const SESSION_KEY = "nexuswms.session.v1";
const SSO_COOKIE = "nexuswms_sso";
interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  login: (identifier: string, password: string) => AuthUser | null;
  logout: () => void;
  canAccess: (module: ModuleKey) => boolean;
}
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SESSION_KEY);
      if (saved) setUser(JSON.parse(saved) as AuthUser);
    } catch {
      window.localStorage.removeItem(SESSION_KEY);
    } finally {
      setReady(true);
    }
  }, []);
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      login: (identifier, password) => {
        const normalized = identifier.trim().toLowerCase();
        const account = SEEDED_USERS.find(
          (candidate) =>
            (candidate.email.toLowerCase() === normalized ||
              candidate.id.toLowerCase() === normalized) &&
            candidate.password === password,
        );
        if (!account) return null;
        const { password: _password, ...session } = account;
        setUser(session);
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        document.cookie = `${SSO_COOKIE}=${encodeURIComponent(JSON.stringify(session))}; Path=/; SameSite=Lax`;
        return session;
      },
      logout: () => {
        setUser(null);
        window.localStorage.removeItem(SESSION_KEY);
        document.cookie = `${SSO_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
      },
      canAccess: (module) => Boolean(user?.modules.includes(module)),
    }),
    [user, ready],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
