import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/work-craft/")({
  beforeLoad: () => {
    throw redirect({ to: "/work-craft/work-orders" });
  },
  head: () => ({
    meta: [
      { title: "Assembly Work Orders — AMS Assembly Management" },
      {
        name: "description",
        content:
          "Enterprise Assembly Management: assembly work orders, bill of materials, component consumption, stage tracking, quality checkpoints and completion certificates.",
      },
      { property: "og:title", content: "Assembly Work Orders — AMS Assembly Management" },
      {
        property: "og:description",
        content: "Operate the full assembly workflow from work order creation to completion certificate.",
      },
    ],
  }),
});
