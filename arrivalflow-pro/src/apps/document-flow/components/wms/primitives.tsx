import { cn } from "@/lib/utils";
import { statusStyles, type DocStatus } from "@/apps/document-flow/wms-data";

export function StatusChip({ status, className }: { status: DocStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap",
        statusStyles[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function ConfidenceMeter({
  value,
  showLabel = true,
  className,
}: {
  value: number;
  showLabel?: boolean;
  className?: string;
}) {
  const tone =
    value >= 95 ? "bg-success" : value >= 80 ? "bg-warning" : value === 0 ? "bg-muted" : "bg-destructive";
  const text =
    value >= 95 ? "text-success" : value >= 80 ? "text-warning-foreground" : value === 0 ? "text-muted-foreground" : "text-destructive";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all duration-700", tone)} style={{ width: `${value}%` }} />
      </div>
      {showLabel && (
        <span className={cn("text-xs font-semibold tabular-nums", text)}>
          {value === 0 ? "—" : `${value.toFixed(1)}%`}
        </span>
      )}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  delta,
  tone = "primary",
  icon: Icon,
  onClick,
  footer,
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: "primary" | "teal" | "success" | "warning" | "danger";
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  footer?: string;
}) {
  const toneMap = {
    primary: "bg-primary-soft text-primary",
    teal: "bg-teal-soft text-teal",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-destructive-soft text-destructive",
  } as const;

  return (
    <button
      type="button"
      onClick={onClick}
      className="surface-card interactive group w-full p-5 text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cn("grid size-11 place-items-center rounded-2xl", toneMap[tone])}>
          <Icon className="size-5" />
        </div>
        {delta && (
          <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground">
            {delta}
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-sm font-medium text-muted-foreground">{label}</p>
      {footer && <p className="mt-3 border-t pt-3 text-[11px] text-muted-foreground">{footer}</p>}
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
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface-card overflow-hidden", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
