import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  tone = "primary",
  hint,
  loading,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: number;
  tone?: "primary" | "available" | "reserved" | "damaged" | "quarantine" | "low" | "out";
  hint?: string;
  loading?: boolean;
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    available: "bg-status-available-soft text-status-available",
    reserved: "bg-status-reserved-soft text-status-reserved",
    damaged: "bg-status-damaged-soft text-status-damaged",
    quarantine: "bg-status-quarantine-soft text-status-quarantine",
    low: "bg-status-low-soft text-status-low",
    out: "bg-status-out-soft text-status-out",
  }[tone];

  if (loading) {
    return (
      <div className="card-surface p-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-7 w-20" />
        <Skeleton className="mt-3 h-3 w-28" />
      </div>
    );
  }

  return (
    <div className="card-surface group p-4 transition-shadow duration-200 hover:shadow-[var(--shadow-elevated)]">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <p className="min-w-0 truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", toneClass)}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="num mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        {typeof trend === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              trend >= 0 ? "text-status-available" : "text-status-damaged",
            )}
          >
            {trend >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {Math.abs(trend)}%
          </span>
        )}
        <span className="truncate">{hint}</span>
      </div>
    </div>
  );
}
