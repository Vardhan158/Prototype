import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Camera, Check, ChevronRight, IdCard, Phone, ScanText, Save, User } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/apps/gatepass-pro/components/wms/AppShell";
import { StepIndicator } from "@/apps/gatepass-pro/components/wms/StepIndicator";
import { ScanSheet } from "@/apps/gatepass-pro/components/wms/ScanSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OCR_LICENSES } from "@/apps/gatepass-pro/lib/wms/data";
import { useWms } from "@/apps/gatepass-pro/lib/wms/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gatepass-pro/gate-entry/driver")({
  head: () => ({
    meta: [
      { title: "Driver Verification — GateFlow WMS" },
      { name: "description", content: "Step 2: capture the driver photo, OCR the driving license and validate ID and expiry." },
      { property: "og:title", content: "Driver Verification — GateFlow WMS" },
      { property: "og:description", content: "Scan the driving license to auto-fill driver details and check expiry." },
    ],
  }),
  component: DriverVerification,
});

function DriverVerification() {
  const { draft, patchDraft } = useWms();
  const navigate = useNavigate();
  const [scan, setScan] = useState<null | { mode: "camera" | "ocr"; label: string; onDone: () => void }>(null);
  const d = draft.driver;
  const expired = d.licenseExpiry?.includes("2026");

  return (
    <AppShell title="New Gate Entry" subtitle="Driver verification" back="/gatepass-pro/gate-entry/vehicle">
      <StepIndicator current={2} />

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() =>
            setScan({
              mode: "camera",
              label: "Driver photo",
              onDone: () => {
                patchDraft({ driver: { photo: true } });
                toast.success("Driver photo attached");
              },
            })
          }
          className={cn(
            "card-elevated flex h-32 flex-col items-center justify-center gap-1.5 p-3 transition-transform active:scale-95",
            d.photo && "ring-2 ring-success",
          )}
        >
          <span
            className={cn(
              "grid size-12 place-items-center rounded-2xl",
              d.photo ? "bg-success/15 text-success" : "bg-accent text-accent-foreground",
            )}
          >
            {d.photo ? <Check className="size-6" /> : <Camera className="size-6" />}
          </span>
          <span className="text-sm font-semibold">Driver Photo</span>
          <span className="text-[11px] text-muted-foreground">{d.photo ? "Captured" : "Face the camera"}</span>
        </button>

        <button
          type="button"
          onClick={() =>
            setScan({
              mode: "ocr",
              label: "Driving license OCR",
              onDone: () => {
                const lic = OCR_LICENSES[Math.floor(Math.random() * OCR_LICENSES.length)]!;
                patchDraft({ driver: { ...lic } });
                toast.success(`License read: ${lic.name}`, { description: "Fields auto-filled from OCR" });
              },
            })
          }
          className={cn(
            "card-elevated flex h-32 flex-col items-center justify-center gap-1.5 p-3 transition-transform active:scale-95",
            d.license && "ring-2 ring-success",
          )}
        >
          <span
            className={cn(
              "grid size-12 place-items-center rounded-2xl",
              d.license ? "bg-success/15 text-success" : "bg-accent text-accent-foreground",
            )}
          >
            {d.license ? <Check className="size-6" /> : <ScanText className="size-6" />}
          </span>
          <span className="text-sm font-semibold">Scan License</span>
          <span className="text-[11px] text-muted-foreground">{d.license ? "OCR complete" : "OCR driving license"}</span>
        </button>
      </div>

      {expired ? (
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-warning/15 p-4 text-warning">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <p className="text-xs font-medium">
            License expires within 90 days. Entry can proceed but will need supervisor hold approval.
          </p>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 pb-2">
        <div className="grid gap-2">
          <Label htmlFor="dn">Driver Name</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="dn"
              value={d.name ?? ""}
              onChange={(e) => patchDraft({ driver: { name: e.target.value } })}
              placeholder="Auto-filled from license"
              className="h-14 rounded-2xl pl-11 text-base"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="dp">Phone Number</Label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="dp"
              inputMode="tel"
              value={d.phone ?? ""}
              onChange={(e) => patchDraft({ driver: { phone: e.target.value } })}
              placeholder="+91"
              className="h-14 rounded-2xl pl-11 text-base"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="dl">License No.</Label>
            <Input
              id="dl"
              value={d.license ?? ""}
              onChange={(e) => patchDraft({ driver: { license: e.target.value } })}
              className="h-14 rounded-2xl text-sm"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="de">Expiry</Label>
            <Input
              id="de"
              value={d.licenseExpiry ?? ""}
              onChange={(e) => patchDraft({ driver: { licenseExpiry: e.target.value } })}
              className="h-14 rounded-2xl text-sm"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="gid">Government ID</Label>
          <div className="relative">
            <IdCard className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="gid"
              value={d.govId ?? ""}
              onChange={(e) => patchDraft({ driver: { govId: e.target.value } })}
              placeholder="Aadhaar / PAN masked"
              className="h-14 rounded-2xl pl-11 text-base"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 pb-4">
        <Button
          className="h-16 rounded-2xl text-base font-semibold"
          disabled={!d.name || !d.phone || !d.license}
          onClick={() => navigate({ to: "/gatepass-pro/gate-entry/delivery" })}
        >
          Next · Delivery Verification <ChevronRight className="size-5" />
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
        mode={scan?.mode ?? "camera"}
        label={scan?.label ?? ""}
        onClose={() => setScan(null)}
        onResult={() => scan?.onDone()}
      />
    </AppShell>
  );
}