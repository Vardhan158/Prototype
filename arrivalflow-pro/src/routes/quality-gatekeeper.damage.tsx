import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PriorityPill, SectionCard, StatCard, StatusBadge } from "@/apps/quality-gatekeeper/components/wms/bits";
import { PhotoGallery } from "@/apps/quality-gatekeeper/components/wms/PhotoGallery";
import { PHOTOS } from "@/apps/quality-gatekeeper/lib/wms-data";

export const Route = createFileRoute("/quality-gatekeeper/damage")({
  head: () => ({
    meta: [
      { title: "Damage Management — AXIOM WMS Quality" },
      { name: "description", content: "Recorded damages by type and severity with photo and video evidence, claims and vendor accountability." },
      { property: "og:title", content: "Damage Management — AXIOM WMS Quality" },
      { property: "og:description", content: "Damage records, severity, evidence and claim status." },
    ],
  }),
  component: DamagePage,
});

const DAMAGES = [
  { id: "DMG-2026-0421", grn: "GRN-2026-004869", type: "Transit Damage", severity: "Major", qty: "4 COIL", vendor: "Tata Steel Processing", claim: "Under Review", date: "31 Jul 2026" },
  { id: "DMG-2026-0418", grn: "GRN-2026-004860", type: "Packing Damage", severity: "Critical", qty: "6,000 EA", vendor: "Guangdong Fasteners", claim: "RTS Approved", date: "30 Jul 2026" },
  { id: "DMG-2026-0409", grn: "GRN-2026-004845", type: "Water Damage", severity: "Minor", qty: "12 EA", vendor: "SKF India", claim: "Closed", date: "29 Jul 2026" },
  { id: "DMG-2026-0402", grn: "GRN-2026-004822", type: "Wrong Item", severity: "Major", qty: "1,200 M", vendor: "Wenzhou Cable Industries", claim: "Dispatched", date: "27 Jul 2026" },
];

function DamagePage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <header>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Quality</p>
        <h1 className="text-2xl font-bold sm:text-3xl">Damage Management</h1>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Damages logged (30d)" value={38} sub="14 transit · 9 packing" icon={<AlertTriangle className="h-5 w-5" />} tone="warning" />
        <StatCard label="Critical severity" value={3} sub="Escalated to procurement" icon={<AlertTriangle className="h-5 w-5" />} tone="danger" />
        <StatCard label="Claim value" value="₹ 13.4 L" sub="₹ 9.1 L recovered" icon={<AlertTriangle className="h-5 w-5" />} tone="primary" />
        <StatCard label="Avg claim closure" value="9.4 days" sub="Target 10 days" icon={<AlertTriangle className="h-5 w-5" />} tone="success" />
      </div>
      <SectionCard title="Damage records" description="Linked to GRN, NCR and vendor scorecard">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Damage ID</TableHead>
                <TableHead>GRN</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Logged</TableHead>
                <TableHead>Claim status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DAMAGES.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="num font-mono text-xs font-semibold text-primary">{d.id}</TableCell>
                  <TableCell className="num font-mono text-xs">{d.grn}</TableCell>
                  <TableCell className="text-xs">{d.type}</TableCell>
                  <TableCell><PriorityPill priority={d.severity} /></TableCell>
                  <TableCell className="num text-right text-xs font-semibold">{d.qty}</TableCell>
                  <TableCell className="max-w-[190px] truncate text-xs">{d.vendor}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{d.date}</TableCell>
                  <TableCell><StatusBadge status={d.claim} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
      <SectionCard title="Damage evidence vault" description="Photos and video clips attached to claims">
        <PhotoGallery
          photos={[
            { src: PHOTOS.damage, label: "Crushed carton", meta: "DMG-2026-0421 · Major" },
            { src: PHOTOS.overall, label: "Pallet context", meta: "DMG-2026-0421 · wide shot" },
            { src: PHOTOS.label, label: "Damaged label", meta: "DMG-2026-0409 · Minor" },
            { src: PHOTOS.serial, label: "Corroded plate", meta: "DMG-2026-0418 · Critical" },
          ]}
        />
      </SectionCard>
    </div>
  );
}
