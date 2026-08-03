import { useEffect, useState } from "react";

export type LiveNotification = {
  id: string; type: string; title: string; body: string; tone: string; read: boolean; time: string;
};
export type NotificationSnapshot = { items: LiveNotification[]; unreadCount: number };

const API_URL = (import.meta.env["VITE_API_URL"] ?? "http://localhost:5000/api/v1").replace(/\/$/, "");

export async function getNotifications(): Promise<NotificationSnapshot> {
  const response = await fetch(`${API_URL}/notifications`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Notifications API failed with status ${response.status}`);
  const payload = (await response.json()) as { success: boolean; data: NotificationSnapshot };
  return payload.data;
}

export async function markNotificationRead(id: string) {
  const response = await fetch(`${API_URL}/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" });
  if (!response.ok) throw new Error("Unable to mark notification as read");
}

export async function markAllNotificationsRead() {
  const response = await fetch(`${API_URL}/notifications/read-all`, { method: "PATCH" });
  if (!response.ok) throw new Error("Unable to mark notifications as read");
}

export function useRealtimeNotifications(initial: NotificationSnapshot = { items: [], unreadCount: 0 }) {
  const [snapshot, setSnapshot] = useState(initial);
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    const source = new EventSource(`${API_URL}/notifications/stream`);
    const update = (event: MessageEvent) => {
      setSnapshot(JSON.parse(event.data) as NotificationSnapshot);
      setConnected(true);
    };
    source.addEventListener("notifications", update as EventListener);
    source.onerror = () => setConnected(false);
    return () => source.close();
  }, []);
  return { ...snapshot, connected, setSnapshot };
}
