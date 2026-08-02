import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PageHeader, SectionCard } from "@/apps/quality-gatekeeper/components/qm/Primitives";
import { StatusPill } from "@/apps/quality-gatekeeper/components/qm/StatusPill";
import { notifications } from "@/apps/quality-gatekeeper/lib/qm-data";

export const Route = createFileRoute("/quality-gatekeeper/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications Â· Axiom WMS" },
      {
        name: "description",
        content: "Assignment, completion, NCR, hold, return and inventory release alerts",
      },
      { property: "og:title", content: "Notifications Â· Axiom WMS" },
      {
        property: "og:description",
        content: "Assignment, completion, NCR, hold, return and inventory release alerts",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Quality", to: "/quality-gatekeeper" }, { label: "Notifications" }]}
        eyebrow="Screen 21"
        title="Notifications"
        description="Assignment, completion, NCR, hold, return and inventory release alerts"
        actions={
          <Button variant="outline" size="sm" onClick={() => toast.success("Exported")}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        }
      />
      <SectionCard padded={false}>
        <ul className="divide-y divide-border">
          {notifications.map((n) => (
            <li key={n.id} className={n.unread ? "bg-primary/4 px-4 py-3" : "px-4 py-3"}>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{n.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{n.body}</p>
                </div>
                <div className="text-right">
                  <StatusPill
                    tone={
                      n.type === "NCR Created" || n.type === "RTS Created"
                        ? "danger"
                        : n.type === "Quality Hold"
                          ? "warning"
                          : "info"
                    }
                    dot={false}
                  >
                    {n.type}
                  </StatusPill>
                  <p className="mt-1 text-[10px] text-muted-foreground">{n.time}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </>
  );
}
