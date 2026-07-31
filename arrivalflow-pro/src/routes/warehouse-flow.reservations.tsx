import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Layers, RefreshCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, PageHeader, SectionCard, StatusBadge } from "@/apps/warehouse-flow/components/ui-kit";
import { KpiCard } from "@/apps/warehouse-flow/components/kpi-card";
import { reservations } from "@/apps/warehouse-flow/data";

export const Route = createFileRoute("/warehouse-flow/reservations")({
  head: () => ({
    meta: [
      { title: "Inventory Reservation — WMS Console" },
      {
        name: "description",
        content:
          "Monitor available versus reserved stock by warehouse, zone, rack, shelf and bin with live reservation status.",
      },
      { property: "og:title", content: "Inventory Reservation — WMS Console" },
      {
        property: "og:description",
        content: "Available vs reserved stock by bin location with reservation status.",
      },
    ],
  }),
  component: ReservationPage,
});

function ReservationPage() {
  const [q, setQ] = useState("");
  const rows = reservations.filter((r) =>
    `${r.id} ${r.code} ${r.name} ${r.request} ${r.warehouse}`.toLowerCase().includes(q.toLowerCase()),
  );

  const totalReserved = reservations.reduce((s, r) => s + r.reserved, 0);
  const shortages = reservations.filter((r) => r.status === "Shortage").length;

  return (
    <>
      <PageHeader
        title="Inventory Reservation"
        description="Allocate and monitor stock committed to approved material requests."
        breadcrumbs={[{ label: "Home", to: "/warehouse-flow/" }, { label: "Inventory Reservation" }]}
        actions={
          <Button variant="outline" onClick={() => toast.success("Reservations re-evaluated")}>
            <RefreshCcw className="size-4" /> Re-run Allocation
          </Button>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active Reservations" value={String(reservations.length)} hint="across 4 warehouses" icon="Layers" />
        <KpiCard label="Reserved Units" value={String(totalReserved)} delta="+28" trend="up" hint="committed stock" icon="PackageCheck" />
        <KpiCard label="Shortages" value={String(shortages)} delta="+1" trend="up" hint="require replenishment" icon="TriangleAlert" />
        <KpiCard label="Allocation Rate" value="92.4%" delta="+1.6pp" trend="up" hint="auto-allocated lines" icon="Gauge" />
      </div>

      <SectionCard
        title="Reservation Ledger"
        description="Stock committed against approved requests"
        bodyClassName="p-0"
        actions={
          <div className="relative w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search reservations"
              className="h-9 pl-9"
            />
          </div>
        }
      >
        {rows.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No reservations match"
            description="Try a different material code, request number or warehouse."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60">
                  <TableHead>Reservation</TableHead>
                  <TableHead>Request</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-right">Reserved</TableHead>
                  <TableHead className="w-40">Availability</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="num text-sm font-semibold text-primary">{r.id}</TableCell>
                    <TableCell className="num text-sm">{r.request}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{r.name}</p>
                      <p className="num text-xs text-muted-foreground">{r.code}</p>
                    </TableCell>
                    <TableCell className="num text-xs text-muted-foreground">
                      {r.warehouse} · {r.zone} · {r.rack} · {r.shelf} · {r.bin}
                    </TableCell>
                    <TableCell className="num text-right text-sm">{r.available}</TableCell>
                    <TableCell className="num text-right text-sm font-semibold">{r.reserved}</TableCell>
                    <TableCell>
                      <Progress value={Math.min(100, (r.reserved / r.available) * 100)} className="h-1.5" />
                      <span className="num mt-1 block text-[11px] text-muted-foreground">
                        {Math.round((r.reserved / r.available) * 100)}% committed
                      </span>
                    </TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>
    </>
  );
}
