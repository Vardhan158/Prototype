import { createFileRoute } from "@tanstack/react-router";
import { Boxes } from "lucide-react";
import { AppShell } from "@/components/wms/app-shell";
import { ModulePlaceholder } from "@/components/wms/module-placeholder";

export const Route = createFileRoute("/dashboard/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory · NexusWMS" },
      {
        name: "description",
        content: "Stock on hand, putaway locations and bin utilisation for Pune Distribution Centre.",
      },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  return (
    <AppShell title="Inventory" subtitle="Stock on hand, bin utilisation and putaway locations">
      <ModulePlaceholder
        icon={Boxes}
        title="Inventory module"
        description="Live stock, bin utilisation and putaway suggestions are part of the wider WMS scope. This prototype focuses on the gate entry and arrival journey."
      />
    </AppShell>
  );
}
