import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Download, PackageCheck, Plus, Search, Truck, Warehouse } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeader, SectionCard } from "@/apps/supplier-flow/components/page-parts";
import { StatCard } from "@/apps/supplier-flow/components/stat-card";
import { StatusBadge } from "@/apps/supplier-flow/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { asns } from "@/apps/supplier-flow/data/procurement";

export const Route = createFileRoute("/supplier-flow/asn/")({
  head: () => ({
    meta: [
      { title: "Advance Shipment Notices | AxisWMS Procurement" },
      { name: "description", content: "Track inbound shipments, transport documents and expected arrivals feeding warehouse gate entry." },
      { property: "og:title", content: "Advance Shipment Notices | AxisWMS Procurement" },
      { property: "og:description", content: "Inbound shipment visibility from despatch to gate entry." },
    ],
  }),
  component: ASNList,
});

const tabs = ["All", "Draft", "In Transit", "Delayed", "Arrived", "Received"];

function ASNList() {
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");

  const rows = useMemo(
    () =>
      asns.filter((a) => {
        if (tab !== "All" && a.status !== tab) return false;
        const t = q.trim().toLowerCase();
        return !t || `${a.id} ${a.supplier} ${a.vehicleNo} ${a.poId} ${a.invoiceNo}`.toLowerCase().includes(t);
      }),
    [tab, q],
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        breadcrumbs={[{ label: "Home", to: "/supplier-flow" }, { label: "Procurement" }, { label: "Advance Shipment Notice" }]}
        title="Advance Shipment Notices"
        subtitle="Inbound visibility from supplier despatch through to warehouse gate entry"
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("Shipment register exported")}><Download className="size-4" /> Export</Button>
            <Button asChild><Link to="/supplier-flow/asn/new"><Plus className="size-4" /> Create ASN</Link></Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Total ASN" value={asns.length} icon={Truck} sub="Rolling 30 days" />
        <StatCard label="In transit" value={asns.filter((a) => a.status === "In Transit").length} icon={Truck} accent="teal" sub="GPS tracked" />
        <StatCard label="Delayed" value={asns.filter((a) => a.status === "Delayed").length} icon={AlertTriangle} accent="danger" sub="Port congestion" />
        <StatCard label="At gate" value={asns.filter((a) => a.status === "Arrived").length} icon={Warehouse} accent="warning" sub="Awaiting gate entry" />
        <StatCard label="Received" value={asns.filter((a) => a.status === "Received").length} icon={PackageCheck} accent="success" sub="GRN posted" />
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex-wrap">
              {tabs.map((t) => (
                <TabsTrigger key={t} value={t} className="text-xs">
                  {t}<span className="num ml-1.5 text-[10px] text-muted-foreground">{t === "All" ? asns.length : asns.filter((a) => a.status === t).length}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="relative ml-auto w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ASN, PO, vehicle, invoice…" />
          </div>
        </div>

        <SectionCard bodyClassName="p-0">
          {rows.length === 0 ? (
            <EmptyState icon={Truck} title="No shipments found" description="No advance shipment notices match the current filters." action={<Button asChild><Link to="/supplier-flow/asn/new">Create ASN</Link></Button>} />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>ASN</TableHead><TableHead>Supplier</TableHead>
                    <TableHead className="hidden lg:table-cell">Vehicle / container</TableHead>
                    <TableHead className="hidden xl:table-cell">Warehouse</TableHead>
                    <TableHead className="hidden md:table-cell">ETA</TableHead>
                    <TableHead className="w-36">Progress</TableHead><TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((a) => (
                    <TableRow key={a.id} className="group">
                      <TableCell>
                        <Link to="/supplier-flow/asn/$asnId" params={{ asnId: a.id }} className="block min-w-36">
                          <p className="num text-sm font-semibold group-hover:text-primary">{a.id}</p>
                          <p className="num text-xs text-muted-foreground">{a.poId}</p>
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{a.supplier}</TableCell>
                      <TableCell className="num hidden lg:table-cell text-sm">{a.vehicleNo}<span className="block text-xs text-muted-foreground">{a.containerNo}</span></TableCell>
                      <TableCell className="hidden xl:table-cell text-sm">{a.warehouse.split(" · ")[0]}</TableCell>
                      <TableCell className="num hidden md:table-cell text-sm">{a.expectedArrival}</TableCell>
                      <TableCell><Progress value={a.progressPct} className="h-1.5" /><span className="num mt-1 block text-[11px] text-muted-foreground">{a.progressPct}%</span></TableCell>
                      <TableCell><StatusBadge status={a.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
