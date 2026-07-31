import { createFileRoute } from "@tanstack/react-router";
import { Database } from "lucide-react";
import { AppShell } from "@/components/wms/app-shell";
import { ModulePlaceholder } from "@/components/wms/module-placeholder";

export const Route = createFileRoute("/master-data")({
  head: () => ({
    meta: [
      { title: "Master Data · NexusWMS" },
      { name: "description", content: "Maintain vendors, vehicles, docks, materials and warehouse topology master records." },
      { property: "og:title", content: "Master Data · NexusWMS" },
      { property: "og:description", content: "Vendor, vehicle, dock and material master records." },
    ],
  }),
  component: () => (
    <AppShell title="Master data" subtitle="Vendors, vehicles, docks, materials and warehouse topology">
      <ModulePlaceholder icon={Database} title="Master data governance" description="Master record maintenance sits outside the gate entry journey covered by this prototype." />
    </AppShell>
  ),
});
