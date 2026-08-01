import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanText, TriangleAlert, Timer, CheckCircle2, Play } from "lucide-react";
import { AppShell } from "@/apps/document-flow/components/wms/AppShell";
import { ConfidenceMeter, KpiCard, SectionCard, StatusChip } from "@/apps/document-flow/components/wms/primitives";
import { Button } from "@/components/ui/button";
import { documents } from "@/apps/document-flow/wms-data";
import { toast } from "sonner";

export const Route = createFileRoute("/document-flow/ocr/")({
  head: () => ({
    meta: [
      { title: "OCR Processing Queue — Axion WMS" },
      { name: "description", content: "Live OCR extraction queue: pending, processing, completed and failed warehouse documents." },
      { property: "og:title", content: "OCR Processing Queue — Axion WMS" },
      { property: "og:description", content: "Live OCR extraction queue: pending, processing, completed and failed warehouse documents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OcrQueue,
});

function OcrQueue() {
  const failed = documents.filter((d) => d.status === "OCR Failed");
  const queue = documents.filter((d) => d.status !== "OCR Failed");

  return (
    <AppShell
      title="OCR Processing"
      subtitle="Engine v4.2 · 3 workers online · average 43 sec per document"
      breadcrumb={[{ label: "Home", to: "/document-flow" }, { label: "OCR Processing" }]}
      actions={
        <Button className="rounded-xl" onClick={() => toast.success("Queue drained — 412 documents dispatched to 3 workers")}>
          <Play className="mr-2 size-4" /> Run full queue
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="In queue" value="412" tone="primary" icon={ScanText} delta="6 min wait" footer="Priority lane: 18 gate documents" />
        <KpiCard label="Processing now" value="7" tone="teal" icon={Timer} delta="live" footer="Workers: ocr-w1, ocr-w2, ocr-w4" />
        <KpiCard label="Completed today" value="298" tone="success" icon={CheckCircle2} delta="97.3% avg" footer="184 auto-approved above 95% confidence" />
        <KpiCard label="Failed" value="9" tone="danger" icon={TriangleAlert} delta="6 retryable" footer="Low resolution (6) · Missing pages (3)" />
      </div>

      {failed.length > 0 && (
        <SectionCard title="Failures needing attention" description="Retry, re-scan or fall back to manual entry" className="mt-6">
          <div className="space-y-3">
            {failed.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-destructive/30 bg-destructive-soft/50 p-4">
                <TriangleAlert className="size-5 text-destructive" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.id} · Low resolution (142 DPI) · page 2 unreadable
                  </p>
                </div>
                <Button size="sm" className="rounded-lg" asChild>
                  <Link to="/document-flow/ocr/$id" params={{ id: d.id }}>Open failure</Link>
                </Button>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard title="Extraction queue" description={`${queue.length} documents`} className="mt-6">
        <div className="space-y-2">
          {queue.map((d) => (
            <Link
              key={d.id}
              to="/document-flow/ocr/$id"
              params={{ id: d.id }}
              className="flex flex-wrap items-center gap-4 rounded-2xl border p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-[10px] font-bold text-primary">
                {d.format}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{d.name}</p>
                <p className="text-xs text-muted-foreground">{d.id} · {d.type} · {d.vendor}</p>
              </div>
              <ConfidenceMeter value={d.confidence} />
              <StatusChip status={d.status} />
            </Link>
          ))}
        </div>
      </SectionCard>
    </AppShell>
  );
}
