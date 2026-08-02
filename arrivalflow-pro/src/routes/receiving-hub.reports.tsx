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
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { HOURLY_RECEIPTS, VENDOR_PERFORMANCE } from "@/apps/receiving-hub/lib/wms-data";

export const Route = createFileRoute("/receiving-hub/reports")({
  head: () => ({
    meta: [
      { title: "Receiving Reports & KPIs | AXIOM WMS Inbound" },
      {
        name: "description",
        content:
          "Daily receiving, vendor performance, variance, damage, dock utilisation and operator KPI reporting.",
      },
      { property: "og:title", content: "Receiving Reports & KPIs | AXIOM WMS Inbound" },
      {
        property: "og:description",
        content:
          "Daily receiving, vendor performance, variance, damage, dock utilisation and operator KPI reporting.",
      },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Reports & KPIs"
        subtitle="Inbound analytics for 01 Aug 2026 Â· shift A"
        crumbs={[{ label: "Inbound", to: "/receiving-hub" }, { label: "Reports" }]}
        actions={
          <Button variant="outline" onClick={() => toast.success("Report pack exported")}>
            <Download className="mr-2 h-4 w-4" /> Export pack
          </Button>
        }
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="elevated-card">
          <CardHeader>
            <CardTitle className="text-base">Units received by window</CardTitle>
            <CardDescription>Daily receiving report</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HOURLY_RECEIPTS} margin={{ left: 8, right: 12, top: 8 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="var(--color-muted-foreground)"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="var(--color-muted-foreground)"
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="units" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="elevated-card">
          <CardHeader>
            <CardTitle className="text-base">Vendor performance</CardTitle>
            <CardDescription>OTIF % and quantity variance %</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface-2/70 hover:bg-surface-2/70">
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Receipts</TableHead>
                  <TableHead className="text-right">OTIF %</TableHead>
                  <TableHead className="text-right">Variance %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {VENDOR_PERFORMANCE.map((v) => (
                  <TableRow key={v.vendor}>
                    <TableCell className="text-sm">{v.vendor}</TableCell>
                    <TableCell className="num text-right text-xs">{v.receipts}</TableCell>
                    <TableCell className="num text-right text-xs">{v.otif}%</TableCell>
                    <TableCell className="num text-right text-xs">{v.variance}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="elevated-card xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Report library</CardTitle>
            <CardDescription>Generate, schedule or email standard inbound reports</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Receiving Report",
              "GRN Report",
              "Vendor Report",
              "Variance Report",
              "Damage Report",
              "Dock Utilisation",
              "Operator Performance",
              "Receiving KPI",
            ].map((r) => (
              <button
                key={r}
                onClick={() =>
                  toast.success(`${r} generated`, {
                    description: "Available in your downloads within 30 seconds.",
                  })
                }
                className="rounded-xl border border-border bg-surface-2/50 p-4 text-left transition hover:border-ring"
              >
                <p className="text-sm font-medium">{r}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF Â· XLSX Â· scheduled daily 18:00
                </p>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
