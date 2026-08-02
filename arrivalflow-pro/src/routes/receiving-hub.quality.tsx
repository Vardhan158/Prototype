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

export const Route = createFileRoute("/receiving-hub/quality")({
  head: () => ({
    meta: [
      { title: "Quality Inspection | AXIOM WMS Inbound" },
      {
        name: "description",
        content:
          "Inspection queue with assigned inspector, sampling plan, priority, due time and result status.",
      },
      { property: "og:title", content: "Quality Inspection | AXIOM WMS Inbound" },
      {
        property: "og:description",
        content:
          "Inspection queue with assigned inspector, sampling plan, priority, due time and result status.",
      },
    ],
  }),
  component: QualityPage,
});

function QualityPage() {
  const { state } = useWms();
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Quality Inspection"
        subtitle={`${state.inspections.length} inspections in the QA pipeline`}
        crumbs={[{ label: "Inbound", to: "/receiving-hub" }, { label: "Quality Inspection" }]}
      />
      <Card className="elevated-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-2/70 hover:bg-surface-2/70">
              <TableHead>Inspection</TableHead>
              <TableHead>GRN</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Inspector</TableHead>
              <TableHead>Sampling</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.inspections.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="num text-xs font-semibold">{i.id}</TableCell>
                <TableCell className="num text-xs">{i.grn}</TableCell>
                <TableCell className="num text-xs">{i.material}</TableCell>
                <TableCell className="text-sm">{i.inspector}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{i.sample}</TableCell>
                <TableCell>
                  <Tone
                    tone={
                      i.priority === "Critical"
                        ? "destructive"
                        : i.priority === "High"
                          ? "warning"
                          : "info"
                    }
                  >
                    {i.priority}
                  </Tone>
                </TableCell>
                <TableCell className="num text-xs">{i.due}</TableCell>
                <TableCell>
                  <Tone
                    tone={
                      i.status === "Passed"
                        ? "success"
                        : i.status === "In Progress"
                          ? "info"
                          : "warning"
                    }
                  >
                    {i.status}
                  </Tone>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
