import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "teal";

const toneMap: Record<Tone, string> = {
  success: "bg-success-soft text-success-foreground border-success/30",
  warning: "bg-warning-soft text-warning-foreground border-warning/30",
  danger: "bg-danger-soft text-destructive border-destructive/30",
  info: "bg-info-soft text-primary border-primary/25",
  teal: "bg-teal-soft text-teal border-teal/30",
  neutral: "bg-muted text-muted-foreground border-border",
};

const statusTone: Record<string, Tone> = {
  Active: "success",
  Approved: "success",
  Received: "success",
  Closed: "neutral",
  Acknowledged: "teal",
  "Sent to Supplier": "teal",
  "In Transit": "teal",
  "Partially Received": "warning",
  Submitted: "info",
  Draft: "neutral",
  "Pending Approval": "warning",
  "Pending Verification": "warning",
  "Gate Entry Pending": "warning",
  Arrived: "info",
  Delayed: "danger",
  Rejected: "danger",
  Blocked: "danger",
  Cancelled: "danger",
  Inactive: "neutral",
  Archived: "neutral",
  Low: "success",
  Medium: "warning",
  High: "danger",
  Critical: "danger",
  Valid: "success",
  Verified: "success",
  Pending: "warning",
  Expiring: "warning",
  Expired: "danger",
  Failed: "danger",
  Passed: "success",
  "Passed with observations": "warning",
  "Not started": "neutral",
};

export function StatusBadge({
  status,
  tone,
  className,
  dot = true,
}: {
  status: string;
  tone?: Tone;
  className?: string;
  dot?: boolean;
}) {
  const t = tone ?? statusTone[status] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneMap[t],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            "size-1.5 rounded-full",
            t === "success" && "bg-success",
            t === "warning" && "bg-warning",
            t === "danger" && "bg-destructive",
            t === "info" && "bg-primary",
            t === "teal" && "bg-teal",
            t === "neutral" && "bg-muted-foreground/60",
          )}
        />
      )}
      {status}
    </span>
  );
}
