import { createFileRoute } from "@tanstack/react-router";
import { BlockedStockScreen } from "@/apps/inventory-flow-pro/components/wms/blocked-stock-screen";

export const Route = createFileRoute("/inventory-flow-pro/quarantine")({
  head: () => ({
    meta: [
      { title: "Quarantine Inventory | AXIOM WMS" },
      { name: "description", content: "Isolated stock in quarantine cages with release approval workflow and isolation ageing." },
      { property: "og:title", content: "Quarantine Inventory | AXIOM WMS" },
      { property: "og:description", content: "No movement permitted until a signed QA release." },
    ],
  }),
  component: () => <BlockedStockScreen variant="QUARANTINE" />,
});
