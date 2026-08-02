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
import { AUDIT_LOGS } from "@/apps/receiving-hub/lib/wms-data";

export const Route = createFileRoute("/receiving-hub/audit")({
  head: () => ({
    meta: [
      { title: "Audit Logs | AXIOM WMS Inbound" },
      {
        name: "description",
        content:
          "Immutable audit trail of every receiving action with timestamp, user, IP address, device and change detail.",
      },
      { property: "og:title", content: "Audit Logs | AXIOM WMS Inbound" },
      {
        property: "og:description",
        content:
          "Immutable audit trail of every receiving action with timestamp, user, IP address, device and change detail.",
      },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Audit Logs"
        subtitle="Immutable, tamper-evident trail retained for 7 years"
        crumbs={[{ label: "Governance", to: "/receiving-hub" }, { label: "Audit Logs" }]}
      />
      <Card className="elevated-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-2/70 hover:bg-surface-2/70">
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>IP address</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {AUDIT_LOGS.map((l, i) => (
              <TableRow key={i}>
                <TableCell className="num text-xs">{l.ts}</TableCell>
                <TableCell className="text-xs">{l.user}</TableCell>
                <TableCell>
                  <Tone
                    tone={
                      l.action.includes("REJECT")
                        ? "destructive"
                        : l.action.includes("DISCREPANCY")
                          ? "warning"
                          : "info"
                    }
                  >
                    {l.action}
                  </Tone>
                </TableCell>
                <TableCell className="num text-xs">{l.entity}</TableCell>
                <TableCell className="num text-xs">{l.ip}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{l.device}</TableCell>
                <TableCell className="text-xs">{l.change}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
