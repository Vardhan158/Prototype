import { useState } from "react";
import {
  AlertTriangle,
  Barcode,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Image as ImageIcon,
  Loader2,
  QrCode,
  ScanLine,
  Trash2,
  Package,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Field, Tone } from "./primitives";
import { BATCHES, SERIALS, type Shipment } from "@/apps/receiving-hub/lib/wms-data";
import { useWms } from "@/apps/receiving-hub/lib/wms-store";

/** Screen 11 + 12 â€” package verification and photo capture. */
export function UnloadStep({ shipment }: { shipment: Shipment }) {
  const [packages, setPackages] = useState({
    pallets: shipment.pallets,
    cartons: shipment.cartons,
    boxes: shipment.boxes,
  });
  const [weight, setWeight] = useState("9.2");
  const [volume, setVolume] = useState("34.6");
  const [photos, setPhotos] = useState([
    { id: "P1", label: "Truck at dock â€” full view", tag: "Overall Truck" },
    { id: "P2", label: "Seal SL-778213 intact", tag: "Seal" },
  ]);
  const [capturing, setCapturing] = useState(false);
  const [tag, setTag] = useState("Material");

  const capture = () => {
    setCapturing(true);
    setTimeout(() => {
      setPhotos((p) => [
        ...p,
        {
          id: `P${p.length + 1}`,
          label: `${tag} evidence ${p.length + 1} â€” dock ${shipment.dock}`,
          tag,
        },
      ]);
      setCapturing(false);
      toast.success("Photo captured", {
        description: `Tagged as ${tag} Â· geo-stamped at dock ${shipment.dock}`,
      });
    }, 900);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="elevated-card xl:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Package verification</CardTitle>
          <CardDescription>
            Count handling units against the packing list before opening cartons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            {(
              [
                ["Pallet count", "pallets", shipment.pallets],
                ["Carton count", "cartons", shipment.cartons],
                ["Box count", "boxes", shipment.boxes],
              ] as const
            ).map(([label, key, expected]) => (
              <div key={key} className="space-y-2">
                <Label className="text-xs">{label}</Label>
                <Input
                  type="number"
                  className="num"
                  value={packages[key]}
                  onChange={(e) => setPackages((p) => ({ ...p, [key]: Number(e.target.value) }))}
                />
                <p className="num text-[0.7rem] text-muted-foreground">
                  Expected {expected} Â· variance {packages[key] - expected}
                </p>
              </div>
            ))}
            <div className="space-y-2">
              <Label className="text-xs">Net weight (T)</Label>
              <Input className="num" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Volume (mÂ³)</Label>
              <Input className="num" value={volume} onChange={(e) => setVolume(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Unloading crew</Label>
              <Select defaultValue="Crew A">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Crew A", "Crew B", "Crew C â€” Forklift"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-2/60 p-4">
            <Package className="h-5 w-5 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Handling units reconciled</p>
              <p className="text-xs text-muted-foreground">
                {packages.pallets} pallets Â· {packages.cartons} cartons Â· {packages.boxes} boxes
                recorded against ASN {shipment.asn}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Package count locked for this receipt")}
            >
              Lock counts
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="elevated-card">
        <CardHeader>
          <CardTitle className="text-base">Photo capture</CardTitle>
          <CardDescription>Mandatory evidence per receiving policy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative grid h-40 place-items-center overflow-hidden rounded-xl border border-border bg-foreground/90">
            {capturing ? (
              <Loader2 className="h-6 w-6 animate-spin text-background" />
            ) : (
              <div className="text-center text-background/80">
                <Camera className="mx-auto h-7 w-7" />
                <p className="mt-1 text-xs">Rear camera Â· 12 MP Â· flash auto</p>
              </div>
            )}
            <div className="pointer-events-none absolute inset-4 rounded-lg border-2 border-dashed border-background/40" />
          </div>
          <div className="flex gap-2">
            <Select value={tag} onValueChange={setTag}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Overall Truck", "Material", "Damage", "Package", "Seal"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={capture} disabled={capturing}>
              <Camera className="mr-2 h-4 w-4" /> Capture
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {photos.map((p) => (
              <div
                key={p.id}
                className="group relative overflow-hidden rounded-xl border border-border bg-surface-2 p-3"
              >
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <p className="mt-2 line-clamp-2 text-[0.7rem] leading-tight">{p.label}</p>
                <Tone tone="info" className="mt-1.5">
                  {p.tag}
                </Tone>
                <button
                  onClick={() => setPhotos((ps) => ps.filter((x) => x.id !== p.id))}
                  className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100"
                  aria-label="Delete photo"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-[0.7rem] text-muted-foreground">
            {photos.length} of minimum 4 photos captured
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/** Screens 06 + 10 â€” material and quantity verification. */
export function VerifyStep({ shipment }: { shipment: Shipment }) {
  const { dispatch } = useWms();

  return (
    <Card className="elevated-card">
      <CardHeader>
        <CardTitle className="text-base">Material &amp; quantity verification</CardTitle>
        <CardDescription>
          Record received, accepted, rejected and damaged quantities per line
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {shipment.lines.map((l) => {
          const diff = l.received - l.expected;
          const variance = ((diff / l.expected) * 100).toFixed(1);
          return (
            <div key={l.id} className="rounded-2xl border border-border bg-surface-2/40 p-4">
              <div className="flex flex-wrap items-start gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-border bg-surface">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="min-w-[200px] flex-1">
                  <p className="num text-xs font-semibold text-primary">{l.code}</p>
                  <p className="text-sm font-medium">{l.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {l.uom} Â· {l.storageCondition} Â· HSN {l.hsn}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {l.serialManaged && <Tone tone="info">Serial controlled</Tone>}
                  {l.batchManaged && <Tone tone="accent">Batch controlled</Tone>}
                  <Tone tone={diff === 0 ? "success" : diff < 0 ? "destructive" : "warning"}>
                    {diff === 0
                      ? "Quantity match"
                      : diff < 0
                        ? `Short ${Math.abs(diff)}`
                        : `Excess ${diff}`}{" "}
                    ({variance}%)
                  </Tone>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <Field label="Expected" value={l.expected.toLocaleString("en-IN")} mono />
                {(
                  [
                    ["Received", "received"],
                    ["Accepted", "accepted"],
                    ["Rejected", "rejected"],
                    ["Damaged", "damaged"],
                  ] as const
                ).map(([label, key]) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground">
                      {label}
                    </Label>
                    <Input
                      type="number"
                      className="num h-9"
                      value={l[key]}
                      onChange={(e) =>
                        dispatch({
                          type: "line",
                          id: shipment.id,
                          lineId: l.id,
                          patch: { [key]: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                ))}
                <div className="space-y-1.5">
                  <Label className="text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground">
                    Variance
                  </Label>
                  <div
                    className={`num flex h-9 items-center rounded-md border px-3 text-sm ${diff === 0 ? "border-success/30 bg-success-soft text-success" : "border-warning/30 bg-warning-soft"}`}
                  >
                    {diff > 0 ? "+" : ""}
                    {diff}
                  </div>
                </div>
              </div>

              <Progress
                value={Math.min((l.received / l.expected) * 100, 100)}
                className="mt-4 h-1.5"
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/** Screens 07 + 08 + 09 â€” scanning, serial and batch management. */
export function ScanStep({ shipment }: { shipment: Shipment }) {
  const [scanning, setScanning] = useState(false);
  const [mode, setMode] = useState<"barcode" | "qr">("barcode");
  const [multi, setMulti] = useState(true);
  const [history, setHistory] = useState([
    {
      code: "8901234567890",
      type: "EAN-13",
      material: shipment.lines[0]?.code ?? "MAT",
      at: "07:22",
      ok: true,
    },
    {
      code: "QR|ASN88213|PLT-04",
      type: "QR",
      material: shipment.lines[1]?.code ?? "MAT",
      at: "07:23",
      ok: true,
    },
    { code: "8901234511111", type: "EAN-13", material: "UNKNOWN", at: "07:26", ok: false },
  ]);
  const [serials, setSerials] = useState(SERIALS);
  const [manualSerial, setManualSerial] = useState("");
  const [batch, setBatch] = useState({
    batch: "",
    supplier: "",
    mfg: "",
    exp: "",
    lot: "",
    qty: "",
  });

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      const ok = Math.random() > 0.2;
      setHistory((h) => [
        {
          code: ok ? `890123456${Math.floor(1000 + Math.random() * 8999)}` : "8901234500000",
          type: mode === "qr" ? "QR" : "Code-128",
          material: ok ? (shipment.lines[0]?.code ?? "MAT") : "UNKNOWN",
          at: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
          ok,
        },
        ...h,
      ]);
      setScanning(false);
      ok
        ? toast.success("Scan accepted", { description: "Matched against ASN line 1" })
        : toast.error("Scan rejected", {
            description: "Barcode not found in ASN â€” quarantine the carton",
          });
    }, 1100);
  };

  return (
    <Tabs defaultValue="scan">
      <TabsList className="mb-4 bg-surface-2">
        <TabsTrigger value="scan">
          <Barcode className="mr-1.5 h-3.5 w-3.5" /> Barcode &amp; QR
        </TabsTrigger>
        <TabsTrigger value="serial">Serial numbers</TabsTrigger>
        <TabsTrigger value="batch">Batch &amp; expiry</TabsTrigger>
      </TabsList>

      <TabsContent value="scan" className="mt-0 grid gap-4 xl:grid-cols-3">
        <Card className="elevated-card xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Scanner</CardTitle>
              <CardDescription>Zebra TC58 paired Â· auto-detect symbology</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Multi-scan</span>
              <Switch checked={multi} onCheckedChange={setMulti} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative grid h-64 place-items-center overflow-hidden rounded-2xl border border-border bg-foreground/90">
              <div className="pointer-events-none absolute inset-8 rounded-xl border-2 border-primary/70" />
              {scanning && (
                <div className="animate-scanline absolute inset-x-10 top-8 h-0.5 bg-primary shadow-[0_0_12px_var(--color-primary)]" />
              )}
              <div className="text-center text-background/85">
                {mode === "qr" ? (
                  <QrCode className="mx-auto h-9 w-9" />
                ) : (
                  <Barcode className="mx-auto h-9 w-9" />
                )}
                <p className="mt-2 text-xs">
                  {scanning ? "Reading symbologyâ€¦" : "Align code within the frame"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={mode === "barcode" ? "default" : "outline"}
                onClick={() => setMode("barcode")}
              >
                <Barcode className="mr-2 h-4 w-4" /> Barcode
              </Button>
              <Button variant={mode === "qr" ? "default" : "outline"} onClick={() => setMode("qr")}>
                <QrCode className="mr-2 h-4 w-4" /> QR code
              </Button>
              <Button className="ml-auto" onClick={simulateScan} disabled={scanning}>
                {scanning ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ScanLine className="mr-2 h-4 w-4" />
                )}
                Scan {multi ? "next" : "once"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="elevated-card">
          <CardHeader>
            <CardTitle className="text-base">Scan history</CardTitle>
            <CardDescription>
              {history.filter((h) => h.ok).length} accepted Â· {history.filter((h) => !h.ok).length}{" "}
              rejected
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[320px] space-y-2 overflow-y-auto">
            {history.map((h, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/50 p-2.5"
              >
                {h.ok ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="num truncate text-xs font-semibold">{h.code}</p>
                  <p className="num text-[0.68rem] text-muted-foreground">
                    {h.type} Â· {h.material} Â· {h.at}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="serial" className="mt-0 space-y-4">
        <Card className="elevated-card">
          <CardHeader>
            <CardTitle className="text-base">Serial number management</CardTitle>
            <CardDescription>
              Duplicate and not-in-ASN serials are blocked per receiving rules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[240px] flex-1 space-y-2">
                <Label htmlFor="ms">Manual serial entry</Label>
                <Input
                  id="ms"
                  className="num"
                  placeholder="SN-BR-4421-000122"
                  value={manualSerial}
                  onChange={(e) => setManualSerial(e.target.value)}
                />
              </div>
              <Button
                onClick={() => {
                  if (!manualSerial) return;
                  const dup = serials.some((s) => s.serial === manualSerial);
                  setSerials((s) => [
                    {
                      serial: manualSerial,
                      material: shipment.lines[0]?.code ?? "MAT",
                      status: dup ? "Duplicate" : "Verified",
                      scannedAt: new Date().toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      by: "Manual entry",
                    },
                    ...s,
                  ]);
                  dup
                    ? toast.error("Duplicate serial blocked")
                    : toast.success("Serial verified against ASN");
                  setManualSerial("");
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add serial
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.message("Serial scanner armed", {
                    description: "Continuous mode â€” 60 reads/min",
                  })
                }
              >
                <ScanLine className="mr-2 h-4 w-4" /> Scan serials
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-success/25 bg-success-soft p-3">
                <p className="num text-lg font-semibold text-success">
                  {serials.filter((s) => s.status === "Verified").length}
                </p>
                <p className="text-xs">Verified serials</p>
              </div>
              <div className="rounded-xl border border-warning/30 bg-warning-soft p-3">
                <p className="num text-lg font-semibold">
                  {serials.filter((s) => s.status === "Duplicate").length}
                </p>
                <p className="text-xs">Duplicate alerts</p>
              </div>
              <div className="rounded-xl border border-destructive/25 bg-destructive-soft p-3">
                <p className="num text-lg font-semibold text-destructive">
                  {serials.filter((s) => s.status === "Not In ASN").length}
                </p>
                <p className="text-xs">Extra / missing serial alerts</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-2/70 hover:bg-surface-2/70">
                    <TableHead>Serial number</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scanned</TableHead>
                    <TableHead>By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serials.map((s) => (
                    <TableRow key={s.serial}>
                      <TableCell className="num text-xs">{s.serial}</TableCell>
                      <TableCell className="num text-xs">{s.material}</TableCell>
                      <TableCell>
                        <Tone
                          tone={
                            s.status === "Verified"
                              ? "success"
                              : s.status === "Duplicate"
                                ? "warning"
                                : "destructive"
                          }
                        >
                          {s.status}
                        </Tone>
                      </TableCell>
                      <TableCell className="num text-xs">{s.scannedAt}</TableCell>
                      <TableCell className="text-xs">{s.by}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="batch" className="mt-0 grid gap-4 xl:grid-cols-3">
        <Card className="elevated-card xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Capture batch</CardTitle>
            <CardDescription>Shelf-life rule: minimum {70}% remaining at receipt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(
              [
                ["Warehouse batch", "batch", "BR-2026-A1181"],
                ["Supplier batch", "supplier", "RX-SEAL-88214"],
                ["Manufacturing date", "mfg", "2026-06-01"],
                ["Expiry date", "exp", "2029-05-31"],
                ["Lot number", "lot", "LOT-4472"],
                ["Quantity", "qty", "600"],
              ] as const
            ).map(([label, key, ph]) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs">{label}</Label>
                <Input
                  className="num h-9"
                  placeholder={ph}
                  value={batch[key]}
                  onChange={(e) => setBatch((b) => ({ ...b, [key]: e.target.value }))}
                />
              </div>
            ))}
            <Button
              className="w-full"
              onClick={() =>
                batch.batch
                  ? toast.success("Batch validated", {
                      description: "Shelf life 96% Â· accepted into receipt",
                    })
                  : toast.error("Batch number is mandatory for this material")
              }
            >
              Validate &amp; add batch
            </Button>
          </CardContent>
        </Card>

        <Card className="elevated-card xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Batches on this receipt</CardTitle>
            <CardDescription>FEFO sequencing applied automatically at put away</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface-2/70 hover:bg-surface-2/70">
                  <TableHead>Batch</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Supplier batch</TableHead>
                  <TableHead>Mfg</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Lot</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Validation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {BATCHES.map((b) => (
                  <TableRow key={b.batch}>
                    <TableCell className="num text-xs font-semibold">{b.batch}</TableCell>
                    <TableCell className="num text-xs">{b.material}</TableCell>
                    <TableCell className="num text-xs">{b.supplierBatch}</TableCell>
                    <TableCell className="num text-xs">{b.mfg}</TableCell>
                    <TableCell className="num text-xs">{b.exp}</TableCell>
                    <TableCell className="num text-xs">{b.lot}</TableCell>
                    <TableCell className="num text-right text-xs">{b.qty}</TableCell>
                    <TableCell>
                      <Tone tone={b.status === "Valid" ? "success" : "warning"}>{b.status}</Tone>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

/** Screens 13 + 14 â€” discrepancy management and partial receipt. */
export function ReviewStep({ shipment }: { shipment: Shipment }) {
  const { dispatch } = useWms();
  const [type, setType] = useState("Short Quantity");
  const [remarks, setRemarks] = useState("");
  const [reason, setReason] = useState("Vendor short-shipped against ASN");
  const [reschedule, setReschedule] = useState("2026-08-04");

  const shortLines = shipment.lines.filter((l) => l.received < l.expected);
  const excessLines = shipment.lines.filter((l) => l.received > l.expected);
  const damagedLines = shipment.lines.filter((l) => l.damaged > 0);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="elevated-card">
        <CardHeader>
          <CardTitle className="text-base">Discrepancy management</CardTitle>
          <CardDescription>Raise exceptions that block GRN posting until approved</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-destructive/25 bg-destructive-soft p-3">
              <p className="num text-lg font-semibold text-destructive">{shortLines.length}</p>
              <p className="text-xs">Short quantity lines</p>
            </div>
            <div className="rounded-xl border border-warning/30 bg-warning-soft p-3">
              <p className="num text-lg font-semibold">{excessLines.length}</p>
              <p className="text-xs">Excess quantity lines</p>
            </div>
            <div className="rounded-xl border border-border bg-surface-2 p-3">
              <p className="num text-lg font-semibold">
                {damagedLines.reduce((a, l) => a + l.damaged, 0)}
              </p>
              <p className="text-xs">Damaged units</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Discrepancy type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Short Quantity",
                  "Excess Quantity",
                  "Wrong Material",
                  "Damaged Material",
                  "Missing Material",
                  "Duplicate Material",
                ].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rem">Remarks &amp; evidence</Label>
            <Textarea
              id="rem"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. 4 cartons crushed on pallet 3, photos attached, vendor claim under SLA 7.2"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => toast.success("2 damage photos attached to discrepancy")}
            >
              <Camera className="mr-2 h-4 w-4" /> Attach photos
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                dispatch({
                  type: "status",
                  id: shipment.id,
                  status: "Discrepancy",
                  note: `${type} raised â€” ${remarks || "see photo evidence"}`,
                });
                toast.error("Discrepancy raised", {
                  description: "Warehouse manager approval required before GRN.",
                });
              }}
            >
              <AlertTriangle className="mr-2 h-4 w-4" /> Raise discrepancy
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="elevated-card">
        <CardHeader>
          <CardTitle className="text-base">Partial receipt</CardTitle>
          <CardDescription>Accept what arrived and schedule the balance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface-2/70 hover:bg-surface-2/70">
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Expected</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipment.lines.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="num text-xs">{l.code}</TableCell>
                    <TableCell className="num text-right text-xs">{l.expected}</TableCell>
                    <TableCell className="num text-right text-xs">{l.received}</TableCell>
                    <TableCell className="num text-right text-xs font-semibold">
                      {Math.max(l.expected - l.received, 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-2">
            <Label>Reason for partial receipt</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Vendor short-shipped against ASN",
                  "Vehicle capacity constraint",
                  "Damaged units returned on truck",
                  "Dock time window expired",
                ].map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resched">Schedule remaining delivery</Label>
            <Input
              id="resched"
              type="date"
              className="num"
              value={reschedule}
              onChange={(e) => setReschedule(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            onClick={() => {
              dispatch({
                type: "status",
                id: shipment.id,
                status: "Partial Receipt",
                note: `Partial receipt â€” ${reason}. Balance scheduled ${reschedule}.`,
              });
              toast.warning("Partial receipt recorded", {
                description: `Balance rescheduled to ${reschedule} Â· PO line kept open`,
              });
            }}
          >
            <ClipboardCheck className="mr-2 h-4 w-4" /> Confirm partial receipt
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
