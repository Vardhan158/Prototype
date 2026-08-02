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
import { reworks } from "@/apps/quality-gatekeeper/lib/qm-data";

export const Route = createFileRoute("/quality-gatekeeper/rework")({
  head: () => ({
    meta: [
      { title: "Rework Orders Â· Axiom WMS" },
      {
        name: "description",
        content:
          "Rework orders raised against non-conforming material with assigned teams and re-inspection gates",
      },
      { property: "og:title", content: "Rework Orders Â· Axiom WMS" },
      {
        property: "og:description",
        content:
          "Rework orders raised against non-conforming material with assigned teams and re-inspection gates",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const [q, setQ] = useState("");
  const rows = reworks.filter((r) =>
    [r.id, r.material, r.team, r.reason].join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Quality", to: "/quality-gatekeeper" }, { label: "Rework Orders" }]}
        eyebrow="Screen 13"
        title="Rework Orders"
        description="Rework orders raised against non-conforming material with assigned teams and re-inspection gates"
        actions={
          <Button variant="outline" size="sm" onClick={() => toast.success("Exported to XLSX")}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi l="Active orders" v="2" />
        <Kpi l="Units in rework" v="8" />
        <Kpi l="Awaiting re-inspection" v="6" />
        <Kpi l="On-time rate" v="92%" />
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
                  <TableHead>Rework Order</TableHead>
                  <TableHead>NCR</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Assigned team</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Expected completion</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} className="hover:bg-accent/30">
                    <TableCell className="num text-xs font-semibold text-primary">{r.id}</TableCell>
                    <TableCell className="num text-xs">
                      <Link
                        to="/quality-gatekeeper/ncr/$id"
                        params={{ id: r.ncr }}
                        className="hover:underline"
                      >
                        {r.ncr}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate text-xs">{r.material}</TableCell>
                    <TableCell className="num text-xs">{r.qty}</TableCell>
                    <TableCell className="text-xs">{r.team}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                      {r.reason}
                    </TableCell>
                    <TableCell className="num text-xs">{r.due}</TableCell>
                    <TableCell className="w-32">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="brand-gradient h-full rounded-full"
                          style={{ width: `${r.progress}%` }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusPill
                        tone={
                          r.status === "Completed"
                            ? "success"
                            : r.status === "Re-Inspection"
                              ? "warning"
                              : "info"
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
