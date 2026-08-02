import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PageHeader, SectionCard } from "@/apps/quality-gatekeeper/components/qm/Primitives";
import { StatusPill } from "@/apps/quality-gatekeeper/components/qm/StatusPill";
import { inspections } from "@/apps/quality-gatekeeper/lib/qm-data";

export const Route = createFileRoute("/quality-gatekeeper/scan")({
  head: () => ({
    meta: [
      { title: "Barcode & QR Verification Â· Axiom WMS" },
      {
        name: "description",
        content:
          "Handheld scanner station for barcode, QR, serial and batch validation against the ASN manifest",
      },
      { property: "og:title", content: "Barcode & QR Verification Â· Axiom WMS" },
      {
        property: "og:description",
        content:
          "Handheld scanner station for barcode, QR, serial and batch validation against the ASN manifest",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Quality", to: "/quality-gatekeeper" },
          { label: "Barcode & QR Verification" },
        ]}
        eyebrow="Screen 07"
        title="Barcode & QR Verification"
        description="Handheld scanner station for barcode, QR, serial and batch validation against the ASN manifest"
        actions={
          <Button variant="outline" size="sm" onClick={() => toast.success("Exported")}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        }
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Scanner">
          <div className="relative grid h-[300px] place-items-center overflow-hidden rounded-2xl border border-border bg-foreground/90">
            <div className="absolute inset-x-10 inset-y-16 rounded-xl border-2 border-dashed border-primary-foreground/40" />
            <div className="text-center text-primary-foreground">
              <p className="text-xs opacity-80">Align the code within the frame</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {["Barcode", "QR", "Serial", "Batch"].map((m) => (
              <Button key={m} variant="outline" size="sm">
                {m}
              </Button>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Auto validation results" padded={false}>
          <ul className="divide-y divide-border">
            {inspections.slice(0, 6).map((i, idx) => (
              <li
                key={i.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="num truncate text-xs font-medium">{i.lines[0]?.serial}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {i.materialCode} Â· {i.lines[0]?.batch}
                  </p>
                </div>
                <StatusPill tone={idx === 2 ? "danger" : "success"}>
                  {idx === 2 ? "Mismatch" : "Match"}
                </StatusPill>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </>
  );
}
