import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Save, Trash2, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppShell } from "@/apps/gate-pass-pro/components/wms/AppShell";
import { holdReasons, roles } from "@/apps/gate-pass-pro/lib/wms-data";

export const Route = createFileRoute("/gate-pass-pro/settings")({
  head: () => ({
    meta: [
      { title: "Gate Module Settings — NexusWMS" },
      { name: "description", content: "Configure gates, security users, vehicle types, hold reasons, approval matrix, notifications and OCR thresholds." },
      { property: "og:title", content: "Gate Module Settings — NexusWMS" },
      { property: "og:description", content: "Warehouse Gate Entry & Arrival Management configuration for gate entry operations." },
    ],
  }),
  component: SettingsPage,
});

const gates = [
  { code: "GATE-01", name: "Gate 01 – Inbound", wh: "WH-01 Bhiwandi", lanes: 2, active: true },
  { code: "GATE-02", name: "Gate 02 – Inbound", wh: "WH-02 Hosur", lanes: 1, active: true },
  { code: "GATE-03", name: "Gate 03 – Inbound", wh: "WH-03 Ghaziabad", lanes: 1, active: true },
  { code: "GATE-04", name: "Gate 04 – Outbound", wh: "WH-01 Bhiwandi", lanes: 2, active: false },
];

const users = [
  { id: "SEC-10428", name: "S. Kulkarni", role: "Security Officer", gate: "Gate 01", status: "Active" },
  { id: "SEC-10429", name: "A. Fernandes", role: "Security Officer", gate: "Gate 02", status: "Active" },
  { id: "SEC-10430", name: "R. Nair", role: "Security Officer", gate: "Gate 03", status: "Active" },
  { id: "SUP-2201", name: "M. Deshpande", role: "Security Supervisor", gate: "All gates", status: "Active" },
  { id: "WHM-3310", name: "P. Bhosale", role: "Store Keeper", gate: "WH-01", status: "Active" },
  { id: "ADM-1000", name: "N. Iyer", role: "Warehouse Gate Entry & Arrival Management", gate: "Global", status: "Locked" },
];

const vehicleTypes = ["Trailer 40ft", "Container 32ft MXL", "Truck 24ft", "Truck 22ft", "Truck 19ft", "Tipper 16 Wheeler", "LCV", "Tanker"];

function SettingsPage() {
  const [ocr, setOcr] = useState([92]);

  return (
    <AppShell
      title="Settings"
      subtitle="Warehouse Gate Entry & Arrival Management · gate module configuration"
      actions={<Button onClick={() => toast.success("Configuration saved")}><Save className="mr-2 h-4 w-4" />Save changes</Button>}
    >
      <Tabs defaultValue="gates">
        <TabsList className="flex-wrap">
          <TabsTrigger value="gates">Gates</TabsTrigger>
          <TabsTrigger value="users">Security users</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicle types</TabsTrigger>
          <TabsTrigger value="reasons">Reasons</TabsTrigger>
          <TabsTrigger value="matrix">Approval matrix</TabsTrigger>
          <TabsTrigger value="notify">Notifications</TabsTrigger>
          <TabsTrigger value="ocr">OCR</TabsTrigger>
        </TabsList>

        <TabsContent value="gates" className="pt-4">
          <div className="surface-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50 text-left text-[11px] uppercase text-muted-foreground">
                <tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Gate</th><th className="px-4 py-3">Warehouse</th><th className="px-4 py-3">Lanes</th><th className="px-4 py-3">Active</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {gates.map((g) => (
                  <tr key={g.code}>
                    <td className="px-4 py-3 font-mono text-xs">{g.code}</td>
                    <td className="px-4 py-3 text-xs">{g.name}</td>
                    <td className="px-4 py-3 text-xs">{g.wh}</td>
                    <td className="px-4 py-3 text-xs">{g.lanes}</td>
                    <td className="px-4 py-3"><Switch defaultChecked={g.active} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-border p-4">
              <Button size="sm" variant="outline" onClick={() => toast.success("Gate GATE-05 added")}><Plus className="mr-2 h-4 w-4" />Add gate</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users" className="pt-4">
          <div className="surface-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50 text-left text-[11px] uppercase text-muted-foreground">
                <tr><th className="px-4 py-3">Employee ID</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Assignment</th><th className="px-4 py-3">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 font-mono text-xs">{u.id}</td>
                    <td className="px-4 py-3 text-xs font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-xs">{u.role}</td>
                    <td className="px-4 py-3 text-xs">{u.gate}</td>
                    <td className="px-4 py-3">
                      <Badge className={u.status === "Active" ? "bg-success/15 text-[10px] text-success" : "bg-muted text-[10px] text-muted-foreground"}>{u.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="pt-4">
          <div className="surface-card p-5">
            <div className="flex flex-wrap gap-2">
              {vehicleTypes.map((v) => (
                <span key={v} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs">
                  {v}
                  <button onClick={() => toast.info(`${v} removed from master`)} aria-label={`Remove ${v}`}>
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Input placeholder="Add vehicle type, e.g. Reefer 20ft" className="max-w-xs" />
              <Button variant="outline" onClick={() => toast.success("Vehicle type added")}>Add</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reasons" className="pt-4">
          <div className="surface-card divide-y divide-border">
            {holdReasons.map((r) => (
              <div key={r} className="flex items-center gap-3 p-4">
                <Settings2 className="h-4 w-4 text-muted-foreground" />
                <p className="flex-1 text-xs">{r}</p>
                <Badge className="bg-muted text-[10px] text-muted-foreground">Hold / Reject</Badge>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matrix" className="pt-4">
          <div className="surface-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50 text-left text-[11px] uppercase text-muted-foreground">
                <tr><th className="px-4 py-3">Scenario</th><th className="px-4 py-3">Approver</th><th className="px-4 py-3">Escalation</th><th className="px-4 py-3">SLA</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["Standard PO arrival", "Security Officer", "Security Supervisor", "15 min"],
                  ["No appointment / walk-in", "Security Supervisor", "Warehouse Manager", "30 min"],
                  ["Missing or expired documents", "Security Supervisor", "Procurement Manager", "30 min"],
                  ["Hazardous consignment", "Warehouse Manager", "Asset Manager", "20 min"],
                  ["Blacklisted driver or vehicle", "Warehouse Gate Entry & Arrival Management", "—", "Immediate"],
                ].map((r) => (
                  <tr key={r[0]}>
                    <td className="px-4 py-3 text-xs font-medium">{r[0]}</td>
                    <td className="px-4 py-3 text-xs">{r[1]}</td>
                    <td className="px-4 py-3 text-xs">{r[2]}</td>
                    <td className="px-4 py-3 text-xs">{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="notify" className="pt-4">
          <div className="surface-card divide-y divide-border">
            {[
              "Truck Arrived", "Gate Entry Created", "Gate Entry Approved",
              "Truck On Hold", "Truck Rejected", "Warehouse Accepted", "Receiving Started",
            ].map((n) => (
              <div key={n} className="flex flex-wrap items-center gap-4 p-4">
                <p className="min-w-44 flex-1 text-xs font-medium">{n}</p>
                {["In-app", "Email", "SMS", "Handheld push"].map((ch) => (
                  <label key={ch} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Switch defaultChecked={ch !== "SMS"} /> {ch}
                  </label>
                ))}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">Recipients resolved from role assignment: {roles.join(", ")}.</p>
        </TabsContent>

        <TabsContent value="ocr" className="pt-4">
          <div className="surface-card max-w-2xl space-y-6 p-5">
            <div className="space-y-2">
              <Label className="text-xs">Minimum OCR confidence to auto-accept ({ocr[0]}%)</Label>
              <Slider value={ocr} onValueChange={setOcr} min={70} max={99} step={1} />
              <p className="text-[11px] text-muted-foreground">Below this threshold the officer must confirm the reading manually.</p>
            </div>
            {[
              ["Number plate OCR", "Reads and matches vehicle master"],
              ["Driving licence OCR", "Extracts licence number and expiry"],
              ["Invoice & E-Way Bill OCR", "Extracts PO, value and quantities"],
              ["Auto-flag expired documents", "Blocks approval when a document has expired"],
            ].map(([k, d]) => (
              <div key={k} className="flex items-center justify-between gap-4 rounded-xl border border-border p-3">
                <div><p className="text-xs font-medium">{k}</p><p className="text-[11px] text-muted-foreground">{d}</p></div>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
