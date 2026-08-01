import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut, QrCode, Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/apps/gatepass-pro/components/wms/AppShell";
import { ScanSheet } from "@/apps/gatepass-pro/components/wms/ScanSheet";
import { StatusChip } from "@/apps/gatepass-pro/components/wms/StatusChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWms } from "@/apps/gatepass-pro/lib/wms/store";

export const Route = createFileRoute("/gatepass-pro/exit")({
  head: () => ({
    meta: [
      { title: "Vehicle Exit — GateFlow WMS" },
      { name: "description", content: "Scan the gate pass QR, verify the truck and generate an exit pass with timestamp." },
      { property: "og:title", content: "Vehicle Exit — GateFlow WMS" },
      { property: "og:description", content: "Verify trucks leaving the yard and issue exit passes." },
    ],
  }),
  component: VehicleExit,
});

function VehicleExit() {
  const { entries, exitVehicle } = useWms();
  const [q, setQ] = useState("");
  const [scan, setScan] = useState(false);
  const inside = entries.filter((e) => ["Accepted", "Waiting Warehouse", "Approved"].includes(e.status));
  const list = inside.filter((e) => !q || e.vehicle.number.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell title="Vehicle Exit" subtitle={`${inside.length} vehicles inside yard`} back="/gatepass-pro">
      <Button className="h-24 w-full flex-col gap-2 rounded-2xl text-base font-semibold" onClick={() => setScan(true)}>
        <QrCode className="size-8" /> Scan Gate Pass QR
      </Button>

      <div className="relative my-4">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search vehicle number"
          className="h-14 rounded-2xl pl-11 text-base"
        />
      </div>

      <div className="grid gap-3">
        {list.map((e) => (
          <div key={e.id} className="card-elevated p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-semibold">{e.vehicle.number}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {e.gateNo} · {e.delivery.dock} · in since {e.arrival}
                </p>
              </div>
              <StatusChip status={e.status} />
            </div>
            <Button
              className="mt-3 h-14 w-full rounded-2xl"
              onClick={() => {
                exitVehicle(e.id);
                toast.success(`Exit pass generated for ${e.vehicle.number}`, {
                  description: "Exit time recorded and synced",
                });
              }}
            >
              <LogOut className="size-5" /> Verify &amp; Generate Exit Pass
            </Button>
          </div>
        ))}
        {list.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">No vehicles pending exit.</p>
        ) : null}
      </div>

      <ScanSheet
        open={scan}
        mode="qr"
        label="Gate pass QR"
        onClose={() => setScan(false)}
        onResult={() => {
          const first = inside[0];
          if (first) {
            setQ(first.vehicle.number);
            toast.success(`Gate pass matched ${first.vehicle.number}`);
          }
        }}
      />
    </AppShell>
  );
}