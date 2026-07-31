import { Link } from "@tanstack/react-router";
import {
  Boxes,
  ChevronRight,
  Layers,
  PackageOpen,
  QrCode,
  Rows3,
  Thermometer,
  Warehouse as WarehouseIcon,
  Weight,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  OCCUPANCY_META,
  aisles,
  bins,
  buildBinGrid,
  occupancyState,
  racks,
  shelves,
  warehouses,
  zones,
  type OccupancyState,
} from "@/apps/warehouse-navigator/data";
import { KeyValue, Meter, OccupancyLegend, StatusChip } from "./ui-kit";

type Level = "warehouse" | "zone" | "aisle" | "rack" | "shelf";

type Selection = {
  warehouse: string;
  zone?: string | undefined;
  aisle?: string | undefined;
  rack?: string | undefined;
  shelf?: string | undefined;
};

type Node = {
  id: string;
  label: string;
  sub: string;
  pct: number;
  state: OccupancyState;
  meta: Array<{ label: string; value: string }>;
};

export function WarehouseMap({ initialWarehouse = "WH-CHN-01" }: { initialWarehouse?: string }) {
  const [sel, setSel] = useState<Selection>({ warehouse: initialWarehouse });
  const [detail, setDetail] = useState<{ node: Node; level: Level | "bin" } | null>(null);

  const level: Level = sel.shelf ? "shelf" : sel.rack ? "rack" : sel.aisle ? "aisle" : sel.zone ? "zone" : "warehouse";
  const wh = warehouses.find((w) => w.code === sel.warehouse)!;

  const nodes = useMemo<Node[]>(() => {
    if (level === "warehouse") {
      return zones
        .filter((z) => z.warehouse === sel.warehouse)
        .map((z) => {
          const pct = Math.round((z.occupied / z.capacity) * 100);
          return {
            id: z.code,
            label: `${z.code} · ${z.name}`,
            sub: z.type,
            pct,
            state: occupancyState(pct, z.override),
            meta: [
              { label: "Zone type", value: z.type },
              { label: "Aisles", value: String(z.aisles) },
              { label: "Capacity", value: `${z.capacity.toLocaleString()} units` },
              { label: "Occupied", value: `${z.occupied.toLocaleString()} units` },
              { label: "Temperature", value: z.temperature },
              { label: "Status", value: z.status },
            ],
          };
        });
    }
    if (level === "zone") {
      const list = aisles.filter((a) => a.zone === sel.zone);
      const base = list.length
        ? list
        : Array.from({ length: 6 }).map((_, i) => ({
            id: `${sel.zone}-a${i}`,
            code: `A-${String(i + 21).padStart(2, "0")}`,
            zone: sel.zone!,
            warehouse: sel.warehouse,
            racks: 8 + i,
            capacity: 1200,
            occupied: 300 + i * 140,
            equipment: "Reach Truck",
            status: "Active" as const,
          }));
      return base.map((a) => {
        const pct = Math.round((a.occupied / a.capacity) * 100);
        return {
          id: a.code,
          label: `Aisle ${a.code}`,
          sub: `${a.racks} racks · ${a.equipment}`,
          pct,
          state: occupancyState(pct, a.status === "Blocked" ? "maintenance" : undefined),
          meta: [
            { label: "Connected zone", value: a.zone },
            { label: "Racks", value: String(a.racks) },
            { label: "Capacity", value: `${a.capacity.toLocaleString()} units` },
            { label: "Current occupancy", value: `${a.occupied.toLocaleString()} units` },
            { label: "Equipment", value: a.equipment },
            { label: "Status", value: a.status },
          ],
        };
      });
    }
    if (level === "aisle") {
      const list = racks.filter((r) => r.aisle === sel.aisle);
      const base = list.length
        ? list
        : Array.from({ length: 8 }).map((_, i) => ({
            id: `${sel.aisle}-r${i}`,
            code: `R-${sel.aisle}-${String(i + 1).padStart(2, "0")}`,
            aisle: sel.aisle!,
            zone: sel.zone!,
            warehouse: sel.warehouse,
            height: "6.4 m",
            width: "2.4 m",
            levels: 5,
            maxWeight: 4000,
            currentLoad: 600 + i * 420,
            barcode: `RK${4000 + i}${i}01`,
            status: "Active" as const,
          }));
      return base.map((r) => {
        const pct = Math.round((r.currentLoad / r.maxWeight) * 100);
        return {
          id: r.code,
          label: r.code,
          sub: `${r.levels} levels · ${r.height}`,
          pct,
          state: occupancyState(pct, r.status === "Maintenance" ? "maintenance" : undefined),
          meta: [
            { label: "Rack height", value: r.height },
            { label: "Rack width", value: r.width },
            { label: "Max weight", value: `${r.maxWeight.toLocaleString()} kg` },
            { label: "Current load", value: `${r.currentLoad.toLocaleString()} kg` },
            { label: "Barcode", value: r.barcode },
            { label: "Status", value: r.status },
          ],
        };
      });
    }
    if (level === "rack") {
      const list = shelves.filter((s) => s.rack === sel.rack);
      const base = list.length
        ? list
        : Array.from({ length: 5 }).map((_, i) => ({
            id: `${sel.rack}-l${i}`,
            code: `S-${sel.rack}-L${i + 1}`,
            rack: sel.rack!,
            level: i + 1,
            bins: 8,
            capacity: 960,
            occupied: 900 - i * 190,
            weightLimit: 1200,
            currentWeight: 1000 - i * 210,
            barcode: `SH${i}0100L${i + 1}`,
            status: "Active" as const,
          }));
      return base.map((s) => {
        const pct = Math.round((s.occupied / s.capacity) * 100);
        return {
          id: s.code,
          label: `Level ${s.level} · ${s.code}`,
          sub: `${s.bins} bins · ${s.currentWeight} / ${s.weightLimit} kg`,
          pct,
          state: occupancyState(pct, s.status === "Blocked" ? "maintenance" : s.status === "Reserved" ? "reserved" : undefined),
          meta: [
            { label: "Shelf capacity", value: `${s.capacity.toLocaleString()} units` },
            { label: "Occupied", value: `${s.occupied.toLocaleString()} units` },
            { label: "Weight limit", value: `${s.weightLimit} kg` },
            { label: "Current weight", value: `${s.currentWeight} kg` },
            { label: "Bins", value: String(s.bins) },
            { label: "Barcode", value: s.barcode },
          ],
        };
      });
    }
    // shelf -> bins
    const list = bins.filter((b) => b.shelf === sel.shelf);
    const base = list.length
      ? list
      : buildBinGrid(sel.shelf!, 1, 8).map((c, i) => ({
          id: c.id,
          code: `B-${sel.shelf}-${String(i + 1).padStart(2, "0")}`,
          shelf: sel.shelf!,
          rack: sel.rack!,
          zone: sel.zone!,
          warehouse: sel.warehouse,
          barcode: `BN${1000 + i}`,
          qr: `QR|${sel.warehouse}|${sel.zone}|${sel.shelf}`,
          sku: c.state === "available" && c.pct < 10 ? null : `SKU-${70000 + i * 137}`,
          item: c.state === "available" && c.pct < 10 ? null : "Assorted MRO Components",
          batch: "BATCH-2409C",
          expiry: "2027-06-30",
          quantity: Math.round((c.pct / 100) * 120),
          reserved: c.state === "reserved" ? 40 : 0,
          damaged: 0,
          capacity: 120,
          temperature: "24.2 °C",
          status: c.state,
        }));
    return base.map((b) => {
      const pct = Math.round((b.quantity / b.capacity) * 100);
      return {
        id: b.code,
        label: b.code,
        sub: b.item ?? "Empty bin",
        pct,
        state: b.status,
        meta: [
          { label: "Current item", value: b.item ?? "—" },
          { label: "SKU", value: b.sku ?? "—" },
          { label: "Current quantity", value: `${b.quantity} / ${b.capacity}` },
          { label: "Reserved", value: String(b.reserved) },
          { label: "Damaged", value: String(b.damaged) },
          { label: "Available", value: String(b.capacity - b.quantity - b.reserved) },
          { label: "Temperature", value: b.temperature },
          { label: "Barcode", value: b.barcode },
        ],
      };
    });
  }, [level, sel]);

  const crumbs = [
    { label: `${wh.code} · ${wh.name}`, onClick: () => setSel({ warehouse: sel.warehouse }) },
    sel.zone ? { label: `Zone ${sel.zone}`, onClick: () => setSel({ warehouse: sel.warehouse, zone: sel.zone }) } : null,
    sel.aisle
      ? { label: `Aisle ${sel.aisle}`, onClick: () => setSel({ warehouse: sel.warehouse, zone: sel.zone, aisle: sel.aisle }) }
      : null,
    sel.rack
      ? {
          label: sel.rack,
          onClick: () => setSel({ warehouse: sel.warehouse, zone: sel.zone, aisle: sel.aisle, rack: sel.rack }),
        }
      : null,
    sel.shelf ? { label: sel.shelf, onClick: () => {} } : null,
  ].filter(Boolean) as Array<{ label: string; onClick: () => void }>;

  const nextLevelLabel = {
    warehouse: "Zones",
    zone: "Aisles",
    aisle: "Racks",
    rack: "Shelves",
    shelf: "Bins",
  }[level];

  function drill(node: Node) {
    if (level === "warehouse") setSel({ warehouse: sel.warehouse, zone: node.id });
    else if (level === "zone") setSel({ ...sel, aisle: node.id });
    else if (level === "aisle") setSel({ ...sel, rack: node.id });
    else if (level === "rack") setSel({ ...sel, shelf: node.id });
    else setDetail({ node, level: "bin" });
  }

  const levelIcon = { warehouse: WarehouseIcon, zone: Layers, aisle: Rows3, rack: Boxes, shelf: PackageOpen }[level];
  const LevelIcon = levelIcon;

  return (
    <div className="space-y-4">
      <div className="glass-panel grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-3 sm:flex sm:flex-wrap sm:justify-between sm:p-4">
        <div className="flex min-w-0 flex-wrap items-center gap-1 text-[12px]">
          {crumbs.map((c, i) => (
            <span key={c.label} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
              <button
                onClick={c.onClick}
                className={cn(
                  "max-w-[190px] truncate rounded-lg px-2 py-1 font-medium transition-colors",
                  i === crumbs.length - 1
                    ? "bg-primary-soft text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {c.label}
              </button>
            </span>
          ))}
        </div>
        <OccupancyLegend className="shrink-0" />
      </div>

      <div className="glass-panel grid-floor overflow-hidden">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-surface/60 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <LevelIcon className="h-4 w-4 shrink-0 text-primary" />
            <h2 className="truncate text-sm font-semibold">
              {nextLevelLabel} · {nodes.length} locations
            </h2>
          </div>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            Click a location to drill down
          </span>
        </header>

        <div
          className={cn(
            "grid gap-3 p-4",
            level === "shelf"
              ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-8"
              : level === "rack"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
          )}
        >
          {nodes.map((n, i) => {
            const meta = OCCUPANCY_META[n.state];
            return (
              <button
                key={n.id}
                onClick={() => drill(n)}
                onDoubleClick={() => setDetail({ node: n, level })}
                style={{ animationDelay: `${i * 18}ms` }}
                className={cn(
                  "group animate-rise relative overflow-hidden rounded-2xl border border-border bg-surface/85 p-3 text-left backdrop-blur transition-all hover:-translate-y-0.5 hover:elev-3",
                )}
              >
                <span className={cn("absolute inset-x-0 top-0 h-1", meta.dot)} />
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 flex-1 truncate text-[13px] font-semibold">{n.label}</p>
                  <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", meta.dot)} />
                </div>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{n.sub}</p>
                <div className="mt-3">
                  <Meter value={n.pct} tone={n.state === "reserved" ? "primary" : n.state === "maintenance" ? "secondary" : undefined} />
                  <div className="mt-1.5 flex items-center justify-between">
                    <StatusChip className={meta.chip}>{meta.label}</StatusChip>
                    <span className="num text-[11px] font-semibold text-muted-foreground">{n.pct}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full", OCCUPANCY_META[detail.node.state].dot)} />
                  {detail.node.label}
                </SheetTitle>
                <SheetDescription>
                  {sel.warehouse}
                  {sel.zone ? ` / ${sel.zone}` : ""}
                  {sel.aisle ? ` / ${sel.aisle}` : ""}
                  {sel.rack ? ` / ${sel.rack}` : ""}
                  {sel.shelf ? ` / ${sel.shelf}` : ""}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-8">
                <div className="rounded-2xl bg-muted/60 p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      Occupancy
                    </span>
                    <span className="num text-2xl font-bold">{detail.node.pct}%</span>
                  </div>
                  <Meter value={detail.node.pct} className="mt-2" />
                </div>
                <KeyValue items={detail.node.meta.map((m) => ({ label: m.label, value: m.value }))} />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="gap-1.5" asChild>
                    <Link to="/warehouse-navigator/bins">
                      <PackageOpen className="h-4 w-4" /> Open inventory
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5" asChild>
                    <Link to="/warehouse-navigator/scanner">
                      <QrCode className="h-4 w-4" /> Scan location
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Thermometer className="h-4 w-4" /> Sensor log
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Weight className="h-4 w-4" /> Load history
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
