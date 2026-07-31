import { useState, type ReactNode } from "react";
import { Bell, Menu, Search, HelpCircle, Building2, LogOut } from "lucide-react";
import { Button } from "@wave/components/ui/button";
import { Input } from "@wave/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@wave/components/ui/select";
import { Avatar, AvatarFallback } from "@wave/components/ui/avatar";
import { ROLES, useRole, type Role } from "@wave/context/role-context";
import { warehouses } from "@wave/data/mock-data";
import { useAuth } from "@/lib/auth";

export function AppHeader({
  onMenu,
  onBell,
  unread,
  children,
}: {
  onMenu: () => void;
  onBell: () => void;
  unread: number;
  children?: ReactNode;
}) {
  const { role, setRole } = useRole();
  const { user, logout } = useAuth();
  const [warehouse, setWarehouse] = useState(warehouses[0]!.code);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Toggle navigation">
            <Menu className="h-5 w-5" />
          </Button>
          <span className="hidden text-sm font-semibold text-foreground md:inline">Outbound Order Fulfillment</span>
        </div>

        <div className="relative min-w-0 justify-self-center max-lg:hidden lg:w-[420px]">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search orders, waves, shipments, SKUs..." className="bg-background pl-9" aria-label="Global search" />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Select value={warehouse} onValueChange={setWarehouse}>
            <SelectTrigger className="hidden h-9 w-[190px] xl:flex" aria-label="Warehouse">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map((w) => (
                <SelectItem key={w.code} value={w.code}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger className="h-9 w-[170px] max-sm:w-[130px]" aria-label="Active role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon" className="hidden sm:inline-flex" aria-label="Help">
            <HelpCircle className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="relative" onClick={onBell} aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="num absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                {unread}
              </span>
            )}
          </Button>

          <Avatar className="h-8 w-8 border border-border">
            <AvatarFallback className="bg-primary-soft text-xs font-semibold text-primary">{user?.name.split(" ").map((part) => part[0]).join("").slice(0, 2) ?? "NW"}</AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="icon" onClick={() => { document.cookie = "nexuswms_sso=; Path=/; Max-Age=0; SameSite=Lax"; logout(); }} aria-label="Sign out" title="Sign out"><LogOut className="h-5 w-5" /></Button>
        </div>
      </div>
      {children}
    </header>
  );
}
