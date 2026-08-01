import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/apps/ams-insights/common/PlaceholderPage";

const description = "Track advance shipping notices and inbound supplier shipments.";

export const Route = createFileRoute("/ams-insights/procurement/asn")({
  head: () => ({
    meta: [
      { title: "ASN / Shipments | Asset Management System" },
      { name: "description", content: description },
      { property: "og:title", content: "ASN / Shipments | AMS" },
      { property: "og:description", content: description },
    ],
  }),
  component: () => <PlaceholderPage title="ASN / Shipments" description={description} />,
});
