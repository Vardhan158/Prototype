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
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/receiving-hub/module-complete")({
  head: () => ({
    meta: [
      { title: "Module Completed | AXIOM WMS Inbound" },
      {
        name: "description",
        content:
          "Goods Receiving and GRN Management module completion summary with automatic handoff to Document Management and OCR Processing.",
      },
      { property: "og:title", content: "Module Completed | AXIOM WMS Inbound" },
      {
        property: "og:description",
        content:
          "Goods Receiving and GRN Management module completion summary with automatic handoff to Document Management and OCR Processing.",
      },
    ],
  }),
  component: ModuleComplete,
});

function ModuleComplete() {
  const { state } = useWms();
  return (
    <div className="mx-auto max-w-[900px]">
      <Card className="elevated-card overflow-hidden">
        <div className="brand-gradient p-8 text-primary-foreground">
          <CheckCircle2 className="h-10 w-10" />
          <h1 className="mt-3 text-2xl font-semibold">Module 03 completed</h1>
          <p className="mt-1 text-sm opacity-90">
            Goods Receiving &amp; GRN Management â€” dock to inventory closed for this shift.
          </p>
        </div>
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-4">
            <Field
              label="Receipts closed"
              value={state.shipments.filter((s) => s.status === "Completed").length}
              mono
            />
            <Field label="GRNs posted" value={state.grns.length} mono />
            <Field label="Inspections raised" value={state.inspections.length} mono />
            <Field label="Inventory records" value={state.inventory.length} mono />
          </div>
          <div className="rounded-2xl border border-primary/25 bg-primary-soft/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Next up
            </p>
            <h2 className="mt-1 text-lg font-semibold">
              Module 04 â€” Document Management &amp; OCR Processing
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Invoices, packing lists, e-way bills and GRNs captured in this module are queued for
              OCR extraction, three-way matching and archival.
            </p>
            <Button
              className="mt-4"
              onClick={() =>
                toast.success("Handoff complete", {
                  description: "12 documents pushed to the OCR processing queue.",
                })
              }
            >
              Continue to Module 04 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <Button asChild variant="outline">
            <Link to="/receiving-hub">Back to receiving dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
