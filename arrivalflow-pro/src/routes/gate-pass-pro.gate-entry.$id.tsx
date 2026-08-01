import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  Truck, User, FileText, QrCode, Printer, Camera, ScrollText, BellRing, ArrowLeft,
  CheckCircle2, PauseCircle, XCircle, PackageCheck, MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/apps/gate-pass-pro/components/wms/AppShell";
import { StatusChip } from "@/apps/gate-pass-pro/components/wms/StatusChip";
import { auditTrail, documents, getEntry, notifications, vehicleHistory } from "@/apps/gate-pass-pro/lib/wms-data";

export const Route = createFileRoute("/gate-pass-pro/gate-entry/$id")({
  loader: ({ params }) => {
    const entry = getEntry(params.id);
    if (!entry) throw notFound();
    return { entry };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Gate entry unavailable — NexusWMS" }, { name: "robots", content: "noindex" }] };
    }
    const t = `${loaderData.entry.id} · ${loaderData.entry.truck} — NexusWMS`;
    return {
      meta: [
        { title: t },
        { name: "description", content: `Gate entry detail for ${loaderData.entry.truck} from ${loaderData.entry.vendor}.` },
        { property: "og:title", content: t },
        { property: "og:description", content: `Vehicle, driver, PO, documents and audit trail for ${loaderData.entry.id}.` },
      ],
    };
  },
  component: GateEntryDetail,
});

const timeline = [
  { time: "06:12", label: "Truck arrived at Gate 01", done: true },
  { time: "06:14", label: "Vehicle verified (OCR 98.2%)", done: true },
  { time: "06:16", label: "Driver verified · blacklist clear", done: true },
  { time: "06:18", label: "PO-4500219847 validated", done: true },
  { time: "06:20", label: "Appointment APT-77118 matched", done: true },
  { time: "06:21", label: "Safety checklist 8/8 passed", done: true },
  { time: "06:26", label: "Supervisor approved entry", done: true },
  { time: "06:27", label: "Gate pass GP-004821 generated", done: true },
  { time: "06:34", label: "Warehouse WH-01 accepted truck", done: true },
  { time: "—", label: "GRN posting (Module 03)", done: false },
];

function GateEntryDetail() {
  const { entry } = Route.useLoaderData();
  const [confirm, setConfirm] = useState<null | "approve" | "hold" | "reject">(null);

  return (
    <AppShell
      title={entry.id}
      subtitle={`${entry.truck} · ${entry.vendor} · arrived ${entry.arrival}`}
      actions={
        <>
          <Button variant="outline" asChild><Link to="/gate-pass-pro/gate-entry"><ArrowLeft className="mr-2 h-4 w-4" />Register</Link></Button>
          <Button variant="outline" onClick={() => toast.success(`Gate pass reprinted · ${entry.id}`)}>
            <Printer className="mr-2 h-4 w-4" />Print gate pass
          </Button>
          <Button onClick={() => setConfirm("approve")}><CheckCircle2 className="mr-2 h-4 w-4" />Approve</Button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="surface-card p-5">
            <div className="flex flex-wrap items-center gap-3">
              <StatusChip status={entry.status} />
              <Badge className="bg-primary/10 text-[11px] text-primary">{entry.gate}</Badge>
              <Badge className="bg-secondary/15 text-[11px] text-secondary">{entry.dock}</Badge>
              <span className="text-[11px] text-muted-foreground">Waiting time {entry.waitingMin} min · Officer {entry.officer}</span>
            </div>
            {entry.holdReason && (
              <p className="mt-3 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs font-medium text-warning">
                Exception: {entry.holdReason}
              </p>
            )}
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Purchase order", entry.po],
                ["PO value", entry.poValue],
                ["Material", entry.material],
                ["Quantity", entry.qty],
                ["Weight", entry.weight],
                ["Transporter", entry.transporter],
                ["Warehouse", entry.warehouse],
                ["Scheduled slot", entry.scheduled],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-border p-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</p>
                  <p className="mt-1 text-sm font-medium">{v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <Tabs defaultValue="timeline">
              <TabsList className="flex-wrap">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
                <TabsTrigger value="driver">Driver</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="audit">Audit</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="pt-5">
                <ol className="space-y-4">
                  {timeline.map((t, i) => (
                    <li key={i} className="relative pl-7">
                      <span className={`absolute left-0 top-1 grid h-4 w-4 place-items-center rounded-full ${t.done ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      </span>
                      {i < timeline.length - 1 && <span className="absolute left-[7px] top-5 h-full w-px bg-border" />}
                      <p className="text-xs font-medium">{t.label}</p>
                      <p className="text-[11px] text-muted-foreground">{t.time}</p>
                    </li>
                  ))}
                </ol>
              </TabsContent>

              <TabsContent value="vehicle" className="space-y-4 pt-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[["Vehicle type", entry.vehicleType], ["Trailer", entry.trailer], ["Container", entry.container]].map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-border p-3">
                      <p className="text-[11px] uppercase text-muted-foreground">{k}</p>
                      <p className="mt-1 text-sm font-medium">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 text-left text-[11px] uppercase text-muted-foreground">
                      <tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Entry</th><th className="px-3 py-2">PO</th><th className="px-3 py-2">Material</th><th className="px-3 py-2">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {vehicleHistory.map((h) => (
                        <tr key={h.entry}>
                          <td className="px-3 py-2">{h.date}</td>
                          <td className="px-3 py-2 font-mono">{h.entry}</td>
                          <td className="px-3 py-2 font-mono">{h.po}</td>
                          <td className="px-3 py-2">{h.material}</td>
                          <td className="px-3 py-2"><StatusChip status={h.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/gate-pass-pro/vehicles/$id" params={{ id: entry.truck }}><Truck className="mr-2 h-4 w-4" />Open vehicle master</Link>
                </Button>
              </TabsContent>

              <TabsContent value="driver" className="space-y-4 pt-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[["Driver", entry.driver], ["Driver ID", entry.driverId], ["Phone", entry.phone], ["Licence", entry.license], ["Licence expiry", entry.licenseExpiry], ["Blacklist", entry.blacklisted ? "Blacklisted" : "Clear"]].map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-border p-3">
                      <p className="text-[11px] uppercase text-muted-foreground">{k}</p>
                      <p className="mt-1 text-sm font-medium">{v}</p>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/gate-pass-pro/drivers/$id" params={{ id: entry.driverId }}><User className="mr-2 h-4 w-4" />Open driver profile</Link>
                </Button>
              </TabsContent>

              <TabsContent value="documents" className="pt-5">
                <div className="divide-y divide-border rounded-xl border border-border">
                  {documents.map((d) => (
                    <div key={d.name} className="flex flex-wrap items-center gap-3 p-3">
                      <FileText className="h-4 w-4 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold">{d.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{d.file} · {d.size}</p>
                      </div>
                      <Badge className="bg-muted text-[10px] text-muted-foreground">{d.ocr}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => toast.info(`Opening ${d.file}`)}>Preview</Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="photos" className="grid gap-3 pt-5 sm:grid-cols-3">
                {["Truck front", "Number plate", "Driver", "Container seal", "Weight slip", "Exit photo"].map((p) => (
                  <div key={p} className="grid h-32 place-items-center rounded-xl border border-border bg-muted/40 text-[11px] text-muted-foreground">
                    <div className="text-center"><Camera className="mx-auto h-5 w-5" /><p className="mt-1">{p}</p></div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="notifications" className="space-y-2 pt-5">
                {notifications.slice(0, 4).map((n) => (
                  <div key={n.id} className="rounded-xl border border-border p-3">
                    <StatusChip status={n.type} />
                    <p className="mt-2 text-xs font-medium">{n.title}</p>
                    <p className="text-[11px] text-muted-foreground">{n.body} · {n.time}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="audit" className="pt-5">
                <ol className="space-y-4">
                  {auditTrail.map((a, i) => (
                    <li key={i} className="rounded-xl border border-border p-3">
                      <p className="text-xs font-semibold">{a.action}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{a.time} · {a.user}</p>
                      <p className="text-[11px] text-muted-foreground">{a.ip} · {a.device} · {a.remarks}</p>
                    </li>
                  ))}
                </ol>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="surface-card p-5 text-center">
            <div className="mx-auto grid h-32 w-32 place-items-center rounded-xl bg-muted/50"><QrCode className="h-24 w-24" /></div>
            <p className="mt-3 text-sm font-semibold">Gate Pass GP-{entry.id.slice(-6)}</p>
            <p className="text-[11px] text-muted-foreground">Valid until 21:10 · Gate 01</p>
            <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => toast.success("Gate pass printed")}>
              <Printer className="mr-2 h-3.5 w-3.5" />Print
            </Button>
          </div>
          <div className="surface-card p-5">
            <p className="text-xs font-semibold">Decision</p>
            <div className="mt-3 grid gap-2">
              <Button size="sm" onClick={() => setConfirm("approve")}><CheckCircle2 className="mr-2 h-4 w-4" />Approve</Button>
              <Button size="sm" variant="outline" onClick={() => setConfirm("hold")}><PauseCircle className="mr-2 h-4 w-4" />Hold</Button>
              <Button size="sm" variant="destructive" onClick={() => setConfirm("reject")}><XCircle className="mr-2 h-4 w-4" />Reject</Button>
            </div>
          </div>
          <div className="surface-card p-5">
            <p className="flex items-center gap-2 text-xs font-semibold"><MapPin className="h-4 w-4 text-secondary" />Yard position</p>
            <p className="mt-2 text-[11px] text-muted-foreground">Bay Y-12 → {entry.dock} · 140 m travel · escort not required</p>
            <Button size="sm" variant="outline" className="mt-3 w-full" asChild><Link to="/gate-pass-pro/queue">Open yard board</Link></Button>
          </div>
          <div className="surface-card p-5">
            <p className="flex items-center gap-2 text-xs font-semibold"><PackageCheck className="h-4 w-4 text-secondary" />Next module</p>
            <Button size="sm" className="mt-3 w-full" asChild><Link to="/gate-pass-pro/receiving">Start Document Management & OCR</Link></Button>
          </div>
          <div className="surface-card p-5">
            <p className="flex items-center gap-2 text-xs font-semibold"><ScrollText className="h-4 w-4" />Audit</p>
            <p className="mt-2 text-[11px] text-muted-foreground">{auditTrail.length} events recorded</p>
            <Button size="sm" variant="outline" className="mt-3 w-full" asChild><Link to="/gate-pass-pro/audit">Open audit trail</Link></Button>
          </div>
          <div className="surface-card p-5">
            <p className="flex items-center gap-2 text-xs font-semibold"><BellRing className="h-4 w-4" />Notify</p>
            <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => toast.success("Warehouse manager notified")}>
              Resend arrival notification
            </Button>
          </div>
        </aside>
      </div>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "approve" && "Approve this gate entry?"}
              {confirm === "hold" && "Place this truck on hold?"}
              {confirm === "reject" && "Reject this truck?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "approve" && "A QR gate pass will be generated and the warehouse notified."}
              {confirm === "hold" && "The truck waits in the yard until a supervisor resolves the exception."}
              {confirm === "reject" && "The vendor and transporter will be notified. This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirm === "approve") toast.success(`${entry.id} approved · gate pass generated`);
                if (confirm === "hold") toast.warning(`${entry.id} placed on hold`);
                if (confirm === "reject") toast.error(`${entry.id} rejected`);
                setConfirm(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
