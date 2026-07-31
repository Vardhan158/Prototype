import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@work/components/ams/AppShell";
import { StatusBadge } from "@work/components/ams/StatusBadge";
import { Button } from "@work/components/ui/button";
import { Input } from "@work/components/ui/input";
import { Label } from "@work/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@work/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@work/components/ui/table";
import { Textarea } from "@work/components/ui/textarea";
import { OPERATORS, REASON_CODES } from "@work/lib/ams/mock-data";
import { useAms } from "@work/lib/ams/store";
import type { ReworkScrapType } from "@work/lib/ams/types";

export const Route = createFileRoute("/work-craft/rework-scrap")({
  head: () => ({
    meta: [
      { title: "Rework & Scrap Recording — AMS" },
      {
        name: "description",
        content:
          "Record rework and scrap against assembly work orders with reason codes, cost impact and manager approval status.",
      },
      { property: "og:title", content: "Rework & Scrap Recording — AMS" },
      {
        property: "og:description",
        content: "BR-085 rework and scrap register for the Assembly Management module.",
      },
    ],
  }),
  component: ReworkScrapPage,
});

function ReworkScrapPage() {
  const { workOrders, reworkScrap, addReworkScrap, currentUser } = useAms();
  const [form, setForm] = useState({
    workOrderId: "",
    type: "Rework" as ReworkScrapType,
    reasonCode: "",
    description: "",
    costImpact: 0,
    operator: (currentUser ?? OPERATORS[0]!) as string,
  });
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!form.workOrderId || !form.reasonCode) {
      setError("Work order and reason code are required.");
      return;
    }
    setError(null);
    addReworkScrap({ ...form, approvalStatus: "Pending Approval" });
    setForm({ ...form, reasonCode: "", description: "", costImpact: 0 });
  };

  return (
    <AppShell
      title="Rework & Scrap"
      description="BR-085 Rework and Scrap Recording."
    >
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="surface-card p-6">
          <h2 className="text-sm font-semibold text-foreground">Record Entry</h2>
          <div className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label>Work Order</Label>
              <Select
                value={form.workOrderId}
                onValueChange={(v) => setForm({ ...form, workOrderId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select work order" />
                </SelectTrigger>
                <SelectContent>
                  {workOrders.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.workOrderNumber} — {w.finishedProduct}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v as ReworkScrapType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rework">Rework</SelectItem>
                  <SelectItem value="Scrap">Scrap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Reason Code</Label>
              <Select
                value={form.reasonCode}
                onValueChange={(v) => setForm({ ...form, reasonCode: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {REASON_CODES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cost Impact</Label>
              <Input
                type="number"
                min={0}
                value={form.costImpact}
                onChange={(e) => setForm({ ...form, costImpact: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Operator</Label>
              <Select
                value={form.operator}
                onValueChange={(v) => setForm({ ...form, operator: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPERATORS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
            <Button className="w-full" onClick={submit}>
              Record
            </Button>
          </div>
        </div>

        <div className="surface-card overflow-hidden xl:col-span-2">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Rework & Scrap Register</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Work Order</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reason Code</TableHead>
                  <TableHead className="text-right">Cost Impact</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Approval</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reworkScrap.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.workOrderId}</TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{r.reasonCode}</TableCell>
                    <TableCell className="text-right">{r.costImpact.toLocaleString()}</TableCell>
                    <TableCell>{r.operator}</TableCell>
                    <TableCell>{r.recordedDate}</TableCell>
                    <TableCell>
                      <StatusBadge value={r.approvalStatus} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
