import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { InspectionStatus, Priority } from "@/apps/quality-gatekeeper/lib/wms-data";

export function StatusBadge({ status }: { status: InspectionStatus | string }) {
  const map: Record<string, string> = {
    "Waiting Inspection": "bg-muted text-muted-foreground border-border",
    Assigned: "bg-info-soft text-primary border-primary/20",
    "Inspection Started": "bg-info-soft text-primary border-primary/25",
    "Under Review": "bg-warning-soft text-warning-foreground border-warning/30",
    Passed: "bg-success-soft text-success border-success/30",
    Failed: "bg-destructive-soft text-destructive border-destructive/30",
    "Quality Hold": "bg-warning-soft text-warning-foreground border-warning/40",
    "NCR Created": "bg-destructive-soft text-destructive border-destructive/30",
    RTS: "bg-destructive-soft text-destructive border-destructive/40",
    "Available Inventory": "bg-success-soft text-success border-success/30",
    PASS: "bg-success-soft text-success border-success/30",
    FAIL: "bg-destructive-soft text-destructive border-destructive/30",
    PARTIAL: "bg-warning-soft text-warning-foreground border-warning/30",
    Closed: "bg-success-soft text-success border-success/30",
    "Under Review ": "bg-warning-soft text-warning-foreground border-warning/30",
    Rework: "bg-warning-soft text-warning-foreground border-warning/30",
    "RTS Approved": "bg-destructive-soft text-destructive border-destructive/30",
    Dispatched: "bg-success-soft text-success border-success/30",
    "Awaiting Pickup": "bg-warning-soft text-warning-foreground border-warning/30",
    "Pending Approval": "bg-info-soft text-primary border-primary/25",
  };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        map[status] ?? "bg-muted text-muted-foreground border-border",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

export function PriorityPill({ priority }: { priority: Priority | string }) {
  const map: Record<string, string> = {
    Critical: "bg-destructive text-destructive-foreground",
    High: "bg-warning text-warning-foreground",
    Medium: "bg-primary-soft text-primary",
    Low: "bg-muted text-muted-foreground",
    Major: "bg-warning text-warning-foreground",
    Minor: "bg-muted text-muted-foreground",
  };
  return (
    <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase", map[priority])}>
      {priority}
    </span>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "default",
  onClick,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "primary";
  onClick?: () => void;
}) {
  const tones: Record<string, string> = {
    default: "text-muted-foreground bg-muted",
    primary: "text-primary bg-info-soft",
    success: "text-success bg-success-soft",
    warning: "text-warning-foreground bg-warning-soft",
    danger: "text-destructive bg-destructive-soft",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-panel group rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
          <p className="num mt-2 text-2xl font-bold">{value}</p>
          {sub && <p className="mt-1 truncate text-xs text-muted-foreground">{sub}</p>}
        </div>
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", tones[tone])}>{icon}</span>
      </div>
    </button>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface-card rounded-2xl", className)}>
      {(title || action) && (
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="truncate text-sm font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Field({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className={cn("mt-1 truncate text-sm font-medium", mono && "num font-mono")}>{value}</p>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-muted text-muted-foreground">{icon}</span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function Timeline({ items }: { items: { at: string; label: string; by: string }[] }) {
  return (
    <ol className="relative space-y-5 border-l border-border pl-5">
      {items.map((t, i) => (
        <li key={i} className="relative">
          <span
            className={cn(
              "absolute top-1 -left-[26px] h-3 w-3 rounded-full border-2 border-card",
              i === items.length - 1 ? "bg-primary" : "bg-border",
            )}
          />
          <p className="text-sm font-medium">{t.label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t.at} · {t.by}
          </p>
        </li>
      ))}
    </ol>
  );
}
