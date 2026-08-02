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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/receiving-hub/settings")({
  head: () => ({
    meta: [
      { title: "Receiving Settings | AXIOM WMS Inbound" },
      {
        name: "description",
        content:
          "Configure receiving rules, quantity tolerance, variance limits, GRN numbering, barcode, batch and serial policies.",
      },
      { property: "og:title", content: "Receiving Settings | AXIOM WMS Inbound" },
      {
        property: "og:description",
        content:
          "Configure receiving rules, quantity tolerance, variance limits, GRN numbering, barcode, batch and serial policies.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { state, dispatch } = useWms();
  const s = state.settings;
  return (
    <div className="mx-auto max-w-[1000px]">
      <PageHeader
        title="Receiving Settings"
        subtitle="Policies applied to every inbound receipt in this warehouse"
        crumbs={[{ label: "Governance", to: "/receiving-hub" }, { label: "Settings" }]}
        actions={
          <Button
            onClick={() =>
              toast.success("Receiving rules saved", {
                description: "Applied to all new receipts from the next dock call.",
              })
            }
          >
            Save changes
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="elevated-card">
          <CardHeader>
            <CardTitle className="text-base">Tolerance rules</CardTitle>
            <CardDescription>Auto-accept thresholds before an exception is raised</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Quantity tolerance %</Label>
              <Input
                type="number"
                className="num"
                value={s.qtyTolerance}
                onChange={(e) =>
                  dispatch({ type: "settings", patch: { qtyTolerance: Number(e.target.value) } })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Variance escalation limit %</Label>
              <Input
                type="number"
                className="num"
                value={s.varianceLimit}
                onChange={(e) =>
                  dispatch({ type: "settings", patch: { varianceLimit: Number(e.target.value) } })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Minimum remaining shelf life %</Label>
              <Input
                type="number"
                className="num"
                value={s.expiryShelfLife}
                onChange={(e) =>
                  dispatch({ type: "settings", patch: { expiryShelfLife: Number(e.target.value) } })
                }
              />
            </div>
          </CardContent>
        </Card>
        <Card className="elevated-card">
          <CardHeader>
            <CardTitle className="text-base">Document & scanning rules</CardTitle>
            <CardDescription>GRN numbering and capture policies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>GRN number format</Label>
              <Input
                className="num"
                value={s.grnPrefix}
                onChange={(e) =>
                  dispatch({ type: "settings", patch: { grnPrefix: e.target.value } })
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2/50 p-3">
              <span className="text-sm">Auto dock allocation</span>
              <Switch
                checked={s.autoDock}
                onCheckedChange={(v) => dispatch({ type: "settings", patch: { autoDock: v } })}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2/50 p-3">
              <span className="text-sm">Mandatory photo capture</span>
              <Switch
                checked={s.mandatoryPhotos}
                onCheckedChange={(v) =>
                  dispatch({ type: "settings", patch: { mandatoryPhotos: v } })
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2/50 p-3">
              <span className="text-sm">Block duplicate serials</span>
              <Switch
                checked={s.duplicateSerialBlock}
                onCheckedChange={(v) =>
                  dispatch({ type: "settings", patch: { duplicateSerialBlock: v } })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
