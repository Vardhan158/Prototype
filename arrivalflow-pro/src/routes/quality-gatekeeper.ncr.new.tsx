import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Save, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, SectionCard } from "@/apps/quality-gatekeeper/components/qm/Primitives";
import { StatusPill } from "@/apps/quality-gatekeeper/components/qm/StatusPill";
import { damageTypes, inspections } from "@/apps/quality-gatekeeper/lib/qm-data";

export const Route = createFileRoute("/quality-gatekeeper/ncr/new")({
  head: () => ({
    meta: [
      { title: "Raise NCR Â· Axiom WMS" },
      {
        name: "description",
        content: "Create a non-conformance report with defect category, root cause and CAPA.",
      },
      { property: "og:title", content: "Raise NCR Â· Axiom WMS" },
      { property: "og:description", content: "Create a warehouse quality non-conformance report." },
    ],
  }),
  component: NewNcr,
});

function NewNcr() {
  const navigate = useNavigate();
  const [desc, setDesc] = useState("");
  const [rc, setRc] = useState("");
  const [touched, setTouched] = useState(false);
  const valid = desc.length >= 20 && rc.length >= 15;

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Quality", to: "/quality-gatekeeper" },
          { label: "NCR", to: "/quality-gatekeeper/ncr" },
          { label: "New" },
        ]}
        eyebrow="Screen 10 Â· Create"
        title="Raise Non-Conformance Report"
        description="Draft NCR-2026-00319 Â· auto-numbered on submission"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast("Draft NCR saved")}>
              <Save className="mr-2 h-4 w-4" /> Save draft
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setTouched(true);
                if (!valid) {
                  toast.error("Validation failed", {
                    description: "Complete the mandatory fields before submitting",
                  });
                  return;
                }
                toast.success("NCR-2026-00319 created", {
                  description: "Routed to Quality Manager for disposition",
                });
                navigate({ to: "/quality-gatekeeper/ncr" });
              }}
            >
              <Send className="mr-2 h-4 w-4" /> Submit NCR
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <SectionCard title="Source & classification">
            <div className="grid gap-3 sm:grid-cols-2">
              <F l="Linked inspection">
                <Select defaultValue={inspections[0]!.id}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {inspections.slice(0, 6).map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.id} Â· {i.material}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </F>
              <F l="Defect category">
                <Select defaultValue={damageTypes[0]!}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {damageTypes.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </F>
              <F l="Severity">
                <Select defaultValue="Major">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Minor", "Major", "Critical"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </F>
              <F l="Affected quantity">
                <Input className="num" defaultValue="3" />
              </F>
              <F l="Responsible department">
                <Select defaultValue="Supplier Quality">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Supplier Quality",
                      "Logistics",
                      "Procurement",
                      "Warehouse Operations",
                      "HSE",
                    ].map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </F>
              <F l="Target closure date">
                <Input type="date" defaultValue="2026-08-15" />
              </F>
            </div>
          </SectionCard>

          <SectionCard title="Description & root cause">
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Non-conformance description *</Label>
                <Textarea
                  className="mt-1.5"
                  rows={4}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="What was found, where, how many units, against which specificationâ€¦"
                />
                {touched && desc.length < 20 && (
                  <p className="mt-1 text-[11px] text-destructive">
                    Description is mandatory (minimum 20 characters).
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs">Root cause *</Label>
                <Textarea
                  className="mt-1.5"
                  rows={3}
                  value={rc}
                  onChange={(e) => setRc(e.target.value)}
                  placeholder="5-Why outcome or Ishikawa categoryâ€¦"
                />
                {touched && rc.length < 15 && (
                  <p className="mt-1 text-[11px] text-destructive">
                    Root cause is mandatory (minimum 15 characters).
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs">Corrective action</Label>
                <Textarea
                  className="mt-1.5"
                  rows={2}
                  placeholder="Immediate containment and correctionâ€¦"
                />
              </div>
              <div>
                <Label className="text-xs">Preventive action</Label>
                <Textarea
                  className="mt-1.5"
                  rows={2}
                  placeholder="Systemic change to prevent recurrenceâ€¦"
                />
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-3">
          <SectionCard title="Validation">
            <ul className="space-y-2 text-xs">
              {[
                ["Linked inspection selected", true],
                ["Defect category selected", true],
                ["Description â‰¥ 20 chars", desc.length >= 20],
                ["Root cause â‰¥ 15 chars", rc.length >= 15],
                ["Evidence attached", true],
              ].map(([l, ok]) => (
                <li key={String(l)} className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-muted-foreground">{String(l)}</span>
                  <StatusPill tone={ok ? "success" : "danger"} dot={false}>
                    {ok ? "OK" : "Missing"}
                  </StatusPill>
                </li>
              ))}
            </ul>
          </SectionCard>
          <SectionCard title="Approval routing">
            <ol className="space-y-2 text-[11px]">
              <li className="rounded-lg border border-border px-3 py-2">
                1 Â· Quality Manager â€” Layla Hassan
              </li>
              <li className="rounded-lg border border-border px-3 py-2">
                2 Â· Procurement Manager â€” Khalid Aziz
              </li>
              <li className="rounded-lg border border-border px-3 py-2">
                3 Â· Vendor acknowledgement (portal)
              </li>
            </ol>
          </SectionCard>
        </div>
      </div>
    </>
  );
}

function F({ l, children }: { l: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{l}</Label>
      {children}
    </div>
  );
}
