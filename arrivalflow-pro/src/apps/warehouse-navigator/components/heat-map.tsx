import { AlertTriangle, Snowflake, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  OCCUPANCY_META,
  buildBinGrid,
  movementRanking,
  occupancyState,
  zones,
  type Zone,
} from "@/apps/warehouse-navigator/data";
import { Meter, OccupancyLegend, Panel, StatusChip } from "./ui-kit";

function heatColor(pct: number) {
  if (pct === 0) return "bg-neutral/25";
  if (pct >= 95) return "bg-danger";
  if (pct >= 85) return "bg-danger/70";
  if (pct >= 75) return "bg-warning";
  if (pct >= 55) return "bg-warning/60";
  if (pct >= 35) return "bg-success/70";
  return "bg-success/40";
}

export function ZoneHeatMap({ warehouse = "WH-CHN-01" }: { warehouse?: string }) {
  const list = zones.filter((z) => z.warehouse === warehouse);
  const [active, setActive] = useState<Zone>(list[0]!);
  const pct = Math.round((active.occupied / active.capacity) * 100);
  const cells = buildBinGrid(active.code, 6, 16);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Panel
        title={`Heat map · ${active.code} ${active.name}`}
        description="Each cell is a storage bin. Intensity maps to occupancy."
        action={<OccupancyLegend className="hidden sm:flex" />}
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {list.map((z) => {
            const p = Math.round((z.occupied / z.capacity) * 100);
            return (
              <button
                key={z.id}
                onClick={() => setActive(z)}
                className={cn(
                  "rounded-xl border px-3 py-2 text-left transition-all hover:-translate-y-0.5",
                  active.id === z.id
                    ? "border-primary bg-primary-soft text-primary elev-1"
                    : "border-border bg-surface/70 hover:elev-1",
                )}
              >
                <span className="block text-[12px] font-semibold">{z.code}</span>
                <span className="num block text-[11px] opacity-70">{p}% full</span>
              </button>
            );
          })}
        </div>

        <div className="grid-floor rounded-2xl border border-border bg-surface/50 p-3">
          <div className="grid grid-cols-16 gap-1.5" style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}>
            {cells.map((c, i) => (
              <button
                key={c.id}
                title={`${c.id} · ${c.pct}% · ${OCCUPANCY_META[c.state].label}`}
                style={{ animationDelay: `${i * 3}ms` }}
                className={cn(
                  "animate-pop-in aspect-square rounded-[5px] transition-all hover:scale-125 hover:ring-2 hover:ring-primary hover:ring-offset-1",
                  c.state === "maintenance" ? "bg-neutral/30" : c.state === "reserved" ? "bg-primary/70" : heatColor(c.pct),
                )}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
            <span>Cool · low occupancy</span>
            <div className="h-2 w-40 rounded-full bg-gradient-to-r from-success via-warning to-danger" />
            <span>Hot · saturated</span>
          </div>
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel title="Zone details" description={`${active.type} · ${active.status}`}>
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] tracking-wide text-muted-foreground uppercase">Occupancy</span>
                <span className="num text-2xl font-bold">{pct}%</span>
              </div>
              <Meter value={pct} className="mt-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: "Capacity", v: active.capacity.toLocaleString() },
                { l: "Occupied", v: active.occupied.toLocaleString() },
                { l: "Aisles", v: String(active.aisles) },
                { l: "Temperature", v: active.temperature },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-muted/60 p-3">
                  <p className="text-[10px] tracking-wide text-muted-foreground uppercase">{s.l}</p>
                  <p className="num text-sm font-bold">{s.v}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Active alerts</p>
              {pct >= 90 ? (
                <div className="flex gap-2 rounded-xl bg-danger-soft p-3 text-[12px] text-danger">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Zone above 90% — overflow routing to adjacent zone recommended.
                </div>
              ) : (
                <div className="flex gap-2 rounded-xl bg-success-soft p-3 text-[12px] text-success">
                  <Snowflake className="h-4 w-4 shrink-0" />
                  All environmental and capacity thresholds nominal.
                </div>
              )}
              <StatusChip className={OCCUPANCY_META[occupancyState(pct, active.override)].chip}>
                {OCCUPANCY_META[occupancyState(pct, active.override)].label}
              </StatusChip>
            </div>
            <Button size="sm" variant="outline" className="w-full">
              Open zone in layout map
            </Button>
          </div>
        </Panel>

        <Panel title="Movement profile" description="Velocity ranking inside this zone">
          <div className="space-y-3">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-success uppercase">
              <TrendingUp className="h-3.5 w-3.5" /> Fast moving
            </p>
            {movementRanking.fast.slice(0, 3).map((m) => (
              <div key={m.sku} className="flex items-center justify-between gap-3 rounded-xl bg-success-soft/60 px-3 py-2">
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-semibold">{m.item}</span>
                  <span className="block text-[10px] text-muted-foreground">{m.sku} · {m.location}</span>
                </span>
                <span className="num shrink-0 text-[12px] font-bold text-success">{m.picks}</span>
              </div>
            ))}
            <p className="flex items-center gap-1.5 pt-1 text-[11px] font-semibold text-warning uppercase">
              <TrendingDown className="h-3.5 w-3.5" /> Slow moving
            </p>
            {movementRanking.slow.slice(0, 3).map((m) => (
              <div key={m.sku} className="flex items-center justify-between gap-3 rounded-xl bg-warning-soft/60 px-3 py-2">
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-semibold">{m.item}</span>
                  <span className="block text-[10px] text-muted-foreground">{m.sku} · aged {m.ageDays}d</span>
                </span>
                <span className="num shrink-0 text-[12px] font-bold text-warning">{m.picks}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
