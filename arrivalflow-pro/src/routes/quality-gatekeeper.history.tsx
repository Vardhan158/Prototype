import { createFileRoute } from "@tanstack/react-router";
import { History as HistoryIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AUDIT_LOG, HISTORY, PHOTOS } from "@/apps/quality-gatekeeper/lib/wms-data";
import { SectionCard, StatCard, StatusBadge, Timeline } from "@/apps/quality-gatekeeper/components/wms/bits";
import { PhotoGallery } from "@/apps/quality-gatekeeper/components/wms/PhotoGallery";

export const Route = createFileRoute("/quality-gatekeeper/history")({
  head: () => ({
    meta: [
      { title: "Inspection History — AXIOM WMS Quality" },
      { name: "description", content: "Complete inspection history with results, inspectors, linked NCRs, evidence photos and immutable audit log." },
      { property: "og:title", content: "Inspection History — AXIOM WMS Quality" },
      { property: "og:description", content: "Past inspections, approvals, NCR links and audit trail." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <header>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Quality Inspection</p>
        <h1 className="text-2xl font-bold sm:text-3xl">Inspection History</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Inspections (30d)" value={276} sub="Across 5 inspectors" icon={<HistoryIcon className="h-5 w-5" />} tone="primary" />
        <StatCard label="Pass rate" value="92.1%" sub="+1.4% vs previous period" icon={<HistoryIcon className="h-5 w-5" />} tone="success" />
        <StatCard label="Partial passes" value={18} sub="Split dispositions" icon={<HistoryIcon className="h-5 w-5" />} tone="warning" />
        <StatCard label="Linked NCRs" value={19} sub="4 still open" icon={<HistoryIcon className="h-5 w-5" />} tone="danger" />
      </div>

      <SectionCard title="Previous inspections" description="Signed and closed dispositions">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>GRN</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Inspector</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="text-right">Accepted</TableHead>
                <TableHead className="text-right">Rejected</TableHead>
                <TableHead>NCR</TableHead>
                <TableHead className="text-right">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {HISTORY.map((h) => (
                <TableRow key={h.grn}>
                  <TableCell className="num font-mono text-xs font-semibold text-primary">{h.grn}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs">{h.vendor}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{h.date}</TableCell>
                  <TableCell className="text-xs">{h.inspector}</TableCell>
                  <TableCell><StatusBadge status={h.result} /></TableCell>
                  <TableCell className="num text-right text-xs text-success">{h.accepted.toLocaleString()}</TableCell>
                  <TableCell className="num text-right text-xs text-destructive">{h.rejected.toLocaleString()}</TableCell>
                  <TableCell className="num font-mono text-xs">{h.ncr}</TableCell>
                  <TableCell className="num text-right text-xs">{h.duration}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-3">
        <SectionCard title="Inspection timeline" description="GRN-2026-004869 · Tata Steel Processing">
          <Timeline
            items={[
              { at: "31 Jul, 21:05", label: "Truck arrived at Dock 07", by: "Gate Security" },
              { at: "31 Jul, 22:10", label: "Inspection started — 100% inspection", by: "N. Verma" },
              { at: "31 Jul, 23:36", label: "4 coils rejected — edge corrosion", by: "N. Verma" },
              { at: "01 Aug, 00:02", label: "Moved to Quality Hold QA-HOLD-01", by: "System" },
              { at: "01 Aug, 08:40", label: "NCR-2026-0317 under review", by: "K. Iyer" },
            ]}
          />
        </SectionCard>

        <SectionCard title="Archived evidence" description="Retention 7 years per QMS policy">
          <PhotoGallery
            className="grid-cols-2 lg:grid-cols-2"
            photos={[
              { src: PHOTOS.damage, label: "Corroded coil edge", meta: "31 Jul, 23:12 · N. Verma" },
              { src: PHOTOS.overall, label: "Lot overview", meta: "31 Jul, 22:18 · N. Verma" },
              { src: PHOTOS.label, label: "Heat number label", meta: "31 Jul, 22:24 · N. Verma" },
              { src: PHOTOS.serial, label: "Coil ID plate", meta: "31 Jul, 22:31 · N. Verma" },
            ]}
          />
        </SectionCard>

        <SectionCard title="Audit log" description="Tamper-evident · exported to GRC nightly">
          <ul className="space-y-3">
            {AUDIT_LOG.map((a, i) => (
              <li key={i} className="rounded-xl border border-border p-3">
                <p className="text-xs font-semibold">{a.action}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {a.at} · {a.user} ({a.role}) · IP {a.ip}
                </p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
