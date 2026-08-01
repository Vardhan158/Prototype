import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/apps/ams-insights/common/PlaceholderPage";

const description = "Manage users, roles and access permissions.";

export const Route = createFileRoute("/ams-insights/settings/users")({
  head: () => ({
    meta: [
      { title: "Users & Roles | Asset Management System" },
      { name: "description", content: description },
      { property: "og:title", content: "Users & Roles | AMS" },
      { property: "og:description", content: description },
    ],
  }),
  component: () => <PlaceholderPage title="Users & Roles" description={description} />,
});
