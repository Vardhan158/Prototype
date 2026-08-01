import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, CheckCheck, Truck, CheckCircle2, PauseCircle, XCircle, Warehouse, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppShell } from "@/apps/gate-pass-pro/components/wms/AppShell";
import { notifications } from "@/apps/gate-pass-pro/lib/wms-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gate-pass-pro/notifications")({
  head: () => ({
    meta: [
      { title: "Notification Centre — NexusWMS" },
      { name: "description", content: "All gate notifications: truck arrived, approved, on hold, rejected, warehouse accepted and receiving started." },
      { property: "og:title", content: "Notification Centre — NexusWMS" },
      { property: "og:description", content: "Every gate event in one inbox." },
    ],
  }),
  component: NotificationCentre,
});

const iconFor: Record<string, typeof Truck> = {
  "Truck Arrived": Truck,
  "Gate Entry Created": Truck,
  "Gate Entry Approved": CheckCircle2,
  "Truck On Hold": PauseCircle,
  "Truck Rejected": XCircle,
  "Warehouse Accepted": Warehouse,
  "Receiving Started": PackageCheck,
};

const toneFor: Record<string, string> = {
  info: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/10 text-destructive",
};

function NotificationCentre() {
  const [items, setItems] = useState(notifications);
  const unread = items.filter((n) => !n.read);
  const read = items.filter((n) => n.read);

  const List = ({ data }: { data: typeof notifications }) =>
    data.length === 0 ? (
      <div className="surface-card p-16 text-center">
        <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-semibold">You're all caught up</p>
        <p className="text-xs text-muted-foreground">New gate events will appear here in real time.</p>
      </div>
    ) : (
      <div className="space-y-3">
        {data.map((n) => {
          const Icon = iconFor[n.type] ?? Bell;
          return (
            <div key={n.id} className={cn("surface-card flex flex-wrap items-start gap-3 p-4", !n.read && "border-primary/30")}>
              <span className={cn("grid h-9 w-9 place-items-center rounded-lg", toneFor[n.tone])}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold">{n.title}</p>
                <p className="text-[11px] text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{n.type} · {n.time}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" asChild>
                  <Link to="/gate-pass-pro/gate-entry">Open</Link>
                </Button>
                {!n.read && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setItems((p) => p.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
                  >
                    Mark read
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );

  return (
    <AppShell
      title="Notification Centre"
      subtitle={`${unread.length} unread · real-time gate, yard and warehouse events`}
      actions={
        <Button
          variant="outline"
          onClick={() => { setItems((p) => p.map((x) => ({ ...x, read: true }))); toast.success("All notifications marked read"); }}
        >
          <CheckCheck className="mr-2 h-4 w-4" />Mark all read
        </Button>
      }
    >
      <Tabs defaultValue="unread">
        <TabsList>
          <TabsTrigger value="unread">Unread ({unread.length})</TabsTrigger>
          <TabsTrigger value="read">Read ({read.length})</TabsTrigger>
          <TabsTrigger value="all">All ({items.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="unread" className="pt-4"><List data={unread} /></TabsContent>
        <TabsContent value="read" className="pt-4"><List data={read} /></TabsContent>
        <TabsContent value="all" className="pt-4"><List data={items} /></TabsContent>
      </Tabs>
    </AppShell>
  );
}
