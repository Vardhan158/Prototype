import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Truck,
  Building2,
  FileText,
  Package,
  PlayCircle,
  Lock,
  XCircle,
  Download,
  CheckCircle2,
  Clock,
  MapPin,
  Printer,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader, SectionCard } from "@/apps/quality-gatekeeper/components/qm/Primitives";
import { StatusPill } from "@/apps/quality-gatekeeper/components/qm/StatusPill";
import { getInspection, priorityTone, statusTone } from "@/apps/quality-gatekeeper/lib/qm-data";

export const Route = createFileRoute("/quality-gatekeeper/queue/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} Â· Inspection Details` },
      {
        name: "description",
        content: `Receiving, vendor, document and material line details for inspection ${params.id}.`,
      },
      { property: "og:title", content: `${params.id} Â· Inspection Details` },
      {
        property: "og:description",
        content: "GRN lot detail with documents, timeline and quantity reconciliation.",
      },
    ],
  }),
  component: Details,
});

const timeline = [
  { t: "06:42", label: "Truck arrived at gate", who: "Gate Security Â· GATE-01", done: true },
  {
    t: "06:58",
    label: "Unloading completed at DOCK-04",
    who: "Store Keeper Â· Rashid N.",
    done: true,
  },
  {
    t: "07:10",
    label: "Documents validated (Module 03)",
    who: "Procurement Â· Auto-check",
    done: true,
  },
  { t: "07:35", label: "GRN approved", who: "Warehouse Manager Â· Omar Siddiqui", done: true },
  { t: "07:52", label: "Added to inspection queue", who: "System Â· QM Engine", done: true },
  { t: "08:05", label: "Inspector assigned", who: "Quality Manager Â· Layla Hassan", done: true },
  { t: "â€”", label: "Inspection execution", who: "Pending", done: false },
  { t: "â€”", label: "Disposition & inventory release", who: "Pending", done: false },
];

const documents = [
  { name: "Delivery Note DN-77120.pdf", size: "412 KB", status: "Verified" },
  { name: "Commercial Invoice INV-2026-8871.pdf", size: "289 KB", status: "Verified" },
  { name: "Packing List PL-88231.pdf", size: "156 KB", status: "Verified" },
  { name: "Mill Test Certificate EN10204 3.1.pdf", size: "2.1 MB", status: "Verified" },
  { name: "Certificate of Conformity.pdf", size: "640 KB", status: "Pending review" },
];

function Details() {
  const { id } = Route.useParams();
  const insp = getInspection(id);
  const navigate = useNavigate();
  const [holdOpen, setHoldOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Quality", to: "/quality-gatekeeper" },
          { label: "Inspection Queue", to: "/quality-gatekeeper/queue" },
          { label: insp.id },
        ]}
        eyebrow="Screen 03"
        title={insp.material}
        description={`${insp.id} Â· ${insp.grn} Â· ${insp.po} Â· received ${insp.receivedOn}`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Inspection dossier sent to printer LP-02")}
            >
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button variant="outline" size="sm" onClick={() => setHoldOpen(true)}>
              <Lock className="mr-2 h-4 w-4" /> Hold
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={() => setRejectOpen(true)}
            >
              <XCircle className="mr-2 h-4 w-4" /> Reject
            </Button>
            <Button size="sm" asChild>
              <Link to="/quality-gatekeeper/inspection/$id" params={{ id: insp.id }}>
                <PlayCircle className="mr-2 h-4 w-4" /> Start Inspection
              </Link>
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusPill tone={statusTone[insp.status]}>{insp.status}</StatusPill>
        <StatusPill tone={priorityTone[insp.priority]} dot={false}>
          {insp.priority} priority
        </StatusPill>
        <StatusPill tone="warning">SLA {insp.slaHours}h Â· 1h 12m remaining</StatusPill>
        <StatusPill tone="brand" dot={false}>
          Lot value SAR {insp.value.toLocaleString()}
        </StatusPill>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <SectionCard title="Vendor" description={insp.vendorCode}>
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </span>
                <div className="min-w-0 text-xs">
                  <p className="truncate font-semibold">{insp.vendor}</p>
                  <p className="text-muted-foreground">Quality score 96 Â· Approved supplier</p>
                  <p className="text-muted-foreground">
                    Contract QA clause: EN 10204 3.1 mandatory
                  </p>
                </div>
              </div>
            </SectionCard>
            <SectionCard title="Inbound transport" description={insp.dock}>
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-info/10 text-info">
                  <Truck className="h-5 w-5" />
                </span>
                <div className="min-w-0 text-xs">
                  <p className="num truncate font-semibold">{insp.truck}</p>
                  <p className="text-muted-foreground">
                    Driver: Yusuf Kareem Â· Seal SL-99231 intact
                  </p>
                  <p className="text-muted-foreground">Arrived 06:42 Â· Unloaded 06:58</p>
                </div>
              </div>
            </SectionCard>
          </div>

          <Tabs defaultValue="materials">
            <TabsList className="w-full justify-start overflow-x-auto rounded-xl">
              <TabsTrigger value="materials">Material lines</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="quantity">Quantity reconciliation</TabsTrigger>
            </TabsList>

            <TabsContent value="materials" className="mt-3">
              <SectionCard padded={false}>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Material</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead>Serial</TableHead>
                        <TableHead className="text-right">Expected</TableHead>
                        <TableHead className="text-right">Received</TableHead>
                        <TableHead className="text-right">Variance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {insp.lines.map((l) => {
                        const v = l.received - l.expected;
                        return (
                          <TableRow key={l.code}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-medium">{l.name}</p>
                                  <p className="num text-[10px] text-muted-foreground">{l.code}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="num text-xs">{l.batch}</TableCell>
                            <TableCell className="num text-xs">{l.serial}</TableCell>
                            <TableCell className="num text-right text-xs">{l.expected}</TableCell>
                            <TableCell className="num text-right text-xs">{l.received}</TableCell>
                            <TableCell className="text-right">
                              <StatusPill tone={v === 0 ? "success" : "danger"} dot={false}>
                                {v === 0 ? "Match" : `${v} ${l.uom}`}
                              </StatusPill>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </SectionCard>
            </TabsContent>

            <TabsContent value="documents" className="mt-3">
              <SectionCard padded={false}>
                <ul className="divide-y divide-border">
                  {documents.map((d) => (
                    <li
                      key={d.name}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <FileText className="h-4 w-4 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium">{d.name}</p>
                          <p className="text-[10px] text-muted-foreground">{d.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusPill tone={d.status === "Verified" ? "success" : "warning"}>
                          {d.status}
                        </StatusPill>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            </TabsContent>

            <TabsContent value="quantity" className="mt-3">
              <SectionCard>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      l: "Expected (PO)",
                      v: insp.lines.reduce((a, b) => a + b.expected, 0),
                      tone: "brand" as const,
                    },
                    {
                      l: "Received (GRN)",
                      v: insp.lines.reduce((a, b) => a + b.received, 0),
                      tone: "info" as const,
                    },
                    {
                      l: "Variance",
                      v: insp.lines.reduce((a, b) => a + (b.received - b.expected), 0),
                      tone: "danger" as const,
                    },
                  ].map((k) => (
                    <div key={k.l} className="rounded-xl border border-border bg-background/60 p-4">
                      <p className="text-[11px] text-muted-foreground">{k.l}</p>
                      <p className="num mt-1 text-xl font-semibold">{k.v}</p>
                      <StatusPill tone={k.tone} className="mt-2" dot={false}>
                        {insp.uom}
                      </StatusPill>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Tolerance profile: under-delivery Â±2% permitted, over-delivery blocked. Variance
                  triggers automatic short-shipment notice to Procurement.
                </p>
              </SectionCard>
            </TabsContent>
          </Tabs>
        </div>

        <SectionCard title="Receiving timeline" description="Module 03 â†’ Module 05 handover">
          <ol className="relative space-y-4 pl-5">
            <span className="absolute top-1 bottom-1 left-[7px] w-px bg-border" />
            {timeline.map((t) => (
              <li key={t.label} className="relative">
                <span
                  className={`absolute top-0.5 -left-5 grid h-4 w-4 place-items-center rounded-full border-2 ${
                    t.done
                      ? "border-success bg-success text-success-foreground"
                      : "border-border bg-background"
                  }`}
                >
                  {t.done ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                  )}
                </span>
                <p className="text-xs font-medium">{t.label}</p>
                <p className="text-[11px] text-muted-foreground">
                  {t.t} Â· {t.who}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-4 rounded-xl border border-border bg-background/60 p-3 text-[11px]">
            <p className="flex items-center gap-2 font-medium">
              <MapPin className="h-3.5 w-3.5 text-primary" /> Staged at QA-STAGE-04,{" "}
              {insp.warehouse}
            </p>
          </div>
        </SectionCard>
      </div>

      {/* Hold dialog */}
      <Dialog open={holdOpen} onOpenChange={setHoldOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place lot on quality hold</DialogTitle>
            <DialogDescription>
              Blocked stock cannot be putaway or issued. A hold number is generated and inventory is
              flagged in WM.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Hold reason</Label>
              <Select defaultValue="doc">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doc">Missing / invalid documentation</SelectItem>
                  <SelectItem value="dim">Dimensional deviation</SelectItem>
                  <SelectItem value="lab">Laboratory retest pending</SelectItem>
                  <SelectItem value="cnt">Counterfeit suspicion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Blocked quantity</Label>
                <Input defaultValue={insp.qty} className="num" />
              </div>
              <div className="space-y-1.5">
                <Label>Hold location</Label>
                <Select defaultValue="QA-HOLD-A1">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QA-HOLD-A1">QA-HOLD-A1</SelectItem>
                    <SelectItem value="QA-HOLD-A2">QA-HOLD-A2</SelectItem>
                    <SelectItem value="QA-HOLD-B3">QA-HOLD-B3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Remarks</Label>
              <Textarea
                placeholder="Describe the reason for the holdâ€¦"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              {reason.length > 0 && reason.length < 10 && (
                <p className="text-[11px] text-destructive">
                  Remarks must be at least 10 characters.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHoldOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={reason.length < 10}
              onClick={() => {
                setHoldOpen(false);
                toast.success("Quality hold QH-2026-00088 created", {
                  description: "Stock blocked in WM Â· Procurement notified",
                });
                navigate({ to: "/quality-gatekeeper/hold" });
              }}
            >
              Create hold
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Reject lot before inspection?</DialogTitle>
            <DialogDescription>
              Rejecting bypasses inspection execution and raises an NCR immediately. This action is
              irreversible and is recorded in the audit trail.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-[11px]">
            {insp.qty} {insp.uom} of {insp.material} will be quarantined and the vendor scorecard
            will be impacted.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setRejectOpen(false);
                navigate({ to: "/quality-gatekeeper/ncr/new" });
              }}
            >
              Reject & raise NCR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
