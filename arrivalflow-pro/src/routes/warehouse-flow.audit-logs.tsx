import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Download, History, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, PageHeader, SectionCard } from "@/apps/warehouse-flow/components/ui-kit";
import { auditLogs } from "@/apps/warehouse-flow/data";

export const Route = createFileRoute("/warehouse-flow/audit-logs")({
  head: () => ({
    meta: [
      { title: "Audit Logs — WMS Console" },
      {
        name: "description",
        content:
          "Full user activity trail with module, action, timestamp and previous versus new values for every change.",
      },
      { property: "og:title", content: "Audit Logs — WMS Console" },
      {
        property: "og:description",
        content: "User activity trail with before and after values for every change.",
      },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const [q, setQ] = useState("");
  const [mod, setMod] = useState("all");
  const modules = Array.from(new Set(auditLogs.map((a) => a.module)));

  const rows = auditLogs.filter(
    (a) =>
      (mod === "all" || a.module === mod) &&
      `${a.user} ${a.action} ${a.entity} ${a.module}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Audit Logs"
        description="Immutable trail of every user action performed in this module."
        breadcrumbs={[{ label: "Home", to: "/warehouse-flow/" }, { label: "Audit Logs" }]}
        actions={
          <Button variant="outline" onClick={() => toast.success("Audit export queued")}>
            <Download className="size-4" /> Export Trail
          </Button>
        }
      />

      <SectionCard bodyClassName="p-0">
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by user, action or entity..."
              className="pl-9"
            />
          </div>
          <Select value={mod} onValueChange={setMod}>
            <SelectTrigger><SelectValue placeholder="Module" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modules</SelectItem>
              {modules.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={History}
            title="No matching activity"
            description="Adjust the search text or module filter to see audit entries."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60">
                  <TableHead>User</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Previous Value</TableHead>
                  <TableHead>New Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-sm font-medium">{a.user}</TableCell>
                    <TableCell className="text-sm">{a.module}</TableCell>
                    <TableCell className="text-sm">{a.action}</TableCell>
                    <TableCell className="num text-xs text-muted-foreground">{a.entity}</TableCell>
                    <TableCell className="num text-xs text-muted-foreground">{a.at}</TableCell>
                    <TableCell>
                      <span className="num rounded-md bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                        {a.prev}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="num rounded-md bg-success/10 px-2 py-0.5 text-xs text-success">
                        {a.next}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>
    </>
  );
}
