import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy, BookOpen, Keyboard, MessageSquare } from "lucide-react";

import { PageHeader } from "@master/components/masters/PageHeader";
import { Button } from "@master/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@master/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@master/components/ui/accordion";
import { toast } from "sonner";

export const Route = createFileRoute("/master-core/help")({
  head: () => ({
    meta: [
      { title: "Help & Documentation — Meridia ERP MDM" },
      {
        name: "description",
        content:
          "Guides, keyboard shortcuts and answers for working with supplier, customer, item and warehouse master data.",
      },
      { property: "og:title", content: "Help & Documentation — Meridia ERP" },
      {
        property: "og:description",
        content: "Master data management guides, shortcuts and support contacts.",
      },
    ],
  }),
  component: HelpPage,
});

const shortcuts = [
  ["Ctrl / ⌘ + K", "Open global search"],
  ["Ctrl / ⌘ + N", "Create a new record"],
  ["Ctrl / ⌘ + S", "Save the current form"],
  ["Esc", "Close panel or dialog"],
  ["/", "Focus the table search"],
];

const faqs = [
  [
    "How are master record codes generated?",
    "Each entity has a numbering series defined under Settings → Numbering. The next code is reserved when the create panel opens and released if you cancel.",
  ],
  [
    "Why is a new record showing as Draft?",
    "When 'Require approval before activation' is enabled, records stay in Draft until every approval step is cleared by the assigned reviewer.",
  ],
  [
    "Can I import records in bulk?",
    "Yes. Use the Import action on any master list, download the template, fill it in and upload. Rows failing validation are reported line by line without blocking valid rows.",
  ],
  [
    "How does the audit history work?",
    "Every field change is captured with the old value, new value, user and timestamp. Open a record and use the Audit tab to review or export the trail.",
  ],
  [
    "What does the data quality score mean?",
    "It combines completeness of mandatory fields, duplicate detection and expiring compliance documents across all master entities.",
  ],
];

function HelpPage() {
  return (
    <div className="min-h-full">
      <PageHeader
        crumbs={[{ label: "Master Data Management", to: "/master-core/" }, { label: "Help" }]}
        icon={<LifeBuoy className="h-5 w-5" />}
        title="Help & Documentation"
        description="Guides, shortcuts and support for the master data management module."
      />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: BookOpen,
              title: "Getting started",
              desc: "Set up numbering, roles and your first supplier record.",
              cta: "Open guide",
            },
            {
              icon: Keyboard,
              title: "Keyboard shortcuts",
              desc: "Work faster across list views, forms and search.",
              cta: "View shortcuts",
            },
            {
              icon: MessageSquare,
              title: "Contact support",
              desc: "Reach the master data governance team directly.",
              cta: "Raise a ticket",
            },
          ].map((c) => (
            <Card key={c.title}>
              <CardHeader>
                <div className="mb-2 grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-accent-foreground">
                  <c.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-sm font-semibold">{c.title}</CardTitle>
                <CardDescription>{c.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => toast("Documentation coming soon")}>
                  {c.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Frequently asked questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map(([q, a], i) => (
                  <AccordionItem key={q} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left text-sm">{q}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {shortcuts.map(([keys, desc]) => (
                <div key={keys} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-sm text-muted-foreground">{desc}</span>
                  <kbd className="num shrink-0 rounded-md border border-border bg-surface px-2 py-1 text-[11px] font-medium">
                    {keys}
                  </kbd>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
