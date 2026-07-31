import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stepper({
  steps,
  current,
  onSelect,
  badges,
}: {
  steps: string[];
  current: number;
  onSelect?: (i: number) => void;
  badges?: (number | undefined)[];
}) {
  return (
    <div className="erp-card flex flex-wrap items-center gap-1 px-4 py-3">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const badge = badges?.[i];
        return (
          <div key={s} className="flex items-center">
            <button
              type="button"
              onClick={() => onSelect?.(i)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                active
                  ? "bg-primary-subtle font-medium text-primary"
                  : "text-muted-foreground hover:bg-surface-muted",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold",
                  done
                    ? "bg-success-subtle text-success"
                    : active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span className="whitespace-nowrap">{s}</span>
              {!!badge && (
                <span className="rounded-full bg-danger-subtle px-1.5 text-[11px] font-semibold text-danger">
                  {badge}
                </span>
              )}
            </button>
            {i < steps.length - 1 && (
              <span className="mx-1 h-px w-5 bg-border" />
            )}
          </div>
        );
      })}
    </div>
  );
}
