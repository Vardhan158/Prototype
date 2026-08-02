import { Link } from "@tanstack/react-router";
import { ChevronRight, Inbox, Loader2, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  breadcrumb,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumb?: { label: string; to?: string }[];
}) {
  return (
    <div className="mb-5">
      {breadcrumb && (
        <div className="mb-2 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
          {breadcrumb.map((b, i) => (
            <span key={b.label} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3 opacity-50" />}
              {b.to ? (
                <Link to={b.to} className="hover:text-primary">
                  {b.label}
                </Link>
              ) : (
                <span className="text-foreground">{b.label}</span>
              )}
            </span>
          ))}
        </div>
      )}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
              {eyebrow}
            </p>
          )}
          <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && (
          <div className="col-span-2 flex flex-wrap items-center gap-2 sm:col-auto">{actions}</div>
        )}
      </div>
    </div>
  );
}

export function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "brand",
  to,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  tone?: "brand" | "success" | "warning" | "danger" | "info";
  to?: string;
}) {
  const toneCls = {
    brand: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    danger: "bg-destructive/10 text-destructive",
    info: "bg-info/10 text-info",
  }[tone];

  const body = (
    <div className="surface-card group h-full rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-float)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg", toneCls)}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="num mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
  return to ? (
    <Link to={to} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  padded = true,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={cn("surface-card overflow-hidden rounded-2xl", className)}>
      {(title || actions) && (
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            {title && <h2 className="truncate text-sm font-semibold">{title}</h2>}
            {description && (
              <p className="truncate text-[11px] text-muted-foreground">{description}</p>
            )}
          </div>
          {actions}
        </header>
      )}
      <div className={cn(padded && "p-4")}>{children}</div>
    </section>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-3 flex-1 rounded" />
          <Skeleton className="hidden h-3 w-24 rounded sm:block" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function InlineLoader({ label = "Loading dataâ€¦" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-xs text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin text-primary" /> {label}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      title="Unable to load records"
      description="The QM service did not respond (ERR_QM_502). Data shown may be stale. Retry or contact the WMS administrator."
      action={
        <Button size="sm" onClick={onRetry}>
          Retry request
        </Button>
      }
    />
  );
}
