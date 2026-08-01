import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function Timeline({ items }: { items: { label: string; time: string; done: boolean }[] }) {
  return (
    <ol className="relative space-y-5 pl-8">
      <span className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-border" />
      {items.map((it) => (
        <li key={it.label} className="relative">
          <span
            className={cn(
              "absolute -left-8 grid size-7 place-items-center rounded-full border-2 bg-card",
              it.done ? "border-success text-success" : "border-border text-muted-foreground",
            )}
          >
            {it.done ? <Check className="size-4" /> : <Clock className="size-3.5" />}
          </span>
          <p className={cn("text-sm font-medium", !it.done && "text-muted-foreground")}>{it.label}</p>
          <p className="text-xs text-muted-foreground">{it.time}</p>
        </li>
      ))}
    </ol>
  );
}