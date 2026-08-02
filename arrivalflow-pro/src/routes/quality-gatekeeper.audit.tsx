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
import { auditTrail } from "@/apps/quality-gatekeeper/lib/qm-data";

export const Route = createFileRoute("/quality-gatekeeper/audit")({
  head: () => ({
    meta: [
      { title: "Audit Trail Â· Axiom WMS" },
      {
        name: "description",
        content:
          "Immutable, 21 CFR Part 11 aligned log of every quality action, device and IP address",
      },
      { property: "og:title", content: "Audit Trail Â· Axiom WMS" },
      {
        property: "og:description",
        content:
          "Immutable, 21 CFR Part 11 aligned log of every quality action, device and IP address",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const [q, setQ] = useState("");
  const rows = auditTrail.filter((r) =>
    [r.user, r.action, r.object, r.changes].join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Quality", to: "/quality-gatekeeper" }, { label: "Audit Trail" }]}
        eyebrow="Screen 20"
        title="Audit Trail"
        description="Immutable, 21 CFR Part 11 aligned log of every quality action, device and IP address"
        actions={
          <Button variant="outline" size="sm" onClick={() => toast.success("Exported to XLSX")}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi l="Events today" v="148" />
        <Kpi l="Users active" v="11" />
        <Kpi l="Failed logins" v="0" />
        <Kpi l="Retention" v="7 years" />
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
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Object</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Changes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} className="hover:bg-accent/30">
                    <TableCell className="text-xs font-medium">{r.user}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.role}</TableCell>
                    <TableCell className="text-xs">{r.action}</TableCell>
                    <TableCell className="num text-xs text-primary">{r.object}</TableCell>
                    <TableCell className="num text-xs">{r.timestamp}</TableCell>
                    <TableCell className="max-w-[170px] truncate text-xs text-muted-foreground">
                      {r.device}
                    </TableCell>
                    <TableCell className="num text-xs">{r.ip}</TableCell>
                    <TableCell className="max-w-[230px] truncate text-xs text-muted-foreground">
                      {r.changes}
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
