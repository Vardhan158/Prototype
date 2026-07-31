import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "primary";

const MAP: Record<string, Tone> = {
  Open: "info",
  "Partially Received": "warning",
  "Fully Received": "success",
  Closed: "neutral",
  Overdue: "danger",
  Draft: "neutral",
  "Pending Inspection": "warning",
  "Pending Approval": "warning",
  Completed: "success",
  Partial: "warning",
  "Over Receipt": "danger",
  "Under Receipt": "warning",
  "Within tolerance": "success",
  Free: "success",
  Occupied: "info",
  Maintenance: "warning",
  Low: "neutral",
  Medium: "warning",
  High: "danger",
  Normal: "info",
  Resolved: "success",
  "In Review": "info",
  Escalated: "danger",
  Serial: "primary",
  Batch: "info",
  None: "neutral",
  Approved: "success",
};

const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  success: "bg-success-subtle text-success border-success/20",
  warning: "bg-warning-subtle text-warning border-warning/20",
  danger: "bg-danger-subtle text-danger border-danger/20",
  info: "bg-info-subtle text-info border-info/20",
  primary: "bg-primary-subtle text-primary border-primary/20",
};

export function StatusChip({
  status,
  tone,
  className,
}: {
  status: string;
  tone?: Tone;
  className?: string;
}) {
  const t = tone ?? MAP[status] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASS[t],
        className,
      )}
    >
      {status}
    </span>
  );
}
