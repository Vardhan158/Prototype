import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/apps/supplier-flow/components/page-parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { approvalMatrix } from "@/apps/supplier-flow/data/procurement";

export const Route = createFileRoute("/supplier-flow/settings")({
  head: () => ({
    meta: [
      { title: "Procurement Settings | AxisWMS" },
      { name: "description", content: "Configure approval matrix, notifications, numbering series and integration settings." },
      { property: "og:title", content: "Procurement Settings | AxisWMS" },
      { property: "og:description", content: "Administration for approval thresholds, notifications and integrations." },
    ],
  }),
  component: Settings,
});

const notifications = [
  "Supplier approved", "Supplier blocked", "PO submitted", "PO approved", "PO rejected",
  "ASN created", "ASN submitted", "Shipment delayed", "Vendor rating updated",
];

function Settings() {
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        breadcrumbs={[{ label: "Home", to: "/supplier-flow" }, { label: "Settings" }]}
        title="Procurement settings"
        subtitle="Organisation-wide configuration for approvals, notifications, numbering and integrations"
        actions={<Button onClick={() => toast.success("Settings saved")}>Save changes</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Approval matrix" description="Delegation of authority by order value" bodyClassName="p-0">
          <Table>
            <TableHeader><TableRow className="bg-muted/50"><TableHead>Value band</TableHead><TableHead className="hidden sm:table-cell">Levels</TableHead><TableHead className="text-right">SLA</TableHead></TableRow></TableHeader>
            <TableBody>
              {approvalMatrix.map((m) => (
                <TableRow key={m.band}>
                  <TableCell className="num text-sm">{m.band}</TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{m.l1} · {m.l2} · {m.l3}</TableCell>
                  <TableCell className="text-right text-sm">{m.sla}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>

        <SectionCard title="Notification preferences" description="Email and in-app alerts for procurement events">
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <div key={n} className="flex items-center justify-between">
                <Label className="text-sm font-normal">{n}</Label>
                <Switch defaultChecked={i % 4 !== 3} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Numbering series">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label className="text-xs">Purchase order prefix</Label><Input className="mt-1.5" defaultValue="PO-2026-" /></div>
            <div><Label className="text-xs">ASN prefix</Label><Input className="mt-1.5" defaultValue="ASN-2026-" /></div>
            <div><Label className="text-xs">Supplier code prefix</Label><Input className="mt-1.5" defaultValue="SUP-" /></div>
            <div><Label className="text-xs">Next sequence</Label><Input className="mt-1.5" defaultValue="004942" /></div>
          </div>
        </SectionCard>

        <SectionCard title="Defaults & integrations">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Base currency</Label>
              <Select defaultValue="INR"><SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{["INR", "USD", "EUR"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Default payment terms</Label>
              <Select defaultValue="Net 30 Days"><SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{["Net 15 Days", "Net 30 Days", "Net 45 Days", "Net 60 Days"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 space-y-3 rounded-lg border p-3">
              {["Auto-notify warehouse & security on ASN submit", "Block PO creation for non-approved suppliers", "Require MTC upload for raw material receipts", "Enforce three-way match before payment"].map((f) => (
                <div key={f} className="flex items-center justify-between gap-3">
                  <Label className="text-sm font-normal">{f}</Label>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
