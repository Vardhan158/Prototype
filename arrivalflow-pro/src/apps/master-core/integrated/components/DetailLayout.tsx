import type { ReactNode } from "react";
import { Download, FileText, History, Paperclip, Power, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, type Crumb } from "@/apps/master-core/integrated/components/PageHeader";
import { StatusChip } from "@/apps/master-core/integrated/components/StatusChip";

export type FieldGroup = { title: string; fields: { label: string; value: ReactNode }[] };

const attachments = [
  { name: "Master_Agreement_2026.pdf", size: "1.8 MB", date: "12 Mar 2026" },
  { name: "Compliance_Certificate.pdf", size: "640 KB", date: "04 Feb 2026" },
  { name: "Bank_Verification.xlsx", size: "112 KB", date: "22 Jan 2026" },
];

const timeline = [
  {
    title: "Record created",
    actor: "Amara Okafor",
    time: "12 Jan 2026 · 09:14",
    note: "Initial master record registered from onboarding intake.",
  },
  {
    title: "Compliance documents uploaded",
    actor: "Chloé Martin",
    time: "04 Feb 2026 · 14:02",
    note: "Certificate and tax registration attached.",
  },
  {
    title: "Payment terms revised",
    actor: "Farah Siddiqui",
    time: "12 Mar 2026 · 11:30",
    note: "Terms changed from Net 30 to Net 45 after negotiation.",
  },
  {
    title: "Approved by governance council",
    actor: "Bram de Vries",
    time: "18 Mar 2026 · 16:45",
    note: "Record promoted to golden master.",
  },
];

const audit = [
  {
    field: "paymentTerms",
    from: "Net 30",
    to: "Net 45",
    user: "Farah Siddiqui",
    at: "12 Mar 2026 11:30",
  },
  { field: "status", from: "Draft", to: "Active", user: "Bram de Vries", at: "18 Mar 2026 16:45" },
  {
    field: "contactPerson",
    from: "—",
    to: "Assigned",
    user: "Amara Okafor",
    at: "12 Jan 2026 09:20",
  },
];

export function DetailLayout({
  title,
  code,
  status,
  crumbs,
  icon,
  groups,
  metrics,
  related,
  extraTab,
}: {
  title: string;
  code: string;
  status: string;
  crumbs: Crumb[];
  icon?: ReactNode;
  groups: FieldGroup[];
  metrics?: { label: string; value: string }[];
  related?: { label: string; value: string; meta: string }[];
  extraTab?: { label: string; content: ReactNode };
}) {
  return (
    <div className="min-h-full">
      <PageHeader
        crumbs={crumbs}
        icon={icon}
        title={title}
        description={`${code} · Golden master record maintained by the Master Data governance team`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.success("Record exported")}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success(`${title} deactivated`)}
            >
              <Power className="h-4 w-4" /> Deactivate
            </Button>
            <Button size="sm" onClick={() => toast.info("Edit mode opened")}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          </>
        }
      />

      <div className="space-y-5 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <StatusChip value={status} />
          <span className="num rounded-md bg-surface px-2 py-1 text-xs text-muted-foreground">
            {code}
          </span>
        </div>

        {metrics && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.label} className="surface-panel p-4">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="num mt-1 text-xl font-semibold">{m.value}</p>
              </div>
            ))}
          </div>
        )}

        <Tabs defaultValue="overview">
          <TabsList className="flex w-full flex-wrap justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="related">Related records</TabsTrigger>
            <TabsTrigger value="timeline">Activity timeline</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="audit">Audit history</TabsTrigger>
            {extraTab && <TabsTrigger value="extra">{extraTab.label}</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="mt-4 grid gap-4 lg:grid-cols-2">
            {groups.map((g) => (
              <Card key={g.title} className="shadow-[var(--shadow-card)]">
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="text-sm font-semibold">{g.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                    {g.fields.map((f) => (
                      <div key={f.label} className="min-w-0">
                        <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {f.label}
                        </dt>
                        <dd className="mt-0.5 break-words text-sm font-medium">{f.value || "—"}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="related" className="mt-4">
            <Card>
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-sm font-semibold">
                  Linked transactional records
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {(
                    related ?? [
                      { label: "PO-88213", value: "€ 142,880", meta: "Purchase order · Open" },
                      { label: "GRN-44120", value: "1,240 units", meta: "Goods receipt · Posted" },
                      { label: "INV-99871", value: "€ 58,410", meta: "Invoice · Paid" },
                    ]
                  ).map((r) => (
                    <li
                      key={r.label}
                      className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 transition-colors hover:bg-surface"
                    >
                      <div className="min-w-0">
                        <p className="num text-sm font-medium">{r.label}</p>
                        <p className="text-xs text-muted-foreground">{r.meta}</p>
                      </div>
                      <span className="num text-sm font-semibold">{r.value}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <ol className="relative space-y-6 border-l border-border pl-6">
                  {timeline.map((t) => (
                    <li key={t.title} className="relative">
                      <span className="absolute -left-[31px] top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-background bg-primary" />
                      <p className="text-sm font-semibold">{t.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.actor} · {t.time}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{t.note}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attachments" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {attachments.map((a) => (
                    <li
                      key={a.name}
                      className="flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-surface"
                    >
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{a.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.size} · uploaded {a.date}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" /> Download
                      </Button>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border p-4">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4" /> Attach document
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="mt-4">
            <Card>
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <History className="h-4 w-4 text-primary" /> Field-level change log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {audit.map((a) => (
                    <li
                      key={a.field + a.at}
                      className="grid gap-1 px-5 py-3 sm:grid-cols-[1fr_auto]"
                    >
                      <div className="min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{a.field}</span>{" "}
                          <span className="text-muted-foreground">changed from</span>{" "}
                          <span className="rounded bg-surface px-1.5 py-0.5 text-xs">{a.from}</span>{" "}
                          <span className="text-muted-foreground">to</span>{" "}
                          <span className="rounded bg-primary-soft px-1.5 py-0.5 text-xs text-accent-foreground">
                            {a.to}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">by {a.user}</p>
                      </div>
                      <span className="num text-xs text-muted-foreground sm:text-right">
                        {a.at}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {extraTab && (
            <TabsContent value="extra" className="mt-4">
              {extraTab.content}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
