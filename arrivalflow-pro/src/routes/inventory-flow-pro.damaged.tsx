import { createFileRoute } from "@tanstack/react-router";
import { BlockedStockScreen } from "@/apps/inventory-flow-pro/components/wms/blocked-stock-screen";

export const Route = createFileRoute("/inventory-flow-pro/damaged")({
  head: () => ({
    meta: [
      { title: "Damaged Inventory | AXIOM WMS" },
      { name: "description", content: "Damage register with severity, evidence and insurance claim tracking for warehouse stock." },
      { property: "og:title", content: "Damaged Inventory | AXIOM WMS" },
      { property: "og:description", content: "Repair, scrap or return damaged inventory with full audit trail." },
    ],
  }),
  component: () => <BlockedStockScreen variant="DAMAGED" />,
});
