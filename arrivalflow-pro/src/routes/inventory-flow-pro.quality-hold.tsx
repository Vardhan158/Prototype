import { createFileRoute } from "@tanstack/react-router";
import { BlockedStockScreen } from "@/apps/inventory-flow-pro/components/wms/blocked-stock-screen";

export const Route = createFileRoute("/inventory-flow-pro/quality-hold")({
  head: () => ({
    meta: [
      { title: "Quality Hold | AXIOM WMS" },
      { name: "description", content: "Blocked stock awaiting QA disposition with NCR tracking, inspector ownership and hold ageing." },
      { property: "og:title", content: "Quality Hold | AXIOM WMS" },
      { property: "og:description", content: "Release, return or rework quality-blocked inventory." },
    ],
  }),
  component: () => <BlockedStockScreen variant="QUALITY_HOLD" />,
});
