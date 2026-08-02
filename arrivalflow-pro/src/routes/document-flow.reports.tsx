import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Download,
  FileStack,
  ScanText,
  TriangleAlert,
} from "lucide-react";
import { AppShell } from "@/apps/document-flow/components/wms/AppShell";
import { KpiCard, SectionCard, StatusChip } from "@/apps/document-flow/components/wms/primitives";
import { documents } from "@/apps/document-flow/wms-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/document-flow/reports")({
  head: () => ({
    meta: [
      { title: "Document Reports & Analytics — Axion WMS" },
      { name: "description", content: "Document processing, OCR quality and compliance reports." },
    ],
  }),
  component: DocumentReportsPage,
});

const monthlyVolume = [
  { month: "Feb", value: 12640 },
  { month: "Mar", value: 13980 },
  { month: "Apr", value: 15120 },
  { month: "May", value: 16680 },
  { month: "Jun", value: 17430 },
  { month: "Jul", value: 18942 },
];

const typeVolume = [
  { label: "Invoices", value: 6540, color: "bg-primary" },
  { label: "E-Way Bills", value: 4280, color: "bg-cyan-500" },
  { label: "Delivery Challans", value: 3470, color: "bg-emerald-500" },
  { label: "Quality Certificates", value: 2690, color: "bg-amber-500" },
  { label: "Other", value: 1962, color: "bg-violet-500" },
];

function DocumentReportsPage() {
  const [period, setPeriod] = useState("Last 30 days");
  const maxVolume = Math.max(...monthlyVolume.map((item) => item.value));
  const exceptions = useMemo(
    () => documents.filter((document) => document.status === "OCR Failed" || document.status === "Pending Review"),
    [],
  );

  const exportReport = () => {
    const rows = [
      ["Document ID", "Type", "Vendor", "Status", "OCR Confidence", "Uploaded At"],
      ...documents.map((document) => [
        document.id,
        document.type,
        document.vendor,
        document.status,
        `${document.confidence}%`,
        document.uploadedAt,
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "document-flow-report.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell
      title="Reports & Analytics"
      subtitle="Document throughput, OCR accuracy and review performance"
      breadcrumb={[{ label: "Home", to: "/document-flow" }, { label: "Reports" }]}
      actions={
        <div className="flex gap-2">
          <select
            aria-label="Report period"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="h-10 rounded-xl border bg-background px-3 text-sm"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <Button className="rounded-xl" onClick={exportReport}>
            <Download className="mr-2 size-4" /> Export CSV
          </Button>
        </div>
      }
    >
      <div className="mb-4 text-xs font-medium text-muted-foreground">Showing performance for {period.toLowerCase()}</div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Documents Processed" value="18,942" delta="+8.7%" icon={FileStack} footer="1,246 more than previous period" />
        <KpiCard label="OCR Success Rate" value="97.3%" delta="+1.2%" tone="success" icon={ScanText} footer="18,431 documents read successfully" />
        <KpiCard label="Average Processing" value="43 sec" delta="-6 sec" tone="teal" icon={Activity} footer="Upload to extracted data" />
        <KpiCard label="Review Exceptions" value="27" delta="6 overdue" tone="warning" icon={TriangleAlert} footer="3 approaching SLA breach" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <SectionCard title="Document volume trend" description="Monthly documents processed" className="xl:col-span-3">
          <div className="flex h-64 items-end gap-3 pt-6 sm:gap-6">
            {monthlyVolume.map((item) => (
              <div key={item.month} className="flex h-full flex-1 flex-col justify-end gap-2 text-center">
                <span className="text-xs font-semibold">{(item.value / 1000).toFixed(1)}k</span>
                <div
                  className="min-h-8 rounded-t-lg bg-primary/85 transition-all hover:bg-primary"
                  style={{ height: `${(item.value / maxVolume) * 82}%` }}
                  title={`${item.value.toLocaleString()} documents`}
                />
                <span className="text-xs text-muted-foreground">{item.month}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Documents by type" description="Current period distribution" className="xl:col-span-2">
          <div className="space-y-5 py-2">
            {typeVolume.map((item) => (
              <div key={item.label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground">{item.value.toLocaleString()}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.value / 6540) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Review exceptions"
        description="Documents requiring attention"
        className="mt-6"
        action={<span className="flex items-center gap-1 text-xs font-medium text-success"><CheckCircle2 className="size-4" /> Live status</span>}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-2 py-3 font-medium">Document</th>
                <th className="px-2 py-3 font-medium">Type</th>
                <th className="px-2 py-3 font-medium">Vendor</th>
                <th className="px-2 py-3 font-medium">Confidence</th>
                <th className="px-2 py-3 font-medium">Status</th>
                <th className="px-2 py-3 font-medium">Uploaded</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {exceptions.map((item) => (
                <tr key={item.id} className="hover:bg-accent/40">
                  <td className="px-2 py-3 font-medium">{item.id}</td>
                  <td className="px-2 py-3">{item.type}</td>
                  <td className="max-w-56 truncate px-2 py-3">{item.vendor}</td>
                  <td className="px-2 py-3 font-semibold">{item.confidence}%</td>
                  <td className="px-2 py-3"><StatusChip status={item.status} /></td>
                  <td className="px-2 py-3 text-muted-foreground">{item.uploadedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </AppShell>
  );
}
