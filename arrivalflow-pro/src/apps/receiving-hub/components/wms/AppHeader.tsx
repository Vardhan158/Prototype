import { Link } from "@tanstack/react-router";
import { Bell, Globe, Moon, Search, Sun, ChevronDown, LogOut, Warehouse } from "lucide-react";
import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useWms } from "@/apps/receiving-hub/lib/wms-store";
import { WAREHOUSES } from "@/apps/receiving-hub/lib/wms-data";
import { useAuth } from "@/lib/auth";

export function AppHeader() {
  const { state, dispatch } = useWms();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("en-IN");
  const unread = state.notifications.filter((n) => !n.read).length;
  const { user, logout } = useAuth();
  const initials =
    user?.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "AM";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="glass-panel sticky top-0 z-30 flex h-16 items-center gap-3 rounded-none border-x-0 border-t-0 px-3 md:px-5">
      <SidebarTrigger className="shrink-0" />
      <Separator orientation="vertical" className="hidden h-6 md:block" />

      <button
        onClick={() => setOpen(true)}
        className="hidden min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-surface/70 px-3 py-2 text-left text-sm text-muted-foreground transition hover:border-ring md:flex md:max-w-md"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate">Search trucks, POs, GRNs, materialsâ€¦</span>
        <kbd className="num ml-auto rounded border border-border px-1.5 py-0.5 text-[0.65rem]">
          âŒ˜K
        </kbd>
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </Button>

      <div className="ml-auto flex items-center gap-1 md:gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hidden gap-2 sm:flex">
              <Warehouse className="h-4 w-4" />
              <span className="num text-xs">{state.warehouse}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Active warehouse</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={state.warehouse}
              onValueChange={(v) => dispatch({ type: "warehouse", value: v })}
            >
              {WAREHOUSES.map((w) => (
                <DropdownMenuRadioItem key={w.code} value={w.code}>
                  <span className="num mr-2 text-xs">{w.code}</span>
                  <span className="text-xs text-muted-foreground">{w.name}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Language">
              <Globe className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Language</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={lang} onValueChange={setLang}>
              {["en-IN", "en-US", "de-DE", "ja-JP", "ar-AE"].map((l) => (
                <DropdownMenuRadioItem key={l} value={l}>
                  {l}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDark((d) => !d)}
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button asChild variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Link to="/receiving-hub/notifications">
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="num absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[0.6rem] font-bold text-destructive-foreground">
                {unread}
              </span>
            )}
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl border border-border bg-surface/70 py-1 pl-1 pr-2 transition hover:border-ring">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-[0.65rem] font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-left lg:block">
                <span className="block text-xs font-semibold leading-tight">
                  {user?.name ?? "A. Mehta"}
                </span>
                <span className="block text-[0.65rem] leading-tight text-muted-foreground">
                  {user?.role ?? "Goods Receiving"}
                </span>
              </span>
              <ChevronDown className="hidden h-3 w-3 lg:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>{user?.email ?? "mehta@nexuswms.com"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/receiving-hub/settings">Preferences</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search trucks, vendors, POs, GRNs, materialsâ€¦" />
        <CommandList>
          <CommandEmpty>No matching records in this warehouse.</CommandEmpty>
          <CommandGroup heading="Inbound shipments">
            {state.shipments.slice(0, 6).map((s) => (
              <CommandItem key={s.id} asChild onSelect={() => setOpen(false)}>
                <Link
                  to="/receiving-hub/queue/$id"
                  params={{ id: s.id }}
                  className="flex w-full items-center gap-2"
                >
                  <span className="num text-xs">{s.truckNo}</span>
                  <span className="truncate text-xs text-muted-foreground">{s.vendor}</span>
                  <Badge variant="outline" className="ml-auto text-[0.65rem]">
                    {s.status}
                  </Badge>
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Goods receipt notes">
            {state.grns.slice(0, 4).map((g) => (
              <CommandItem key={g.grn} asChild onSelect={() => setOpen(false)}>
                <Link
                  to="/receiving-hub/grn/$id"
                  params={{ id: g.grn }}
                  className="flex w-full items-center gap-2"
                >
                  <span className="num text-xs">{g.grn}</span>
                  <span className="truncate text-xs text-muted-foreground">{g.vendor}</span>
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
