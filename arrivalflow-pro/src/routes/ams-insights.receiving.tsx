import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/apps/ams-insights/common/PlaceholderPage";

const description = "Goods receipt, inspection and putaway operations.";

export const Route = createFileRoute("/ams-insights/receiving")({
  head: () => ({
    meta: [
      { title: "Receiving | Asset Management System" },
      { name: "description", content: description },
      { property: "og:title", content: "Receiving | AMS" },
      { property: "og:description", content: description },
    ],
  }),
  component: () => <PlaceholderPage title="Receiving" description={description} />,
});
