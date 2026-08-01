import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/apps/ams-insights/common/PlaceholderPage";

const description = "Configure organisation, currency and workflow settings.";

export const Route = createFileRoute("/ams-insights/settings/system")({
  head: () => ({
    meta: [
      { title: "System Settings | Asset Management System" },
      { name: "description", content: description },
      { property: "og:title", content: "System Settings | AMS" },
      { property: "og:description", content: description },
    ],
  }),
  component: () => <PlaceholderPage title="System Settings" description={description} />,
});
