import { createFileRoute } from "@tanstack/react-router";
import { Boxes } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SectionCard, StatCard, StatusBadge } from "@/apps/quality-gatekeeper/components/wms/bits";

export const Route = createFileRoute("/quality-gatekeeper/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — AXIOM WMS" },
      { name: "description", content: "Unrestricted, quality-inspection and blocked stock by material, batch and storage bin." },
      { property: "og:title", content: "Inventory — AXIOM WMS" },
      { property: "og:description", content: "Stock by status, batch and bin across the plant." },
    ],
  }),
  component: Inventory,
});

const STOCK = [
  { m: "MAT-66031 Loctite 3090 Adhesive 20L", batch: "B-2026-0712", bin: "WH-A-12-03", qty: "96 DRUM", status: "Available Inventory" },
  { m: "MAT-88120 AC Drive Unit 7.5kW", batch: "B-2026-0731", bin: "QA-STG-01", qty: "200 EA", status: "Waiting Inspection" },
  { m: "MAT-10220 CR Steel Coil 1.2mm", batch: "HEAT-99213", bin: "QA-HOLD-01", qty: "4 COIL", status: "Quality Hold" },
  { m: "MAT-30110 Hex Bolt M12x60 8.8", batch: "B-2026-0701", bin: "QA-HOLD-02", qty: "6,000 EA", status: "RTS" },
  { m: "MAT-52001 Cubitron II Disc 125mm", batch: "B-2026-0727", bin: "QA-STG-01", qty: "1,800 EA", status: "Waiting Inspection" },
  { m: "MAT-44012 Directional Valve 4WE6", batch: "B-2026-0725", bin: "QA-STG-02", qty: "600 EA", status: "Assigned" },
];

function Inventory() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <header>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Stock</p>
        <h1 className="text-2xl font-bold sm:text-3xl">Inventory</h1>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Unrestricted stock" value="184,220" sub="Across 1,240 bins" icon={<Boxes className="h-5 w-5" />} tone="success" />
        <StatCard label="Quality inspection stock" value="3,020" sub="Awaiting disposition" icon={<Boxes className="h-5 w-5" />} tone="primary" />
        <StatCard label="Blocked stock" value="7,444" sub="Quality hold + RTS" icon={<Boxes className="h-5 w-5" />} tone="warning" />
        <StatCard label="Inventory accuracy" value="99.4%" sub="Last cycle count 30 Jul" icon={<Boxes className="h-5 w-5" />} tone="success" />
      </div>
      <SectionCard title="Stock by status" description="Quality status determines pickability">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Material</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Bin</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Quality status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {STOCK.map((s) => (
                <TableRow key={s.m + s.bin}>
                  <TableCell className="text-xs">{s.m}</TableCell>
                  <TableCell className="num font-mono text-xs">{s.batch}</TableCell>
                  <TableCell className="num font-mono text-xs">{s.bin}</TableCell>
                  <TableCell className="num text-right text-xs font-semibold">{s.qty}</TableCell>
                  <TableCell><StatusBadge status={s.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
}
