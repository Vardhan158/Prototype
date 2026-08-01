import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BellRing, Truck, CheckCircle2, Warehouse, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle,
} from "@/components/ui/drawer";
import { AppShell } from "@/apps/gate-pass-pro/components/wms/AppShell";
import { StatusChip } from "@/apps/gate-pass-pro/components/wms/StatusChip";
import { gateEntries } from "@/apps/gate-pass-pro/lib/wms-data";

export const Route = createFileRoute("/gate-pass-pro/arrival-notifications")({
  head: () => ({
    meta: [
      { title: "Arrival Notifications — NexusWMS" },
      { name: "description", content: "Warehouse manager, store keeper, asset manager and procurement views of inbound truck arrivals awaiting acceptance." },
      { property: "og:title", content: "Arrival Notifications — NexusWMS" },
      { property: "og:description", content: "Role-based inbound arrival alerts and warehouse acceptance." },
    ],
  }),
  component: ArrivalNotifications,
});

const audiences = ["Warehouse Manager", "Store Keeper", "Asset Manager", "Procurement Manager"];

function ArrivalNotifications() {
  const [arrivals, setArrivals] = useState(() =>
    gateEntries.filter((e) => ["Approved", "Waiting Warehouse"].includes(e.status)),
  );
  const [drawer, setDrawer] = useState<string | null>(null);
  const active = arrivals.find((a) => a.id === drawer);

  return (
    <AppShell
      title="Arrival Notifications"
      subtitle="Trucks approved at the gate and pushed to warehouse teams for acceptance"
      actions={
        <Button variant="outline" onClick={() => toast.success("Broadcast sent to all warehouse teams")}>
          <Send className="mr-2 h-4 w-4" />Broadcast
        </Button>
      }
    >
      <Tabs defaultValue={audiences[0]!}>
        <TabsList className="flex-wrap">
          {audiences.map((a) => <TabsTrigger key={a} value={a}>{a}</TabsTrigger>)}
        </TabsList>
        {audiences.map((a) => (
          <TabsContent key={a} value={a} className="pt-5">
            <p className="mb-3 text-xs text-muted-foreground">
              {arrivals.length} arrival notifications routed to <strong>{a}</strong> · WH-01 Bhiwandi
            </p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {arrivals.map((e) => (
                <div key={e.id} className="surface-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Truck className="h-4 w-4" />
                    </span>
                    <StatusChip status={e.status} />
                  </div>
                  <p className="mt-3 font-mono text-sm font-semibold">{e.truck}</p>
                  <p className="truncate text-xs text-muted-foreground">{e.vendor}</p>
                  <dl className="mt-3 space-y-1 text-[11px]">
                    <div className="flex justify-between"><dt className="text-muted-foreground">Arrival</dt><dd>{e.arrival.slice(11)}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">PO</dt><dd className="font-mono">{e.po}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Material</dt><dd className="max-w-36 truncate">{e.material}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Dock</dt><dd>{e.dock}</dd></div>
                  </dl>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => setDrawer(e.id)}>
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />Accept
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/gate-pass-pro/gate-entry/$id" params={{ id: e.id }}>Details</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-6 surface-card p-5">
        <p className="flex items-center gap-2 text-sm font-semibold"><BellRing className="h-4 w-4 text-primary" />Escalation matrix</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {[
            ["0 min", "Store keeper + warehouse manager notified on approval"],
            ["15 min", "Unaccepted arrivals escalate to shift supervisor"],
            ["30 min", "Procurement manager and gate supervisor alerted"],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border border-border p-3">
              <Badge className="bg-primary/10 text-[10px] text-primary">{t}</Badge>
              <p className="mt-2 text-[11px] text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </div>

      <Drawer open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Accept truck into warehouse</DrawerTitle>
            <DrawerDescription>
              {active?.truck} · {active?.vendor} · {active?.material} ({active?.qty})
            </DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-3 px-4 sm:grid-cols-3">
            {[
              ["Dock", active?.dock ?? "—"],
              ["Unloading crew", "Team B · 4 members"],
              ["Estimated unload", "55 minutes"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-border p-3">
                <p className="text-[11px] uppercase text-muted-foreground">{k}</p>
                <p className="mt-1 text-sm font-medium">{v}</p>
              </div>
            ))}
          </div>
          <DrawerFooter className="sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setDrawer(null)}>Cancel</Button>
            <Button
              onClick={() => {
                if (active) {
                  const entry = gateEntries.find((e) => e.id === active.id);
                  if (entry) entry.status = "Warehouse Accepted";
                  setArrivals((prev) => prev.filter((a) => a.id !== active.id));
                }
                setDrawer(null);
                toast.success(`${active?.truck} accepted · receiving can start`, {
                  description: "Handed off to Document Management & OCR & GRN Management",
                });
              }}
            >
              <Warehouse className="mr-2 h-4 w-4" />Accept &amp; start receiving
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </AppShell>
  );
}
