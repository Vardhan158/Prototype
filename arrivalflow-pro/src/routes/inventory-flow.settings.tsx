import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, Save, ShieldCheck, SlidersHorizontal, Warehouse } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/apps/inventory-flow/components/PageHeader";
import { SectionCard } from "@/apps/inventory-flow/components/SectionCard";
import { StatusBadge } from "@/apps/inventory-flow/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WAREHOUSES, ZONES } from "@/apps/inventory-flow/lib/data";

export const Route = createFileRoute("/inventory-flow/settings")({
  head: () => ({
    meta: [
      { title: "Inventory Settings — VoltCore WMS" },
      {
        name: "description",
        content:
          "Configure warehouse master data, valuation method, alert thresholds and approval rules for the inventory module.",
      },
      { property: "og:title", content: "Inventory Settings — VoltCore WMS" },
      {
        property: "og:description",
        content: "Warehouse master data, valuation, alerting and approval configuration for inventory operations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function ToggleRow({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked ?? false} />
    </div>
  );
}

function SettingsPage() {
  const [valuation, setValuation] = useState("Weighted Average");

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        title="Inventory Settings"
        description="Master data, valuation method, alerting and approval configuration"
        breadcrumbs={[{ label: "Inventory Management", to: "/" }, { label: "Settings" }]}
        actions={
          <Button size="sm" onClick={() => toast.success("Settings saved", { description: "Configuration applied to the inventory module." })}>
            <Save className="mr-1.5 size-4" /> Save changes
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Warehouse master data" description="Plant storage locations and zones">
          <ul className="divide-y divide-border">
            {WAREHOUSES.map((w) => (
              <li key={w} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{w}</p>
                  <p className="truncate text-xs text-muted-foreground">{ZONES.join(" · ")}</p>
                </div>
                <StatusBadge status="Available" />
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Valuation & costing" description="Applied to stock value reporting">
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label>Valuation method</Label>
              <Select value={valuation} onValueChange={setValuation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Weighted Average", "FIFO", "Standard Cost", "Moving Average"].map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Base currency</Label>
              <Select defaultValue="USD">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["USD", "EUR", "INR", "JPY"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fy">Financial year start</Label>
              <Input id="fy" type="date" defaultValue="2026-04-01" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Alerts & notifications" description="Threshold-driven operational alerts">
          <div className="divide-y divide-border">
            <ToggleRow label="Low stock alerts" description="Notify planners when stock hits the reorder point." defaultChecked />
            <ToggleRow label="Expiry warnings" description="Alert 30 days before batch expiry for consumables." defaultChecked />
            <ToggleRow label="Quarantine escalation" description="Escalate holds open for more than 7 days." defaultChecked />
            <ToggleRow label="Cycle count reminders" description="Daily digest of scheduled and overdue counts." />
          </div>
          <Separator className="my-3" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="thresh">Low stock threshold buffer (%)</Label>
              <Input id="thresh" type="number" defaultValue={10} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expiry">Expiry warning (days)</Label>
              <Input id="expiry" type="number" defaultValue={30} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Approvals & controls" description="Workflow governance for stock changes">
          <div className="divide-y divide-border">
            <ToggleRow label="Adjustment approval required" description="All stock adjustments route to a supervisor." defaultChecked />
            <ToggleRow label="Transfer approval required" description="Inter-warehouse transfers need approval before dispatch." defaultChecked />
            <ToggleRow label="Negative stock allowed" description="Permit issues that drive on-hand below zero." />
            <ToggleRow label="Serial capture mandatory" description="Force serial entry for serialised equipment." defaultChecked />
          </div>
          <Separator className="my-3" />
          <div className="space-y-1.5">
            <Label htmlFor="limit">Adjustment auto-approve limit (value)</Label>
            <Input id="limit" type="number" defaultValue={5000} />
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: Warehouse, label: "Warehouses configured", value: String(WAREHOUSES.length) },
          { icon: SlidersHorizontal, label: "Valuation method", value: valuation },
          { icon: ShieldCheck, label: "Approval policies", value: "3 active" },
        ].map((s) => (
          <div key={s.label} className="card-surface flex items-center gap-3 p-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <s.icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="truncate text-sm font-semibold">{s.value}</p>
            </div>
          </div>
        ))}
        <div className="card-surface flex items-center gap-3 p-4 sm:col-span-3">
          <Bell className="size-4 shrink-0 text-primary" />
          <p className="text-xs text-muted-foreground">
            Settings are stored per plant. Changes take effect on the next MRP and alert evaluation cycle.
          </p>
        </div>
      </div>
    </div>
  );
}
