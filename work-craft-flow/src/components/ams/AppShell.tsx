import { Link, useRouterState } from "@tanstack/react-router";
import {
  Award,
  Boxes,
  ChevronRight,
  ClipboardList,
  Factory,
  LogOut,
  Menu,
  PackageCheck,
  Recycle,
  ShieldAlert,
} from "lucide-react";
import { Fragment, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAms } from "@/lib/ams/store";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const NAV = [
  { to: "/work-orders", label: "Assembly Work Orders", icon: ClipboardList },
  { to: "/rework-scrap", label: "Rework & Scrap", icon: Recycle },
  { to: "/exceptions", label: "Assembly Exceptions", icon: ShieldAlert },
  { to: "/finished-goods", label: "Finished Goods", icon: PackageCheck },
  { to: "/certificates", label: "Completion Certificates", icon: Award },
] as const;

const SEGMENT_LABELS: Record<string, string> = {
  "work-orders": "Assembly Work Orders",
  "rework-scrap": "Rework & Scrap",
  exceptions: "Assembly Exceptions",
  "finished-goods": "Finished Goods",
  certificates: "Completion Certificates",
  new: "Create Work Order",
  edit: "Edit",
  bom: "Bill of Materials",
  consumption: "Component Consumption",
  stages: "Assembly Stages",
  quality: "Quality Checkpoints",
  confirmation: "Assembly Confirmation",
};

function Breadcrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((segment, index) => ({
    label: SEGMENT_LABELS[segment] ?? decodeURIComponent(segment),
    href: "/" + segments.slice(0, index + 1).join("/"),
  }));

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
      <Link to="/work-orders" className="hover:text-foreground">
        Assembly Management
      </Link>
      {crumbs.map((c, i) => (
        <Fragment key={c.href}>
          <ChevronRight className="size-3" />
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-foreground">{c.label}</span>
          ) : (
            <Link to={c.href} className="hover:text-foreground">
              {c.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary-soft text-primary-deep"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}


function Brand() {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Factory className="size-5" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-foreground">AMS</p>
        <p className="text-xs text-muted-foreground">Assembly Management</p>
      </div>
    </div>
  );
}

export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { currentUser, logout } = useAms();
  const { user, logout: logoutAuth } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-6 border-r border-border bg-sidebar px-4 py-5 lg:flex">
        <Brand />
        <NavLinks />
        <div className="mt-auto rounded-xl bg-primary-soft p-3">
          <p className="text-xs font-medium text-primary-deep">Section 14.9</p>
          <p className="mt-1 text-xs text-muted-foreground">BR-079 to BR-088</p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="no-print sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-sidebar p-4">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="mb-6 mt-2">
                  <Brand />
                </div>
                <NavLinks onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2 lg:hidden">
              <Boxes className="size-5 text-primary" />
              <span className="text-sm font-semibold">AMS</span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-foreground">{user?.name ?? currentUser ?? "Guest"}</p>
                <p className="text-xs text-muted-foreground">{user?.role ?? "Assembly Module"}</p>
              </div>
              <Link to="/login">
                <Button variant="outline" size="sm" onClick={() => { document.cookie = "nexuswms_sso=; Path=/; Max-Age=0; SameSite=Lax"; logout(); logoutAuth(); }}>
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="no-print mb-4">
            <Breadcrumbs />
          </div>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
              {description ? (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
