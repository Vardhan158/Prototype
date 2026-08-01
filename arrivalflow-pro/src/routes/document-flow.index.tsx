import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  FileStack,
  ScanText,
  Gauge,
  CalendarClock,
  ClipboardCheck,
  TriangleAlert,
  Upload,
  ArrowRight,
  DoorOpen,
  PackageCheck,
  Boxes,
} from "lucide-react";
import { AppShell } from "@/apps/document-flow/components/wms/AppShell";
import { KpiCard, SectionCard, StatusChip } from "@/apps/document-flow/components/wms/primitives";
import { Button } from "@/components/ui/button";
import { documents, recentActivity } from "@/apps/document-flow/wms-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/document-flow/")({
  head: () => ({
    meta: [
      { title: "Operations Dashboard — Axion WMS" },
      { name: "description", content: "Warehouse operations overview: documents, OCR queue, receiving and gate activity." },
      { property: "og:title", content: "Operations Dashboard — Axion WMS" },
      { property: "og:description", content: "Warehouse operations overview: documents, OCR queue, receiving and gate activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const toneDot: Record<string, string> = {
  primary: "bg-primary",
  teal: "bg-teal",
  success: "bg-success",
  danger: "bg-destructive",
  muted: "bg-muted-foreground",
};

function DashboardPage() {
  const navigate = useNavigate();
  const go = () => navigate({ to: "/document-flow/documents" });

  return (
    <AppShell
      title="Good morning, Rohan"
      subtitle="Shift A · WH-01 Bhiwandi Central · 31 July 2026"
      breadcrumb={[{ label: "Home", to: "/document-flow" }, { label: "Dashboard" }]}
      actions={
        <>
          <Button variant="outline" className="rounded-xl" asChild>
            <Link to="/document-flow/documents/library">Document Library</Link>
          </Button>
          <Button className="rounded-xl" asChild>
            <Link to="/document-flow/documents/upload">
              <Upload className="mr-2 size-4" /> Upload Document
            </Link>
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard label="Total Documents" value="18,942" delta="+312 this week" icon={FileStack} onClick={go} footer="Across 4 warehouses and 218 vendors" />
        <KpiCard label="OCR Pending" value="412" delta="Queue 6 min" tone="warning" icon={ScanText} onClick={() => navigate({ to: "/document-flow/ocr" })} footer="Average processing time 43 sec / document" />
        <KpiCard label="OCR Success Rate" value="97.3%" delta="+1.2%" tone="success" icon={Gauge} onClick={go} footer="Rolling 7-day average, all document types" />
        <KpiCard label="Documents Today" value="311" delta="Peak 11:00" tone="teal" icon={CalendarClock} onClick={go} footer="184 inbound · 87 gate · 40 asset" />
        <KpiCard label="Pending Reviews" value="27" delta="6 overdue" tone="warning" icon={ClipboardCheck} onClick={() => navigate({ to: "/document-flow/documents/library" })} footer="SLA breach in 2 hrs for 3 invoices" />
        <KpiCard label="Failed OCR" value="9" delta="-4 vs yday" tone="danger" icon={TriangleAlert} onClick={() => navigate({ to: "/document-flow/ocr" })} footer="Low resolution (6) · Missing pages (3)" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <SectionCard
          title="Recent documents"
          description="Latest uploads across all modules"
          className="xl:col-span-2"
          action={
            <Button variant="ghost" size="sm" className="rounded-lg" asChild>
              <Link to="/document-flow/documents/library">
                View all <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          }
        >
          <div className="divide-y">
            {documents.slice(0, 6).map((d) => (
              <Link
                key={d.id}
                to="/document-flow/documents/$id"
                params={{ id: d.id }}
                className="flex items-center gap-4 py-3 transition-colors hover:bg-accent/50"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-[10px] font-bold text-primary">
                  {d.format}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {d.id} · {d.vendor} · {d.uploadedAt}
                  </p>
                </div>
                <StatusChip status={d.status} />
              </Link>
            ))}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Recent activity" description="Live operations feed">
            <ol className="relative space-y-4 border-l pl-5">
              {recentActivity.map((a) => (
                <li key={a.action} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[23px] top-1.5 size-2.5 rounded-full ring-4 ring-card",
                      toneDot[a.tone],
                    )}
                  />
                  <p className="text-sm">
                    <span className="font-semibold">{a.user}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {a.role} · {a.time}
                  </p>
                </li>
              ))}
            </ol>
          </SectionCard>

          <SectionCard title="Module shortcuts">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Gate Entry", icon: DoorOpen, sub: "12 vehicles in" },
                { label: "Receiving", icon: PackageCheck, sub: "8 open GRNs" },
                { label: "OCR Queue", icon: ScanText, sub: "412 pending", to: "/document-flow/ocr" },
                { label: "Inventory", icon: Boxes, sub: "99.1% accuracy" },
              ].map((s) => (
                <Link
                  key={s.label}
                  to={s.to ?? "/document-flow/documents"}
                  className="rounded-2xl border p-3 transition-colors hover:border-primary/40 hover:bg-accent/50"
                >
                  <s.icon className="size-5 text-primary" />
                  <p className="mt-2 text-sm font-medium">{s.label}</p>
                  <p className="text-[11px] text-muted-foreground">{s.sub}</p>
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
