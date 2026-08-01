import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Download, FileText, MapPin, Printer, Truck, Warehouse } from "lucide-react";
import { toast } from "sonner";
import { Field, PageHeader, SectionCard, Timeline } from "@/apps/supplier-flow/components/page-parts";
import { StatusBadge } from "@/apps/supplier-flow/components/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getASN } from "@/apps/supplier-flow/data/procurement";

export const Route = createFileRoute("/supplier-flow/asn/$asnId")({
  loader: ({ params }) => {
    if (!getASN(params.asnId)) throw notFound();
    return null;
  },
  head: ({ params }) => {
    const a = getASN(params.asnId);
    if (!a) return { meta: [{ title: "ASN not found | AxisWMS" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: `${a.id} — Advance Shipment Notice | AxisWMS` },
        { name: "description", content: `Shipment ${a.shipmentNo} from ${a.supplier} arriving at ${a.warehouse}.` },
        { property: "og:title", content: `${a.id} — Advance Shipment Notice | AxisWMS` },
        { property: "og:description", content: `${a.packages} packages · ${a.weightKg} kg · ETA ${a.expectedArrival}.` },
      ],
    };
  },
  component: ASNDetail,
});

function ASNDetail() {
  const { asnId } = Route.useParams();
  const a = getASN(asnId)!;
  const [gateOpen, setGateOpen] = useState(false);

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        breadcrumbs={[{ label: "Home", to: "/supplier-flow" }, { label: "ASN", to: "/supplier-flow/asn" }, { label: a.id }]}
        title={a.id}
        subtitle={`${a.supplier} · Shipment ${a.shipmentNo} · ${a.warehouse}`}
        meta={
          <>
            <StatusBadge status={a.status} />
            <span className="num rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium">{a.poId}</span>
            <span className="num rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium">ETA {a.expectedArrival}</span>
          </>
        }
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("Documents pack downloaded")}><Download className="size-4" /> Documents</Button>
            <Button variant="outline" onClick={() => toast.success("Gate pass printed at Gate 1")}><Printer className="size-4" /> Gate pass</Button>
            {["Arrived", "In Transit"].includes(a.status) && <Button onClick={() => setGateOpen(true)}><Warehouse className="size-4" /> Initiate gate entry</Button>}
          </>
        }
      />

      {a.status === "Delayed" && (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-danger-soft p-4">
          <p className="text-sm font-semibold text-destructive">Shipment delayed</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{a.currentLocation}. Revised ETA communicated to warehouse and production planning.</p>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-4">
        <div className="space-y-4 xl:col-span-3">
          <SectionCard title="Shipment tracking" description={a.currentLocation}>
            <Progress value={a.progressPct} className="h-2.5" />
            <ol className="mt-4 grid gap-2 text-xs sm:grid-cols-5">
              {["Despatched", "In transit", "Port / hub", "At gate", "Received"].map((s, i) => (
                <li key={s} className={i <= Math.floor(a.progressPct / 21) ? "font-medium text-primary" : "text-muted-foreground"}>
                  <span className="mb-1 block h-1 rounded-full" style={{ background: i <= Math.floor(a.progressPct / 21) ? "var(--primary)" : "var(--border)" }} />
                  {s}
                </li>
              ))}
            </ol>
          </SectionCard>

          <Tabs defaultValue="shipment">
            <TabsList className="flex-wrap">
              {["shipment", "vehicle", "materials", "documents", "timeline"].map((t) => (
                <TabsTrigger key={t} value={t} className="text-xs capitalize">{t}</TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="shipment" className="mt-4">
              <SectionCard title="Shipment details">
                <dl className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  <Field label="ASN number" value={<span className="num">{a.id}</span>} />
                  <Field label="Purchase order" value={<Link className="text-primary hover:underline" to="/supplier-flow/purchase-orders/$poId" params={{ poId: a.poId }}>{a.poId}</Link>} />
                  <Field label="Shipment number" value={<span className="num">{a.shipmentNo}</span>} />
                  <Field label="Supplier" value={<Link className="text-primary hover:underline" to="/supplier-flow/suppliers/$supplierId" params={{ supplierId: a.supplierId }}>{a.supplier}</Link>} />
                  <Field label="Dispatched on" value={a.dispatchedOn} />
                  <Field label="Expected arrival" value={a.expectedArrival} />
                  <Field label="Warehouse" value={a.warehouse} />
                  <Field label="Gate" value={a.gate} />
                  <Field label="Gross weight" value={`${a.weightKg.toLocaleString("en-IN")} kg`} />
                  <Field label="Volume" value={`${a.volumeCbm} CBM`} />
                  <Field label="Packages" value={a.packages} />
                  <Field label="Invoice" value={<span className="num">{a.invoiceNo}</span>} />
                </dl>
              </SectionCard>
            </TabsContent>

            <TabsContent value="vehicle" className="mt-4 grid gap-4 lg:grid-cols-2">
              <SectionCard title="Vehicle & container">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Field label="Transport company" value={a.transporter} />
                  <Field label="Vehicle number" value={<span className="num">{a.vehicleNo}</span>} />
                  <Field label="Container number" value={<span className="num">{a.containerNo}</span>} />
                  <Field label="E-way bill" value={<span className="num">{a.ewayBill}</span>} />
                </dl>
              </SectionCard>
              <SectionCard title="Driver details">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Field label="Driver name" value={a.driverName} />
                  <Field label="Driver phone" value={<span className="num">{a.driverPhone}</span>} />
                  <Field label="Licence number" value={<span className="num">{a.driverLicense}</span>} />
                  <Field label="Delivery challan" value={<span className="num">{a.deliveryChallan}</span>} />
                </dl>
                <p className="mt-3 flex items-center gap-2 rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" /> Driver details are shared with plant security for gate verification.
                </p>
              </SectionCard>
            </TabsContent>

            <TabsContent value="materials" className="mt-4">
              <SectionCard title="Material summary" bodyClassName="p-0">
                <Table>
                  <TableHeader><TableRow className="bg-muted/50"><TableHead>Material</TableHead><TableHead className="hidden sm:table-cell">Batch / heat</TableHead><TableHead className="text-right">Quantity</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {a.materials.map((m) => (
                      <TableRow key={m.material}>
                        <TableCell><p className="text-sm font-medium">{m.description}</p><p className="num text-xs text-muted-foreground">{m.material}</p></TableCell>
                        <TableCell className="num hidden sm:table-cell text-sm">{m.batch}</TableCell>
                        <TableCell className="num text-right text-sm font-medium">{m.qty.toLocaleString("en-IN")} {m.uom}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </SectionCard>
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <SectionCard title="Shipping documents" bodyClassName="p-0">
                <div className="divide-y">
                  {a.documents.map((d) => (
                    <div key={d.name} className="flex items-center gap-3 px-4 py-3">
                      <FileText className="size-4 text-muted-foreground" />
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{d.name}</p><p className="text-xs text-muted-foreground">{d.type} · {d.size}</p></div>
                      <StatusBadge status={d.status} />
                      <Button size="sm" variant="ghost" onClick={() => toast.success("Download started")}><Download className="size-4" /></Button>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </TabsContent>

            <TabsContent value="timeline" className="mt-4">
              <SectionCard title="Shipment timeline"><Timeline events={a.timeline} /></SectionCard>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <SectionCard title="Notifications raised">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><Warehouse className="mt-0.5 size-4 text-primary" /> Warehouse team — {a.warehouse.split(" · ")[1]}</li>
              <li className="flex items-start gap-2"><Truck className="mt-0.5 size-4 text-primary" /> Plant security — {a.gate}</li>
              <li className="flex items-start gap-2"><FileText className="mt-0.5 size-4 text-primary" /> Quality inspection queue</li>
            </ul>
          </SectionCard>
          <SectionCard title="Next module">
            <p className="text-sm font-medium">Warehouse Gate Entry & Arrival Management</p>
            <p className="mt-1 text-xs text-muted-foreground">
              On arrival, security verifies driver, e-way bill and seal, then issues a gate pass with weighbridge and dock allocation.
            </p>
            <Button className="mt-3 w-full" variant="outline" onClick={() => setGateOpen(true)}>Handover to gate entry</Button>
          </SectionCard>
        </div>
      </div>

      <Dialog open={gateOpen} onOpenChange={setGateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Initiate gate entry for {a.id}?</DialogTitle>
            <DialogDescription>
              A gate entry request will be created at {a.gate} with driver {a.driverName} and vehicle {a.vehicleNo}. Security will verify documents on arrival.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGateOpen(false)}>Cancel</Button>
            <Button onClick={() => { setGateOpen(false); toast.success("Gate entry request created", { description: "Token TKN-4482 issued · dock D-04 reserved." }); }}>Create gate entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
