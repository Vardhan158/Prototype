import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Upload } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/apps/supplier-flow/components/page-parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { purchaseOrders } from "@/apps/supplier-flow/data/procurement";

export const Route = createFileRoute("/supplier-flow/asn/new")({
  head: () => ({
    meta: [
      { title: "Create ASN | AxisWMS Procurement" },
      { name: "description", content: "Create an advance shipment notice with transport, driver and document details." },
      { property: "og:title", content: "Create ASN | AxisWMS Procurement" },
      { property: "og:description", content: "Advance shipment notice creation with document upload and gate notification." },
    ],
  }),
  component: CreateASN,
});

function CreateASN() {
  const navigate = useNavigate();
  const [po, setPo] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-success-soft text-success"><Check className="size-8" /></span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">ASN submitted</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="num font-medium text-foreground">ASN-2026-002270</span> created against {po || "the selected order"}. Warehouse and plant security have been notified for gate entry.
        </p>
        <div className="mt-6 flex gap-2">
          <Button variant="outline" onClick={() => setDone(false)}>Create another</Button>
          <Button onClick={() => navigate({ to: "/supplier-flow/asn" })}>View shipments</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        breadcrumbs={[{ label: "Home", to: "/supplier-flow" }, { label: "ASN", to: "/supplier-flow/asn" }, { label: "Create" }]}
        title="Create advance shipment notice"
        subtitle="Declare despatch, transport, driver and statutory documents before the truck leaves"
        actions={<Button variant="ghost" asChild><Link to="/supplier-flow/asn">Cancel</Link></Button>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Shipment header">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-xs">Purchase order *</Label>
              <Select value={po} onValueChange={setPo}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select approved PO…" /></SelectTrigger>
                <SelectContent>
                  {purchaseOrders.filter((p) => ["Approved", "Sent to Supplier", "Partially Received"].includes(p.status)).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.id} — {p.supplier}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Shipment number</Label><Input className="mt-1.5" placeholder="SHP-778510" /></div>
            <div><Label className="text-xs">Dispatch date</Label><Input className="mt-1.5" type="date" /></div>
            <div><Label className="text-xs">Expected arrival</Label><Input className="mt-1.5" type="datetime-local" /></div>
            <div><Label className="text-xs">Transport company</Label><Input className="mt-1.5" placeholder="Meridian Logistics & Freight" /></div>
            <div><Label className="text-xs">Packages</Label><Input className="mt-1.5" type="number" placeholder="14" /></div>
            <div><Label className="text-xs">Gross weight (kg)</Label><Input className="mt-1.5" type="number" placeholder="18450" /></div>
          </div>
        </SectionCard>

        <SectionCard title="Vehicle & driver">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label className="text-xs">Vehicle number *</Label><Input className="mt-1.5" placeholder="MH-04-GT-7712" /></div>
            <div><Label className="text-xs">Container number</Label><Input className="mt-1.5" placeholder="HLXU 4482913" /></div>
            <div><Label className="text-xs">Driver name *</Label><Input className="mt-1.5" placeholder="Ramesh Yadav" /></div>
            <div><Label className="text-xs">Driver phone *</Label><Input className="mt-1.5" placeholder="+91 98204 11783" /></div>
            <div><Label className="text-xs">Licence number</Label><Input className="mt-1.5" placeholder="MH0320190044821" /></div>
            <div><Label className="text-xs">E-way bill</Label><Input className="mt-1.5" placeholder="281004471982" /></div>
          </div>
        </SectionCard>

        <SectionCard title="Shipping documents" className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {["Commercial invoice", "Packing list", "Delivery challan", "E-way bill / test certificate"].map((d) => (
              <div key={d} className="rounded-lg border border-dashed p-4 text-center">
                <Upload className="mx-auto size-5 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">{d}</p>
                <Button size="sm" variant="ghost" className="mt-1" onClick={() => toast.success(`${d} uploaded`)}>Upload</Button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => toast.success("ASN draft saved")}>Save draft</Button>
            <Button
              onClick={() => {
                if (!po) {
                  toast.error("Select a purchase order to continue");
                  return;
                }
                setDone(true);
                toast.success("ASN submitted", { description: "Warehouse and security notified." });
              }}
            >
              Submit ASN
            </Button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
