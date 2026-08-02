import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PageHeader,
  StatusPill,
  Tone,
  Field,
  EmptyState,
} from "@/apps/receiving-hub/components/wms/primitives";
import { useWms } from "@/apps/receiving-hub/lib/wms-store";

export const Route = createFileRoute("/receiving-hub/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications | AXIOM WMS Inbound" },
      {
        name: "description",
        content:
          "Receiving started, completed, GRN created, discrepancies, partial receipts, inspection assignments and inventory creation alerts.",
      },
      { property: "og:title", content: "Notifications | AXIOM WMS Inbound" },
      {
        property: "og:description",
        content:
          "Receiving started, completed, GRN created, discrepancies, partial receipts, inspection assignments and inventory creation alerts.",
      },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { state, dispatch } = useWms();
  return (
    <div className="mx-auto max-w-[1000px]">
      <PageHeader
        title="Notifications"
        subtitle={`${state.notifications.filter((n) => !n.read).length} unread inbound events`}
        crumbs={[{ label: "Inbound", to: "/receiving-hub" }, { label: "Notifications" }]}
        actions={
          <Button variant="outline" onClick={() => dispatch({ type: "read-all" })}>
            Mark all read
          </Button>
        }
      />
      <div className="space-y-2">
        {state.notifications.map((n) => (
          <Card key={n.id} className={`elevated-card ${n.read ? "opacity-70" : ""}`}>
            <CardContent className="flex flex-wrap items-start gap-3 p-4">
              <Tone tone={n.severity}>{n.type}</Tone>
              <div className="min-w-[220px] flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.body}</p>
              </div>
              <span className="num text-[0.7rem] text-muted-foreground">{n.at}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
