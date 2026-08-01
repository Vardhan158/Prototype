import { createFileRoute } from "@tanstack/react-router";
import { BlockedStockScreen } from "@/apps/inventory-flow-pro/components/wms/blocked-stock-screen";

export const Route = createFileRoute("/inventory-flow-pro/recall")({
  head: () => ({
    meta: [
      { title: "Recall Inventory | AXIOM WMS" },
      { name: "description", content: "Supplier and regulatory recalls with affected batch and serial scope, hard-blocked across all warehouses." },
      { property: "og:title", content: "Recall Inventory | AXIOM WMS" },
      { property: "og:description", content: "Recall control with automatic movement blocking." },
    ],
  }),
  component: () => <BlockedStockScreen variant="RECALL" />,
});
