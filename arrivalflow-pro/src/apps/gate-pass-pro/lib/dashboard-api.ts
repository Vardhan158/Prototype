import { useEffect, useState } from "react";

export type DashboardData = {
  kpis: Array<{ label: string; value: number; delta: string; tone: string; icon: string }>;
  hourlyTraffic: Array<{ hour: string; entries: number; exits: number }>;
  activities: Array<{ time: string; user: string; text: string; tone: string }>;
  queue: Array<{
    id: string;
    truck: string;
    vendor: string;
    status: string;
    waitingMin: number;
  }>;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    body: string;
    time: string;
    read: boolean;
    tone: string;
  }>;
  generatedAt: string;
};

const API_URL = (import.meta.env["VITE_API_URL"] ?? "http://localhost:5000/api/v1").replace(/\/$/, "");

export async function getDashboardData(): Promise<DashboardData> {
  const response = await fetch(`${API_URL}/dashboard`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Dashboard API failed with status ${response.status}`);
  const payload = (await response.json()) as { success: boolean; data?: DashboardData; message?: string };
  if (!payload.success || !payload.data) throw new Error(payload.message ?? "Dashboard data is unavailable");
  return payload.data;
}

export function useRealtimeDashboard(initial: DashboardData) {
  const [data, setData] = useState(initial);
  useEffect(() => {
    const source = new EventSource(`${API_URL}/dashboard/stream`);
    const update = (event: MessageEvent) => setData(JSON.parse(event.data) as DashboardData);
    source.addEventListener("dashboard", update as EventListener);
    return () => source.close();
  }, []);
  return data;
}
