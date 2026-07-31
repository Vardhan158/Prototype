import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MAP: Record<string, string> = {
  // Work order status
  Pending: "bg-secondary text-secondary-foreground",
  "In Progress": "bg-primary-soft text-primary-deep",
  Completed: "bg-success/12 text-success",
  Failed: "bg-destructive/12 text-destructive",
  Rework: "bg-warning/18 text-warning-foreground",
  // Stage status
  "Not Started": "bg-muted text-muted-foreground",
  // Checkpoints
  Pass: "bg-success/12 text-success",
  Fail: "bg-destructive/12 text-destructive",
  // Priority
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-primary-soft text-primary-deep",
  High: "bg-warning/18 text-warning-foreground",
  Critical: "bg-destructive/12 text-destructive",
  // Exceptions / approvals
  Open: "bg-destructive/12 text-destructive",
  "In Review": "bg-warning/18 text-warning-foreground",
  Resolved: "bg-success/12 text-success",
  "Pending Approval": "bg-warning/18 text-warning-foreground",
  Approved: "bg-success/12 text-success",
  Rejected: "bg-destructive/12 text-destructive",
  Generated: "bg-primary-soft text-primary-deep",
  Released: "bg-success/12 text-success",
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn("rounded-full border-0 font-medium", MAP[value] ?? "bg-muted", className)}
    >
      {value}
    </Badge>
  );
}
