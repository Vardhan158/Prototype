import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import QRCode from "qrcode";
import { CheckCircle2, Printer, ScanLine, UserCog } from "lucide-react";
import { PageHeader } from "@/apps/storage-guardian/components/warehouse/app-shell";
import { QrCode } from "@/apps/storage-guardian/components/warehouse/qr-code";
import { QrScanner } from "@/apps/storage-guardian/components/warehouse/qr-scanner";
import { Badge } from "@/components/ui/badge";
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
import { useWarehouse } from "@/apps/storage-guardian/lib/warehouse/store";
import { STAFF } from "@/apps/storage-guardian/lib/warehouse/data";
import type { PutAwayTask } from "@/apps/storage-guardian/lib/warehouse/types";

export const Route = createFileRoute("/storage-guardian/putaway")({
  head: () => ({
    meta: [
      { title: "Put-Away Queue — NODE·WMS" },
      {
        name: "description",
        content:
          "Auto-assigned put-away tasks with suggested locations, QR label scanning and match validation before inventory commit.",
      },
      { property: "og:title", content: "Put-Away Queue — NODE·WMS" },
      {
        property: "og:description",
        content: "Scan item and location QR codes to confirm put-away and commit inventory.",
      },
    ],
  }),
  component: PutAwayPage,
});

function PutAwayPage() {
  const { tasks } = useWarehouse();
  const open = tasks.filter((t) => t.status !== "Done");
  const done = tasks.filter((t) => t.status === "Done");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Put-Away Queue"
        subtitle="Workflow: scan the item QR → scan the assigned location QR → confirm put-away."
      />

      <div className="space-y-4">
        {open.length === 0 && (
          <p className="panel p-6 text-sm text-muted-foreground">
            Queue is clear. New tasks appear after a capacity check assigns a location.
          </p>
        )}
        {open.map((task) => <TaskCard key={task.id} task={task} />)}
      </div>

      {done.length > 0 && (
        <section className="panel p-5">
          <h2 className="text-lg font-semibold">Completed today ({done.length})</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {done.map((t) => (
              <li key={t.id} className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="size-4 text-success" />
                <span className="font-mono text-xs">{t.id}</span> · {t.itemId} stored at{" "}
                <span className="font-mono text-xs">{t.locationCode}</span> by {t.assignee}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function TaskCard({ task }: { task: PutAwayTask }) {
  const { items, confirmPutAway, reassignTask } = useWarehouse();
  const item = items.find((i) => i.id === task.itemId);
  const [itemScan, setItemScan] = useState("");
  const [locScan, setLocScan] = useState(task.locationCode);

  const submit = () => {
    const res = confirmPutAway(task.id, itemScan, locScan);
    res.ok ? toast.success(res.message) : toast.error(res.message);
    if (res.ok) {
      setItemScan("");
      setLocScan("");
    }
  };

  const printQr = async () => {
    if (!item?.code) {
      toast.error("This item does not have a QR code yet.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=520,height=700");
    if (!printWindow) {
      toast.error("Allow pop-ups to print the QR label.");
      return;
    }

    try {
      const qrImage = await QRCode.toDataURL(item.code, { width: 320, margin: 2 });
      printWindow.document.write(`<!doctype html>
        <html><head><title>QR Label — ${task.id}</title>
        <style>
          @page { size: 100mm 75mm; margin: 5mm; }
          body { margin: 0; font-family: Arial, sans-serif; color: #111; }
          .label { box-sizing: border-box; width: 90mm; min-height: 65mm; border: 2px solid #111; padding: 5mm; display: flex; align-items: center; gap: 5mm; }
          img { width: 42mm; height: 42mm; }
          h1 { margin: 0 0 3mm; font-size: 16px; }
          p { margin: 1.5mm 0; font-size: 11px; }
          .code { font-family: monospace; font-weight: 700; overflow-wrap: anywhere; }
        </style></head><body>
        <div class="label"><img src="${qrImage}" alt="QR code" />
          <div><h1>${item.name}</h1><p class="code">${item.code}</p><p>Task: ${task.id}</p><p>Quantity: ${item.qty} units</p><p>Put away: ${task.locationCode}</p></div>
        </div></body></html>`);
      printWindow.document.close();
      printWindow.addEventListener("load", () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      });
    } catch {
      printWindow.close();
      toast.error("Could not generate the QR label.");
    }
  };

  return (
    <article className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{item?.name ?? task.itemId}</h3>
            <Badge variant={task.priority === "High" ? "destructive" : "secondary"}>{task.priority}</Badge>
            <Badge variant="outline">{task.status}</Badge>
          </div>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {task.id} · item {task.itemId} · {item?.qty ?? 0} units → {task.locationCode}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UserCog className="size-4 text-muted-foreground" />
          <Select value={task.assignee} onValueChange={(v) => { reassignTask(task.id, v); toast.success(`Reassigned to ${v}.`); }}>
            <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STAFF.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-[auto_1fr]">
        <div className="flex flex-wrap gap-3">
          {item?.code ? (
            <QrCode value={item.code} size={104} />
          ) : (
            <p className="text-xs text-warning">Item has no label yet — generate a QR in the pipeline.</p>
          )}
        </div>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`is-${task.id}`}>Item QR scan</Label>
              <Input id={`is-${task.id}`} value={itemScan} onChange={(e) => setItemScan(e.target.value)} placeholder={item?.code ?? "DC-…"} className="font-mono text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`ls-${task.id}`}>Location QR scan</Label>
              <Input id={`ls-${task.id}`} value={locScan} onChange={(e) => setLocScan(e.target.value)} placeholder={task.locationCode} className="font-mono text-xs" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" onClick={submit}>
              <ScanLine className="size-4" /> Confirm put-away
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setItemScan(item?.code ?? ""); setLocScan(task.locationCode); }}>
              Autofill scans
            </Button>
            <Button size="sm" variant="outline" onClick={printQr} disabled={!item?.code}>
              <Printer className="size-4" /> Print QR
            </Button>
            <QrScanner onScan={(t) => (itemScan ? setLocScan(t) : setItemScan(t))} />
          </div>
        </div>
      </div>
    </article>
  );
}
