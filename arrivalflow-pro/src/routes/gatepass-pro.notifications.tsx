import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCheck, MessageSquare, PauseCircle, PackageCheck, XCircle } from "lucide-react";
import { AppShell } from "@/apps/gatepass-pro/components/wms/AppShell";
import { useWms } from "@/apps/gatepass-pro/lib/wms/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gatepass-pro/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — GateFlow WMS" },
      { name: "description", content: "Warehouse acceptance, hold and rejection alerts plus shift messages for gate officers." },
      { property: "og:title", content: "Notifications — GateFlow WMS" },
      { property: "og:description", content: "Stay on top of warehouse acceptance, holds and rejections." },
    ],
  }),
  component: Notifications,
});

const ICONS = {
  accepted: PackageCheck,
  rejected: XCircle,
  hold: PauseCircle,
  message: MessageSquare,
} as const;

const TONES = {
  accepted: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
  hold: "bg-warning/20 text-warning",
  message: "bg-accent text-accent-foreground",
} as const;

function Notifications() {
  const { notifications, markAllRead } = useWms();

  return (
    <AppShell
      title="Notifications"
      subtitle={`${notifications.filter((n) => !n.read).length} unread`}
      back="/gatepass-pro"
      action={
        <button aria-label="Mark all read" onClick={markAllRead} className="grid size-10 place-items-center rounded-full active:bg-white/15">
          <CheckCheck className="size-5" />
        </button>
      }
    >
      <div className="grid gap-3">
        {notifications.map((n) => {
          const Icon = ICONS[n.kind];
          return (
            <div key={n.id} className={cn("card-elevated flex gap-3 p-4", !n.read && "ring-2 ring-primary/25")}>
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", TONES[n.kind])}>
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{n.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{n.time}</p>
              </div>
              {!n.read ? <Bell className="size-4 shrink-0 text-primary" /> : null}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}