import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { STATUS_META, TONE_CLASS, statusTone, type InventoryStatus, type Tone } from "@/apps/inventory-flow-pro/lib/wms/statuses";
import type { InventoryItem, LifecycleEvent } from "@/apps/inventory-flow-pro/lib/wms/data";

/* ------------------------------------------------------------------ layout */

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight sm:text-[26px]">
          {title}
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  actions,
  children,
  className,
  padded = true,
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <Card className={cn("glass-panel gap-0 overflow-hidden py-0", className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-3">
          <div>
            {title && <h2 className="text-sm font-semibold tracking-tight">{title}</h2>}
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn(padded && "p-4")}>{children}</div>
    </Card>
  );
}

/* ------------------------------------------------------------------- chips */

export function StatusChip({
  status,
  size = "sm",
  withIcon = true,
}: {
  status: InventoryStatus;
  size?: "sm" | "md";
  withIcon?: boolean;
}) {
  const meta = STATUS_META[status];
  const tone = statusTone(status);
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border font-medium",
        tone.chip,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
      )}
    >
      {withIcon ? <Icon className="size-3" /> : <span className={cn("size-1.5 rounded-full", tone.dot)} />}
      {meta.label}
    </span>
  );
}

export function ToneChip({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        TONE_CLASS[tone].chip,
      )}
    >
      {children}
    </span>
  );
}

export function SeverityChip({ severity }: { severity: string }) {
  const tone: Tone =
    severity === "Critical" ? "danger"
    : severity === "High" ? "warning"
    : severity === "Medium" ? "info"
    : "slate";
  return <ToneChip tone={tone}>{severity}</ToneChip>;
}

/* -------------------------------------------------------------- stat tiles */

export function StatTile({
  label,
  value,
  unit,
  delta,
  tone = "primary",
  icon: Icon,
  to,
  hint,
}: {
  label: string;
  value: number | string;
  unit?: string;
  delta?: number;
  tone?: Tone;
  icon?: React.ComponentType<{ className?: string }>;
  to?: string;
  hint?: string;
}) {
  const t = TONE_CLASS[tone];
  const body = (
    <Card className="glass-panel group h-full gap-0 py-0 transition-all hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          <p className="num mt-1.5 text-2xl font-semibold tracking-tight">
            {value}
            {unit && <span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span>}
          </p>
          {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
          {delta !== undefined && (
            <p
              className={cn(
                "mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium",
                delta >= 0 ? "text-success" : "text-destructive",
              )}
            >
              {delta >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {Math.abs(delta)}% vs last week
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {Icon && (
            <span className={cn("grid size-9 place-items-center rounded-xl border", t.chip)}>
              <Icon className="size-4" />
            </span>
          )}
          {to && (
            <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </div>
      </div>
      <div className={cn("h-1 w-full opacity-70", t.bar)} />
    </Card>
  );
  return to ? (
    <Link to={to} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}

export function MiniBar({ value, tone = "primary" }: { value: number; tone?: Tone }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full transition-all", TONE_CLASS[tone].bar)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/* ------------------------------------------------------------ info display */

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-xs font-medium">{value}</span>
    </div>
  );
}

export function KeyValueGrid({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
      {rows.map((r) => (
        <div key={r.label} className="flex items-baseline justify-between gap-4 border-b border-border/60 py-2">
          <dt className="text-xs text-muted-foreground">{r.label}</dt>
          <dd className="text-right text-xs font-medium">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* --------------------------------------------------------- barcode / qr */

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function Barcode({ value, className }: { value: string; className?: string }) {
  const bars = useMemo(() => {
    const h = hash(value);
    return Array.from({ length: 58 }, (_, i) => ((h >> i % 24) + i * 7) % 4);
  }, [value]);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex h-12 items-end gap-[2px]">
        {bars.map((b, i) => (
          <span
            key={i}
            className="h-full bg-foreground"
            style={{ width: `${1 + b}px`, opacity: b === 0 ? 0.15 : 1 }}
          />
        ))}
      </div>
      <p className="num text-center text-[10px] tracking-[0.24em] text-muted-foreground">{value}</p>
    </div>
  );
}

export function QrBlock({ value, size = 96 }: { value: string; size?: number }) {
  const cells = useMemo(() => {
    const h = hash(value);
    return Array.from({ length: 21 * 21 }, (_, i) => {
      const r = Math.floor(i / 21);
      const c = i % 21;
      const finder =
        (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7)
          ? (r % 6 === 0 || c % 6 === 0 || (r > 1 && r < 5 && c > 1 && c < 5))
          : null;
      if (finder !== null) return finder;
      return ((h >> (i % 29)) ^ (r * 31 + c * 17)) % 3 === 0;
    });
  }, [value]);
  return (
    <div
      className="grid overflow-hidden rounded-md border border-border bg-card p-1.5"
      style={{ gridTemplateColumns: "repeat(21, 1fr)", width: size, height: size }}
    >
      {cells.map((on, i) => (
        <span key={i} className={on ? "bg-foreground" : "bg-transparent"} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- timeline */

export function LifecycleTimeline({
  events,
  compact,
}: {
  events: LifecycleEvent[];
  compact?: boolean;
}) {
  return (
    <ol className="relative space-y-0">
      {events.map((ev, idx) => {
        const meta = STATUS_META[ev.status];
        const tone = statusTone(ev.status);
        const Icon = meta.icon;
        const last = idx === events.length - 1;
        return (
          <li key={ev.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && (
              <span className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-border" />
            )}
            <span
              className={cn(
                "z-10 mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border",
                tone.chip,
              )}
            >
              <Icon className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{ev.title}</p>
                <StatusChip status={ev.status} withIcon={false} />
                {last && (
                  <Badge variant="outline" className="border-primary/30 text-[10px] text-primary">
                    Current
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {ev.user} · {ev.role} · {new Date(ev.timestamp).toLocaleString("en-GB")}
              </p>
              {!compact && (
                <>
                  <p className="mt-1 text-xs text-foreground/80">{ev.remarks}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {ev.location}
                    {ev.document ? ` · ${ev.document}` : ""}
                  </p>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* --------------------------------------------------------- loading states */

export function useSimulatedLoad(ms = 650) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}

export function TableSkeleton({ rows = 6, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn("h-6 flex-1", c === 0 && "max-w-[120px]")} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <span className="grid size-11 place-items-center rounded-2xl border border-border bg-muted/60">
        <Icon className="size-5 text-muted-foreground" />
      </span>
      <p className="text-sm font-semibold">{title}</p>
      <p className="max-w-sm text-xs text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

/* -------------------------------------------------------------- helpers */

export const inr = (n: number) =>
  `₹${n >= 100000 ? `${(n / 100000).toFixed(2)}L` : n.toLocaleString("en-IN")}`;

export const itemValue = (i: InventoryItem) => i.quantity * i.unitValue;

export function locationPath(i: InventoryItem) {
  return `${i.warehouseCode} / ${i.zone} / ${i.rack} / ${i.shelf} / ${i.bin}`;
}

export function InventoryIdLink({ id }: { id: string }) {
  return (
    <Link
      to="/inventory-flow-pro/inventory/$id"
      params={{ id }}
      className="num font-medium text-primary hover:underline"
    >
      {id}
    </Link>
  );
}
