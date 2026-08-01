import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Truck,
  User,
  Building2,
  FileText,
  ShieldCheck,
  Paperclip,
  Clock3,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Download,
  QrCode,
  ArrowRight,
} from "lucide-react";
import { AppShell, StatusBadge } from "@/components/wms/app-shell";
import { Field, SectionCard, StepRail, Timeline } from "@/components/wms/primitives";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { activeArrival } from "@/lib/wms-data";
import truckGate from "@/assets/truck-gate.jpg";
import truckRear from "@/assets/truck-rear.jpg";
import driverPhoto from "@/assets/driver.jpg";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/gate-entry")({
  head: () => ({
    meta: [
      { title: "Gate Entry GE/2026/07/4821 · NexusWMS" },
      {
        name: "description",
        content:
          "Full gate entry record for truck MH 12 QT 4489: vehicle, driver, vendor, purchase order, security remarks and documents.",
      },
      { property: "og:title", content: "Gate Entry GE/2026/07/4821 · NexusWMS" },
      { property: "og:description", content: "Review the security-cleared gate entry record before accepting the arrival." },
    ],
  }),
  component: GateEntry,
});

const docs = [
  { name: "Invoice_INV-2026-88231.pdf", size: "412 KB", by: "Vendor portal" },
  { name: "E-Way_Bill_391204558812.pdf", size: "188 KB", by: "Transporter" },
  { name: "Weighbridge_Slip_WB-77120.jpg", size: "1.2 MB", by: "Gate 2 security" },
  { name: "Packing_List_PL-4482.pdf", size: "96 KB", by: "Vendor portal" },
];

const gateTimeline = [
  { time: "09:04", title: "Vehicle reported at Gate 2", detail: "ANPR captured MH 12 QT 4489", tone: "primary" },
  { time: "09:07", title: "Documents scanned by security", detail: "4 files uploaded · S. Patil", tone: "primary" },
  { time: "09:10", title: "Weighbridge gross weight recorded", detail: "31.8 T gross · WB-77120", tone: "teal" },
  { time: "09:12", title: "Security approval granted", detail: "Forwarded to Warehouse Manager", tone: "success" },
];

function GateEntry() {
  const a = activeArrival;
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState<null | "accept" | "reject" | "hold">(null);

  return (
    <AppShell
      title={`Gate entry ${a.gateEntryNo}`}
      subtitle={`${a.truckNo} · ${a.vendor} · reported 09:04, cleared by security 09:12`}
      actions={
        <>
          <StatusBadge status={a.status} />
          <Button variant="outline" className="rounded-xl" onClick={() => setConfirm("hold")}>
            <PauseCircle className="size-4" /> Hold
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-destructive/30 text-destructive hover:bg-danger-soft hover:text-destructive"
            onClick={() => setConfirm("reject")}
          >
            <XCircle className="size-4" /> Reject
          </Button>
          <Button className="rounded-xl shadow-glow" onClick={() => setConfirm("accept")}>
            <CheckCircle2 className="size-4" /> Accept arrival
          </Button>
        </>
      }
    >
      <StepRail current={1} />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <SectionCard
            title="Vehicle information"
            description="Captured by ANPR and gate security"
            icon={Truck}
            actions={
              <Button variant="ghost" size="sm" className="rounded-lg" asChild>
                <Link to="/vehicle-verification">
                  Verify <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Truck number" value={a.truckNo} mono />
              <Field label="Transporter" value={a.transporter} />
              <Field label="Vehicle type" value="10-wheel closed container" />
              <Field label="Seal number" value="SL-772391" mono />
              <Field label="Gross weight" value="31.8 T" />
              <Field label="Tare weight" value="13.4 T" />
              <Field label="Net load" value={a.weight} />
              <Field label="Pallet count" value={`${a.pallets} pallets`} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                { src: truckGate, label: "Front · Gate 2 camera · 09:04" },
                { src: truckRear, label: "Rear · seal check · 09:06" },
              ].map((img) => (
                <Link
                  key={img.label}
                  to="/vehicle-verification"
                  className="group relative overflow-hidden rounded-2xl border border-border/70"
                >
                  <img
                    src={img.src}
                    alt={img.label}
                    loading="lazy"
                    width={1024}
                    height={640}
                    className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-foreground/60 px-3 py-2 text-[11px] font-medium text-background">
                    {img.label}
                  </span>
                </Link>
              ))}
            </div>
          </SectionCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              title="Driver information"
              icon={User}
              actions={
                <Button variant="ghost" size="sm" className="rounded-lg" asChild>
                  <Link to="/driver-verification">
                    Verify <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              }
            >
              <div className="flex items-start gap-4">
                <img
                  src={driverPhoto}
                  alt={`${a.driver}, delivery driver`}
                  loading="lazy"
                  width={640}
                  height={640}
                  className="size-20 shrink-0 rounded-2xl object-cover"
                />
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <Field label="Name" value={a.driver} />
                  <Field label="Mobile" value={a.driverPhone} mono />
                  <Field label="Licence" value={a.license} mono />
                  <Field label="Previous visits" value="14 · last 22 Jul 2026" />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Vendor & purchase order"
              icon={Building2}
              actions={
                <Button variant="ghost" size="sm" className="rounded-lg" asChild>
                  <Link to="/purchase-order">
                    Open PO <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Vendor" value={a.vendor} />
                <Field label="Vendor code" value={a.vendorCode} mono />
                <Field label="PO number" value={a.po} mono />
                <Field label="PO value" value={a.poValue} />
                <Field label="Material" value={a.material} />
                <Field label="Expected delivery" value="31 Jul 2026" />
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Uploaded documents" description="Attached at the gate by security" icon={Paperclip}>
            <div className="grid gap-3 sm:grid-cols-2">
              {docs.map((d) => (
                <button
                  key={d.name}
                  onClick={() => toast.info("Opening document", { description: d.name })}
                  className="flex items-center gap-3 rounded-2xl border border-border/70 p-3 text-left transition-colors hover:border-primary/30 hover:bg-primary-soft"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                    <FileText className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{d.name}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {d.size} · {d.by}
                    </span>
                  </span>
                  <Download className="size-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <Card className="gap-0 rounded-2xl border-border/70 p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-teal-soft text-teal">
                <QrCode className="size-[18px]" />
              </span>
              <div>
                <p className="text-sm font-semibold">Gate pass QR</p>
                <p className="text-[11px] text-muted-foreground">Scan at dock to confirm docking</p>
              </div>
            </div>
            <div className="mt-4 grid place-items-center rounded-2xl bg-muted/50 p-4">
              <svg viewBox="0 0 21 21" className="size-32" shapeRendering="crispEdges" aria-label="Gate pass QR code">
                {Array.from({ length: 21 }).map((_, y) =>
                  Array.from({ length: 21 }).map((__, x) => {
                    const finder =
                      (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)
                        ? (x % 6 === 0 || y % 6 === 0 || (x > 1 && x < 5 && y > 1 && y < 5)) &&
                          !(x === 7 || y === 7)
                        : ((x * 7 + y * 13 + (x ^ y)) % 3 === 0);
                    return finder ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" className="fill-foreground" /> : null;
                  }),
                )}
              </svg>
            </div>
            <p className="mt-3 text-center font-mono text-xs text-muted-foreground">{a.gateEntryNo}</p>
          </Card>

          <SectionCard title="Security remarks" icon={ShieldCheck}>
            <p className="text-sm leading-relaxed text-muted-foreground">{a.remarks}</p>
            <div className="mt-4 grid gap-3">
              <Field label="Cleared by" value={a.securityGuard} />
              <Field label="Clearance time" value="09:12 · 31 Jul 2026" />
              <Field label="Exception flags" value="None" />
            </div>
          </SectionCard>

          <SectionCard title="Gate timeline" icon={Clock3}>
            <Timeline items={gateTimeline} />
          </SectionCard>
        </div>
      </div>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "accept" && `Accept arrival ${a.truckNo}?`}
              {confirm === "reject" && `Reject arrival ${a.truckNo}?`}
              {confirm === "hold" && `Place ${a.truckNo} on hold?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "accept" &&
                "You will continue to vehicle, driver and purchase order verification before assigning a dock."}
              {confirm === "reject" && "The vehicle is turned away and the vendor plus buyer are notified immediately."}
              {confirm === "hold" && "The vehicle is moved to holding bay B and the vendor is asked for missing paperwork."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl"
              onClick={() => {
                if (confirm === "accept") {
                  toast.success("Arrival accepted", { description: "Continue with vehicle verification." });
                  navigate({ to: "/vehicle-verification" });
                } else if (confirm === "reject") {
                  toast.error("Arrival rejected", { description: `${a.truckNo} turned away at Gate 2.` });
                  navigate({ to: "/notifications" });
                } else {
                  toast.warning("Arrival placed on hold", { description: "Moved to holding bay B." });
                  navigate({ to: "/notifications" });
                }
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
