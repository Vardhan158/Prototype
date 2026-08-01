import { cn } from "@/lib/utils";
import { statusTone, type GateStatus } from "@/apps/gate-pass-pro/lib/wms-data";

const toneClass: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  info: "bg-primary/10 text-primary border-primary/20",
  success: "bg-success/12 text-success border-success/25",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-destructive/10 text-destructive border-destructive/25",
  teal: "bg-secondary/15 text-secondary border-secondary/30",
};

export function StatusChip({ status, className }: { status: GateStatus | string; className?: string }) {
  const tone = statusTone[status as GateStatus] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        toneClass[tone],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function Tone({ tone, children, className }: { tone: string; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", toneClass[tone] ?? toneClass["neutral"], className)}>
      {children}
    </span>
  );
}
