import { Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  delta,
  deltaDirection = "up",
  to,
  accent = "primary",
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  icon: LucideIcon;
  delta?: string;
  deltaDirection?: "up" | "down";
  to?: string;
  accent?: "primary" | "teal" | "success" | "warning" | "danger";
}) {
  const accentBg = {
    primary: "bg-primary-soft text-primary",
    teal: "bg-teal-soft text-teal",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-destructive",
  }[accent];

  const body = (
    <div className="group card-elevate relative h-full overflow-hidden rounded-xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="num mt-2 text-2xl font-semibold tracking-tight">{value}</p>
          {sub && <p className="mt-1 truncate text-xs text-muted-foreground">{sub}</p>}
        </div>
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", accentBg)}>
          <Icon className="size-4.5" />
        </span>
      </div>
      {delta && (
        <div
          className={cn(
            "mt-3 inline-flex items-center gap-1 text-xs font-medium",
            deltaDirection === "up" ? "text-success" : "text-destructive",
          )}
        >
          {deltaDirection === "up" ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
          {delta}
        </div>
      )}
    </div>
  );

  return to ? (
    <Link to={to as never} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}
