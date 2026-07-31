import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumbs: { label: string; to?: string }[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6">
      <nav className="mb-3 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {breadcrumbs.map((b, i) => (
          <span key={b.label} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5 opacity-60" />}
            {b.to ? (
              <Link to={b.to} className="transition-colors hover:text-foreground">
                {b.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{b.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {description && (
            <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <div className="mt-5 h-px bg-border" />
    </div>
  );
}

const tone: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground border-transparent",
  info: "bg-info/12 text-info border-info/25",
  success: "bg-success/12 text-success border-success/25",
  warning: "bg-warning/18 text-warning-foreground border-warning/35",
  danger: "bg-destructive/12 text-destructive border-destructive/25",
  primary: "bg-primary/12 text-primary border-primary/25",
};

const statusTone: Record<string, keyof typeof tone> = {
  Draft: "neutral",
  "Pending Approval": "warning",
  Approved: "info",
  Reserved: "primary",
  "Partially Reserved": "warning",
  Allocated: "info",
  Shortage: "danger",
  Picking: "info",
  "In Progress": "info",
  Picked: "success",
  Short: "danger",
  Pending: "neutral",
  Issued: "success",
  "Ready to Issue": "warning",
  Closed: "neutral",
  Rejected: "danger",
  Received: "info",
  Inspecting: "warning",
  Scrapped: "danger",
  Quarantined: "warning",
  "Returned to Inventory": "success",
  Low: "neutral",
  Medium: "info",
  High: "warning",
  Critical: "danger",
  Good: "success",
  Damaged: "danger",
  "Needs Inspection": "warning",
  Scrap: "danger",
};

export function StatusBadge({
  status,
  dot = true,
  className,
}: {
  status: string;
  dot?: boolean;
  className?: string;
}) {
  const t = tone[statusTone[status] ?? "neutral"];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        t,
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md text-[11px] font-semibold uppercase tracking-wide",
        tone[statusTone[priority] ?? "neutral"],
      )}
    >
      {priority}
    </Badge>
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
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="truncate text-base font-semibold">{title}</h2>}
            {description && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="size-6" />
      </div>
      <p className="mt-4 font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
