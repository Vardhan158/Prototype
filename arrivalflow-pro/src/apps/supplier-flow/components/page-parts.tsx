import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/apps/supplier-flow/data/procurement";

export function PageHeader({
  breadcrumbs,
  title,
  subtitle,
  actions,
  meta,
}: {
  breadcrumbs: { label: string; to?: string }[];
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="mb-5">
      <nav className="mb-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        {breadcrumbs.map((b, i) => (
          <span key={b.label} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3" />}
            {b.to ? (
              <Link to={b.to as never} className="transition-colors hover:text-primary">
                {b.label}
              </Link>
            ) : (
              <span className="text-foreground">{b.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          {subtitle && <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>}
          {meta && <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
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
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("card-elevate rounded-xl", className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold tracking-tight">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium">{value ?? "—"}</dd>
    </div>
  );
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative space-y-5 pl-6">
      <span className="absolute left-[7px] top-2 bottom-2 w-px bg-border" aria-hidden />
      {events.map((e) => (
        <li key={e.id} className="relative">
          <span
            className={cn(
              "absolute -left-6 top-1 size-3.5 rounded-full border-2 border-background ring-2",
              e.state === "done" && "bg-success ring-success/30",
              e.state === "current" && "animate-pulse bg-primary ring-primary/30",
              e.state === "pending" && "bg-muted-foreground/40 ring-border",
              e.state === "error" && "bg-destructive ring-destructive/30",
            )}
          />
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <p className="text-sm font-medium">{e.title}</p>
            <p className="num text-xs text-muted-foreground">{e.timestamp}</p>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{e.description}</p>
          <p className="mt-1 text-xs font-medium text-primary">{e.actor}</p>
        </li>
      ))}
    </ol>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-6" />
      </span>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3.5">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-3.5 animate-pulse rounded bg-muted"
              style={{ width: c === 0 ? "18%" : `${10 + ((r + c) % 4) * 4}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
