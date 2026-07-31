import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader, SectionCard } from "@/apps/warehouse-flow/components/ui-kit";
import { users, warehouses } from "@/apps/warehouse-flow/data";

export const Route = createFileRoute("/warehouse-flow/settings")({
  head: () => ({
    meta: [
      { title: "Settings — WMS Console" },
      {
        name: "description",
        content:
          "Configure warehouses, approval limits, numbering series, notification rules and user roles for the module.",
      },
      { property: "og:title", content: "Settings — WMS Console" },
      {
        property: "og:description",
        content: "Configure warehouses, approval limits, numbering and notification rules.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Module configuration for warehouses, approvals, numbering and notifications."
        breadcrumbs={[{ label: "Home", to: "/warehouse-flow/" }, { label: "Settings" }]}
        actions={
          <Button onClick={() => toast.success("Settings saved")}>
            <Save className="size-4" /> Save Changes
          </Button>
        }
      />

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 grid gap-4 xl:grid-cols-2">
          <SectionCard title="Organisation" description="Defaults applied to new documents">
            <div className="space-y-4">
              <Field label="Company">
                <Input defaultValue="Northline Industrial Pvt. Ltd." />
              </Field>
              <Field label="Default Warehouse">
                <Select defaultValue="WH-01">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.code} value={w.code}>{w.code} — {w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Currency">
                <Select defaultValue="INR">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR — Indian Rupee (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Time Zone">
                <Select defaultValue="ist">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ist">Asia/Kolkata (IST)</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Document Numbering">
            <div className="space-y-4">
              <Field label="Material Request Series"><Input defaultValue="MR-{YYYY}-#####" className="num" /></Field>
              <Field label="Goods Issue Series"><Input defaultValue="GI-{YYYY}-#####" className="num" /></Field>
              <Field label="Return Series"><Input defaultValue="MRTN-{YYYY}-#####" className="num" /></Field>
              <Field label="Pick List Series"><Input defaultValue="PL-{YYYY}-####" className="num" /></Field>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="approvals" className="mt-4 grid gap-4 xl:grid-cols-2">
          <SectionCard title="Approval Limits" description="Value thresholds per approver role">
            <div className="space-y-4">
              <Field label="Supervisor limit"><Input defaultValue="₹50,000" className="num" /></Field>
              <Field label="Ops Manager limit"><Input defaultValue="₹5,00,000" className="num" /></Field>
              <Field label="Finance limit"><Input defaultValue="Unlimited" className="num" /></Field>
            </div>
          </SectionCard>
          <SectionCard title="Workflow Rules">
            <div className="space-y-1">
              {[
                ["Two-step approval for Critical priority", true],
                ["Auto-approve requests below supervisor limit", false],
                ["Require finance approval above ₹5,00,000", true],
                ["Allow send-back to requester", true],
                ["Block issue when shortage exists", true],
              ].map(([label, on], i) => (
                <div key={String(label)}>
                  {i > 0 && <Separator />}
                  <div className="flex items-center justify-between gap-4 py-3">
                    <span className="text-sm">{label}</span>
                    <Switch defaultChecked={on as boolean} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="warehouses" className="mt-4">
          <SectionCard title="Warehouses" bodyClassName="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60">
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Return Bin</TableHead>
                  <TableHead className="text-right">Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.map((w, i) => (
                  <TableRow key={w.code}>
                    <TableCell className="num text-sm font-semibold">{w.code}</TableCell>
                    <TableCell className="text-sm">{w.name}</TableCell>
                    <TableCell className="num text-sm">RB-0{i + 1}</TableCell>
                    <TableCell className="text-right"><Switch defaultChecked /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <SectionCard title="Notification Rules" description="Choose which workflow events raise alerts">
            <div className="space-y-1">
              {[
                "Request Created",
                "Approval Pending",
                "Request Approved",
                "Inventory Reserved",
                "Pick List Generated",
                "Material Issued",
                "Material Returned",
                "Inspection Pending",
                "Inventory Updated",
                "Low Stock Alert",
              ].map((label, i) => (
                <div key={label}>
                  {i > 0 && <Separator />}
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3">
                    <span className="truncate text-sm">{label}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">Email</span>
                      <Switch defaultChecked={i % 3 !== 0} />
                      <span className="text-xs text-muted-foreground">In-app</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <SectionCard title="Users & Roles" bodyClassName="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Approve</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Inspect</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u, i) => (
                  <TableRow key={u.name}>
                    <TableCell className="text-sm font-medium">{u.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.role}</TableCell>
                    <TableCell><Switch defaultChecked={i < 3} /></TableCell>
                    <TableCell><Switch defaultChecked={i % 2 === 0} /></TableCell>
                    <TableCell><Switch defaultChecked={u.role.includes("QA")} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
