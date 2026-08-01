import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, QrCode, LogOut, Camera, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { AppShell } from "@/apps/gate-pass-pro/components/wms/AppShell";
import { StatusChip } from "@/apps/gate-pass-pro/components/wms/StatusChip";
import { gateEntries } from "@/apps/gate-pass-pro/lib/wms-data";

export const Route = createFileRoute("/gate-pass-pro/vehicle-exit")({
  head: () => ({
    meta: [
      { title: "Vehicle Exit — NexusWMS" },
      { name: "description", content: "Scan the QR gate pass, verify the truck and record exit time, photo and security confirmation." },
      { property: "og:title", content: "Vehicle Exit — NexusWMS" },
      { property: "og:description", content: "Gate pass verification and truck release from the yard." },
    ],
  }),
  component: VehicleExit,
});

function VehicleExit() {
  const inside = gateEntries.filter((e) => ["Warehouse Accepted", "Receiving", "Completed"].includes(e.status));
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [scan, setScan] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [done, setDone] = useState(false);

  const rows = inside.filter((e) => `${e.truck} ${e.id} ${e.vendor}`.toLowerCase().includes(q.toLowerCase()));
  const active = inside.find((e) => e.id === selected);

  return (
    <AppShell title="Vehicle Exit" subtitle="11 vehicles currently inside the facility · Gate 01 outbound lane">
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="surface-card">
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <div className="relative min-w-56 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search truck number or gate entry…" className="pl-9" />
            </div>
            <Button variant="outline" onClick={() => setScan(true)}><QrCode className="mr-2 h-4 w-4" />Scan gate pass</Button>
          </div>
          {rows.length === 0 ? (
            <div className="p-16 text-center">
              <LogOut className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold">No vehicle found inside the facility</p>
              <p className="text-xs text-muted-foreground">Check the truck number or scan the printed gate pass QR.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {rows.map((e) => (
                <button
                  key={e.id}
                  onClick={() => { setSelected(e.id); setVerified(false); }}
                  className={`flex w-full flex-wrap items-center gap-3 p-4 text-left transition-colors hover:bg-accent/40 ${selected === e.id ? "bg-accent/60" : ""}`}
                >
                  <span className="w-32 font-mono text-xs font-semibold">{e.truck}</span>
                  <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{e.vendor} · {e.id}</span>
                  <span className="text-[11px] text-muted-foreground">{e.dock}</span>
                  <StatusChip status={e.status} />
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="surface-card p-5">
          {!active ? (
            <div className="py-16 text-center">
              <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold">Select a vehicle</p>
              <p className="text-xs text-muted-foreground">Pick a truck from the list or scan its gate pass to begin exit checks.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="font-mono text-sm font-semibold">{active.truck}</p>
                <p className="text-[11px] text-muted-foreground">{active.id} · {active.vendor}</p>
              </div>
              <dl className="space-y-2 text-xs">
                {[
                  ["Driver", active.driver],
                  ["Entry time", active.arrival],
                  ["Dock", active.dock],
                  ["Gate pass", `GP-${active.id.slice(-6)}`],
                  ["Exit time", "01 Aug 2026 · 13:14"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="rounded-xl border border-dashed border-border p-4 text-center">
                <Camera className="mx-auto h-5 w-5 text-muted-foreground" />
                <p className="mt-2 text-[11px] text-muted-foreground">Exit photo (rear + seal)</p>
                <Button size="sm" variant="outline" className="mt-2" onClick={() => toast.success("Exit photo captured")}>Capture</Button>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Security remarks</Label>
                <Textarea placeholder="Empty vehicle verified, seal removed, no material on board…" />
              </div>

              {verified ? (
                <div className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs font-medium text-success">
                  Gate pass verified · GRN GRN-2026-00918 posted · vehicle cleared for exit
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setVerifying(true);
                    setTimeout(() => { setVerifying(false); setVerified(true); toast.success("Gate pass verified"); }, 900);
                  }}
                >
                  {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Verify gate pass
                </Button>
              )}

              <Button className="w-full" disabled={!verified} onClick={() => setDone(true)}>
                <LogOut className="mr-2 h-4 w-4" />Confirm exit
              </Button>
            </div>
          )}
        </aside>
      </div>

      <Dialog open={scan} onOpenChange={setScan}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Scan gate pass QR</DialogTitle>
            <DialogDescription>Hold the printed or mobile gate pass in front of the outbound scanner.</DialogDescription>
          </DialogHeader>
          <div className="mx-auto grid h-56 w-56 place-items-center rounded-2xl border-2 border-dashed border-primary/50 bg-muted/50">
            <QrCode className="h-20 w-20 text-primary/50" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScan(false)}>Cancel</Button>
            <Button onClick={() => { setScan(false); setSelected("GE-2026-004829"); toast.success("Gate pass GP-004829 recognised"); }}>
              Simulate scan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={done} onOpenChange={setDone}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-center">Vehicle exit recorded</DialogTitle>
            <DialogDescription className="text-center">
              {active?.truck} left the facility at 13:14 · total dwell time 62 minutes.
            </DialogDescription>
          </DialogHeader>
          <CheckCircle2 className="mx-auto my-3 h-14 w-14 text-success" />
          <DialogFooter className="sm:justify-center">
            <Button variant="outline" onClick={() => setDone(false)}>Close</Button>
            <Button asChild><Link to="/gate-pass-pro/reports">View exit report</Link></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
