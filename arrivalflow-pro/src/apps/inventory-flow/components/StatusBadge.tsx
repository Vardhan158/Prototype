import { cn } from "@/lib/utils";

type Tone = "available" | "reserved" | "damaged" | "quarantine" | "low" | "out";

const TONE_MAP: Record<string, Tone> = {
  Available: "available",
  Approved: "available",
  Completed: "available",
  Received: "available",
  "Fast Moving": "available",
  Reserved: "reserved",
  "In Transit": "reserved",
  "In Progress": "reserved",
  Submitted: "reserved",
  Scheduled: "reserved",
  Normal: "reserved",
  Damaged: "damaged",
  Rejected: "damaged",
  Overdue: "damaged",
  Blocked: "damaged",
  High: "damaged",
  "Dead Stock": "damaged",
  Quarantine: "quarantine",
  Pending: "quarantine",
  "Slow Moving": "quarantine",
  "Low Stock": "low",
  "Out of Stock": "out",
  Draft: "out",
  Cancelled: "out",
  Low: "out",
};

const TONE_CLASS: Record<Tone, string> = {
  available: "bg-status-available-soft text-status-available ring-status-available/25",
  reserved: "bg-status-reserved-soft text-status-reserved ring-status-reserved/25",
  damaged: "bg-status-damaged-soft text-status-damaged ring-status-damaged/25",
  quarantine: "bg-status-quarantine-soft text-status-quarantine ring-status-quarantine/25",
  low: "bg-status-low-soft text-status-low ring-status-low/25",
  out: "bg-status-out-soft text-status-out ring-status-out/25",
};

export function StatusBadge({
  status,
  className,
  dot = true,
}: {
  status: string;
  className?: string;
  dot?: boolean;
}) {
  const tone = TONE_MAP[status] ?? "out";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONE_CLASS[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 shrink-0 rounded-full bg-current" />}
      {status}
    </span>
  );
}
