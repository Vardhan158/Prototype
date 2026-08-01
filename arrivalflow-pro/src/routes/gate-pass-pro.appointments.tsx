import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarClock, Search, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppShell } from "@/apps/gate-pass-pro/components/wms/AppShell";
import { appointments } from "@/apps/gate-pass-pro/lib/wms-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gate-pass-pro/appointments")({
  head: () => ({
    meta: [
      { title: "Dock Appointments — NexusWMS" },
      { name: "description", content: "Booked dock appointment slots, actual arrival times, delays and dock recommendations." },
      { property: "og:title", content: "Dock Appointments — NexusWMS" },
      { property: "og:description", content: "Slot compliance and dock allocation for inbound trucks." },
    ],
  }),
  component: Appointments,
});

const tone: Record<string, string> = {
  Verified: "bg-success/15 text-success",
  "Early Arrival": "bg-primary/10 text-primary",
  "Slot Missed": "bg-destructive/10 text-destructive",
  Delayed: "bg-warning/15 text-warning",
  Scheduled: "bg-muted text-muted-foreground",
};

function Appointments() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const rows = appointments.filter((a) => `${a.id} ${a.vendor} ${a.truck}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell
      title="Dock Appointments"
      subtitle="01 August 2026 · 8 slots booked · 3 docks under maintenance window"
      actions={<Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Book slot</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          ["Slots booked", "8"],
          ["On-time arrivals", "5"],
          ["Slots missed", "1"],
          ["Avg. slot deviation", "9 min"],
        ].map(([k, v]) => (
          <div key={k} className="surface-card p-4">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</p>
            <p className="mt-1 text-2xl font-semibold">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 surface-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search appointment, vendor or truck…" className="pl-9" />
          </div>
        </div>
        {rows.length === 0 ? (
          <div className="p-16 text-center">
            <CalendarClock className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">No appointments match “{q}”</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setQ("")}>Clear search</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50 text-left text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Appointment</th><th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Truck</th><th className="px-4 py-3">Scheduled slot</th>
                  <th className="px-4 py-3">Actual</th><th className="px-4 py-3">Delay</th>
                  <th className="px-4 py-3">Dock</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((a) => (
                  <tr key={a.id} className="hover:bg-accent/40">
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{a.id}</td>
                    <td className="px-4 py-3 text-xs">{a.vendor}</td>
                    <td className="px-4 py-3 font-mono text-xs">{a.truck}</td>
                    <td className="px-4 py-3 text-xs">{a.slot}</td>
                    <td className="px-4 py-3 text-xs">{a.actual}</td>
                    <td className="px-4 py-3 text-xs">{a.delay ? `${a.delay} min` : "—"}</td>
                    <td className="px-4 py-3 text-xs">{a.dock}</td>
                    <td className="px-4 py-3"><Badge className={cn("text-[10px]", tone[a.status])}>{a.status}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => toast.success(`${a.id} verified against arrival`)}>
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />Verify
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground">
        Need to create an arrival for a walk-in truck without an appointment?{" "}
        <Link to="/gate-pass-pro/gate-entry/new" className="font-semibold text-primary hover:underline">Create gate entry</Link>
      </p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book dock appointment</DialogTitle>
            <DialogDescription>Reserve a dock slot for an inbound supplier delivery.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1.5"><Label>Vendor</Label><Input defaultValue="Godrej Interio" /></div>
            <div className="space-y-1.5"><Label>Truck number</Label><Input defaultValue="MH-04-EF-2287" className="font-mono" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Date</Label><Input type="date" defaultValue="2026-08-02" /></div>
              <div className="space-y-1.5"><Label>Slot</Label>
                <Select defaultValue="10:00 – 10:45">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["08:00 – 08:45", "10:00 – 10:45", "13:00 – 13:45", "16:00 – 16:45"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => { setOpen(false); toast.success("Appointment APT-77126 booked · DOCK-06"); }}>Book slot</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
