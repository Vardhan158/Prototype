import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Barcode, Building2, CalendarClock, ChevronRight, Layers, QrCode, Save, Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/apps/gatepass-pro/components/wms/AppShell";
import { StepIndicator } from "@/apps/gatepass-pro/components/wms/StepIndicator";
import { ScanSheet } from "@/apps/gatepass-pro/components/wms/ScanSheet";
import { VoiceNote } from "@/apps/gatepass-pro/components/wms/VoiceNote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PO_DB, PO_LIST } from "@/apps/gatepass-pro/lib/wms/data";
import { useWms } from "@/apps/gatepass-pro/lib/wms/store";

export const Route = createFileRoute("/gatepass-pro/gate-entry/delivery")({
  head: () => ({
    meta: [
      { title: "Delivery Verification — GateFlow WMS" },
      { name: "description", content: "Step 3: scan the delivery QR or purchase order to auto-fetch vendor, PO, material category and dock." },
      { property: "og:title", content: "Delivery Verification — GateFlow WMS" },
      { property: "og:description", content: "Scan a QR or PO barcode to auto-fetch vendor and delivery details." },
    ],
  }),
  component: DeliveryVerification,
});

function DeliveryVerification() {
  const { draft, patchDraft } = useWms();
  const navigate = useNavigate();
  const [scan, setScan] = useState<null | { mode: "qr" | "barcode"; label: string }>(null);
  const [manual, setManual] = useState("");
  const del = draft.delivery;

  const applyPo = (po: string) => {
    const found = PO_DB[po];
    if (!found) {
      toast.error("PO not found in SAP EWM", { description: "Check the number or ask the driver for the QR" });
      return;
    }
    patchDraft({ delivery: { po, ...found } });
    toast.success(`PO ${po} verified`, { description: found.vendor });
  };

  return (
    <AppShell title="New Gate Entry" subtitle="Delivery / PO verification" back="/gatepass-pro/gate-entry/driver">
      <StepIndicator current={3} />

      <div className="grid grid-cols-2 gap-3">
        <Button
          className="h-28 flex-col gap-2 rounded-2xl text-sm font-semibold"
          onClick={() => setScan({ mode: "qr", label: "Delivery QR code" })}
        >
          <QrCode className="size-8" /> Scan QR Code
        </Button>
        <Button
          variant="secondary"
          className="h-28 flex-col gap-2 rounded-2xl text-sm font-semibold"
          onClick={() => setScan({ mode: "barcode", label: "Purchase order barcode" })}
        >
          <Barcode className="size-8" /> Scan PO Barcode
        </Button>
      </div>

      <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or enter manually <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="po">PO Number</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="po"
              inputMode="numeric"
              placeholder="45001287…"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              className="h-14 rounded-2xl pl-11 text-base"
            />
          </div>
          <Button className="h-14 rounded-2xl px-5" onClick={() => applyPo(manual.trim())}>
            Fetch
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">Demo POs: {PO_LIST.join(" · ")}</p>
      </div>

      {del.po ? (
        <div className="card-elevated mt-5 overflow-hidden">
          <div className="flex items-center justify-between bg-success/12 px-4 py-3">
            <p className="text-sm font-semibold text-success">PO Verified · {del.po}</p>
            <span className="text-[11px] font-semibold text-success">SAP EWM</span>
          </div>
          <dl className="grid gap-3 p-4 text-sm">
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Vendor</dt>
                <dd className="font-medium">{del.vendor}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Layers className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Material category</dt>
                <dd className="font-medium">{del.category}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarClock className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Expected delivery</dt>
                <dd className="font-medium">
                  {del.expected} · {del.dock} · {del.pallets} pallets
                </dd>
              </div>
            </div>
          </dl>
        </div>
      ) : null}

      <div className="mt-4">
        <VoiceNote seconds={draft.voiceNote} onChange={(s) => patchDraft({ voiceNote: s })} />
      </div>

      <div className="mt-6 grid gap-3 pb-4">
        <Button
          className="h-16 rounded-2xl text-base font-semibold"
          disabled={!del.po}
          onClick={() => navigate({ to: "/gatepass-pro/gate-entry/review" })}
        >
          Next · Review <ChevronRight className="size-5" />
        </Button>
        <Button
          variant="outline"
          className="h-14 rounded-2xl"
          onClick={() => {
            toast.success("Draft saved locally");
            navigate({ to: "/gatepass-pro" });
          }}
        >
          <Save className="size-5" /> Save Draft
        </Button>
      </div>

      <ScanSheet
        open={!!scan}
        mode={scan?.mode ?? "qr"}
        label={scan?.label ?? ""}
        onClose={() => setScan(null)}
        onResult={() => applyPo(PO_LIST[Math.floor(Math.random() * PO_LIST.length)]!)}
      />
    </AppShell>
  );
}