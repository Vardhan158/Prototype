import { Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Inbox, Loader2, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OCCUPANCY_META, type OccupancyState } from "@/apps/warehouse-navigator/data";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  breadcrumb,
}: {
  eyebrow?: string | undefined;
  title: string;
  subtitle?: string | undefined;
  actions?: ReactNode | undefined;
  breadcrumb?: Array<{ label: string; to?: string | undefined }> | undefined;
}) {
  return (
    <div className="mb-5 animate-rise">
      {breadcrumb && (
        <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          {breadcrumb.map((b, i) => (
            <span key={b.label} className="flex items-center gap-1.5">
              {i > 0 && <span className="opacity-50">/</span>}
              {b.to ? (
                <Link to={b.to} className="transition-colors hover:text-primary">
                  {b.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{b.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">{eyebrow}</p>
          )}
          <h1 className="truncate text-xl font-bold sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string | undefined;
  description?: string | undefined;
  action?: ReactNode | undefined;
  children: ReactNode;
  className?: string | undefined;
  bodyClassName?: string | undefined;
}) {
  return (
    <section className={cn("glass-panel overflow-hidden", className)}>
      {(title || action) && (
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            {title && <h2 className="truncate text-sm font-semibold">{title}</h2>}
            {description && <p className="truncate text-[11px] text-muted-foreground">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  delta,
  tone = "primary",
  footer,
  to,
}: {
  label: string;
  value: string | number;
  unit?: string | undefined;
  icon: LucideIcon;
  delta?: number | undefined;
  tone?: "primary" | "secondary" | "success" | "warning" | "danger" | "neutral" | undefined;
  footer?: string | undefined;
  to?: string | undefined;
}) {
  const toneMap = {
    primary: "bg-primary-soft text-primary",
    secondary: "bg-secondary-soft text-secondary",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    neutral: "bg-neutral-soft text-muted-foreground",
  } as const;

  const body = (
    <div className="glass-panel h-full p-4 transition-all hover:-translate-y-0.5 hover:elev-3">
      <div className="flex items-start justify-between gap-3">
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", toneMap[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        {typeof delta === "number" && (
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
              delta >= 0 ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
            )}
          >
            {delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="mt-3.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="num mt-0.5 text-2xl font-bold">
        {value}
        {unit && <span className="ml-1 text-sm font-semibold text-muted-foreground">{unit}</span>}
      </p>
      {footer && <p className="mt-1 text-[11px] text-muted-foreground">{footer}</p>}
    </div>
  );

  return to ? (
    <Link to={to} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}

export function Meter({
  value,
  max = 100,
  tone,
  className,
  showLabel = false,
}: {
  value: number;
  max?: number | undefined;
  tone?: "primary" | "success" | "warning" | "danger" | "secondary" | undefined;
  className?: string | undefined;
  showLabel?: boolean | undefined;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const auto = pct >= 95 ? "danger" : pct >= 75 ? "warning" : "success";
  const t = tone ?? auto;
  const bar = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  }[t];
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all duration-700", bar)} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="num w-9 shrink-0 text-right text-[11px] font-semibold">{pct}%</span>}
    </div>
  );
}

export function OccupancyLegend({ className }: { className?: string | undefined }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5", className)}>
      {(Object.keys(OCCUPANCY_META) as OccupancyState[]).map((k) => (
        <span key={k} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className={cn("h-2.5 w-2.5 rounded-sm", OCCUPANCY_META[k].dot)} />
          {OCCUPANCY_META[k].label}
        </span>
      ))}
    </div>
  );
}

export function StatusChip({ children, className }: { children: ReactNode; className?: string | undefined }) {
  return (
    <Badge
      variant="secondary"
      className={cn("rounded-full border-0 px-2.5 py-0.5 text-[11px] font-semibold", className)}
    >
      {children}
    </Badge>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}: {
  title: string;
  description: string;
  actionLabel?: string | undefined;
  onAction?: (() => void) | undefined;
  icon?: LucideIcon | undefined;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <p className="mt-2 text-sm font-semibold">{title}</p>
      <p className="max-w-sm text-[12px] text-muted-foreground">{description}</p>
      {actionLabel && (
        <Button size="sm" className="mt-3" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function LoadingRows({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2 p-1">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-9 flex-1 rounded-lg bg-[linear-gradient(90deg,var(--color-muted)_25%,color-mix(in_oklab,var(--color-muted)_60%,white)_50%,var(--color-muted)_75%)] bg-[length:200%_100%] animate-shimmer"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function InlineLoader({ label = "Syncing warehouse telemetry…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      {label}
    </div>
  );
}

export function KeyValue({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return (
    <dl className="grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
      {items.map((i) => (
        <div key={i.label} className="min-w-0">
          <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{i.label}</dt>
          <dd className="mt-0.5 text-sm font-semibold break-words">{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}
