import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PageHeader,
  StatusPill,
  Tone,
  Field,
  EmptyState,
} from "@/apps/receiving-hub/components/wms/primitives";
import { useWms } from "@/apps/receiving-hub/lib/wms-store";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { ApprovalDialog } from "@/apps/receiving-hub/components/wms/dialogs";

export const Route = createFileRoute("/receiving-hub/approvals")({
  head: () => ({
    meta: [
      { title: "Receiving Approvals | AXIOM WMS Inbound" },
      {
        name: "description",
        content:
          "Approve, hold or reject receiving exceptions with manager comments and digital signature.",
      },
      { property: "og:title", content: "Receiving Approvals | AXIOM WMS Inbound" },
      {
        property: "og:description",
        content:
          "Approve, hold or reject receiving exceptions with manager comments and digital signature.",
      },
    ],
  }),
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const { state } = useWms();
  const [target, setTarget] = useState<{ id: string; mode: "approve" | "reject" | "hold" } | null>(
    null,
  );
  const pending = state.shipments.filter((s) =>
    ["Discrepancy", "Partial Receipt", "On Hold"].includes(s.status),
  );
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Receiving Approvals"
        subtitle={`${pending.length} exceptions awaiting a manager decision`}
        crumbs={[{ label: "Inbound", to: "/receiving-hub" }, { label: "Approvals" }]}
      />
      {pending.length === 0 ? (
        <Card className="elevated-card">
          <EmptyState
            icon={ShieldCheck}
            title="No approvals pending"
            body="Every receipt is within tolerance. Exceptions raised on the floor appear here instantly."
            action={
              <Button asChild>
                <Link to="/receiving-hub/queue">Open receiving queue</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {pending.map((s) => (
            <Card key={s.id} className="elevated-card">
              <CardContent className="flex flex-wrap items-center gap-4 p-5">
                <div className="min-w-[220px] flex-1">
                  <p className="num text-sm font-semibold">
                    {s.truckNo} Â· {s.id}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {s.vendor} Â· {s.po}
                  </p>
                </div>
                <StatusPill status={s.status} />
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTarget({ id: s.id, mode: "hold" })}
                  >
                    Hold
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => setTarget({ id: s.id, mode: "reject" })}
                  >
                    Reject
                  </Button>
                  <Button size="sm" onClick={() => setTarget({ id: s.id, mode: "approve" })}>
                    Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <ApprovalDialog
        shipmentId={target?.id ?? null}
        mode={target?.mode ?? "approve"}
        onClose={() => setTarget(null)}
      />
    </div>
  );
}
