import { createFileRoute } from "@tanstack/react-router";
import { Warehouse as WarehouseIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { SectionCard, StatCard } from "@/apps/quality-gatekeeper/components/wms/bits";

export const Route = createFileRoute("/quality-gatekeeper/warehouse")({
  head: () => ({
    meta: [
      { title: "Warehouse — AXIOM WMS" },
      { name: "description", content: "Storage zone utilisation, dock status and quality staging capacity for the Pune plant." },
      { property: "og:title", content: "Warehouse — AXIOM WMS" },
      { property: "og:description", content: "Zone utilisation, dock status and QA staging capacity." },
    ],
  }),
  component: WarehousePage,
});

const ZONES = [
  { zone: "Zone A — Fast moving", bins: 420, used: 78 },
  { zone: "Zone B — Bulk pallet", bins: 260, used: 64 },
  { zone: "Zone C — Hazardous", bins: 80, used: 41 },
  { zone: "QA Staging", bins: 60, used: 92 },
  { zone: "QA Hold", bins: 40, used: 55 },
];

function WarehousePage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <header>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Operations</p>
        <h1 className="text-2xl font-bold sm:text-3xl">Warehouse</h1>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Storage utilisation" value="72%" sub="860 of 1,200 bins" icon={<WarehouseIcon className="h-5 w-5" />} tone="primary" />
        <StatCard label="QA staging load" value="92%" sub="Near capacity — expedite inspections" icon={<WarehouseIcon className="h-5 w-5" />} tone="danger" />
        <StatCard label="Active docks" value="9" sub="4 occupied" icon={<WarehouseIcon className="h-5 w-5" />} tone="success" />
        <StatCard label="Open putaway tasks" value="31" sub="Post-inspection releases" icon={<WarehouseIcon className="h-5 w-5" />} tone="warning" />
      </div>
      <SectionCard title="Zone utilisation" description="Live bin occupancy from EWM">
        <ul className="space-y-4">
          {ZONES.map((z) => (
            <li key={z.zone}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{z.zone}</span>
                <span className="num text-xs text-muted-foreground">{z.used}% of {z.bins} bins</span>
              </div>
              <Progress value={z.used} className="mt-2 h-1.5" />
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
