import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, Pencil, Search, UserCog } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@work/components/ams/AppShell";
import { StatusBadge } from "@work/components/ams/StatusBadge";
import { Button } from "@work/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@work/components/ui/dialog";
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
import { OPERATORS, PRODUCTS } from "@work/lib/ams/mock-data";
import { useAms } from "@work/lib/ams/store";

export const Route = createFileRoute("/work-craft/work-orders/")({
  head: () => ({
    meta: [
      { title: "Assembly Work Orders — AMS" },
      {
        name: "description",
        content:
          "Search, filter and manage assembly work orders: product, quantity, priority, operator, current stage and status.",
      },
      { property: "og:title", content: "Assembly Work Orders — AMS" },
      {
        property: "og:description",
        content: "Enterprise register of assembly work orders with search, filters and pagination.",
      },
    ],
  }),
  component: WorkOrdersPage,
});

const PAGE_SIZE = 5;
const ALL = "All";

function WorkOrdersPage() {
  const { workOrders, assignOperator, finishedGoods } = useAms();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(ALL);
  const [operator, setOperator] = useState(ALL);
  const [product, setProduct] = useState(ALL);
  const [priority, setPriority] = useState(ALL);
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [assignTarget, setAssignTarget] = useState<string | null>(null);
  const [assignValue, setAssignValue] = useState<string>(OPERATORS[0]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return workOrders.filter((wo) => {
      const serials = finishedGoods
        .filter((f) => f.workOrderId === wo.id)
        .map((f) => f.serialNumber)
        .join(" ");
      const matchesQuery =
        !q ||
        [wo.workOrderNumber, wo.assignedOperator, wo.finishedProduct, wo.status, serials]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return (
        matchesQuery &&
        (status === ALL || wo.status === status) &&
        (operator === ALL || wo.assignedOperator === operator) &&
        (product === ALL || wo.finishedProduct === product) &&
        (priority === ALL || wo.priority === priority) &&
        (!date || wo.startDate === date)
      );
    });
  }, [workOrders, finishedGoods, query, status, operator, product, priority, date]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <AppShell
      title="Work Orders"
      description="Assembly work orders with search, filters and pagination."
      actions={
        <Link to="/work-craft/work-orders/new">
          <Button>Create Work Order</Button>
        </Link>
      }
    >
      <div className="surface-card p-4">
        <div className="grid gap-3 lg:grid-cols-6">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search work order, operator, product, serial number, status"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {[ALL, "Pending", "In Progress", "Completed", "Failed", "Rework"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s === ALL ? "All statuses" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={operator}
            onValueChange={(v) => {
              setOperator(v);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All operators</SelectItem>
              {OPERATORS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={product}
            onValueChange={(v) => {
              setProduct(v);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All products</SelectItem>
              {PRODUCTS.map((p) => (
                <SelectItem key={p.code} value={p.name}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Select
              value={priority}
              onValueChange={(v) => {
                setPriority(v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {[ALL, "Low", "Medium", "High", "Critical"].map((p) => (
                  <SelectItem key={p} value={p}>
                    {p === ALL ? "All" : p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <div className="surface-card mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Order ID</TableHead>
                <TableHead>Finished Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned Operator</TableHead>
                <TableHead>Current Stage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Completion Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((wo) => (
                <TableRow key={wo.id}>
                  <TableCell className="font-medium">{wo.workOrderNumber}</TableCell>
                  <TableCell className="max-w-[220px] truncate">{wo.finishedProduct}</TableCell>
                  <TableCell className="text-right">{wo.quantity}</TableCell>
                  <TableCell>
                    <StatusBadge value={wo.priority} />
                  </TableCell>
                  <TableCell>{wo.assignedOperator}</TableCell>
                  <TableCell>{wo.currentStage}</TableCell>
                  <TableCell>
                    <StatusBadge value={wo.status} />
                  </TableCell>
                  <TableCell>{wo.createdDate}</TableCell>
                  <TableCell>{wo.completionDate ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="View"
                        onClick={() => navigate({ to: "/work-craft/work-orders/$id", params: { id: wo.id } })}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit"
                        onClick={() =>
                          navigate({ to: "/work-craft/work-orders/$id/edit", params: { id: wo.id } })
                        }
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Assign Operator"
                        onClick={() => {
                          setAssignTarget(wo.id);
                          setAssignValue(wo.assignedOperator);
                        }}
                      >
                        <UserCog className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                    No work orders match the current search and filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {rows.length} of {filtered.length} work orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {current} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={current === totalPages}
              onClick={() => setPage(current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={assignTarget !== null} onOpenChange={(o) => !o && setAssignTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Operator</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Assigned Operator</Label>
            <Select value={assignValue} onValueChange={setAssignValue}>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (assignTarget) assignOperator(assignTarget, assignValue);
                setAssignTarget(null);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
