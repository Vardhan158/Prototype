import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/apps/ams-insights/common/PlaceholderPage";

const description = "Kitting, assembly orders and work-in-progress tracking.";

export const Route = createFileRoute("/ams-insights/assembly")({
  head: () => ({
    meta: [
      { title: "Assembly | Asset Management System" },
      { name: "description", content: description },
      { property: "og:title", content: "Assembly | AMS" },
      { property: "og:description", content: description },
    ],
  }),
  component: () => <PlaceholderPage title="Assembly" description={description} />,
});
