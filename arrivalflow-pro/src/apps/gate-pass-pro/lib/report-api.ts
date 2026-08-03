import { useEffect, useState } from "react";

export type GateReport = {
  metrics: Array<{ label: string; value: string; hint: string }>;
  hourlyTraffic: Array<{ hour: string; entries: number; exits: number }>;
  vendorRows: Array<{ vendor: string; trips: number; onTime: string; avgWait: string; rejected: number; tonnage: string }>;
  waitingTrend: Array<{ day: string; minutes: number }>;
  exceptions: Array<{ id: string; truck: string; vendor: string; holdReason: string; arrival: string; status: string }>;
  statusDistribution: Array<{ name: string; value: number }>;
  officerPerformance: Array<{ officer: string; gate: string; entries: number; avgMinutes: number; exceptions: number }>;
  generatedAt: string;
};
const API_URL = (import.meta.env["VITE_API_URL"] ?? "http://localhost:5000/api/v1").replace(/\/$/, "");

export async function getGateReport(range: string): Promise<GateReport> {
  const response = await fetch(`${API_URL}/reports?range=${encodeURIComponent(range)}`);
  if (!response.ok) throw new Error(`Reports API failed with status ${response.status}`);
  const payload = (await response.json()) as { success: boolean; data: GateReport };
  return payload.data;
}

export function useRealtimeGateReport(range: string, initial: GateReport) {
  const [report, setReport] = useState(initial);
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    const source = new EventSource(`${API_URL}/reports/stream?range=${encodeURIComponent(range)}`);
    const update = (event: MessageEvent) => { setReport(JSON.parse(event.data) as GateReport); setConnected(true); };
    source.addEventListener("report", update as EventListener);
    source.onerror = () => setConnected(false);
    return () => source.close();
  }, [range]);
  return { report, connected };
}
