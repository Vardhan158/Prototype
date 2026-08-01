import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Gauge,
  UploadCloud,
  TriangleAlert,
  ClipboardCheck,
  ArrowRight,
  FileText,
  ScanText,
  Upload,
  Search,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/apps/document-flow/components/wms/AppShell";
import { ConfidenceMeter, KpiCard, SectionCard, StatusChip } from "@/apps/document-flow/components/wms/primitives";
import { Button } from "@/components/ui/button";
import { accuracyTrend, categoryMix, documents, uploadTrend } from "@/apps/document-flow/wms-data";

export const Route = createFileRoute("/document-flow/documents/")({
  head: () => ({
    meta: [
      { title: "Document Management Dashboard — Axion WMS" },
      {
        name: "description",
        content: "OCR accuracy, uploads, failed extractions and pending reviews for warehouse documents.",
      },
      { property: "og:title", content: "Document Management Dashboard — Axion WMS" },
      {
        property: "og:description",
        content: "OCR accuracy, uploads, failed extractions and pending reviews for warehouse documents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DocumentsDashboard,
});

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--card)",
  fontSize: 12,
  color: "var(--foreground)",
};

function DocumentsDashboard() {
  const navigate = useNavigate();

  return (
    <AppShell
      title="Document Management"
      subtitle="Capture, extract, review and link every warehouse document"
      breadcrumb={[{ label: "Home", to: "/document-flow" }, { label: "Document Management" }]}
      actions={
        <>
          <Button variant="outline" className="rounded-xl" asChild>
            <Link to="/document-flow/documents/library">
              <Search className="mr-2 size-4" /> Search Library
            </Link>
          </Button>
          <Button className="rounded-xl" asChild>
            <Link to="/document-flow/documents/upload">
              <Upload className="mr-2 size-4" /> Upload Document
            </Link>
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="OCR Accuracy" value="97.3%" delta="+1.2% WoW" tone="success" icon={Gauge} onClick={() => navigate({ to: "/document-flow/ocr" })} footer="Best: E-Way Bill 99.4% · Worst: handwritten DC 74.1%" />
        <KpiCard label="Today's Uploads" value="311" delta="+18%" tone="primary" icon={UploadCloud} onClick={() => navigate({ to: "/document-flow/documents/library" })} footer="Mobile capture 92 · Scanner 154 · Email 65" />
        <KpiCard label="Failed OCR" value="9" delta="6 retryable" tone="danger" icon={TriangleAlert} onClick={() => navigate({ to: "/document-flow/ocr" })} footer="Auto-retry runs every 15 minutes" />
        <KpiCard label="Pending Review" value="27" delta="3 SLA risk" tone="warning" icon={ClipboardCheck} onClick={() => navigate({ to: "/document-flow/documents/library" })} footer="Reviewers online: 4 of 7" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <SectionCard title="Uploads vs OCR completions" description="Last 7 days" className="xl:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={uploadTrend} margin={{ left: -18, right: 6, top: 6 }}>
                <defs>
                  <linearGradient id="gUp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gOcr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" name="Uploads" dataKey="uploads" stroke="var(--color-chart-1)" fill="url(#gUp)" strokeWidth={2} />
                <Area type="monotone" name="OCR completed" dataKey="ocr" stroke="var(--color-chart-2)" fill="url(#gOcr)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Document categories" description="Volume share, current quarter">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryMix} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3}>
                  {categoryMix.map((c) => (
                    <Cell key={c.name} fill={c.color} stroke="var(--card)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-2">
            {categoryMix.map((c) => (
              <li key={c.name} className="flex items-center gap-2 text-xs">
                <span className="size-2.5 rounded-full" style={{ background: c.color }} />
                <span className="flex-1">{c.name}</span>
                <span className="font-semibold tabular-nums">{c.value.toLocaleString("en-IN")}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <SectionCard title="OCR accuracy trend" description="Weekly average confidence">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracyTrend} margin={{ left: -20, right: 6, top: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis domain={[88, 100]} tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="accuracy" stroke="var(--color-chart-3)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Extraction volume by type" description="Documents processed this week">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryMix} margin={{ left: -20, right: 6, top: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10} stroke="var(--muted-foreground)" interval={0} angle={-12} dy={8} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {categoryMix.map((c) => (
                    <Cell key={c.name} fill={c.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Recent OCR activity"
          description="Live extraction results"
          action={
            <Button variant="ghost" size="sm" className="rounded-lg" asChild>
              <Link to="/document-flow/ocr">
                Queue <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          }
        >
          <div className="space-y-3">
            {documents.slice(0, 5).map((d) => (
              <Link
                key={d.id}
                to="/document-flow/ocr/$id"
                params={{ id: d.id }}
                className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:border-primary/40 hover:bg-accent/40"
              >
                <ScanText className="size-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{d.type} · {d.id}</p>
                  <ConfidenceMeter value={d.confidence} />
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Recent uploads"
        description="Newest documents entering the pipeline"
        className="mt-6"
        action={
          <Button variant="ghost" size="sm" className="rounded-lg" asChild>
            <Link to="/document-flow/documents/library">
              Open library <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        }
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {documents.slice(0, 6).map((d) => (
            <Link
              key={d.id}
              to="/document-flow/documents/$id"
              params={{ id: d.id }}
              className="interactive rounded-2xl border p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <FileText className="size-5 text-primary" />
                <StatusChip status={d.status} />
              </div>
              <p className="mt-3 line-clamp-2 text-sm font-medium">{d.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {d.vendor} · {d.pages} pages · {d.sizeMb} MB
              </p>
              <div className="mt-3 border-t pt-3">
                <ConfidenceMeter value={d.confidence} />
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>
    </AppShell>
  );
}
