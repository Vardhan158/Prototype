import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tone = "primary" | "secondary" | "success" | "warning" | "danger" | "neutral";

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary border-primary/20",
  secondary: "bg-secondary-soft text-secondary-foreground border-secondary/30",
  success: "bg-success-soft text-success-foreground border-success/30",
  warning: "bg-warning-soft text-warning-foreground border-warning/40",
  danger: "bg-danger-soft text-danger border-danger/30",
  neutral: "bg-muted text-muted-foreground border-border",
};

const statusTone: Record<string, Tone> = {
  Created: "neutral",
  "Inventory Reserved": "secondary",
  Ready: "primary",
  "Wave Assigned": "primary",
  Picking: "warning",
  Picked: "secondary",
  Packing: "warning",
  Packed: "secondary",
  "Quality Verified": "success",
  Staged: "secondary",
  Loaded: "primary",
  Dispatched: "success",
  Delivered: "success",
  Cancelled: "neutral",
  Exception: "danger",
  Draft: "neutral",
  "Pending Approval": "warning",
  Approved: "secondary",
  Released: "primary",
  "In Progress": "warning",
  Completed: "success",
  Queued: "neutral",
  Assigned: "primary",
  Paused: "warning",
  Open: "danger",
  "In Review": "warning",
  Resolved: "success",
  Critical: "danger",
  High: "warning",
  Medium: "secondary",
  Low: "neutral",
  Idle: "neutral",
  Break: "neutral",
  Free: "success",
  Loading: "warning",
  "Waiting Truck": "warning",
  Maintenance: "neutral",
  "Awaiting QC": "warning",
  "In Transit": "primary",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = statusTone[status] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", {
          "bg-primary": tone === "primary",
          "bg-secondary": tone === "secondary",
          "bg-success": tone === "success",
          "bg-warning": tone === "warning",
          "bg-danger": tone === "danger",
          "bg-muted-foreground": tone === "neutral",
        })}
      />
      {status}
    </span>
  );
}

export function KpiCard({
  label,
  value,
  sub,
  delta,
  icon,
  tone = "primary",
  onClick,
}: {
  label: string;
  value: string | number;
  sub?: string;
  delta?: string;
  icon: ReactNode;
  tone?: Tone;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="surface-card group w-full p-4 text-left transition-all hover:shadow-[var(--shadow-elev-2)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p className="num mt-2 text-2xl font-semibold">{value}</p>
          {sub && <p className="mt-1 truncate text-xs text-muted-foreground">{sub}</p>}
        </div>
        <span className={cn("shrink-0 rounded-xl border p-2", toneClasses[tone])}>{icon}</span>
      </div>
      {delta && (
        <p
          className={cn(
            "mt-3 text-xs font-medium",
            delta.startsWith("-") ? "text-danger" : "text-success-foreground",
          )}
        >
          {delta}
        </p>
      )}
    </button>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumb?: string[];
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
      <div className="min-w-0">
        {breadcrumb && (
          <p className="mb-1 truncate text-xs text-muted-foreground">
            {breadcrumb.join("  â€º  ")}
          </p>
        )}
        <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("surface-card overflow-hidden", className)}>
      {(title || actions) && (
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3 sm:flex sm:justify-between">
          <div className="min-w-0">
            {title && <h2 className="truncate text-sm font-semibold">{title}</h2>}
            {description && <p className="truncate text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function ProgressBar({ value, tone = "primary" }: { value: number; tone?: Tone }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full transition-all", {
          "bg-primary": tone === "primary",
          "bg-secondary": tone === "secondary",
          "bg-success": tone === "success",
          "bg-warning": tone === "warning",
          "bg-danger": tone === "danger",
          "bg-muted-foreground": tone === "neutral",
        })}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function Timeline({
  steps,
}: {
  steps: { label: string; at: string; by?: string; done: boolean }[];
}) {
  return (
    <ol className="relative space-y-4 pl-6">
      <span className="absolute top-1 bottom-1 left-[7px] w-px bg-border" />
      {steps.map((s, i) => {
        const active = s.done && !steps[i + 1]?.done;
        return (
          <li key={s.label} className="relative">
            <span
              className={cn(
                "absolute top-1 -left-[22px] size-3.5 rounded-full border-2",
                s.done ? "border-primary bg-primary" : "border-border bg-surface",
                active && "ring-4 ring-primary/15",
              )}
            />
            <p className={cn("text-sm font-medium", !s.done && "text-muted-foreground")}>
              {s.label}
            </p>
            <p className="text-xs text-muted-foreground">
              {s.at}
              {s.by ? ` Â· ${s.by}` : ""}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="rounded-2xl border border-border bg-muted p-3 text-muted-foreground">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-4 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="num mt-0.5 truncate text-sm font-medium">{value}</p>
    </div>
  );
}
