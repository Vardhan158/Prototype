import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";

import { PageHeader } from "@master/components/masters/PageHeader";
import { Badge } from "@master/components/ui/badge";
import { Button } from "@master/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@master/components/ui/card";
import { Input } from "@master/components/ui/input";
import { Label } from "@master/components/ui/label";
import { Separator } from "@master/components/ui/separator";
import { Switch } from "@master/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@master/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/master-core/settings")({
  head: () => ({
    meta: [
      { title: "MDM Settings — Meridia ERP" },
      {
        name: "description",
        content:
          "Configure numbering series, approval workflows, data quality rules and access roles for master data.",
      },
      { property: "og:title", content: "MDM Settings — Meridia ERP" },
      {
        property: "og:description",
        content: "Governance settings for master data numbering, approvals and validation rules.",
      },
    ],
  }),
  component: SettingsPage,
});

const roles = [
  { role: "Warehouse Gate Entry & Arrival Management", scope: "All masters", create: true, edit: true, del: true, approve: true },
  { role: "Manager", scope: "Assigned masters", create: true, edit: true, del: false, approve: true },
  { role: "Editor", scope: "Assigned masters", create: true, edit: true, del: false, approve: false },
  { role: "Viewer", scope: "Read only", create: false, edit: false, del: false, approve: false },
];

const series = [
  { entity: "Supplier", prefix: "SUP-", next: "1013", reset: "Never" },
  { entity: "Customer", prefix: "CUS-", next: "2011", reset: "Never" },
  { entity: "Item", prefix: "ITM-", next: "3013", reset: "Never" },
  { entity: "Warehouse", prefix: "WH-", next: "07", reset: "Never" },
  { entity: "Employee", prefix: "EMP-", next: "4011", reset: "Yearly" },
  { entity: "Vehicle", prefix: "VEH-", next: "5007", reset: "Never" },
];

function SettingsPage() {
  return (
    <div className="min-h-full">
      <PageHeader
        crumbs={[{ label: "Master Data Management", to: "/master-core/" }, { label: "Settings" }]}
        icon={<SettingsIcon className="h-5 w-5" />}
        title="Master Data Settings"
        description="Numbering series, validation rules, approval workflow and role-based access."
      />
      <div className="p-4 sm:p-6">
        <Tabs defaultValue="numbering">
          <TabsList>
            <TabsTrigger value="numbering">Numbering</TabsTrigger>
            <TabsTrigger value="quality">Data quality</TabsTrigger>
            <TabsTrigger value="access">Access control</TabsTrigger>
          </TabsList>

          <TabsContent value="numbering" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Numbering series</CardTitle>
                <CardDescription>
                  Auto-generated codes applied when a new master record is created.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {series.map((s) => (
                  <div
                    key={s.entity}
                    className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-end"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{s.entity}</p>
                      <p className="text-xs text-muted-foreground">Reset: {s.reset}</p>
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Prefix</Label>
                      <Input defaultValue={s.prefix} className="h-9 w-28" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Next number</Label>
                      <Input defaultValue={s.next} className="num h-9 w-28" />
                    </div>
                    <Button variant="outline" onClick={() => toast.success(`${s.entity} series updated`)}>
                      Save
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Validation rules</CardTitle>
                <CardDescription>Applied at record creation and bulk import.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  ["Block duplicate codes", "Prevents saving a record with an existing code."],
                  ["Mandatory tax identifiers", "Requires GST / VAT numbers on trading partners."],
                  ["Validate email and phone formats", "Rejects malformed contact details."],
                  ["Warn on expiring certifications", "Flags certificates expiring within 60 days."],
                  ["Require approval before activation", "New records stay in Draft until approved."],
                ].map(([title, desc], i) => (
                  <div key={title} className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{title}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <Switch defaultChecked={i !== 4} className="shrink-0" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Approval workflow</CardTitle>
                <CardDescription>Sequential approval chain for master changes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  ["Step 1 — Data Steward", "Completeness and duplicate check"],
                  ["Step 2 — Department Manager", "Business validation"],
                  ["Step 3 — Finance", "Tax and payment terms review"],
                ].map(([step, desc]) => (
                  <div key={step} className="rounded-lg border border-border p-4">
                    <p className="text-sm font-medium">{step}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                ))}
                <Separator />
                <Button onClick={() => toast.success("Workflow saved")}>Save workflow</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Role based access</CardTitle>
                <CardDescription>Permissions granted per master data role.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {roles.map((r) => (
                  <div
                    key={r.role}
                    className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{r.role}</p>
                      <p className="text-xs text-muted-foreground">{r.scope}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {r.create && <Badge variant="secondary">Create</Badge>}
                      {r.edit && <Badge variant="secondary">Edit</Badge>}
                      {r.del && <Badge variant="secondary">Delete</Badge>}
                      {r.approve && <Badge variant="secondary">Approve</Badge>}
                      {!r.create && !r.edit && <Badge variant="outline">View only</Badge>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
