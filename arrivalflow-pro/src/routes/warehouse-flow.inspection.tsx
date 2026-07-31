import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, PackagePlus, ShieldAlert, Trash2, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState, PageHeader, SectionCard, StatusBadge } from "@/apps/warehouse-flow/components/ui-kit";
import { cn } from "@/lib/utils";
import { returns } from "@/apps/warehouse-flow/data";

export const Route = createFileRoute("/warehouse-flow/inspection")({
  head: () => ({
    meta: [
      { title: "Return Inspection — WMS Console" },
      {
        name: "description",
        content:
          "QA inspection queue for returned materials with approve, reject, restock, scrap, quarantine and vendor return actions.",
      },
      { property: "og:title", content: "Return Inspection — WMS Console" },
      {
        property: "og:description",
        content: "Inspect returned materials and decide restock, scrap, quarantine or vendor return.",
      },
    ],
  }),
  component: InspectionPage,
});

const decisions = [
  { key: "approve", label: "Approve Return", icon: Check },
  { key: "reject", label: "Reject Return", icon: X },
  { key: "restock", label: "Return to Inventory", icon: PackagePlus },
  { key: "scrap", label: "Scrap", icon: Trash2 },
  { key: "quarantine", label: "Quarantine", icon: ShieldAlert },
  { key: "vendor", label: "Vendor Return", icon: Truck },
] as const;

function InspectionPage() {
  const queue = returns.filter((r) => r.status === "Inspecting" || r.status === "Received");
  const [activeNo, setActiveNo] = useState(queue[0]?.returnNo ?? "");
  const active = queue.find((r) => r.returnNo === activeNo);
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState<(typeof decisions)[number] | null>(null);

  return (
    <>
      <PageHeader
        title="Return Inspection"
        description="Inspect returned materials and decide their disposition."
        breadcrumbs={[{ label: "Home", to: "/warehouse-flow/" }, { label: "Return Inspection" }]}
      />

      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <SectionCard
          title="Inspection Queue"
          description={`${queue.length} returns awaiting QA`}
          bodyClassName="p-0"
        >
          {queue.length === 0 ? (
            <EmptyState
              icon={Check}
              title="Queue is clear"
              description="Every returned item has been inspected and dispositioned."
            />
          ) : (
            <ul className="divide-y divide-border">
              {queue.map((r) => (
                <li key={r.returnNo}>
                  <button
                    onClick={() => setActiveNo(r.returnNo)}
                    className={cn(
                      "w-full px-5 py-4 text-left transition-colors",
                      r.returnNo === activeNo
                        ? "bg-primary/8 shadow-[inset_3px_0_0_0_var(--color-primary)]"
                        : "hover:bg-muted/60",
                    )}
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                      <span className="num truncate text-sm font-semibold text-primary">
                        {r.returnNo}
                      </span>
                      <StatusBadge status={r.condition} dot={false} />
                    </div>
                    <p className="mt-1 truncate text-sm">{r.material}</p>
                    <p className="num mt-0.5 text-xs text-muted-foreground">
                      {r.qty} {r.unit} · {r.reason} · {r.date}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {active && (
          <div className="space-y-4">
            <SectionCard title="Inspection Details" description={`${active.returnNo} · ${active.reason}`}>
              <dl className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Material", active.material],
                  ["Material Code", active.code],
                  ["Quantity", `${active.qty} ${active.unit}`],
                  ["Reference Request", active.request],
                  ["Reference Issue", active.issue],
                  ["Warehouse / Bin", `${active.warehouse} · ${active.bin}`],
                  ["Returned By", active.by],
                  ["Return Date", active.date],
                  ["Reported Condition", active.condition],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
                    <dd className="num mt-0.5 text-sm font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Return remarks</p>
                <p className="mt-1 text-sm">{active.remarks}</p>
              </div>
            </SectionCard>

            <SectionCard title="Inspection Findings">
              <Textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Record measurements, visual defects, batch observations..."
              />
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {decisions.map((d) => (
                  <Button
                    key={d.key}
                    variant={d.key === "approve" ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setPending(d)}
                  >
                    <d.icon className="size-4" /> {d.label}
                  </Button>
                ))}
              </div>
            </SectionCard>
          </div>
        )}
      </div>

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pending?.label}?</AlertDialogTitle>
            <AlertDialogDescription>
              {active?.returnNo} ({active?.qty} {active?.unit} of {active?.material}) will be
              dispositioned and inventory will be updated accordingly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.success(`${active?.returnNo}: ${pending?.label} recorded`);
                setPending(null);
                setNotes("");
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
