import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const STEPS = ["Vehicle", "Driver", "Delivery", "Review", "Gate Pass"];

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="card-elevated mb-4 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-sm font-semibold">
          Step {current} of {STEPS.length}
        </p>
        <p className="text-xs text-muted-foreground">{STEPS[current - 1]}</p>
      </div>
      <div className="flex items-center gap-1.5">
        {STEPS.map((s, i) => {
          const done = i + 1 < current;
          const active = i + 1 === current;
          return (
            <div key={s} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={cn(
                  "h-2 w-full rounded-full",
                  done ? "bg-success" : active ? "bg-primary" : "bg-muted",
                )}
              />
              <span
                className={cn(
                  "flex items-center gap-1 text-[10px] font-medium",
                  active ? "text-primary" : done ? "text-success" : "text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3" /> : null}
                {s}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}