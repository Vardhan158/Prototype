import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/ams/AppShell";
import { StatusBadge } from "@/components/ams/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAms } from "@/lib/ams/store";

export const Route = createFileRoute("/certificates/")({
  head: () => ({
    meta: [
      { title: "Assembly Completion Certificates — AMS" },
      {
        name: "description",
        content:
          "Assembly completion certificates listing tests performed, components used, operator and manager approval.",
      },
      { property: "og:title", content: "Assembly Completion Certificates — AMS" },
      {
        property: "og:description",
        content: "BR-088 assembly completion certificate register.",
      },
    ],
  }),
  component: CertificatesPage,
});

function CertificatesPage() {
  const { certificates } = useAms();

  return (
    <AppShell
      title="Assembly Certificates"
      description="BR-088 Assembly Completion Certificate."
    >
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate Number</TableHead>
                <TableHead>Work Order</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Completion Date</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.map((c) => (
                <TableRow key={c.certificateNumber}>
                  <TableCell className="font-medium">{c.certificateNumber}</TableCell>
                  <TableCell>
                    <Link
                      to="/work-orders/$id"
                      params={{ id: c.workOrderId }}
                      className="text-primary hover:underline"
                    >
                      {c.workOrderId}
                    </Link>
                  </TableCell>
                  <TableCell>{c.product}</TableCell>
                  <TableCell>{c.serialNumber}</TableCell>
                  <TableCell>{c.operator}</TableCell>
                  <TableCell>{c.completionDate}</TableCell>
                  <TableCell>
                    <StatusBadge value={c.approval} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to="/certificates/$number" params={{ number: c.certificateNumber }}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppShell>
  );
}
