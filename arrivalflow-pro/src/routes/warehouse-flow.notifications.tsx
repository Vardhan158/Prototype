import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, PageHeader, SectionCard } from "@/apps/warehouse-flow/components/ui-kit";
import { cn } from "@/lib/utils";
import { notifications } from "@/apps/warehouse-flow/data";

export const Route = createFileRoute("/warehouse-flow/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — WMS Console" },
      {
        name: "description",
        content:
          "Workflow notifications for created requests, approvals, reservations, pick lists, issues, returns and low stock.",
      },
      { property: "og:title", content: "Notifications — WMS Console" },
      {
        property: "og:description",
        content: "Workflow notifications across the material request lifecycle.",
      },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const [items, setItems] = useState(notifications);
  const unread = items.filter((n) => !n.read);

  const list = (rows: typeof items) =>
    rows.length === 0 ? (
      <EmptyState
        icon={Bell}
        title="Nothing here"
        description="You are all caught up — new workflow events will appear here."
      />
    ) : (
      <ul className="divide-y divide-border">
        {rows.map((n) => (
          <li
            key={n.id}
            className={cn(
              "grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 px-5 py-4",
              !n.read && "bg-primary/5",
            )}
          >
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Bell className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-[11px]">{n.type}</Badge>
                {!n.read && <span className="size-1.5 rounded-full bg-primary" />}
              </div>
              <p className="mt-1 text-sm font-medium">{n.title}</p>
              <p className="num text-xs text-muted-foreground">{n.detail}</p>
            </div>
            <span className="whitespace-nowrap text-xs text-muted-foreground">{n.time}</span>
          </li>
        ))}
      </ul>
    );

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Workflow events raised across the material request, issue and returns lifecycle."
        breadcrumbs={[{ label: "Home", to: "/warehouse-flow/" }, { label: "Notifications" }]}
        actions={
          <Button
            variant="outline"
            onClick={() => {
              setItems((s) => s.map((n) => ({ ...n, read: true })));
              toast.success("All notifications marked as read");
            }}
          >
            <CheckCheck className="size-4" /> Mark all read
          </Button>
        }
      />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({items.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unread.length})</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <SectionCard bodyClassName="p-0">{list(items)}</SectionCard>
        </TabsContent>
        <TabsContent value="unread" className="mt-4">
          <SectionCard bodyClassName="p-0">{list(unread)}</SectionCard>
        </TabsContent>
        <TabsContent value="alerts" className="mt-4">
          <SectionCard bodyClassName="p-0">
            {list(items.filter((n) => n.type.includes("Alert") || n.type.includes("Pending")))}
          </SectionCard>
        </TabsContent>
      </Tabs>
    </>
  );
}
