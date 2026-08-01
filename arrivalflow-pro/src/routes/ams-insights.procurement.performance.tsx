import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/apps/ams-insights/common/PlaceholderPage";

const description = "On-time delivery, quality scores and supplier ratings.";

export const Route = createFileRoute("/ams-insights/procurement/performance")({
  head: () => ({
    meta: [
      { title: "Supplier Performance | Asset Management System" },
      { name: "description", content: description },
      { property: "og:title", content: "Supplier Performance | AMS" },
      { property: "og:description", content: description },
    ],
  }),
  component: () => <PlaceholderPage title="Supplier Performance" description={description} />,
});
