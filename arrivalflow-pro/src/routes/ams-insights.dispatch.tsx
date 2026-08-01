import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/apps/ams-insights/common/PlaceholderPage";

const description = "Outbound shipments, packing lists and delivery notes.";

export const Route = createFileRoute("/ams-insights/dispatch")({
  head: () => ({
    meta: [
      { title: "Dispatch | Asset Management System" },
      { name: "description", content: description },
      { property: "og:title", content: "Dispatch | AMS" },
      { property: "og:description", content: description },
    ],
  }),
  component: () => <PlaceholderPage title="Dispatch" description={description} />,
});
