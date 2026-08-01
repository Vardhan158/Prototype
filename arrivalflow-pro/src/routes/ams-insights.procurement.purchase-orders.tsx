import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/apps/ams-insights/common/PlaceholderPage";

const description = "Browse, create and manage all purchase orders across suppliers.";

export const Route = createFileRoute("/ams-insights/procurement/purchase-orders")({
  head: () => ({
    meta: [
      { title: "Purchase Orders | Asset Management System" },
      { name: "description", content: description },
      { property: "og:title", content: "Purchase Orders | AMS" },
      { property: "og:description", content: description },
    ],
  }),
  component: () => <PlaceholderPage title="Purchase Orders" description={description} />,
});
