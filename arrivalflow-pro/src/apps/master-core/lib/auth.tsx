import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
export type User = { name: string; email: string; role: "Warehouse Gate Entry & Arrival Management" | "Master Data Managemnet" };
const users = [
  { name: "Nexus Warehouse Gate Entry & Arrival Management", email: "admin@nexuswms.com", id: "ADM-0001", password: "Admin@2026", role: "Warehouse Gate Entry & Arrival Management" as const },
  { name: "Amara Okafor", email: "amara@nexuswms.com", id: "DST-1001", password: "master@2026", role: "Master Data Managemnet" as const },
];
const key = "nexuswms.master.session.v1";
function sharedSession(): User | null { try { const raw = document.cookie.split("; ").find((part) => part.startsWith("nexuswms_sso="))?.split("=").slice(1).join("="); if (!raw) return null; const value = JSON.parse(decodeURIComponent(raw)) as User; return value.role === "Warehouse Gate Entry & Arrival Management" || value.role === "Master Data Managemnet" ? value : null; } catch { return null; } }
const Context = createContext<{ user: User | null; ready: boolean; login: (id: string, password: string) => User | null; logout: () => void } | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [ready, setReady] = useState(false);
  useEffect(() => { try { const shared = sharedSession(); const value = localStorage.getItem(key); if (shared) { setUser(shared); localStorage.setItem(key, JSON.stringify(shared)); } else if (value) setUser(JSON.parse(value)); } finally { setReady(true); } }, []);
  const login = (id: string, password: string) => { const value = id.trim().toLowerCase(); const found = users.find((u) => (u.email.toLowerCase() === value || u.id.toLowerCase() === value) && u.password === password); if (!found) return null; const session: User = { name: found.name, email: found.email, role: found.role }; setUser(session); localStorage.setItem(key, JSON.stringify(session)); return session; };
  return <Context.Provider value={{ user, ready, login, logout: () => { setUser(null); localStorage.removeItem(key); } }}>{children}</Context.Provider>;
}
export function useAuth() { const value = useContext(Context); if (!value) throw new Error("useAuth must be inside AuthProvider"); return value; }
