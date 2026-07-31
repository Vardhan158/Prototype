import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Layers, Maximize2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader, Panel, StatusChip } from "@/apps/warehouse-navigator/components/ui-kit";
import { WarehouseMap } from "@/apps/warehouse-navigator/components/warehouse-map";
import { warehouses, zones } from "@/apps/warehouse-navigator/data";

export const Route = createFileRoute("/warehouse-navigator/layout")({
  head: () => ({
    meta: [
      { title: "Interactive Warehouse Layout Map | StoreGrid WMS" },
      {
        name: "description",
        content:
          "Drill through the full storage hierarchy — warehouse, zone, aisle, rack, shelf, bin — on a colour-coded interactive layout map with live occupancy.",
      },
      { property: "og:title", content: "Interactive Warehouse Layout Map | StoreGrid WMS" },
      { property: "og:description", content: "Clickable warehouse → zone → aisle → rack → shelf → bin layout with live occupancy colours." },
    ],
  }),
  component: LayoutScreen,
});

function LayoutScreen() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Warehouse", to: "/warehouse-navigator/warehouses" }, { label: "Layout Map" }]}
        eyebrow="Screen 02"
        title="Warehouse Layout"
        subtitle="Every location is clickable. Single click drills one level deeper, double click opens the location detail panel."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <RefreshCw className="h-4 w-4" /> Sync layout
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" /> Export CAD
            </Button>
            <Button size="sm" className="gap-1.5" asChild>
              <Link to="/warehouse-navigator/visualization">
                <Maximize2 className="h-4 w-4" /> 3D view
              </Link>
            </Button>
          </>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Hierarchy levels", v: "6", s: "Warehouse → Bin" },
          { l: "Mapped locations", v: "12,486", s: "98.4% digitised" },
          { l: "Blocked locations", v: "37", s: "Maintenance & inspection" },
          { l: "Reserved locations", v: "214", s: "Allocated to open orders" },
        ].map((k) => (
          <div key={k.l} className="glass-panel p-4">
            <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{k.l}</p>
            <p className="num text-xl font-bold">{k.v}</p>
            <p className="text-[11px] text-muted-foreground">{k.s}</p>
          </div>
        ))}
      </div>

      <WarehouseMap />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Hierarchy summary" description="Chennai Central DC">
          <div className="space-y-2">
            {zones
              .filter((z) => z.warehouse === "WH-CHN-01")
              .map((z) => (
                <div key={z.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
                  <span className="flex min-w-0 items-center gap-2">
                    <Layers className="h-4 w-4 shrink-0 text-primary" />
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-semibold">
                        {z.code} · {z.name}
                      </span>
                      <span className="block text-[10px] text-muted-foreground">
                        {z.aisles} aisles · {z.type}
                      </span>
                    </span>
                  </span>
                  <StatusChip className="bg-primary-soft text-primary">
                    {Math.round((z.occupied / z.capacity) * 100)}%
                  </StatusChip>
                </div>
              ))}
          </div>
        </Panel>

        <Panel title="Switch warehouse" description="Layout maps available across the network">
          <div className="grid gap-2 sm:grid-cols-2">
            {warehouses.map((w) => (
              <Link
                key={w.id}
                to="/warehouse-navigator/warehouses/$code"
                params={{ code: w.code }}
                className="rounded-xl border border-border bg-surface/70 p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40"
              >
                <p className="truncate text-[12px] font-semibold">{w.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{w.code} · {w.zones} zones</p>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
