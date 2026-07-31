import { createFileRoute } from "@tanstack/react-router";
import { Globe2 } from "lucide-react";
import { useState } from "react";

import { DataTable, type Column, type TableFilter } from "@master/components/masters/DataTable";
import { PageHeader } from "@master/components/masters/PageHeader";
import { RecordFormSheet, type FormStep } from "@master/components/masters/RecordFormSheet";
import { StatusChip } from "@master/components/masters/StatusChip";
import { Badge } from "@master/components/ui/badge";
import { countries, type Country } from "@master/data/masters";

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
  const [open, setOpen] = useState(false);

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
      options: [...new Set(countries.map((c) => c.currency))],
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
        crumbs={[{ label: "Master Data Management", to: "/master-core/" }, { label: "Country & Currency" }]}
        icon={<Globe2 className="h-5 w-5" />}
        title="Country & Currency Master"
        description="Geography reference data for tax rules, duties, exchange rates and localisation."
      />
      <div className="p-4 sm:p-6">
        <DataTable
          rows={countries}
          columns={columns}
          filters={filters}
          entity="Countries"
          createLabel="Add Country"
          getId={(r) => r.id}
          getLabel={(r) => r.name}
          searchText={(r) => `${r.code} ${r.name} ${r.currency} ${r.language} ${r.timeZone}`}
          onCreate={() => setOpen(true)}
          onEdit={() => setOpen(true)}
        />
      </div>
      <RecordFormSheet open={open} onOpenChange={setOpen} entity="Country" steps={steps} />
    </div>
  );
}
