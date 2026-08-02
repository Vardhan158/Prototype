import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, FileText, Loader2, Truck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  EmptyState,
  Field,
  PageHeader,
  StatusPill,
} from "@/apps/receiving-hub/components/wms/primitives";
import {
  UnloadStep,
  VerifyStep,
  ScanStep,
  ReviewStep,
} from "@/apps/receiving-hub/components/wms/receiving-steps";
import { useWms } from "@/apps/receiving-hub/lib/wms-store";
import { currency } from "@/apps/receiving-hub/lib/wms-data";

export const Route = createFileRoute("/receiving-hub/receiving/$id")({
  head: () => ({
    meta: [
      { title: "Receiving Process | AXIOM WMS Inbound" },
      {
        name: "description",
        content:
          "Guided receiving workflow: unload, verify quantities, scan barcodes, serials and batches, reconcile discrepancies and complete the receipt.",
      },
      { property: "og:title", content: "Receiving Process | AXIOM WMS Inbound" },
      { property: "og:description", content: "Stepper-driven receiving execution on the dock." },
    ],
  }),
  component: ReceivingProcess,
});

const STEPS = ["Receiving Started", "Unload", "Verify", "Scan", "Review", "Complete"];

function ReceivingProcess() {
  const { id } = Route.useParams();
  const { state, dispatch } = useWms();
  const navigate = useNavigate();
  const shipment = state.shipments.find((s) => s.id === id);
  const [step, setStep] = useState(1);
  const [posting, setPosting] = useState(false);

  if (!shipment)
    return (
      <Card className="elevated-card mx-auto max-w-xl">
        <EmptyState
          icon={Truck}
          title="Receipt not available"
          body={`Shipment ${id} is no longer open for receiving.`}
          action={
            <Button asChild>
              <Link to="/receiving-hub/queue">Back to queue</Link>
            </Button>
          }
        />
      </Card>
    );

  const accepted = shipment.lines.reduce((a, l) => a + l.accepted, 0);
  const expected = shipment.lines.reduce((a, l) => a + l.expected, 0);
  const value = shipment.lines.reduce((a, l) => a + l.accepted * l.unitPrice, 0);

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title={`Receiving Â· ${shipment.truckNo}`}
        subtitle={`${shipment.vendor} Â· Dock ${shipment.dock ?? "â€”"} Â· ${shipment.po}`}
        crumbs={[
          { label: "Inbound", to: "/receiving-hub" },
          { label: "Receiving Queue", to: "/receiving-hub/queue" },
          { label: shipment.id, to: "/receiving-hub/queue" },
          { label: "Process" },
        ]}
        actions={<StatusPill status={shipment.status} />}
      />

      <Card className="elevated-card mb-5">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-3">
            {STEPS.map((s, i) => (
              <button key={s} onClick={() => setStep(i)} className="flex items-center gap-2">
                <span
                  className={`num grid h-8 w-8 place-items-center rounded-full text-xs font-semibold transition ${i < step ? "bg-success text-success-foreground" : i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </span>
                <span
                  className={`text-xs ${i === step ? "font-semibold" : "text-muted-foreground"}`}
                >
                  {s}
                </span>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="hidden h-3 w-3 text-muted-foreground sm:block" />
                )}
              </button>
            ))}
          </div>
          <Progress value={(step / (STEPS.length - 1)) * 100} className="mt-4 h-1.5" />
        </CardContent>
      </Card>

      {step === 0 && (
        <Card className="elevated-card">
          <CardHeader>
            <CardTitle className="text-base">Receiving started</CardTitle>
            <CardDescription>Crew briefed, dock secured, receipt opened in WMS</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-3">
            <Field label="Receipt" value={shipment.id} mono />
            <Field label="Dock" value={shipment.dock ?? "â€”"} mono />
            <Field label="Operator" value={state.role} />
            <Field label="Expected units" value={expected.toLocaleString("en-IN")} mono />
            <Field label="Lines" value={shipment.lines.length} mono />
            <Field label="PO value" value={currency(shipment.poValue)} mono />
          </CardContent>
        </Card>
      )}
      {step === 1 && <UnloadStep shipment={shipment} />}
      {step === 2 && <VerifyStep shipment={shipment} />}
      {step === 3 && <ScanStep shipment={shipment} />}
      {step === 4 && <ReviewStep shipment={shipment} />}
      {step === 5 && (
        <Card className="elevated-card">
          <CardHeader>
            <CardTitle className="text-base">Receiving summary</CardTitle>
            <CardDescription>Confirm and post the goods receipt note</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-4">
              <Field label="Truck" value={shipment.truckNo} mono />
              <Field label="Vendor" value={shipment.vendor} />
              <Field label="Purchase order" value={shipment.po} mono />
              <Field label="Warehouse" value={shipment.warehouse} mono />
              <Field label="Expected units" value={expected.toLocaleString("en-IN")} mono />
              <Field label="Accepted units" value={accepted.toLocaleString("en-IN")} mono />
              <Field label="Variance" value={`${accepted - expected}`} mono />
              <Field label="Receipt value" value={currency(value)} mono />
            </div>
            <Button
              size="lg"
              disabled={posting}
              onClick={() => {
                setPosting(true);
                setTimeout(() => {
                  dispatch({ type: "grn", id: shipment.id });
                  setPosting(false);
                  toast.success("GRN generated", {
                    description: "Posted against the purchase order.",
                  });
                  navigate({ to: "/receiving-hub/grn" });
                }, 1200);
              }}
            >
              {posting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Generate GRN
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-5 flex items-center justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button disabled={step === STEPS.length - 1} onClick={() => setStep((s) => s + 1)}>
          Continue <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
