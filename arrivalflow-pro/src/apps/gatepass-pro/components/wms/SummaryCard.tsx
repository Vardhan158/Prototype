import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function SummaryCard({
  icon: Icon,
  title,
  rows,
  action,
}: {
  icon: LucideIcon;
  title: string;
  rows: [string, ReactNode][];
  action?: ReactNode;
}) {
  return (
    <div className="card-elevated p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <span className="grid size-8 place-items-center rounded-xl bg-accent text-accent-foreground">
            <Icon className="size-4" />
          </span>
          {title}
        </p>
        {action}
      </div>
      <dl className="grid gap-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-4 text-sm">
            <dt className="shrink-0 text-muted-foreground">{k}</dt>
            <dd className="text-right font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}