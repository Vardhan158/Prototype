import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/apps/ams-insights/common/PlaceholderPage";

const description = "Stock levels, bin locations and material movements.";

export const Route = createFileRoute("/ams-insights/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory | Asset Management System" },
      { name: "description", content: description },
      { property: "og:title", content: "Inventory | AMS" },
      { property: "og:description", content: description },
    ],
  }),
  component: () => <PlaceholderPage title="Inventory" description={description} />,
});
