import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Unlock, XCircle, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EmptyState,
  PageHeader,
  SectionCard,
} from "@/apps/quality-gatekeeper/components/qm/Primitives";
import { StatusPill } from "@/apps/quality-gatekeeper/components/qm/StatusPill";
import { holds } from "@/apps/quality-gatekeeper/lib/qm-data";

export const Route = createFileRoute("/quality-gatekeeper/hold")({
  head: () => ({
    meta: [
      { title: "Quality Hold Â· Axiom WMS" },
      {
        name: "description",
        content:
          "Blocked stock register with hold reasons, quarantine locations, release and reject actions.",
      },
      { property: "og:title", content: "Quality Hold Â· Axiom WMS" },
      {
        property: "og:description",
        content: "Manage quarantined warehouse stock and hold dispositions.",
      },
    ],
  }),
  component: HoldPage,
});

function HoldPage() {
  const [q, setQ] = useState("");
  const [action, setAction] = useState<{ id: string; type: "release" | "reject" } | null>(null);
  const rows = holds.filter((h) =>
    [h.id, h.material, h.vendor, h.reason].join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Quality", to: "/quality-gatekeeper" }, { label: "Quality Hold" }]}
        eyebrow="Screen 11"
        title="Quality Hold"
        description="Stock blocked from putaway and issue until quality disposition"
        actions={
          <Button size="sm" asChild>
            <Link to="/quality-gatekeeper/queue">Create hold from queue</Link>
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi l="Active holds" v="3" tone="warning" />
        <Kpi l="Blocked units" v="48" tone="danger" />
        <Kpi l="Blocked value" v="SAR 214k" tone="danger" />
        <Kpi l="Avg hold age" v="0.7 d" tone="success" />
      </div>

      <SectionCard padded={false}>
        <div className="border-b border-border p-3">
          <div className="relative max-w-md">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search hold, material, vendorâ€¦"
              className="h-9 rounded-xl pl-9"
            />
          </div>
        </div>
        {rows.length === 0 ? (
          <EmptyState
            icon={Lock}
            title="No quality holds"
            description="No stock is currently blocked for this filter."
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Hold No.</TableHead>
                    <TableHead>Inspection</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Blocked qty</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((h) => (
                    <TableRow key={h.id} className="hover:bg-accent/30">
                      <TableCell className="num text-xs font-semibold text-primary">
                        {h.id}
                      </TableCell>
                      <TableCell className="num text-xs">
                        <Link
                          to="/quality-gatekeeper/queue/$id"
                          params={{ id: h.inspection }}
                          className="hover:underline"
                        >
                          {h.inspection}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate text-xs">{h.material}</TableCell>
                      <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">
                        {h.reason}
                      </TableCell>
                      <TableCell className="num text-right text-xs">
                        {h.qty} {h.uom}
                      </TableCell>
                      <TableCell className="num text-xs">{h.location}</TableCell>
                      <TableCell className="text-xs">{h.inspector}</TableCell>
                      <TableCell className="num text-xs">{h.ageDays} d</TableCell>
                      <TableCell>
                        <StatusPill
                          tone={
                            h.status === "Active"
                              ? "warning"
                              : h.status === "Released"
                                ? "success"
                                : "danger"
                          }
                        >
                          {h.status}
                        </StatusPill>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={h.status !== "Active"}
                            onClick={() => setAction({ id: h.id, type: "release" })}
                          >
                            <Unlock className="mr-1.5 h-3.5 w-3.5 text-success" /> Release
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={h.status !== "Active"}
                            onClick={() => setAction({ id: h.id, type: "reject" })}
                          >
                            <XCircle className="mr-1.5 h-3.5 w-3.5 text-destructive" /> Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ul className="divide-y divide-border lg:hidden">
              {rows.map((h) => (
                <li key={h.id} className="p-3">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="num truncate text-xs font-semibold text-primary">{h.id}</p>
                      <p className="mt-0.5 truncate text-sm font-medium">{h.material}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{h.reason}</p>
                      <p className="num truncate text-[11px] text-muted-foreground">
                        {h.qty} {h.uom} Â· {h.location}
                      </p>
                    </div>
                    <StatusPill tone={h.status === "Active" ? "warning" : "success"}>
                      {h.status}
                    </StatusPill>
                  </div>
                  {h.status === "Active" && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setAction({ id: h.id, type: "release" })}
                      >
                        Release
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-destructive"
                        onClick={() => setAction({ id: h.id, type: "reject" })}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </SectionCard>

      <Dialog open={action !== null} onOpenChange={(o) => !o && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action?.type === "release" ? "Release quality hold" : "Reject held stock"}
            </DialogTitle>
            <DialogDescription>
              {action?.type === "release"
                ? `${action?.id} will be unblocked and the quantity moved to unrestricted-use stock.`
                : `${action?.id} will be rejected. An NCR and return-to-supplier request will be generated.`}
            </DialogDescription>
          </DialogHeader>
          <Textarea rows={3} placeholder="Justification / decision notesâ€¦" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>
              Cancel
            </Button>
            <Button
              variant={action?.type === "reject" ? "destructive" : "default"}
              onClick={() => {
                toast.success(
                  action?.type === "release"
                    ? "Hold released â€” stock unblocked"
                    : "Stock rejected â€” NCR raised",
                );
                setAction(null);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Kpi({ l, v, tone }: { l: string; v: string; tone: "warning" | "danger" | "success" }) {
  return (
    <div className="surface-card rounded-2xl p-4">
      <p className="text-[11px] text-muted-foreground">{l}</p>
      <p className="num mt-1 text-2xl font-semibold">{v}</p>
      <StatusPill tone={tone} className="mt-2" dot={false}>
        {tone === "success" ? "Within target" : "Monitor"}
      </StatusPill>
    </div>
  );
}
