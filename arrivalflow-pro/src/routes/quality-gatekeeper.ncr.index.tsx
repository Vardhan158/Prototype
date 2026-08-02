import { createFileRoute, Link } from "@tanstack/react-router";
import { FileWarning, Plus, Download, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ncrs } from "@/apps/quality-gatekeeper/lib/qm-data";

export const Route = createFileRoute("/quality-gatekeeper/ncr/")({
  head: () => ({
    meta: [
      { title: "Non-Conformance Reports Â· Axiom WMS" },
      {
        name: "description",
        content:
          "Register of quality non-conformance reports with severity, disposition and CAPA status.",
      },
      { property: "og:title", content: "Non-Conformance Reports Â· Axiom WMS" },
      {
        property: "og:description",
        content: "Track NCRs, root cause and corrective actions across suppliers.",
      },
    ],
  }),
  component: NcrList,
});

const tone = (s: string) =>
  s === "Closed" ? "success" : s === "Open" ? "danger" : s === "CAPA Pending" ? "warning" : "info";

function NcrList() {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const rows = ncrs.filter(
    (n) =>
      (tab === "all" || (tab === "open" ? n.status !== "Closed" : n.status === "Closed")) &&
      [n.id, n.vendor, n.material, n.category].join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Quality", to: "/quality-gatekeeper" }, { label: "NCR" }]}
        eyebrow="Screen 10"
        title="Non-Conformance Reports"
        description="8D-aligned NCR register with root cause, corrective and preventive actions"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("NCR register exported (PDF)")}
            >
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button size="sm" asChild>
              <Link to="/quality-gatekeeper/ncr/new">
                <Plus className="mr-2 h-4 w-4" /> Raise NCR
              </Link>
            </Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { l: "Open NCRs", v: "4", t: "danger" as const },
          { l: "Critical severity", v: "2", t: "danger" as const },
          { l: "CAPA overdue", v: "1", t: "warning" as const },
          { l: "Closed (MTD)", v: "17", t: "success" as const },
        ].map((k) => (
          <div key={k.l} className="surface-card rounded-2xl p-4">
            <p className="text-[11px] text-muted-foreground">{k.l}</p>
            <p className="num mt-1 text-2xl font-semibold">{k.v}</p>
            <StatusPill tone={k.t} className="mt-2" dot={false}>
              {k.t === "success" ? "On track" : "Attention"}
            </StatusPill>
          </div>
        ))}
      </div>

      <SectionCard padded={false}>
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="rounded-xl">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative min-w-[180px] flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search NCR, vendor, materialâ€¦"
              className="h-9 rounded-xl pl-9"
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={FileWarning}
            title="No non-conformance reports"
            description="Nothing matches this filter. NCRs are created automatically when an inspection fails or damage is escalated."
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>NCR</TableHead>
                    <TableHead>Inspection</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>Disposition</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((n) => (
                    <TableRow key={n.id} className="hover:bg-accent/30">
                      <TableCell>
                        <Link
                          to="/quality-gatekeeper/ncr/$id"
                          params={{ id: n.id }}
                          className="num text-xs font-semibold text-primary hover:underline"
                        >
                          {n.id}
                        </Link>
                        <p className="text-[10px] text-muted-foreground">{n.raisedOn}</p>
                      </TableCell>
                      <TableCell className="num text-xs">{n.inspection}</TableCell>
                      <TableCell className="max-w-[160px] truncate text-xs">{n.vendor}</TableCell>
                      <TableCell className="max-w-[170px] truncate text-xs">{n.material}</TableCell>
                      <TableCell className="max-w-[160px] truncate text-xs">{n.category}</TableCell>
                      <TableCell>
                        <StatusPill
                          tone={
                            n.severity === "Critical"
                              ? "danger"
                              : n.severity === "Major"
                                ? "warning"
                                : "info"
                          }
                          dot={false}
                        >
                          {n.severity}
                        </StatusPill>
                      </TableCell>
                      <TableCell className="num text-right text-xs">{n.qty}</TableCell>
                      <TableCell className="text-xs">{n.disposition}</TableCell>
                      <TableCell>
                        <StatusPill tone={tone(n.status)}>{n.status}</StatusPill>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ul className="divide-y divide-border lg:hidden">
              {rows.map((n) => (
                <li key={n.id} className="p-3">
                  <Link to="/quality-gatekeeper/ncr/$id" params={{ id: n.id }} className="block">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <div className="min-w-0">
                        <p className="num truncate text-xs font-semibold text-primary">{n.id}</p>
                        <p className="mt-0.5 truncate text-sm font-medium">{n.material}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {n.vendor} Â· {n.category} Â· {n.qty} units
                        </p>
                      </div>
                      <StatusPill tone={tone(n.status)}>{n.status}</StatusPill>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </SectionCard>
    </>
  );
}
