import { createFileRoute, useParams } from "@tanstack/react-router";
import { Building2, Clock, IdCard, PackageCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/apps/gatepass-pro/components/wms/AppShell";
import { SummaryCard } from "@/apps/gatepass-pro/components/wms/SummaryCard";
import { StatusChip } from "@/apps/gatepass-pro/components/wms/StatusChip";
import { Timeline } from "@/apps/gatepass-pro/components/wms/Timeline";
import { Button } from "@/components/ui/button";
import { useWms } from "@/apps/gatepass-pro/lib/wms/store";

export const Route = createFileRoute("/gatepass-pro/entry/$id")({
  head: () => ({
    meta: [
      { title: "Pending Warehouse Acceptance — GateFlow WMS" },
      { name: "description", content: "Live status of a gate entry: truck, vendor, arrival time and warehouse acceptance timeline." },
      { property: "og:title", content: "Pending Warehouse Acceptance — GateFlow WMS" },
      { property: "og:description", content: "Follow the arrival timeline from gate approval to warehouse acceptance." },
    ],
  }),
  component: EntryDetail,
});

function EntryDetail() {
  const { id } = useParams({ from: "/gatepass-pro/entry/$id" });
  const { entries, acceptByWarehouse, exitVehicle } = useWms();
  const entry = entries.find((e) => e.id === id);

  if (!entry) {
    return (
      <AppShell title="Entry not found" back="/gatepass-pro/entries">
        <p className="text-sm text-muted-foreground">This gate entry is no longer available.</p>
      </AppShell>
    );
  }

  return (
    <AppShell title={entry.vehicle.number} subtitle={entry.gateNo} back="/gatepass-pro/entries">
      <div className="card-elevated mb-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Current status</p>
            <p className="text-lg font-bold">{entry.status}</p>
          </div>
          <StatusChip status={entry.status} />
        </div>
        {entry.holdReason ? (
          <p className="mt-3 rounded-xl bg-warning/15 p-3 text-xs font-medium text-warning">
            Reason: {entry.holdReason}
          </p>
        ) : null}
      </div>

      <div className="card-elevated mb-4 p-4">
        <p className="mb-4 text-sm font-semibold">Arrival timeline</p>
        <Timeline items={entry.timeline} />
      </div>

      <div className="grid gap-3">
        <SummaryCard
          icon={Truck}
          title="Truck"
          rows={[
            ["Vehicle", entry.vehicle.number],
            ["Type", entry.vehicle.type],
            ["Transporter", entry.vehicle.transporter],
          ]}
        />
        <SummaryCard
          icon={IdCard}
          title="Driver"
          rows={[
            ["Name", entry.driver.name],
            ["Phone", entry.driver.phone],
            ["License", `${entry.driver.license} · exp ${entry.driver.licenseExpiry}`],
          ]}
        />
        <SummaryCard
          icon={Building2}
          title="Vendor & PO"
          rows={[
            ["Vendor", entry.delivery.vendor],
            ["PO", entry.delivery.po],
            ["Dock", entry.delivery.dock],
            ["Category", entry.delivery.category],
          ]}
        />
        <SummaryCard
          icon={Clock}
          title="Timings"
          rows={[
            ["Arrival", entry.arrival],
            ["Warehouse", entry.warehouse],
            ["Exit", entry.exitTime ?? "Not exited"],
          ]}
        />
      </div>

      <div className="mt-5 grid gap-3 pb-4">
        {entry.status === "Waiting Warehouse" ? (
          <Button
            className="h-16 rounded-2xl bg-success text-base font-semibold text-success-foreground hover:bg-success/90"
            onClick={() => {
              acceptByWarehouse(entry.id);
              toast.success("Warehouse accepted the truck", { description: `${entry.delivery.dock} assigned` });
            }}
          >
            <PackageCheck className="size-6" /> Simulate Warehouse Acceptance
          </Button>
        ) : null}
        {entry.status === "Accepted" ? (
          <Button variant="outline" className="h-14 rounded-2xl" onClick={() => exitVehicle(entry.id)}>
            Mark vehicle exited
          </Button>
        ) : null}
      </div>
    </AppShell>
  );
}