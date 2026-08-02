import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EmptyState,
  PageHeader,
  SectionCard,
} from "@/apps/quality-gatekeeper/components/qm/Primitives";
import { StatusPill } from "@/apps/quality-gatekeeper/components/qm/StatusPill";
import { scraps } from "@/apps/quality-gatekeeper/lib/qm-data";

export const Route = createFileRoute("/quality-gatekeeper/scrap")({
  head: () => ({
    meta: [
      { title: "Scrap Management Â· Axiom WMS" },
      {
        name: "description",
        content: "Scrap requests with cost of poor quality, approval routing and disposal evidence",
      },
      { property: "og:title", content: "Scrap Management Â· Axiom WMS" },
      {
        property: "og:description",
        content: "Scrap requests with cost of poor quality, approval routing and disposal evidence",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const [q, setQ] = useState("");
  const rows = scraps.filter((r) =>
    [r.id, r.material, r.reason].join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Quality", to: "/quality-gatekeeper" },
          { label: "Scrap Management" },
        ]}
        eyebrow="Screen 14"
        title="Scrap Management"
        description="Scrap requests with cost of poor quality, approval routing and disposal evidence"
        actions={
          <Button variant="outline" size="sm" onClick={() => toast.success("Exported to XLSX")}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi l="Open requests" v="1" />
        <Kpi l="Scrap value MTD" v="SAR 20.1k" />
        <Kpi l="Units scrapped" v="180" />
        <Kpi l="Scrap rate" v="0.8%" />
      </div>

      <SectionCard padded={false}>
        <div className="border-b border-border p-3">
          <div className="relative max-w-md">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search recordsâ€¦"
              className="h-9 rounded-xl pl-9"
            />
          </div>
        </div>
        {rows.length === 0 ? (
          <EmptyState
            title="Nothing to show"
            description="No records match the current search. Records appear here as dispositions are created from NCRs."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Scrap No.</TableHead>
                  <TableHead>NCR</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Scrap cost</TableHead>
                  <TableHead>Approver</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} className="hover:bg-accent/30">
                    <TableCell className="num text-xs font-semibold text-primary">{r.id}</TableCell>
                    <TableCell className="num text-xs">{r.ncr}</TableCell>
                    <TableCell className="max-w-[180px] truncate text-xs">{r.material}</TableCell>
                    <TableCell className="num text-xs">
                      {r.qty} {r.uom}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">
                      {r.reason}
                    </TableCell>
                    <TableCell className="num text-xs">SAR {r.cost.toLocaleString()}</TableCell>
                    <TableCell className="text-xs">{r.approver}</TableCell>
                    <TableCell>
                      <StatusPill
                        tone={
                          r.status === "Disposed"
                            ? "success"
                            : r.status === "Approved"
                              ? "info"
                              : "warning"
                        }
                      >
                        {r.status}
                      </StatusPill>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>
    </>
  );
}

function Kpi({ l, v }: { l: string; v: string }) {
  return (
    <div className="surface-card rounded-2xl p-4">
      <p className="text-[11px] text-muted-foreground">{l}</p>
      <p className="num mt-1 text-2xl font-semibold">{v}</p>
    </div>
  );
}
