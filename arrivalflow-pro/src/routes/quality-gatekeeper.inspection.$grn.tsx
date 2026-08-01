import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, FileText, Play, Truck, Package, ShieldCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, PriorityPill, SectionCard, StatusBadge, Timeline, EmptyState } from "@/apps/quality-gatekeeper/components/wms/bits";
import { PhotoGallery } from "@/apps/quality-gatekeeper/components/wms/PhotoGallery";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PHOTOS } from "@/apps/quality-gatekeeper/lib/wms-data";
import { actions, useGrn } from "@/apps/quality-gatekeeper/lib/wms-store";
import { toast } from "sonner";

export const Route = createFileRoute("/quality-gatekeeper/inspection/$grn")({
  head: () => ({
    meta: [
      { title: "Inspection Details — AXIOM WMS Quality" },
      { name: "description", content: "GRN inspection details: vehicle, vendor, purchase order, material lines, documents and receiving timeline." },
      { property: "og:title", content: "Inspection Details — AXIOM WMS Quality" },
      { property: "og:description", content: "Vehicle, vendor, PO, material lines, documents and receiving timeline for a GRN." },
    ],
  }),
  component: InspectionDetails,
});

function InspectionDetails() {
  const { grn: id } = useParams({ from: "/quality-gatekeeper/inspection/$grn" });
  const grn = useGrn(id);
  const navigate = useNavigate();

  if (!grn) {
    return (
      <EmptyState
        icon={<Package className="h-6 w-6" />}
        title="GRN not found"
        description="This goods receipt is not available in the current warehouse context. It may have been archived or belongs to another plant."
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/quality-gatekeeper/queue">Back to queue</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5">
        <Link to="/quality-gatekeeper/queue">
          <ArrowLeft className="h-4 w-4" /> Inspection Queue
        </Link>
      </Button>

      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="num truncate font-mono text-2xl font-bold sm:text-3xl">{grn.grn}</h1>
            <PriorityPill priority={grn.priority} />
            <StatusBadge status={grn.status} />
          </div>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {grn.vendor} · {grn.po} · {grn.plant}
          </p>
        </div>
        <Button
          size="lg"
          className="shrink-0 rounded-xl"
          onClick={() => {
            actions.start(grn.id);
            toast.success("Inspection started", { description: `${grn.grn} locked to your inspector queue.` });
            navigate({ to: "/quality-gatekeeper/inspect/$grn", params: { grn: grn.id } });
          }}
        >
          <Play className="h-4 w-4" /> Start Inspection
        </Button>
      </header>

      <div className="grid gap-5 xl:grid-cols-3">
        <SectionCard className="xl:col-span-2" title="Vehicle & dock details" description="Captured at gate entry by security scanner">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            <Field label="Truck number" value={grn.truck} mono />
            <Field label="Driver" value={grn.driver} />
            <Field label="Dock" value={grn.dock} />
            <Field label="Arrival time" value={grn.arrival} />
            <Field label="ASN" value={grn.asn} mono />
            <Field label="Packages" value={`${grn.packages} pkg`} />
            <Field label="Total quantity" value={`${grn.qty.toLocaleString()} ${grn.uom}`} />
            <Field label="Staging bin" value={grn.storageLocation} mono />
          </div>
        </SectionCard>

        <SectionCard title="Vendor & purchase order" description="Master data from SAP MM">
          <div className="grid grid-cols-2 gap-5">
            <Field label="Vendor" value={grn.vendor} />
            <Field label="Vendor code" value={grn.vendorCode} mono />
            <Field label="Purchase order" value={grn.po} mono />
            <Field label="Inspection type" value={grn.inspectionType} />
            <div className="col-span-2">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Vendor quality rating</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${grn.vendorRating}%`,
                      background: grn.vendorRating >= 90 ? "var(--success)" : grn.vendorRating >= 75 ? "var(--warning)" : "var(--destructive)",
                    }}
                  />
                </div>
                <span className="num text-sm font-bold">{grn.vendorRating}%</span>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Material lines" description={`${grn.lines.length} line item(s) on this goods receipt`}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Material code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Serial</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="text-right">Expected</TableHead>
                <TableHead className="text-right">Received</TableHead>
                <TableHead className="text-right">Variance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grn.lines.map((l) => (
                <TableRow key={l.code} className="cursor-pointer" onClick={() => navigate({ to: "/quality-gatekeeper/inspect/$grn", params: { grn: grn.id } })}>
                  <TableCell className="num font-mono text-xs font-semibold text-primary">{l.code}</TableCell>
                  <TableCell className="text-xs">{l.name}</TableCell>
                  <TableCell className="num font-mono text-xs">{l.batch}</TableCell>
                  <TableCell className="num font-mono text-xs">{l.serial}</TableCell>
                  <TableCell className="text-xs">{l.expiry}</TableCell>
                  <TableCell className="num text-right text-xs">{l.expected.toLocaleString()}</TableCell>
                  <TableCell className="num text-right text-xs font-semibold">{l.received.toLocaleString()}</TableCell>
                  <TableCell className={`num text-right text-xs font-semibold ${l.received - l.expected < 0 ? "text-destructive" : "text-success"}`}>
                    {l.received - l.expected}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-3">
        <SectionCard title="Documents" description="Attached at goods receipt posting">
          <ul className="space-y-2">
            {grn.documents.map((d) => (
              <li key={d.name} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-info-soft text-primary">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{d.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {d.type} · {d.size}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info("Opening PDF viewer", { description: d.name })}>
                  <Download className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Receiving photos" description="Captured at unloading">
          <PhotoGallery
            className="grid-cols-2 lg:grid-cols-2"
            photos={[
              { src: PHOTOS.overall, label: "Overall shipment", meta: `${grn.dock} · ${grn.arrival}` },
              { src: PHOTOS.label, label: "Carton label", meta: `${grn.lines[0]?.code ?? ""} · label verification` },
            ]}
          />
        </SectionCard>

        <SectionCard title="Timeline" description="Live event log">
          <Timeline items={grn.timeline} />
        </SectionCard>
      </div>

      <div className="glass-panel grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl p-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-info-soft text-primary">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Quality disposition required</p>
          <p className="truncate text-xs text-muted-foreground">
            Stock is blocked in {grn.storageLocation} until inspection is completed and approved.
          </p>
        </div>
        <Button variant="outline" className="shrink-0 rounded-xl" onClick={() => navigate({ to: "/quality-gatekeeper/inspect/$grn", params: { grn: grn.id } })}>
          <Truck className="h-4 w-4" /> Open inspection
        </Button>
      </div>
    </div>
  );
}
