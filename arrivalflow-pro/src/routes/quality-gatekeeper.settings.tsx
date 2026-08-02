import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PageHeader, SectionCard } from "@/apps/quality-gatekeeper/components/qm/Primitives";
import { StatusPill } from "@/apps/quality-gatekeeper/components/qm/StatusPill";

export const Route = createFileRoute("/quality-gatekeeper/settings")({
  head: () => ({
    meta: [
      { title: "Settings Â· Axiom WMS" },
      {
        name: "description",
        content:
          "Inspection templates, sampling rules, AQL levels, damage categories and NCR configuration",
      },
      { property: "og:title", content: "Settings Â· Axiom WMS" },
      {
        property: "og:description",
        content:
          "Inspection templates, sampling rules, AQL levels, damage categories and NCR configuration",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Quality", to: "/quality-gatekeeper" }, { label: "Settings" }]}
        eyebrow="Screen 22"
        title="Settings"
        description="Inspection templates, sampling rules, AQL levels, damage categories and NCR configuration"
        actions={
          <Button variant="outline" size="sm" onClick={() => toast.success("Exported")}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        }
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[
          [
            "Inspection Templates",
            "6 active templates Â· flange, valve, electrical, PPE, bulk, consumables",
          ],
          ["Sampling Rules", "ISO 2859-1 tables, switching rules and lot-size bands"],
          ["AQL Levels", "0.065 â€“ 4.0 configured per material group criticality"],
          ["Damage Categories", "8 categories mapped to defect codes and severity"],
          ["Quality Rules", "Auto-hold on critical defect, tolerance Â±2% under-delivery"],
          ["NCR Settings", "Numbering QM-NCR-YYYY, 2-step approval, 8D template"],
        ].map(([t, d]) => (
          <SectionCard key={t} title={t as string}>
            <p className="text-[11px] text-muted-foreground">{d}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 w-full"
              onClick={() => toast("Configuration opened")}
            >
              Configure
            </Button>
          </SectionCard>
        ))}
      </div>
    </>
  );
}
