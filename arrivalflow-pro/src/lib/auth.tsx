import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type AppRole = "Administrator" | "Data Steward" | "Wave Planner" | "Production Manager" | "Inventory Controller" | "Warehouse Supervisor" | "Receiving Supervisor" | "Document Controller" | "Procurement Manager" | "Storage Manager" | "Quality Inspector" | "Inventory Lifecycle Manager" | "Supplier Manager";
export type ModuleKey = "arrival" | "master" | "wave" | "workcraft" | "inventory" | "warehouse" | "receiving" | "document" | "procurement" | "storage" | "quality" | "lifecycle" | "supplier";

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
    modules: ["arrival", "master", "wave", "workcraft", "inventory", "warehouse", "receiving", "document", "procurement", "storage", "quality", "lifecycle", "supplier"],
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
  {
    id: "RCV-1001",
    name: "A. Mehta",
    email: "mehta@nexuswms.com",
    password: "receiving@2026",
    role: "Receiving Supervisor",
    modules: ["receiving"],
    dashboard: "/receiving-hub",
  },
  {
    id: "DOC-1001",
    name: "R. Deshmukh",
    email: "deshmukh@nexuswms.com",
    password: "document@2026",
    role: "Document Controller",
    modules: ["document"],
    dashboard: "/document-flow",
  },
  {
    id: "PRC-1001",
    name: "AMS Procurement Manager",
    email: "procurement@nexuswms.com",
    password: "procurement@2026",
    role: "Procurement Manager",
    modules: ["procurement"],
    dashboard: "/ams-insights",
  },
  {
    id: "STG-1001",
    name: "Storage Guardian Manager",
    email: "storage@nexuswms.com",
    password: "storage@2026",
    role: "Storage Manager",
    modules: ["storage"],
    dashboard: "/storage-guardian",
  },
  {
    id: "QIN-1001",
    name: "A. Sharma",
    email: "quality@nexuswms.com",
    password: "quality@2026",
    role: "Quality Inspector",
    modules: ["quality"],
    dashboard: "/quality-gatekeeper",
  },
  {
    id: "ILM-1001",
    name: "Inventory Lifecycle Manager",
    email: "lifecycle@nexuswms.com",
    password: "lifecycle@2026",
    role: "Inventory Lifecycle Manager",
    modules: ["lifecycle"],
    dashboard: "/inventory-flow-pro",
  },
  {
    id: "SUP-1001",
    name: "Ananya Gupta",
    email: "supplier@nexuswms.com",
    password: "supplier@2026",
    role: "Supplier Manager",
    modules: ["supplier"],
    dashboard: "/supplier-flow",
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
        window.location.assign("/login");
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
