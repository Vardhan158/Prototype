import { createFileRoute, Link } from "@tanstack/react-router";
import { Printer } from "lucide-react";

import { AppShell } from "@work/components/ams/AppShell";
import { StatusBadge } from "@work/components/ams/StatusBadge";
import { Button } from "@work/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@work/components/ui/table";
import { useAms } from "@work/lib/ams/store";

export const Route = createFileRoute("/work-craft/certificates/$number")({
  head: () => ({
    meta: [
      { title: "Assembly Completion Certificate — AMS" },
      {
        name: "description",
        content:
          "Printable assembly completion certificate with tests performed, components used and approval details.",
      },
      { property: "og:title", content: "Assembly Completion Certificate — AMS" },
      {
        property: "og:description",
        content: "BR-088 printable assembly completion certificate.",
      },
    ],
  }),
  component: CertificateDetail,
});

function CertificateDetail() {
  const { number } = Route.useParams();
  const { certificates } = useAms();
  const cert = certificates.find((c) => c.certificateNumber === number);

  if (!cert) {
    return (
      <AppShell title="Certificate not found">
        <div className="surface-card p-8 text-sm text-muted-foreground">
          No certificate exists with number {number}.
          <div className="mt-4">
            <Link to="/work-craft/certificates">
              <Button variant="outline">Back to Certificates</Button>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={cert.certificateNumber}
      description="Assembly Completion Certificate"
      actions={
        <div className="no-print flex gap-2">
          <Link to="/work-craft/certificates">
            <Button variant="outline">Back</Button>
          </Link>
          <Button onClick={() => window.print()}>
            <Printer className="size-4" /> Print
          </Button>
        </div>
      }
    >
      <div className="surface-card mx-auto max-w-4xl p-8">
        <div className="border-b border-border pb-6 text-center">
          <h2 className="text-xl font-semibold text-foreground">
            Assembly Completion Certificate
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Certificate No. {cert.certificateNumber}
          </p>
        </div>

        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
          {[
            ["Work Order", cert.workOrderId],
            ["Product", cert.product],
            ["Finished Goods Serial", cert.serialNumber],
            ["Completion Date", cert.completionDate],
            ["Operator", cert.operator],
            ["Approving Manager", cert.manager],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
            </div>
          ))}
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Approval</dt>
            <dd className="mt-1">
              <StatusBadge value={cert.approval} />
            </dd>
          </div>
        </dl>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-foreground">Tests Performed</h3>
          <Table className="mt-3">
            <TableHeader>
              <TableRow>
                <TableHead>Test</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Inspector</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cert.testsPerformed.map((t) => (
                <TableRow key={t.name}>
                  <TableCell>{t.name}</TableCell>
                  <TableCell>
                    <StatusBadge value={t.result} />
                  </TableCell>
                  <TableCell>{t.inspector || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-foreground">Components Used</h3>
          <Table className="mt-3">
            <TableHeader>
              <TableRow>
                <TableHead>Component Code</TableHead>
                <TableHead>Component Name</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cert.componentsUsed.map((c) => (
                <TableRow key={c.componentCode}>
                  <TableCell>{c.componentCode}</TableCell>
                  <TableCell>{c.componentName}</TableCell>
                  <TableCell className="text-right">{c.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          <div className="border-t border-border pt-3 text-sm text-muted-foreground">
            Operator Signature — {cert.operator}
          </div>
          <div className="border-t border-border pt-3 text-sm text-muted-foreground">
            Manager Signature — {cert.manager}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
