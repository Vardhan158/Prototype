import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Activity, BrainCircuit, Clock3, Gauge, ScanText, Sparkles } from "lucide-react";
import { AppShell } from "@/apps/document-flow/components/wms/AppShell";
import { KpiCard, SectionCard } from "@/apps/document-flow/components/wms/primitives";

export const Route = createFileRoute("/document-flow/analytics")({
  head: () => ({
    meta: [
      { title: "Document Analytics — Axion WMS" },
      { name: "description", content: "OCR accuracy, automation and document-processing analytics." },
    ],
  }),
  component: DocumentAnalyticsPage,
});

const throughput = [42, 58, 76, 105, 138, 126, 164, 151, 119, 92, 61, 35];
const confidence = [
  { label: "E-Way Bill", value: 99.1 },
  { label: "Purchase Order", value: 98.4 },
  { label: "Invoice", value: 97.6 },
  { label: "Quality Certificate", value: 95.2 },
  { label: "Delivery Challan", value: 91.8 },
];
const warehouses = [
  { name: "WH-01 Bhiwandi Central", documents: "7,842", accuracy: 98.1, review: "1m 48s" },
  { name: "WH-02 Luhari Hub", documents: "5,106", accuracy: 97.4, review: "2m 06s" },
  { name: "WH-03 Chakan Plant Store", documents: "3,921", accuracy: 96.2, review: "2m 31s" },
  { name: "WH-04 Chennai DC", documents: "2,073", accuracy: 95.8, review: "2m 54s" },
];

function DocumentAnalyticsPage() {
  const [period, setPeriod] = useState("30 days");
  const [warehouse, setWarehouse] = useState("All warehouses");
  const maxThroughput = Math.max(...throughput);
  const scope = useMemo(() => `${warehouse} · Last ${period}`, [period, warehouse]);

  return (
    <AppShell
      title="Document Analytics"
      subtitle="Operational intelligence for OCR, review and document automation"
      breadcrumb={[{ label: "Home", to: "/document-flow" }, { label: "Analytics" }]}
      actions={
        <div className="flex flex-wrap gap-2">
          <select value={warehouse} onChange={(event) => setWarehouse(event.target.value)} className="h-10 rounded-xl border bg-background px-3 text-sm" aria-label="Warehouse">
            <option>All warehouses</option>
            <option>WH-01 Bhiwandi Central</option>
            <option>WH-02 Luhari Hub</option>
            <option>WH-03 Chakan Plant Store</option>
          </select>
          <select value={period} onChange={(event) => setPeriod(event.target.value)} className="h-10 rounded-xl border bg-background px-3 text-sm" aria-label="Analytics period">
            <option>7 days</option>
            <option>30 days</option>
            <option>90 days</option>
          </select>
        </div>
      }
    >
      <p className="mb-4 text-xs font-medium text-muted-foreground">Analytics scope: {scope}</p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Straight-through Processing" value="84.6%" delta="+3.4%" tone="success" icon={Sparkles} footer="Processed without manual review" />
        <KpiCard label="OCR Confidence" value="97.3%" delta="+1.2%" icon={Gauge} footer="Weighted across all document types" />
        <KpiCard label="Extraction Time" value="43 sec" delta="-12.2%" tone="teal" icon={Clock3} footer="Median end-to-end OCR duration" />
        <KpiCard label="Fields Corrected" value="2.1%" delta="-0.8%" tone="warning" icon={BrainCircuit} footer="Manual corrections after extraction" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <SectionCard title="Hourly processing throughput" description="Documents processed during Shift A" className="xl:col-span-3" action={<span className="flex items-center gap-1 text-xs font-semibold text-success"><Activity className="size-4" /> Live</span>}>
          <div className="flex h-64 items-end gap-2 pt-6">
            {throughput.map((value, index) => (
              <div key={index} className="flex h-full flex-1 flex-col justify-end gap-2 text-center">
                <span className="hidden text-[10px] font-semibold sm:block">{value}</span>
                <div className="min-h-4 rounded-t-md bg-primary/80 transition hover:bg-primary" style={{ height: `${(value / maxThroughput) * 84}%` }} title={`${value} documents`} />
                <span className="text-[10px] text-muted-foreground">{String(index + 6).padStart(2, "0")}:00</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="OCR confidence by type" description="Average extraction confidence" className="xl:col-span-2">
          <div className="space-y-5 py-1">
            {confidence.map((item) => (
              <div key={item.label}>
                <div className="mb-1.5 flex justify-between text-sm"><span className="font-medium">{item.label}</span><span className="font-semibold">{item.value}%</span></div>
                <div className="h-2.5 rounded-full bg-muted"><div className={`h-full rounded-full ${item.value >= 97 ? "bg-success" : item.value >= 95 ? "bg-primary" : "bg-warning"}`} style={{ width: `${item.value}%` }} /></div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <SectionCard title="Automation funnel" description="From upload to ERP posting" className="xl:col-span-2">
          <div className="space-y-3">
            {[
              ["Documents uploaded", "18,942", "100%"],
              ["OCR completed", "18,431", "97.3%"],
              ["Auto-validated", "16,988", "89.7%"],
              ["Auto-linked to PO/GRN", "16,025", "84.6%"],
            ].map(([label, value, width], index) => (
              <div key={label} className="rounded-xl border bg-accent/20 p-3" style={{ width: `calc(100% - ${index * 5}%)` }}>
                <div className="flex items-center justify-between gap-3"><span className="text-xs font-medium">{label}</span><span className="text-sm font-bold">{value}</span></div>
                <p className="mt-1 text-[11px] text-muted-foreground">{width} of uploads</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Warehouse performance" description="Volume, accuracy and review speed" className="xl:col-span-3">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-left text-sm">
              <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="py-3 font-medium">Warehouse</th><th className="py-3 font-medium">Documents</th><th className="py-3 font-medium">OCR accuracy</th><th className="py-3 font-medium">Avg. review</th></tr></thead>
              <tbody className="divide-y">
                {warehouses.map((item) => (
                  <tr key={item.name} className="hover:bg-accent/40"><td className="py-3 font-medium">{item.name}</td><td className="py-3">{item.documents}</td><td className="py-3"><span className="font-semibold text-success">{item.accuracy}%</span></td><td className="py-3 text-muted-foreground">{item.review}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="AI insight" description="Recommended action based on the selected scope" className="mt-6">
        <div className="flex gap-3 rounded-2xl bg-primary-soft p-4">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><ScanText className="size-5" /></div>
          <div><p className="text-sm font-semibold">Delivery Challan accuracy is below the 95% target</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Most corrections involve handwritten quantities and vehicle numbers. Route low-resolution uploads through image enhancement before OCR to reduce manual review volume by an estimated 18%.</p></div>
        </div>
      </SectionCard>
    </AppShell>
  );
}
