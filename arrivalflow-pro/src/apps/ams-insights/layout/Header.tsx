import { Bell, CircleHelp, LogOut, Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";

export function Header({ title, onToggleSidebar }: { title: string; onToggleSidebar: () => void }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-4 md:px-6">
      <button
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Menu className="size-5" />
      </button>
      <h1 className="truncate text-base font-semibold tracking-tight md:text-lg">{title}</h1>

      <div className="ml-auto flex items-center gap-1 md:gap-2">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search POs, suppliers…" className="h-9 w-56 rounded-lg pl-9 lg:w-72" />
        </div>
        <button
          aria-label="Search"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
        >
          <Search className="size-[18px]" />
        </button>
        <button
          aria-label="Notifications"
          className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="size-[18px]" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive" />
        </button>
        <button
          aria-label="Help"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <CircleHelp className="size-[18px]" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="ml-1 flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                {user?.name.split(" ").map((part) => part[0]).join("").slice(0, 2) ?? "AU"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left leading-tight lg:block">
              <p className="text-sm font-medium">{user?.name ?? "AMS User"}</p>
              <p className="text-[11px] text-muted-foreground">{user?.role ?? "Procurement Team"}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>{user?.name ?? "AMS User"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>My Profile</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuItem>Activity Log</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onSelect={logout}>
              <LogOut className="mr-2 size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
