import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/apps/ams-insights/common/PlaceholderPage";

const description = "Long-term supply agreements and blanket purchase orders.";

export const Route = createFileRoute("/ams-insights/procurement/contracts")({
  head: () => ({
    meta: [
      { title: "Contracts (Blanket PO) | Asset Management System" },
      { name: "description", content: description },
      { property: "og:title", content: "Contracts (Blanket PO) | AMS" },
      { property: "og:description", content: description },
    ],
  }),
  component: () => <PlaceholderPage title="Contracts (Blanket PO)" description={description} />,
});
