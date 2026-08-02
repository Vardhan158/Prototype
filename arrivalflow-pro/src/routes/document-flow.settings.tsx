import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Database, FileCheck2, Link2, Save, ScanText, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/apps/document-flow/components/wms/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/document-flow/settings")({
  head: () => ({
    meta: [
      { title: "Document Flow Settings — Axion WMS" },
      { name: "description", content: "Configure OCR, review workflows, notifications and retention." },
    ],
  }),
  component: DocumentSettingsPage,
});

function SettingRow({ title, description, enabled = true }: { title: string; description: string; enabled?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-5 border-b py-4 last:border-b-0">
      <div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs text-muted-foreground">{description}</p></div>
      <Switch defaultChecked={enabled} aria-label={title} />
    </div>
  );
}

function Panel({ icon: Icon, title, description, children }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="surface-card overflow-hidden">
      <div className="flex items-center gap-3 border-b px-5 py-4">
        <div className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary"><Icon className="size-5" /></div>
        <div><h2 className="text-sm font-semibold">{title}</h2><p className="text-xs text-muted-foreground">{description}</p></div>
      </div>
      <div className="px-5 py-2">{children}</div>
    </section>
  );
}

function DocumentSettingsPage() {
  const [confidence, setConfidence] = useState("92");
  const [retention, setRetention] = useState("7 years");

  return (
    <AppShell
      title="Settings"
      subtitle="Configure document processing, governance and system connections"
      breadcrumb={[{ label: "Home", to: "/document-flow" }, { label: "Settings" }]}
      actions={<Button className="rounded-xl" onClick={() => toast.success("Document Flow settings saved")}><Save className="mr-2 size-4" /> Save changes</Button>}
    >
      <Tabs defaultValue="ocr">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="ocr">OCR & Extraction</TabsTrigger>
          <TabsTrigger value="workflow">Review Workflow</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="ocr" className="mt-5 grid gap-5 xl:grid-cols-2">
          <Panel icon={ScanText} title="OCR processing" description="Control extraction and validation behavior">
            <SettingRow title="Automatic OCR processing" description="Start extraction immediately after a document is uploaded." />
            <SettingRow title="Image enhancement" description="Improve contrast, alignment and resolution before extraction." />
            <SettingRow title="Handwriting recognition" description="Detect handwritten quantities, dates and vehicle numbers." />
            <SettingRow title="Duplicate detection" description="Compare document number, vendor and file fingerprint." />
          </Panel>
          <Panel icon={ShieldCheck} title="Confidence rules" description="Define when manual verification is required">
            <div className="space-y-2 border-b py-4">
              <Label htmlFor="confidence">Auto-accept confidence threshold</Label>
              <div className="flex items-center gap-3"><Input id="confidence" type="number" min="70" max="99" value={confidence} onChange={(event) => setConfidence(event.target.value)} className="max-w-28" /><span className="text-sm text-muted-foreground">%</span></div>
              <p className="text-xs text-muted-foreground">Documents below this score are sent to the review queue.</p>
            </div>
            <SettingRow title="Validate tax identifiers" description="Check GSTIN and invoice numbers against expected formats." />
            <SettingRow title="Block expired documents" description="Prevent approval of expired licenses and compliance records." />
          </Panel>
        </TabsContent>

        <TabsContent value="workflow" className="mt-5 grid gap-5 xl:grid-cols-2">
          <Panel icon={FileCheck2} title="Review routing" description="Set rules for document verification">
            <SettingRow title="Auto-approve high-confidence documents" description={`Approve documents with confidence at or above ${confidence}%.`} />
            <SettingRow title="Require two-person review" description="Use maker-checker review for invoices above ₹10 lakh." />
            <SettingRow title="Prioritize inbound documents" description="Move documents linked to waiting vehicles to the top." />
          </Panel>
          <Panel icon={ShieldCheck} title="Service levels" description="Escalation and approval targets">
            <div className="grid gap-4 py-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="review-sla">Review SLA</Label><select id="review-sla" className="h-10 w-full rounded-lg border bg-background px-3 text-sm" defaultValue="2 hours"><option>30 minutes</option><option>1 hour</option><option>2 hours</option><option>4 hours</option></select></div>
              <div className="space-y-2"><Label htmlFor="escalation">Escalate before SLA</Label><select id="escalation" className="h-10 w-full rounded-lg border bg-background px-3 text-sm" defaultValue="30 minutes"><option>15 minutes</option><option>30 minutes</option><option>1 hour</option></select></div>
            </div>
            <SettingRow title="Reassign inactive reviewers" description="Move open tasks when a reviewer is unavailable." />
          </Panel>
        </TabsContent>

        <TabsContent value="notifications" className="mt-5">
          <Panel icon={Bell} title="Notification preferences" description="Choose which events notify document teams">
            {[
              ["OCR processing failed", "Notify the uploader and document controller immediately."],
              ["Review SLA approaching", "Send a warning 30 minutes before the review deadline."],
              ["Document rejected", "Notify the uploader with the rejection reason."],
              ["Daily processing summary", "Email volume, accuracy and exception metrics at 18:00."],
              ["Integration unavailable", "Alert administrators when ERP synchronization fails."],
            ].map(([title, description]) => <SettingRow key={title} title={title} description={description} enabled={title !== "Daily processing summary"} />)}
          </Panel>
        </TabsContent>

        <TabsContent value="retention" className="mt-5 grid gap-5 xl:grid-cols-2">
          <Panel icon={Database} title="Document retention" description="Storage lifecycle and archival policy">
            <div className="space-y-2 border-b py-4"><Label htmlFor="retention">Default retention period</Label><select id="retention" value={retention} onChange={(event) => setRetention(event.target.value)} className="h-10 w-full rounded-lg border bg-background px-3 text-sm"><option>3 years</option><option>5 years</option><option>7 years</option><option>10 years</option></select></div>
            <SettingRow title="Archive inactive documents" description="Move documents to lower-cost storage after 12 months." />
            <SettingRow title="Legal hold protection" description="Prevent deletion of documents assigned to a legal hold." />
          </Panel>
          <Panel icon={ShieldCheck} title="Security & audit" description="Protect documents and maintain traceability">
            <SettingRow title="Encrypt exported files" description="Password-protect bulk report and document exports." />
            <SettingRow title="Record document access" description="Maintain a full audit trail of views and downloads." />
            <SettingRow title="Mask sensitive identifiers" description="Hide tax and personal identifiers for limited roles." />
          </Panel>
        </TabsContent>

        <TabsContent value="integrations" className="mt-5">
          <Panel icon={Link2} title="Connected systems" description="Document exchange and master-data connections">
            {[
              ["SAP S/4HANA", "Connected · Last sync 2 minutes ago", true],
              ["Vendor Portal", "Connected · 28 active vendors", true],
              ["Azure Document Intelligence", "Connected · OCR service healthy", true],
              ["Email document intake", "documents@axionwms.com", true],
              ["SharePoint archive", "Not configured", false],
            ].map(([title, description, enabled]) => <SettingRow key={String(title)} title={String(title)} description={String(description)} enabled={Boolean(enabled)} />)}
          </Panel>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
