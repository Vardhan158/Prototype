import { cn } from "@master/lib/utils";

const map: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/20",
  Inactive: "bg-muted text-muted-foreground border-border",
  Draft: "bg-warning/15 text-warning-foreground border-warning/30",
  Certified: "bg-success/10 text-success border-success/20",
  Pending: "bg-warning/15 text-warning-foreground border-warning/30",
  Expired: "bg-destructive/10 text-destructive border-destructive/20",
  High: "bg-destructive/10 text-destructive border-destructive/20",
  Medium: "bg-primary-soft text-accent-foreground border-primary/20",
  Low: "bg-muted text-muted-foreground border-border",
  Enabled: "bg-success/10 text-success border-success/20",
  Disabled: "bg-muted text-muted-foreground border-border",
};

export function StatusChip({ value, className }: { value: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        map[value] ?? "bg-primary-soft text-accent-foreground border-primary/20",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {value}
    </span>
  );
}
