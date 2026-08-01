import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/apps/ams-insights/common/PlaceholderPage";

const description = "Procurement analytics, spend reports and export tools.";

export const Route = createFileRoute("/ams-insights/reports")({
  head: () => ({
    meta: [
      { title: "Reports | Asset Management System" },
      { name: "description", content: description },
      { property: "og:title", content: "Reports | AMS" },
      { property: "og:description", content: description },
    ],
  }),
  component: () => <PlaceholderPage title="Reports" description={description} />,
});
