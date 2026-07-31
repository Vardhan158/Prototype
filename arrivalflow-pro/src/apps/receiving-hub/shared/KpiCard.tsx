import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "success" | "warning" | "info";

const ICON_TONE: Record<Tone, string> = {
  primary: "bg-primary-subtle text-primary",
  success: "bg-success-subtle text-success",
  warning: "bg-warning-subtle text-warning",
  info: "bg-info-subtle text-info",
};

export function KpiCard({
  label,
  value,
  delta,
  deltaGood,
  caption,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  delta?: string;
  deltaGood?: boolean;
  caption?: string;
  icon: LucideIcon;
  tone?: Tone;
}) {
  const Arrow = deltaGood ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="erp-card p-5">
      <div className="flex items-start justify-between">
        <span className="label-xs">{label}</span>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            ICON_TONE[tone],
          )}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </span>
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-[28px] font-semibold leading-none tracking-tight">
          {value}
        </span>
        {delta && (
          <span
            className={cn(
              "mb-0.5 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
              deltaGood
                ? "bg-success-subtle text-success"
                : "bg-danger-subtle text-danger",
            )}
          >
            <Arrow className="h-3 w-3" />
            {delta}
          </span>
        )}
      </div>
      {caption && (
        <p className="mt-2 text-xs text-muted-foreground">{caption}</p>
      )}
    </div>
  );
}
