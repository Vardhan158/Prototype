import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  Download,
  FileText,
  PauseCircle,
  Phone,
  PlayCircle,
  Truck,
  Warehouse,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  EmptyState,
  Field,
  PageHeader,
  PriorityPill,
  StatusPill,
  Tone,
} from "@/apps/receiving-hub/components/wms/primitives";
import { AssignDockDialog, ConfirmDialog } from "@/apps/receiving-hub/components/wms/dialogs";
import { DocumentViewerDialog } from "@/apps/receiving-hub/components/wms/DocumentViewer";
import { useWms } from "@/apps/receiving-hub/lib/wms-store";
import { currency } from "@/apps/receiving-hub/lib/wms-data";

export const Route = createFileRoute("/receiving-hub/queue/$id")({
  head: () => ({
    meta: [
      { title: "Receiving Details | AXIOM WMS Inbound" },
      {
        name: "description",
        content:
          "Truck, driver, vendor, purchase order, ASN, expected materials, documents and receiving timeline for an inbound shipment.",
      },
      { property: "og:title", content: "Receiving Details | AXIOM WMS Inbound" },
      {
        property: "og:description",
        content: "Full inbound shipment dossier before receiving starts.",
      },
    ],
  }),
  component: ReceivingDetails,
});

function ReceivingDetails() {
  const { id } = Route.useParams();
  const { state, dispatch } = useWms();
  const navigate = useNavigate();
  const shipment = state.shipments.find((s) => s.id === id);
  const [dockOpen, setDockOpen] = useState(false);
  const [reject, setReject] = useState(false);
  const [hold, setHold] = useState(false);
  const [doc, setDoc] = useState<string | null>(null);

  if (!shipment) {
    return (
      <Card className="elevated-card mx-auto max-w-xl">
        <EmptyState
          icon={Truck}
          title="Shipment not found"
          body={`No inbound shipment matches ${id} in the selected warehouse. It may have been archived after GRN posting.`}
          action={
            <Button asChild>
              <Link to="/receiving-hub/queue">Back to receiving queue</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  const expectedUnits = shipment.lines.reduce((a, l) => a + l.expected, 0);

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title={`${shipment.truckNo} Â· ${shipment.vendor}`}
        subtitle={`${shipment.id} Â· ${shipment.po} Â· ${shipment.asn} Â· Gate entry ${shipment.gateEntry}`}
        crumbs={[
          { label: "Inbound", to: "/receiving-hub" },
          { label: "Receiving Queue", to: "/receiving-hub/queue" },
          { label: shipment.id },
        ]}
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate({ to: "/receiving-hub/queue" })}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Queue
            </Button>
            <Button variant="outline" onClick={() => setHold(true)}>
              <PauseCircle className="mr-2 h-4 w-4" /> Hold
            </Button>
            <Button variant="outline" className="text-destructive" onClick={() => setReject(true)}>
              <Ban className="mr-2 h-4 w-4" /> Reject
            </Button>
            {!shipment.dock ? (
              <Button onClick={() => setDockOpen(true)}>
                <Warehouse className="mr-2 h-4 w-4" /> Assign dock
              </Button>
            ) : (
              <Button
                onClick={() => {
                  dispatch({
                    type: "status",
                    id: shipment.id,
                    status: "Receiving Started",
                    note: "Receiving started at dock " + shipment.dock,
                  });
                  toast.success("Receiving started", {
                    description: `${shipment.truckNo} at dock ${shipment.dock}`,
                  });
                  navigate({ to: "/receiving-hub/receiving/$id", params: { id: shipment.id } });
                }}
              >
                <PlayCircle className="mr-2 h-4 w-4" /> Start receiving
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card className="elevated-card">
            <CardHeader className="flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">Truck &amp; driver information</CardTitle>
                <CardDescription>
                  Verified at gate against e-way bill and transporter manifest
                </CardDescription>
              </div>
              <StatusPill status={shipment.status} />
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-3">
              <Field label="Truck number" value={shipment.truckNo} mono />
              <Field label="Driver" value={shipment.driver} />
              <Field
                label="Driver contact"
                value={
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-muted-foreground" /> {shipment.driverPhone}
                  </span>
                }
              />
              <Field label="Transporter" value={shipment.transporter} />
              <Field label="Seal number" value={shipment.sealNo} mono />
              <Field label="Weighbridge" value={shipment.vehicleWeight} />
              <Field label="Arrival" value={shipment.arrival} mono />
              <Field label="Appointment window" value={shipment.appointment} mono />
              <Field label="Dock" value={shipment.dock ?? "Unassigned"} mono />
              <Field label="Pallets" value={shipment.pallets} mono />
              <Field label="Cartons" value={shipment.cartons} mono />
              <Field label="Boxes" value={shipment.boxes} mono />
            </CardContent>
          </Card>

          <Card className="elevated-card">
            <CardHeader>
              <CardTitle className="text-base">Vendor &amp; purchase order</CardTitle>
              <CardDescription>Contract terms pulled from procurement master</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-3">
              <Field label="Vendor" value={shipment.vendor} />
              <Field label="Vendor code" value={shipment.vendorCode} mono />
              <Field label="Purchase order" value={shipment.po} mono />
              <Field label="PO value" value={currency(shipment.poValue)} mono />
              <Field label="ASN reference" value={shipment.asn} mono />
              <Field label="Payment terms" value="Net 45 Â· 2% early settlement" />
              <Field label="Inco terms" value="FOR Destination" />
              <Field
                label="Tolerance allowed"
                value={`${state.settings.qtyTolerance}% over/under`}
                mono
              />
              <Field label="Warehouse" value={shipment.warehouse} mono />
            </CardContent>
          </Card>

          <Card className="elevated-card">
            <Tabs defaultValue="materials">
              <CardHeader className="pb-3">
                <TabsList className="w-full justify-start bg-surface-2">
                  <TabsTrigger value="materials">Expected materials</TabsTrigger>
                  <TabsTrigger value="docs">Documents ({shipment.documents.length})</TabsTrigger>
                  <TabsTrigger value="compliance">Compliance</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="materials" className="mt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-surface-2/70 hover:bg-surface-2/70">
                          <TableHead>Material</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Expected</TableHead>
                          <TableHead>UoM</TableHead>
                          <TableHead>Control</TableHead>
                          <TableHead>Storage</TableHead>
                          <TableHead className="text-right">Line value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {shipment.lines.map((l) => (
                          <TableRow key={l.id}>
                            <TableCell className="num text-xs font-semibold">{l.code}</TableCell>
                            <TableCell className="text-sm">{l.name}</TableCell>
                            <TableCell className="num text-right text-sm">
                              {l.expected.toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell className="text-xs">{l.uom}</TableCell>
                            <TableCell className="space-x-1">
                              {l.serialManaged && <Tone tone="info">Serial</Tone>}
                              {l.batchManaged && <Tone tone="accent">Batch</Tone>}
                              {!l.serialManaged && !l.batchManaged && (
                                <Tone tone="muted">Qty only</Tone>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {l.storageCondition}
                            </TableCell>
                            <TableCell className="num text-right text-sm">
                              {currency(l.expected * l.unitPrice)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-2/60 px-4 py-3 text-sm">
                    <span className="text-muted-foreground">
                      {shipment.lines.length} line(s) Â· {expectedUnits.toLocaleString("en-IN")}{" "}
                      expected units
                    </span>
                    <span className="num font-semibold">{currency(shipment.poValue)}</span>
                  </div>
                </TabsContent>

                <TabsContent value="docs" className="mt-0 space-y-2">
                  {shipment.documents.map((d) => (
                    <div
                      key={d.name}
                      className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface-2/50 p-3"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{d.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {d.type} Â· {d.size}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setDoc(d.name)}>
                        <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toast.success(`${d.name} downloaded`)}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="compliance" className="mt-0 grid gap-5 sm:grid-cols-2">
                  <Field label="E-Way bill" value="331002884 Â· Valid till 02 Aug 2026" />
                  <Field label="GST verification" value="27AAACB1234M1ZP Â· Active" />
                  <Field label="Vendor quality rating" value="A Â· 96% OTIF over 12 months" />
                  <Field label="Hazmat classification" value="Not applicable" />
                  <Field
                    label="Cold chain data logger"
                    value={
                      shipment.lines.some((l) => l.storageCondition.includes("Cold"))
                        ? "Required â€” logger #CL-8842"
                        : "Not required"
                    }
                  />
                  <Field label="Insurance cover" value="Marine cargo Â· policy MC-77120" />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="elevated-card">
            <CardHeader>
              <CardTitle className="text-base">Shipment timeline</CardTitle>
              <CardDescription>Every state transition with actor attribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-5 border-l border-border pl-5">
                {shipment.timeline.map((t, i) => (
                  <li key={i} className="relative">
                    <span
                      className={`absolute -left-[1.6rem] top-1 h-3 w-3 rounded-full ring-2 ring-card ${
                        i === shipment.timeline.length - 1
                          ? "animate-pulse-ring bg-success"
                          : "bg-primary/50"
                      }`}
                    />
                    <p className="text-sm font-medium leading-snug">{t.label}</p>
                    <p className="num mt-0.5 text-[0.7rem] text-muted-foreground">{t.at}</p>
                    <p className="text-xs text-muted-foreground">{t.actor}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card className="elevated-card">
            <CardHeader>
              <CardTitle className="text-base">Priority &amp; SLA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Priority</span>
                <PriorityPill priority={shipment.priority} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Detention risk</span>
                <Tone tone={shipment.status === "Waiting" ? "warning" : "success"}>
                  {shipment.status === "Waiting" ? "42 min to free window" : "Within window"}
                </Tone>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Unload SLA</span>
                <span className="num text-sm font-semibold">90 min</span>
              </div>
              {shipment.status === "Discrepancy" && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive-soft p-3 text-xs text-destructive">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Open discrepancy blocks GRN posting. Manager approval required in Approvals.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AssignDockDialog
        shipmentId={dockOpen ? shipment.id : null}
        onClose={() => setDockOpen(false)}
      />
      <DocumentViewerDialog name={doc} onClose={() => setDoc(null)} />
      <ConfirmDialog
        open={reject}
        onOpenChange={setReject}
        title="Reject this consignment?"
        body={`${shipment.truckNo} will be turned away from the yard. Procurement and the vendor receive an automatic rejection note with photo evidence.`}
        cta="Reject consignment"
        destructive
        onConfirm={() => {
          dispatch({
            type: "status",
            id: shipment.id,
            status: "Rejected",
            note: "Consignment rejected at dock",
          });
          toast.error("Consignment rejected", {
            description: "Rejection note RN-88412 generated.",
          });
          setReject(false);
        }}
      />
      <ConfirmDialog
        open={hold}
        onOpenChange={setHold}
        title="Place shipment on hold?"
        body="Receiving pauses and the dock reservation is retained for 60 minutes. Yard marshal will be notified."
        cta="Place on hold"
        onConfirm={() => {
          dispatch({
            type: "status",
            id: shipment.id,
            status: "On Hold",
            note: "Shipment placed on hold",
          });
          toast.warning("Shipment on hold");
          setHold(false);
        }}
      />
    </div>
  );
}
