import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { PageHeader } from "@/apps/storage-guardian/components/warehouse/app-shell";
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
import { useWarehouse } from "@/apps/storage-guardian/lib/warehouse/store";

export const Route = createFileRoute("/storage-guardian/audit")({
  head: () => ({
    meta: [
      { title: "Audit Trail — NODE·WMS" },
      {
        name: "description",
        content:
          "Immutable movement history: actor, action, entity, before/after state and timestamp for every warehouse event.",
      },
      { property: "og:title", content: "Audit Trail — NODE·WMS" },
      {
        property: "og:description",
        content: "Filterable audit history of every warehouse action by item, user and action type.",
      },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const { audit } = useWarehouse();
  const [q, setQ] = useState("");
  const [action, setAction] = useState("all");
  const [actor, setActor] = useState("all");

  const actions = [...new Set(audit.map((a) => a.action))];
  const actors = [...new Set(audit.map((a) => a.actor))];

  const rows = useMemo(
    () =>
      audit.filter(
        (a) =>
          (action === "all" || a.action === action) &&
          (actor === "all" || a.actor === actor) &&
          `${a.entity} ${a.before} ${a.after}`.toLowerCase().includes(q.trim().toLowerCase()),
      ),
    [audit, q, action, actor],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Trail"
        subtitle="Mandatory logging on every stage — filter by item, user or action type."
      />

      <div className="panel overflow-hidden">
        <div className="flex flex-wrap gap-3 border-b border-border p-4">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search item, location or state…" className="pl-8" />
          </div>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {actions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={actor} onValueChange={setActor}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All users</SelectItem>
              {actors.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="max-h-[640px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-surface">
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Before</TableHead>
                <TableHead>After</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                    {new Date(a.createdAt).toISOString().replace("T", " ").slice(0, 16)}
                  </TableCell>
                  <TableCell className="text-sm">{a.actor}</TableCell>
                  <TableCell className="text-sm font-medium">{a.action}</TableCell>
                  <TableCell className="font-mono text-xs">{a.entity}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.before}</TableCell>
                  <TableCell className="text-xs">{a.after}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No audit entries match the filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
