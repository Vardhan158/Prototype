import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, HelpCircle, LogOut, Moon, Search, Settings, Sun, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./StatusBadge";
import { useAuth } from "@/lib/auth";

const NOTIFICATIONS = [
  { title: "12 materials below reorder point", meta: "Inventory Planning · 8 min ago", tag: "Low Stock" },
  { title: "Cycle count CC-2604 is overdue", meta: "Central Warehouse · 42 min ago", tag: "Overdue" },
  { title: "Transfer TR-4407 arrived at Assembly", meta: "Warehouse Transfers · 2 h ago", tag: "Received" },
  { title: "Batch BATCH-26412 moved to quarantine", meta: "Quality Control · 5 h ago", tag: "Quarantine" },
];

export function AppHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("wms-theme");
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("wms-theme", next ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur-md">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 sm:px-5">
        <SidebarTrigger className="shrink-0" />

        <form
          className="relative min-w-0 max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/inventory-flow/explorer", search: { q: query } });
          }}
        >
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search materials, batches, serials…"
            className="h-9 pl-8"
          />
        </form>

        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle dark mode">
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <Button variant="ghost" size="icon" className="hidden sm:inline-flex" aria-label="Help">
            <HelpCircle className="size-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="size-4" />
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-status-damaged ring-2 ring-card" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications <span className="text-xs text-muted-foreground">4 new</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {NOTIFICATIONS.map((n) => (
                <DropdownMenuItem key={n.title} className="flex-col items-start gap-1 py-2.5">
                  <div className="flex w-full items-start justify-between gap-2">
                    <span className="text-sm font-medium">{n.title}</span>
                    <StatusBadge status={n.tag} dot={false} />
                  </div>
                  <span className="text-xs text-muted-foreground">{n.meta}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 flex items-center gap-2 rounded-lg border border-border px-2 py-1 transition-colors hover:bg-accent">
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary text-[11px] font-semibold text-primary-foreground">
                  RK
                </span>
                <span className="hidden text-left leading-tight md:block">
                  <span className="block text-xs font-medium">{user?.name ?? "R. Krishnan"}</span>
                  <span className="block text-[10px] text-muted-foreground">{user?.role ?? "Inventory Controller"}</span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 size-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate({ to: "/inventory-flow" })}>
                <Settings className="mr-2 size-4" /> Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => { logout(); navigate({ to: "/login" }); }}>
                <LogOut className="mr-2 size-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
