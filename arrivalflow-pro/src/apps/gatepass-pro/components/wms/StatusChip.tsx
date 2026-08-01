import { cn } from "@/lib/utils";
import type { EntryStatus } from "@/apps/gatepass-pro/lib/wms/types";

const MAP: Record<EntryStatus, string> = {
  New: "bg-muted text-muted-foreground",
  "Vehicle Verified": "bg-accent text-accent-foreground",
  "Driver Verified": "bg-accent text-accent-foreground",
  "PO Verified": "bg-accent text-accent-foreground",
  Approved: "bg-success/15 text-success",
  Hold: "bg-warning/20 text-warning",
  Rejected: "bg-destructive/15 text-destructive",
  "Waiting Warehouse": "bg-secondary/20 text-secondary",
  Accepted: "bg-success/15 text-success",
  Exited: "bg-muted text-muted-foreground",
};

export function StatusChip({ status, className }: { status: EntryStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide",
        MAP[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}