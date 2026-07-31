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
import { MANAGERS } from "@work/lib/ams/mock-data";
import { useAms } from "@work/lib/ams/store";
import {
  EXCEPTION_TYPES,
  type ExceptionSeverity,
  type ExceptionStatus,
  type ExceptionType,
} from "@work/lib/ams/types";

export const Route = createFileRoute("/work-craft/exceptions")({
  head: () => ({
    meta: [
      { title: "Assembly Exceptions — AMS" },
      {
        name: "description",
        content:
          "Raise, assign and resolve assembly exceptions such as missing components, failed tests and damaged parts.",
      },
      { property: "og:title", content: "Assembly Exceptions — AMS" },
      {
        property: "og:description",
        content: "BR-087 exception handling for the Assembly Management module.",
      },
    ],
  }),
  component: ExceptionsPage,
});

const SEVERITIES: ExceptionSeverity[] = ["Low", "Medium", "High", "Critical"];
const STATUSES: ExceptionStatus[] = ["Open", "In Review", "Resolved"];

function ExceptionsPage() {
  const { workOrders, exceptions, addException, updateException } = useAms();
  const [form, setForm] = useState({
    workOrderId: "",
    type: EXCEPTION_TYPES[0] as ExceptionType,
    severity: "Medium" as ExceptionSeverity,
    assignedManager: MANAGERS[0]! as string,
    resolution: "",
  });
  const [filter, setFilter] = useState<"All" | ExceptionStatus>("All");
  const [error, setError] = useState<string | null>(null);

  const rows = exceptions.filter((e) => filter === "All" || e.status === filter);

  const submit = () => {
    if (!form.workOrderId) {
      setError("Select a work order.");
      return;
    }
    setError(null);
    addException({ ...form, status: "Open" });
    setForm({ ...form, resolution: "" });
  };

  return (
    <AppShell title="Assembly Exceptions" description="BR-087 Assembly Exception Handling.">
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="surface-card p-6">
          <h2 className="text-sm font-semibold text-foreground">Raise Exception</h2>
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
                      {w.workOrderNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Exception Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v as ExceptionType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXCEPTION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Severity</Label>
              <Select
                value={form.severity}
                onValueChange={(v) => setForm({ ...form, severity: v as ExceptionSeverity })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITIES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Assigned Manager</Label>
              <Select
                value={form.assignedManager}
                onValueChange={(v) => setForm({ ...form, assignedManager: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MANAGERS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Resolution Notes</Label>
              <Input
                value={form.resolution}
                placeholder="Optional"
                onChange={(e) => setForm({ ...form, resolution: e.target.value })}
              />
            </div>
            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
            <Button className="w-full" onClick={submit}>
              Raise Exception
            </Button>
          </div>
        </div>

        <div className="surface-card overflow-hidden xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Exception Register</h2>
            <div className="flex gap-1">
              {(["All", ...STATUSES] as const).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={filter === s ? "default" : "outline"}
                  onClick={() => setFilter(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Work Order</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Raised</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.workOrderId}</TableCell>
                    <TableCell>{e.type}</TableCell>
                    <TableCell>
                      <StatusBadge value={e.severity} />
                    </TableCell>
                    <TableCell>{e.assignedManager}</TableCell>
                    <TableCell>{e.raisedDate}</TableCell>
                    <TableCell>
                      <StatusBadge value={e.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={e.status}
                        onValueChange={(v) =>
                          updateException(e.id, { status: v as ExceptionStatus })
                        }
                      >
                        <SelectTrigger className="ml-auto w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
