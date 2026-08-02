import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  KpiCard,
  PageHeader,
  ProgressBar,
  SectionCard,
  StatusBadge,
  Metric,
  Timeline,
} from "@/apps/wave-flow/components/wms/ui";
import { Button } from "@/components/ui/button";
import { Settings, Users, Bell, Printer } from "lucide-react";
import { roles } from "@/apps/wave-flow/lib/wms-data";

export const Route = createFileRoute("/wave-flow/settings")({
  head: () => ({
    meta: [
      { title: "Settings â€” NexusWMS" },
      {
        name: "description",
        content:
          "Configure wave strategies, picking rules, label templates, dock capacity, roles and notification policies.",
      },
      { property: "og:title", content: "Settings â€” NexusWMS" },
      {
        property: "og:description",
        content:
          "Configure wave strategies, picking rules, label templates, dock capacity, roles and notification policies.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Settings"
        description="Module configuration for DC-01 Rotterdam"
        breadcrumb={["Outbound", "Settings"]}
        actions={<Button onClick={() => toast.success("Configuration saved")}>Save changes</Button>}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Wave strategy defaults" description="Applied by the auto wave engine">
          <div className="space-y-3">
            {[
              ["Default strategy", "Zone batch consolidation"],
              ["Max orders per wave", "12"],
              ["Max lines per picker", "45"],
              ["Carrier cutoff buffer", "45 minutes"],
              ["Auto-release approved waves", "Enabled"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0"
              >
                <span className="text-sm">{k}</span>
                <span className="num text-sm text-muted-foreground">{v}</span>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard
          title="Picking rules"
          description="RF and validation policy"
          actions={<Settings className="size-4 text-muted-foreground" />}
        >
          <div className="space-y-3">
            {[
              ["Barcode validation", "Mandatory on every line"],
              ["Batch/serial capture", "Required for regulated materials"],
              ["Short-pick tolerance", "0% â€” exception raised"],
              ["Pick path", "Serpentine, zone-optimised"],
              ["Voice picking", "Disabled"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0"
              >
                <span className="text-sm">{k}</span>
                <span className="text-sm text-muted-foreground">{v}</span>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard
          title="Roles & permissions"
          actions={<Users className="size-4 text-muted-foreground" />}
        >
          <ul className="space-y-2">
            {roles.map((r) => (
              <li
                key={r}
                className="glass-panel flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
              >
                <span className="truncate text-sm">{r}</span>
                <StatusBadge status={r === "Picker" || r === "Packer" ? "Assigned" : "Approved"} />
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard
          title="Notifications & printing"
          actions={<Bell className="size-4 text-muted-foreground" />}
        >
          <ul className="space-y-2">
            {[
              "Order Ready",
              "Wave Created",
              "Wave Released",
              "Picking Started",
              "Picking Completed",
              "Packing Completed",
              "Truck Assigned",
              "Loading Started",
              "Dispatch Approved",
              "Shipment Dispatched",
              "Shipment Delivered",
              "Exception Raised",
            ].map((n) => (
              <li key={n} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate">{n}</span>
                <span className="text-xs text-muted-foreground">Email Â· In-app</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Printer className="size-4" /> Default label printer: LP-02 (Zebra ZT411)
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
