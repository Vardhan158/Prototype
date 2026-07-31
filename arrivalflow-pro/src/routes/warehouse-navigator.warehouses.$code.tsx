import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Activity,
  Droplets,
  MapPin,
  Pencil,
  QrCode,
  Thermometer,
  Truck,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeyValue, Meter, PageHeader, Panel, StatCard, StatusChip } from "@/apps/warehouse-navigator/components/ui-kit";
import { WarehouseMap } from "@/apps/warehouse-navigator/components/warehouse-map";
import { ZoneHeatMap } from "@/apps/warehouse-navigator/components/heat-map";
import { activities, warehouses, zones } from "@/apps/warehouse-navigator/data";

export const Route = createFileRoute("/warehouse-navigator/warehouses/$code")({
  loader: ({ params }) => {
    const warehouse = warehouses.find((w) => w.code === params.code);
    if (!warehouse) throw notFound();
    return { warehouse };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Warehouse unavailable | StoreGrid WMS" }, { name: "robots", content: "noindex" }] };
    }
    const w = loaderData.warehouse;
    const title = `${w.name} (${w.code}) | Warehouse Details`;
    const description = `${w.name} in ${w.city} — ${w.storageType}, ${w.capacity.toLocaleString()} unit capacity, live occupancy, environment sensors and location hierarchy.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: WarehouseDetails,
  notFoundComponent: () => (
    <Panel title="Warehouse not found">
      <p className="text-sm text-muted-foreground">
        That warehouse code is not part of the network.{" "}
        <Link to="/warehouse-navigator/warehouses" className="font-semibold text-primary">
          Back to warehouse list
        </Link>
      </p>
    </Panel>
  ),
});

function WarehouseDetails() {
  const { warehouse: w } = Route.useLoaderData();
  const pct = Math.round((w.occupied / w.capacity) * 100);
  const whZones = zones.filter((z) => z.warehouse === w.code);

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Warehouse", to: "/warehouse-navigator/warehouses" }, { label: "Warehouse List", to: "/warehouse-navigator/warehouses" }, { label: w.code }]}
        eyebrow="Screen 04"
        title={w.name}
        subtitle={`${w.storageType} · ${w.docks} dock doors · managed by ${w.manager}`}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <QrCode className="h-4 w-4" /> Facility QR
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Pencil className="h-4 w-4" /> Edit warehouse
            </Button>
            <Button size="sm" className="gap-1.5" asChild>
              <Link to="/warehouse-navigator/layout">Open layout map</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total capacity" value={w.capacity.toLocaleString()} unit="units" icon={Truck} />
        <StatCard label="Live occupancy" value={`${pct}%`} icon={Activity} tone={pct >= 90 ? "danger" : pct >= 75 ? "warning" : "success"} footer={`${w.occupied.toLocaleString()} units stored`} />
        <StatCard label="Temperature" value={w.temperature} icon={Thermometer} tone="secondary" footer="Within SKU band" />
        <StatCard label="Humidity" value={w.humidity} icon={Droplets} tone="primary" footer="Sensor grid · 24 probes" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Warehouse information" description="Master data & compliance">
          <KeyValue
            items={[
              { label: "Warehouse code", value: <span className="num text-primary">{w.code}</span> },
              { label: "Status", value: <StatusChip className={w.status === "Operational" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}>{w.status}</StatusChip> },
              {
                label: "Address",
                value: (
                  <span className="flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    {w.address}
                  </span>
                ),
              },
              {
                label: "Warehouse manager",
                value: (
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    {w.manager}
                  </span>
                ),
              },
              { label: "Storage type", value: w.storageType },
              { label: "Dock doors", value: `${w.docks} doors · 4 cross-dock lanes` },
              { label: "Zones configured", value: `${whZones.length} zones` },
              { label: "Available space", value: `${(w.capacity - w.occupied).toLocaleString()} units` },
            ]}
          />
          <div className="mt-5 rounded-2xl bg-muted/60 p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] tracking-wide text-muted-foreground uppercase">Live occupancy</span>
              <span className="num text-2xl font-bold">{pct}%</span>
            </div>
            <Meter value={pct} className="mt-2" />
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              {[
                { l: "Occupied", v: w.occupied.toLocaleString(), c: "text-primary" },
                { l: "Reserved", v: Math.round(w.capacity * 0.08).toLocaleString(), c: "text-secondary" },
                { l: "Free", v: (w.capacity - w.occupied).toLocaleString(), c: "text-success" },
              ].map((s) => (
                <div key={s.l}>
                  <p className={`num text-sm font-bold ${s.c}`}>{s.v}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Recent activities" description={`Audit trail · ${w.code}`} bodyClassName="p-0">
          <div className="max-h-[430px] divide-y divide-border overflow-y-auto">
            {activities.map((a) => (
              <div key={a.id} className="px-4 py-3">
                <p className="text-[12px] leading-snug">
                  <span className="font-semibold">{a.actor}</span> {a.action}
                </p>
                <p className="mt-0.5 truncate text-[11px] font-medium text-primary">{a.target}</p>
                <p className="text-[10px] text-muted-foreground">{a.time}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Tabs defaultValue="map" className="mt-4">
        <TabsList className="rounded-xl">
          <TabsTrigger value="map">Warehouse map</TabsTrigger>
          <TabsTrigger value="heat">Heat map</TabsTrigger>
          <TabsTrigger value="zones">Zones</TabsTrigger>
        </TabsList>
        <TabsContent value="map" className="mt-4">
          <WarehouseMap initialWarehouse={w.code} />
        </TabsContent>
        <TabsContent value="heat" className="mt-4">
          <ZoneHeatMap warehouse={w.code} />
        </TabsContent>
        <TabsContent value="zones" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {whZones.map((z) => {
              const p = Math.round((z.occupied / z.capacity) * 100);
              return (
                <Link key={z.id} to="/warehouse-navigator/zones" className="glass-panel block p-4 transition-all hover:-translate-y-0.5 hover:elev-3">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold">{z.code} · {z.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{z.type}</p>
                    </div>
                    <StatusChip className="bg-primary-soft text-primary">{z.aisles} aisles</StatusChip>
                  </div>
                  <Meter value={p} className="mt-3" showLabel />
                </Link>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
