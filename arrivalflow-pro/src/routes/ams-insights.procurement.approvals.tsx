import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/apps/ams-insights/common/PlaceholderPage";

const description = "Review and action purchase orders awaiting approval.";

export const Route = createFileRoute("/ams-insights/procurement/approvals")({
  head: () => ({
    meta: [
      { title: "PO Approvals | Asset Management System" },
      { name: "description", content: description },
      { property: "og:title", content: "PO Approvals | AMS" },
      { property: "og:description", content: description },
    ],
  }),
  component: () => <PlaceholderPage title="PO Approvals" description={description} />,
});
