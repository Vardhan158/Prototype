import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Open: "bg-success/10 text-success border-success/20",
  Approved: "bg-violet/10 text-violet border-violet/20",
  Sent: "bg-primary/10 text-primary border-primary/20",
  "Partially Received": "bg-warning/10 text-warning border-warning/25",
  Partial: "bg-warning/10 text-warning border-warning/25",
  Received: "bg-cyan/10 text-cyan border-cyan/25",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  "In Transit": "bg-primary/10 text-primary border-primary/20",
  Arrived: "bg-success/10 text-success border-success/20",
  Pending: "bg-warning/10 text-warning border-warning/25",
  Dispatched: "bg-violet/10 text-violet border-violet/20",
  Active: "bg-success/10 text-success border-success/20",
  "On Hold": "bg-warning/10 text-warning border-warning/25",
  Blocked: "bg-destructive/10 text-destructive border-destructive/20",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        statusStyles[status] ?? "bg-muted text-muted-foreground border-border",
      )}
    >
      {status}
    </span>
  );
}
