import { createFileRoute } from "@tanstack/react-router";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { SectionCard } from "@/apps/quality-gatekeeper/components/wms/bits";

export const Route = createFileRoute("/quality-gatekeeper/settings")({
  head: () => ({
    meta: [
      { title: "Quality Settings — AXIOM WMS" },
      { name: "description", content: "Inspection plan defaults, AQL levels, escalation SLAs, evidence rules and notification routing." },
      { property: "og:title", content: "Quality Settings — AXIOM WMS" },
      { property: "og:description", content: "Inspection defaults, AQL levels, SLAs and notification routing." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto max-w-[1100px] space-y-5">
      <header>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Configuration</p>
        <h1 className="text-2xl font-bold sm:text-3xl">Quality Settings</h1>
      </header>

      <SectionCard title="Inspection defaults" description="Applied when no material-specific inspection plan exists">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-xs">Default inspection type</Label>
            <Select defaultValue="AQL Sampling">
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="100% Inspection">100% Inspection</SelectItem>
                <SelectItem value="Random Sampling">Random Sampling</SelectItem>
                <SelectItem value="AQL Sampling">AQL Sampling</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">AQL level</Label>
            <Select defaultValue="1.0">
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["0.65", "1.0", "1.5", "2.5"].map((a) => (<SelectItem key={a} value={a}>AQL {a}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Inspection SLA (minutes)</Label>
            <Input defaultValue={60} className="num mt-1.5" />
          </div>
          <div>
            <Label className="text-xs">NCR response SLA (hours)</Label>
            <Input defaultValue={48} className="num mt-1.5" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Evidence & compliance rules" description="Enforced by the inspection workbench">
        {[
          { t: "Mandatory photo evidence on rejection", d: "Minimum 4 photos required before a FAIL disposition can be signed." },
          { t: "Digital signature required", d: "Certified e-signature enforced on every approval (21 CFR Part 11 aligned)." },
          { t: "Auto-create NCR on critical severity", d: "Critical damage automatically raises an NCR and blocks the lot." },
          { t: "Barcode validation mandatory", d: "Every material line must be scanned before verification can be completed." },
        ].map((r) => (
          <div key={r.t} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border py-4 last:border-0">
            <div className="min-w-0">
              <p className="text-sm font-medium">{r.t}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{r.d}</p>
            </div>
            <Switch defaultChecked />
          </div>
        ))}
      </SectionCard>

      <SectionCard title="Notification routing" description="Who gets notified on quality events">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-xs">Pass — notify</Label>
            <Input defaultValue="Warehouse Manager, Store Keeper" className="mt-1.5" />
          </div>
          <div>
            <Label className="text-xs">Fail / NCR — notify</Label>
            <Input defaultValue="Quality Manager, Procurement, Supplier Quality" className="mt-1.5" />
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button className="rounded-xl" onClick={() => toast.success("Quality settings saved", { description: "Applied to plant PL-1000 · effective immediately" })}>
            Save settings
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
