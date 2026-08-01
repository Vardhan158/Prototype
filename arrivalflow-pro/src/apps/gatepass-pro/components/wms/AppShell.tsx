import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, CircleUser, ClipboardCheck, Home, Truck, WifiOff, ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useWms } from "@/apps/gatepass-pro/lib/wms/store";

const TABS = [
  { to: "/gatepass-pro", label: "Home", icon: Home },
  { to: "/gatepass-pro/gate-entry/vehicle", label: "Gate Entry", icon: Truck },
  { to: "/gatepass-pro/approvals", label: "Approvals", icon: ClipboardCheck },
  { to: "/gatepass-pro/notifications", label: "Alerts", icon: Bell },
  { to: "/gatepass-pro/profile", label: "Profile", icon: CircleUser },
];

export function AppShell({
  title,
  subtitle,
  back,
  action,
  children,
  hideNav,
  footer,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  action?: ReactNode;
  children: ReactNode;
  hideNav?: boolean;
  footer?: ReactNode;
}) {
  const { online, notifications } = useWms();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="gatepass-theme min-h-dvh bg-surface-2 md:flex md:items-center md:justify-center md:py-6">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[440px] flex-col bg-background shadow-[var(--shadow-card)] md:min-h-0 md:h-[860px] md:max-w-[420px] md:overflow-hidden md:rounded-[2rem] md:border">
        <header className="sticky top-0 z-20 bg-primary px-4 pb-4 pt-3 text-primary-foreground">
          <div className="flex items-center gap-3">
            {back ? (
              <Link
                to={back}
                aria-label="Go back"
                className="-ml-2 grid size-10 place-items-center rounded-full transition-colors active:bg-white/15"
              >
                <ChevronLeft className="size-6" />
              </Link>
            ) : null}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold leading-tight">{title}</h1>
              {subtitle ? (
                <p className="truncate text-xs text-primary-foreground/75">{subtitle}</p>
              ) : null}
            </div>
            {action}
          </div>
        </header>

        {!online ? (
          <div className="flex items-center gap-2 bg-warning px-4 py-2 text-xs font-semibold text-warning-foreground">
            <WifiOff className="size-4" /> Offline mode · entries queued for auto sync
          </div>
        ) : null}

        <main className={cn("flex-1 overflow-y-auto px-4 pb-6 pt-4", !hideNav && "pb-28")}>{children}</main>

        {footer ? (
          <div className={cn("sticky bottom-0 z-20 border-t bg-card px-4 py-3", !hideNav && "pb-20")}>{footer}</div>
        ) : null}

        {!hideNav ? (
          <nav className="absolute inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-card/95 px-1 pb-2 pt-1.5 backdrop-blur">
            {TABS.map((t) => {
              const active = path.startsWith(t.to.split("/").slice(0, 2).join("/"));
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={cn(
                    "relative flex flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-8 w-14 place-items-center rounded-full transition-colors",
                      active && "bg-accent",
                    )}
                  >
                    <t.icon className="size-5" />
                    {t.label === "Alerts" && unread > 0 ? (
                      <span className="absolute right-3 top-0 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                        {unread}
                      </span>
                    ) : null}
                  </span>
                  {t.label}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>
    </div>
  );
}
