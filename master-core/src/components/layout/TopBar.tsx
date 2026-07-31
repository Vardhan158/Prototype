import { Bell, Command, HelpCircle, Search, Sun, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { customers, items, suppliers, warehouses } from "@/data/masters";
import { useAuth } from "@/lib/auth";

const notifications = [
  { title: "Certification expiring", body: "Lumière Électronique SAS certificate expired.", time: "12m" },
  { title: "Import completed", body: "342 item records imported without errors.", time: "1h" },
  { title: "Approval required", body: "3 supplier records awaiting data steward review.", time: "4h" },
];

export function TopBar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 sm:px-5">
        <SidebarTrigger className="shrink-0" />

        <button
          onClick={() => setOpen(true)}
          className="group flex min-w-0 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary-soft md:max-w-md"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">Search masters, codes, records…</span>
          <kbd className="ml-auto hidden shrink-0 items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium sm:flex">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:inline-flex"
                onClick={() => toast.info("Theme switching is not enabled in this build.")}
              >
                <Sun className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Appearance (light)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden sm:inline-flex" asChild>
                <Link to="/help">
                  <HelpCircle className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Help centre</TooltipContent>
          </Tooltip>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="text-sm font-semibold">Notifications</p>
                <Badge variant="secondary">3 new</Badge>
              </div>
              <ul className="divide-y divide-border">
                {notifications.map((n) => (
                  <li key={n.title} className="px-4 py-3 transition-colors hover:bg-surface">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium">{n.title}</p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{n.time}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-surface">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary-soft text-xs font-semibold text-accent-foreground">
                    AO
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-left leading-tight lg:block">
                  <span className="block text-xs font-semibold">{user?.name ?? "Nexus User"}</span>
                  <span className="block text-[11px] text-muted-foreground">{user?.role ?? "User"}</span>
                </span>
                <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground lg:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>My account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">Preferences</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Audit log</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onSelect={() => { document.cookie = "nexuswms_sso=; Path=/; Max-Age=0; SameSite=Lax"; logout(); }}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search across all master data…" />
        <CommandList>
          <CommandEmpty>No records found.</CommandEmpty>
          <CommandGroup heading="Suppliers">
            {suppliers.slice(0, 4).map((s) => (
              <CommandItem key={s.id} value={`${s.code} ${s.name}`} onSelect={() => setOpen(false)}>
                <span className="num text-xs text-muted-foreground">{s.code}</span>
                <span>{s.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Customers">
            {customers.slice(0, 3).map((c) => (
              <CommandItem key={c.id} value={`${c.code} ${c.name}`} onSelect={() => setOpen(false)}>
                <span className="num text-xs text-muted-foreground">{c.code}</span>
                <span>{c.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Items">
            {items.slice(0, 3).map((i) => (
              <CommandItem key={i.id} value={`${i.code} ${i.name}`} onSelect={() => setOpen(false)}>
                <span className="num text-xs text-muted-foreground">{i.code}</span>
                <span>{i.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Warehouses">
            {warehouses.slice(0, 3).map((w) => (
              <CommandItem key={w.id} value={`${w.code} ${w.name}`} onSelect={() => setOpen(false)}>
                <span className="num text-xs text-muted-foreground">{w.code}</span>
                <span>{w.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
