import { createFileRoute, Link } from "@tanstack/react-router";
import { Truck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SectionCard, StatCard, StatusBadge } from "@/apps/quality-gatekeeper/components/wms/bits";
import { useWms } from "@/apps/quality-gatekeeper/lib/wms-store";

export const Route = createFileRoute("/quality-gatekeeper/receiving")({
  head: () => ({
    meta: [
      { title: "Receiving — AXIOM WMS" },
      { name: "description", content: "Dock appointments and posted goods receipts feeding the quality inspection queue." },
      { property: "og:title", content: "Receiving — AXIOM WMS" },
      { property: "og:description", content: "Dock appointments and posted goods receipts." },
    ],
  }),
  component: Receiving,
});

function Receiving() {
  const { grns } = useWms();
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <header>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Inbound</p>
        <h1 className="text-2xl font-bold sm:text-3xl">Receiving</h1>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Trucks at dock" value={4} sub="2 unloading · 2 waiting" icon={<Truck className="h-5 w-5" />} tone="primary" />
        <StatCard label="GRNs posted today" value={7} sub="1,214 packages" icon={<Truck className="h-5 w-5" />} tone="success" />
        <StatCard label="Avg unload time" value="38 min" sub="Target 45 min" icon={<Truck className="h-5 w-5" />} tone="success" />
        <StatCard label="Handed to QA" value={grns.length} sub="Pending disposition" icon={<Truck className="h-5 w-5" />} tone="warning" />
      </div>
      <SectionCard title="Posted goods receipts" description="Each GRN flows automatically into the quality inspection queue">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>GRN</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Dock</TableHead>
                <TableHead>Truck</TableHead>
                <TableHead>Arrival</TableHead>
                <TableHead className="text-right">Packages</TableHead>
                <TableHead>Staging bin</TableHead>
                <TableHead>QA status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grns.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="num font-mono text-xs font-semibold text-primary">
                    <Link to="/quality-gatekeeper/inspection/$grn" params={{ grn: g.id }}>{g.grn}</Link>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs">{g.vendor}</TableCell>
                  <TableCell className="text-xs">{g.dock}</TableCell>
                  <TableCell className="num font-mono text-xs">{g.truck}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{g.arrival}</TableCell>
                  <TableCell className="num text-right text-xs">{g.packages}</TableCell>
                  <TableCell className="num font-mono text-xs">{g.storageLocation}</TableCell>
                  <TableCell><StatusBadge status={g.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
}
