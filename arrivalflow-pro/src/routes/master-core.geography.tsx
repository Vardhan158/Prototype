import { createFileRoute } from "@tanstack/react-router";
import { Globe2 } from "lucide-react";

import {
  DataTable,
  type Column,
  type TableFilter,
} from "@/apps/master-core/integrated/components/DataTable";
import { PageHeader } from "@/apps/master-core/integrated/components/PageHeader";
import {
  RecordFormSheet,
  type FormStep,
} from "@/apps/master-core/integrated/components/RecordFormSheet";
import { StatusChip } from "@/apps/master-core/integrated/components/StatusChip";
import { useMasterPage } from "@/apps/master-core/integrated/hooks/useMasters";
import { Badge } from "@/components/ui/badge";
import { type Country } from "@/apps/master-core/integrated/data/masters";

export const Route = createFileRoute("/master-core/geography")({
  head: () => ({
    meta: [
      { title: "Country & Currency Master — Meridia ERP" },
      {
        name: "description",
        content:
          "Country master with currency, exchange rate, tax rules, import duty, time zone and language settings.",
      },
      { property: "og:title", content: "Country & Currency Master — Meridia ERP" },
      {
        property: "og:description",
        content: "Geography reference data driving tax, duty and multi-currency transactions.",
      },
    ],
  }),
  component: GeographyMaster,
});

const steps: FormStep[] = [
  {
    title: "Basic Information",
    description: "Country identification",
    fields: [
      { name: "code", label: "Country Code", required: true, placeholder: "CN-BR" },
      { name: "name", label: "Country Name", required: true },
      { name: "flag", label: "Flag Emoji" },
      { name: "language", label: "Official Language" },
      { name: "timeZone", label: "Time Zone" },
      { name: "status", label: "Status", type: "switch" },
    ],
  },
  {
    title: "Contact",
    description: "Currency and fiscal configuration",
    fields: [
      { name: "currency", label: "Currency Code", required: true },
      { name: "symbol", label: "Currency Symbol" },
      { name: "exchangeRate", label: "Exchange Rate (vs base)", type: "number" },
      { name: "taxRule", label: "Tax Rule" },
      { name: "importDuty", label: "Import Duty" },
    ],
  },
  {
    title: "Documents",
    description: "Trade agreements and compliance notes",
    fields: [{ name: "agreement", label: "Trade Agreement Reference" }],
  },
];

function GeographyMaster() {
  const m = useMasterPage<Country>("countries", "Country");

  const columns: Column<Country>[] = [
    {
      key: "code",
      header: "Code",
      value: (r) => r.code,
      render: (r) => <span className="num text-xs font-semibold text-primary">{r.code}</span>,
    },
    {
      key: "name",
      header: "Country",
      value: (r) => r.name,
      render: (r) => (
        <span className="flex items-center gap-2 font-medium">
          <span aria-hidden className="text-base">
            {r.flag}
          </span>
          {r.name}
        </span>
      ),
    },
    {
      key: "currency",
      header: "Currency",
      value: (r) => r.currency,
      render: (r) => (
        <Badge variant="secondary">
          {r.currency} {r.symbol}
        </Badge>
      ),
    },
    {
      key: "exchangeRate",
      header: "Exchange rate",
      value: (r) => r.exchangeRate,
      render: (r) => <span className="num">{r.exchangeRate.toFixed(2)}</span>,
    },
    { key: "taxRule", header: "Tax rule", value: (r) => r.taxRule },
    { key: "importDuty", header: "Import duty", value: (r) => r.importDuty },
    { key: "timeZone", header: "Time zone", value: (r) => r.timeZone },
    { key: "language", header: "Language", value: (r) => r.language, hiddenByDefault: true },
    {
      key: "status",
      header: "Status",
      value: (r) => r.status,
      render: (r) => <StatusChip value={r.status} />,
    },
  ];

  const filters: TableFilter<Country>[] = [
    {
      key: "currency",
      label: "Currency",
      options: [...new Set(m.rows.map((c) => c.currency))],
      match: (r, v) => r.currency === v,
    },
    {
      key: "status",
      label: "Status",
      options: ["Active", "Inactive", "Draft"],
      match: (r, v) => r.status === v,
    },
  ];

  return (
    <div className="min-h-full">
      <PageHeader
        crumbs={[{ label: "Master Data Management", to: "/" }, { label: "Country & Currency" }]}
        icon={<Globe2 className="h-5 w-5" />}
        title="Country & Currency Master"
        description="Geography reference data for tax rules, duties, exchange rates and localisation."
      />
      <div className="p-4 sm:p-6">
        <DataTable
          rows={m.rows}
          columns={columns}
          filters={filters}
          entity="Countries"
          isLoading={m.isLoading}
          onRefresh={m.refetch}
          onDelete={m.remove}
          createLabel="Add Country"
          getId={(r) => r.id}
          getLabel={(r) => r.name}
          searchText={(r) => `${r.code} ${r.name} ${r.currency} ${r.language} ${r.timeZone}`}
          onCreate={m.startCreate}
          onEdit={m.startEdit}
        />
      </div>
      <RecordFormSheet
        open={m.open}
        onOpenChange={m.setOpen}
        entity="Country"
        steps={steps}
        mode={m.mode}
        initial={m.initial}
        recordId={m.recordId}
        documentEntity="countries"
        onSubmit={m.submit}
      />
    </div>
  );
}
