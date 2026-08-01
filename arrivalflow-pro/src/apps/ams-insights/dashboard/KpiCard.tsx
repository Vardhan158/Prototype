import { CheckCircle2, Clock, FileText, Truck, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KpiStat } from "@/apps/ams-insights/mock/dashboardStats";

const icons = {
  file: FileText,
  clock: Clock,
  truck: Truck,
  check: CheckCircle2,
  users: Users,
};

const tones: Record<KpiStat["tone"], string> = {
  blue: "bg-primary/10 text-primary",
  green: "bg-success/10 text-success",
  orange: "bg-warning/10 text-warning",
  purple: "bg-violet/10 text-violet",
  cyan: "bg-cyan/10 text-cyan",
};

export function KpiCard({ stat }: { stat: KpiStat }) {
  const Icon = icons[stat.icon];
  return (
    <div className="group rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div
        className={cn(
          "mb-4 flex size-10 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105",
          tones[stat.tone],
        )}
      >
        <Icon className="size-5" />
      </div>
      <p className="text-sm text-muted-foreground">{stat.label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{stat.value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
    </div>
  );
}
