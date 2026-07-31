import * as Icons from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  delta,
  trend,
  hint,
  icon,
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: string;
  hint?: string;
  icon?: string;
}) {
  const Icon = (icon && (Icons as unknown as Record<string, Icons.LucideIcon>)[icon]) || Icons.Box;
  const up = trend === "up";
  return (
    <div className="surface-card p-5 transition-shadow hover:shadow-lg">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <p className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {label}
        </p>
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-baseline gap-2">
        <span className="num text-3xl font-bold tracking-tight">{value}</span>
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold",
              up ? "text-success" : "text-destructive",
            )}
          >
            {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {delta}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
