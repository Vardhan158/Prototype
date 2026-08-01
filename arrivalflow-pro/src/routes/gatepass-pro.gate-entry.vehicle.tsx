import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Check, ChevronRight, ScanText, Save, Truck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/apps/gatepass-pro/components/wms/AppShell";
import { StepIndicator } from "@/apps/gatepass-pro/components/wms/StepIndicator";
import { ScanSheet } from "@/apps/gatepass-pro/components/wms/ScanSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OCR_PLATES, TRANSPORTERS, VEHICLE_TYPES } from "@/apps/gatepass-pro/lib/wms/data";
import { useWms } from "@/apps/gatepass-pro/lib/wms/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gatepass-pro/gate-entry/vehicle")({
  head: () => ({
    meta: [
      { title: "Vehicle Scan — GateFlow WMS" },
      { name: "description", content: "Step 1: photograph the truck, OCR the number plate and confirm vehicle type and transporter." },
      { property: "og:title", content: "Vehicle Scan — GateFlow WMS" },
      { property: "og:description", content: "Capture truck photos and auto-detect the vehicle number with OCR." },
    ],
  }),
  component: VehicleScan,
});

function CaptureTile({
  label,
  hint,
  done,
  onClick,
}: {
  label: string;
  hint: string;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "card-elevated flex h-32 flex-col items-center justify-center gap-1.5 p-3 text-center transition-transform active:scale-95",
        done && "ring-2 ring-success",
      )}
    >
      <span
        className={cn(
          "grid size-12 place-items-center rounded-2xl",
          done ? "bg-success/15 text-success" : "bg-accent text-accent-foreground",
        )}
      >
        {done ? <Check className="size-6" /> : <Camera className="size-6" />}
      </span>
      <span className="text-sm font-semibold leading-tight">{label}</span>
      <span className="text-[11px] text-muted-foreground">{done ? "Captured" : hint}</span>
    </button>
  );
}

function VehicleScan() {
  const { draft, patchDraft } = useWms();
  const navigate = useNavigate();
  const [scan, setScan] = useState<null | { mode: "camera" | "ocr"; label: string; onDone: () => void }>(null);

  const v = draft.vehicle;

  return (
    <AppShell title="New Gate Entry" subtitle="Vehicle scan · Gate 02" back="/gatepass-pro">
      <StepIndicator current={1} />

      <div className="grid grid-cols-2 gap-3">
        <CaptureTile
          label="Truck Photo"
          hint="Front 3/4 view"
          done={!!v.truckPhoto}
          onClick={() =>
            setScan({
              mode: "camera",
              label: "Truck photo",
              onDone: () => {
                patchDraft({ vehicle: { truckPhoto: true } });
                toast.success("Truck photo attached");
              },
            })
          }
        />
        <CaptureTile
          label="Number Plate"
          hint="Fill the frame"
          done={!!v.platePhoto}
          onClick={() =>
            setScan({
              mode: "camera",
              label: "Number plate photo",
              onDone: () => {
                patchDraft({ vehicle: { platePhoto: true } });
                toast.success("Plate photo attached");
              },
            })
          }
        />
      </div>

      <Button
        variant="secondary"
        className="mt-3 h-16 w-full rounded-2xl text-base font-semibold"
        onClick={() =>
          setScan({
            mode: "ocr",
            label: "Auto-detect vehicle number",
            onDone: () => {
              const plate = OCR_PLATES[Math.floor(Math.random() * OCR_PLATES.length)]!;
              patchDraft({
                vehicle: {
                  number: plate,
                  platePhoto: true,
                  type: v.type ?? VEHICLE_TYPES[0]!,
                  transporter: v.transporter ?? TRANSPORTERS[1]!,
                },
              });
              toast.success(`OCR detected ${plate}`, { description: "Vehicle type & transporter auto-filled" });
            },
          })
        }
      >
        <ScanText className="size-6" /> Run OCR · Auto Detect Number
      </Button>

      <div className="mt-5 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="plate">Vehicle Number (editable)</Label>
          <div className="relative">
            <Truck className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="plate"
              placeholder="Scan or type"
              value={v.number ?? ""}
              onChange={(e) => patchDraft({ vehicle: { number: e.target.value.toUpperCase() } })}
              className="h-14 rounded-2xl pl-11 text-base font-semibold tracking-wide"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Vehicle Type</Label>
          <Select value={v.type ?? ""} onValueChange={(val) => patchDraft({ vehicle: { type: val } })}>
            <SelectTrigger className="h-14 rounded-2xl text-base data-[size=default]:h-14">
              <SelectValue placeholder="Select vehicle type" />
            </SelectTrigger>
            <SelectContent>
              {VEHICLE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Transport Company</Label>
          <Select
            value={v.transporter ?? ""}
            onValueChange={(val) => patchDraft({ vehicle: { transporter: val } })}
          >
            <SelectTrigger className="h-14 rounded-2xl text-base data-[size=default]:h-14">
              <SelectValue placeholder="Select transporter" />
            </SelectTrigger>
            <SelectContent>
              {TRANSPORTERS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 grid gap-3 pb-4">
        <Button
          className="h-16 rounded-2xl text-base font-semibold"
          disabled={!v.number || !v.type || !v.transporter}
          onClick={() => navigate({ to: "/gatepass-pro/gate-entry/driver" })}
        >
          Next · Driver Verification <ChevronRight className="size-5" />
        </Button>
        <Button
          variant="outline"
          className="h-14 rounded-2xl"
          onClick={() => {
            toast.success("Draft saved locally", { description: "Will auto-sync when online" });
            navigate({ to: "/gatepass-pro" });
          }}
        >
          <Save className="size-5" /> Save Draft
        </Button>
      </div>

      <ScanSheet
        open={!!scan}
        mode={scan?.mode ?? "camera"}
        label={scan?.label ?? ""}
        onClose={() => setScan(null)}
        onResult={() => scan?.onDone()}
      />
    </AppShell>
  );
}