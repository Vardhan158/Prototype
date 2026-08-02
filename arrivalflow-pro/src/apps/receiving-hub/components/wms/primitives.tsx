import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_TONE } from "@/apps/receiving-hub/lib/wms-data";

const TONE: Record<string, string> = {
  success: "bg-success-soft text-success border-success/25",
  destructive: "bg-destructive-soft text-destructive border-destructive/25",
  warning: "bg-warning-soft text-warning-foreground border-warning/35",
  info: "bg-info-soft text-info border-info/25",
  accent: "bg-primary-soft text-primary border-primary/25",
  muted: "bg-muted text-muted-foreground border-border",
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const tone = TONE[STATUS_TONE[status] ?? "muted"] ?? TONE["muted"];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[0.7rem] font-medium",
        tone,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}

export function Tone({
  tone,
  children,
  className,
}: {
  tone: keyof typeof TONE;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[0.7rem] font-medium",
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PriorityPill({ priority }: { priority: string }) {
  const map: Record<string, keyof typeof TONE> = {
    Critical: "destructive",
    High: "warning",
    Normal: "info",
    Low: "muted",
  };
  return <Tone tone={map[priority] ?? "muted"}>{priority}</Tone>;
}

export function PageHeader({
  title,
  subtitle,
  crumbs = [],
  actions,
}: {
  title: string;
  subtitle?: string;
  crumbs?: { label: string; to?: string }[];
  actions?: ReactNode;
}) {
  return (
    <div className="animate-rise-in mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {crumbs.length > 0 && (
          <nav className="mb-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                {c.to ? (
                  <Link to={c.to} className="hover:text-foreground hover:underline">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-semibold tracking-tight md:text-[1.75rem]">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Field({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
      <p className={cn("mt-1 truncate text-sm font-medium", mono && "num")}>{value}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-border bg-surface-2">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
      {action}
    </div>
  );
}
