import { createFileRoute } from "@tanstack/react-router";
import { Truck } from "lucide-react";
import { useState } from "react";

import { DataTable, type Column, type TableFilter } from "@master/components/masters/DataTable";
import { PageHeader } from "@master/components/masters/PageHeader";
import { RecordFormSheet, type FormStep } from "@master/components/masters/RecordFormSheet";
import { StatusChip } from "@master/components/masters/StatusChip";
import { Badge } from "@master/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@master/components/ui/tabs";
import { vehicles, carriers, type Vehicle, type Carrier } from "@master/data/masters";

export const Route = createFileRoute("/master-core/vehicles")({
  head: () => ({
    meta: [
      { title: "Vehicle & Carrier Master — Meridia ERP" },
      {
        name: "description",
        content:
          "Fleet and transport partner master with capacity, insurance, fitness validity and driver assignment.",
      },
      { property: "og:title", content: "Vehicle & Carrier Master — Meridia ERP" },
      {
        property: "og:description",
        content: "Own fleet and contracted carriers with compliance and service capability data.",
      },
    ],
  }),
  component: VehicleMaster,
});

const vehicleSteps: FormStep[] = [
  {
    title: "Basic Information",
    description: "Registration and vehicle classification",
    fields: [
      { name: "code", label: "Vehicle Code", required: true, placeholder: "VEH-5007" },
      { name: "vehicleNumber", label: "Vehicle Number", required: true },
      {
        name: "type",
        label: "Vehicle Type",
        type: "select",
        required: true,
        options: [
          "40ft Container Truck",
          "Refrigerated Van",
          "Flatbed Trailer",
          "Box Truck",
          "Hazmat Tanker",
          "Curtain Side Trailer",
        ],
      },
      { name: "capacity", label: "Capacity" },
      { name: "status", label: "Status", type: "switch" },
    ],
  },
  {
    title: "Contact",
    description: "Load capability, driver and carrier",
    fields: [
      { name: "weight", label: "Max Weight" },
      { name: "volume", label: "Load Volume" },
      { name: "driver", label: "Assigned Driver" },
      { name: "carrier", label: "Carrier" },
      { name: "gps", label: "GPS Tracking", type: "select", options: ["Enabled", "Disabled"] },
    ],
  },
  {
    title: "Documents",
    description: "Insurance and fitness certificates",
    fields: [
      { name: "insuranceExpiry", label: "Insurance Expiry", type: "date" },
      { name: "fitnessExpiry", label: "Fitness Expiry", type: "date" },
    ],
  },
];

const carrierSteps: FormStep[] = [
  {
    title: "Basic Information",
    description: "Carrier identification",
    fields: [
      { name: "code", label: "Carrier Code", required: true },
      { name: "name", label: "Carrier Name", required: true },
      { name: "licenseNumber", label: "License Number" },
      { name: "status", label: "Status", type: "switch" },
    ],
  },
  {
    title: "Contact",
    description: "Coordination contact and capabilities",
    fields: [
      { name: "contactPerson", label: "Contact Person" },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "email", label: "Email", type: "email" },
      { name: "refrigerated", label: "Refrigerated Capability", type: "switch" },
      { name: "hazardTransport", label: "Hazmat Certified", type: "switch" },
    ],
  },
  {
    title: "Documents",
    description: "Contracts and liability cover",
    fields: [{ name: "contract", label: "Contract Reference" }],
  },
];

function VehicleMaster() {
  const [vOpen, setVOpen] = useState(false);
  const [cOpen, setCOpen] = useState(false);

  const vehicleColumns: Column<Vehicle>[] = [
    {
      key: "code",
      header: "Code",
      value: (r) => r.code,
      render: (r) => <span className="num text-xs font-semibold text-primary">{r.code}</span>,
    },
    {
      key: "vehicleNumber",
      header: "Vehicle number",
      value: (r) => r.vehicleNumber,
      render: (r) => <span className="num font-medium">{r.vehicleNumber}</span>,
    },
    {
      key: "type",
      header: "Type",
      value: (r) => r.type,
      render: (r) => <Badge variant="secondary">{r.type}</Badge>,
    },
    { key: "capacity", header: "Capacity", value: (r) => r.capacity },
    { key: "weight", header: "Max weight", value: (r) => r.weight, hiddenByDefault: true },
    { key: "volume", header: "Volume", value: (r) => r.volume, hiddenByDefault: true },
    { key: "driver", header: "Driver", value: (r) => r.driver },
    { key: "carrier", header: "Carrier", value: (r) => r.carrier },
    {
      key: "insuranceExpiry",
      header: "Insurance expiry",
      value: (r) => r.insuranceExpiry,
      render: (r) => <span className="num text-xs">{r.insuranceExpiry}</span>,
    },
    {
      key: "fitnessExpiry",
      header: "Fitness expiry",
      value: (r) => r.fitnessExpiry,
      render: (r) => <span className="num text-xs">{r.fitnessExpiry}</span>,
      hiddenByDefault: true,
    },
    {
      key: "gps",
      header: "GPS",
      value: (r) => r.gps,
      render: (r) => (
        <Badge variant={r.gps === "Enabled" ? "secondary" : "outline"}>{r.gps}</Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      value: (r) => r.status,
      render: (r) => <StatusChip value={r.status} />,
    },
  ];

  const vehicleFilters: TableFilter<Vehicle>[] = [
    {
      key: "type",
      label: "Type",
      options: [...new Set(vehicles.map((v) => v.type))],
      match: (r, v) => r.type === v,
    },
    {
      key: "carrier",
      label: "Carrier",
      options: [...new Set(vehicles.map((v) => v.carrier))],
      match: (r, v) => r.carrier === v,
    },
    {
      key: "gps",
      label: "GPS",
      options: ["Enabled", "Disabled"],
      match: (r, v) => r.gps === v,
    },
  ];

  const carrierColumns: Column<Carrier>[] = [
    {
      key: "code",
      header: "Code",
      value: (r) => r.code,
      render: (r) => <span className="num text-xs font-semibold text-primary">{r.code}</span>,
    },
    {
      key: "name",
      header: "Carrier",
      value: (r) => r.name,
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    { key: "contactPerson", header: "Contact person", value: (r) => r.contactPerson },
    { key: "phone", header: "Phone", value: (r) => r.phone },
    { key: "email", header: "Email", value: (r) => r.email, hiddenByDefault: true },
    {
      key: "licenseNumber",
      header: "License",
      value: (r) => r.licenseNumber,
      render: (r) => <span className="num text-xs">{r.licenseNumber}</span>,
    },
    {
      key: "capability",
      header: "Capabilities",
      value: (r) => `${r.refrigerated}-${r.hazardTransport}`,
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.refrigerated && <Badge variant="secondary">Reefer</Badge>}
          {r.hazardTransport && <Badge variant="secondary">Hazmat</Badge>}
          {!r.refrigerated && !r.hazardTransport && (
            <span className="text-xs text-muted-foreground">Standard</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      value: (r) => r.status,
      render: (r) => <StatusChip value={r.status} />,
    },
  ];

  const carrierFilters: TableFilter<Carrier>[] = [
    {
      key: "capability",
      label: "Capability",
      options: ["Refrigerated", "Hazmat", "Standard"],
      match: (r, v) =>
        v === "Refrigerated"
          ? r.refrigerated
          : v === "Hazmat"
            ? r.hazardTransport
            : !r.refrigerated && !r.hazardTransport,
    },
  ];

  return (
    <div className="min-h-full">
      <PageHeader
        crumbs={[{ label: "Master Data Management", to: "/master-core/" }, { label: "Vehicle & Carrier" }]}
        icon={<Truck className="h-5 w-5" />}
        title="Vehicle & Carrier Master"
        description="Own fleet, contracted carriers, compliance windows and transport capabilities."
      />
      <div className="p-4 sm:p-6">
        <Tabs defaultValue="vehicles">
          <TabsList>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="carriers">Carriers</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles" className="mt-4">
            <DataTable
              rows={vehicles}
              columns={vehicleColumns}
              filters={vehicleFilters}
              entity="Vehicles"
              createLabel="Add Vehicle"
              getId={(r) => r.id}
              getLabel={(r) => r.vehicleNumber}
              searchText={(r) =>
                `${r.code} ${r.vehicleNumber} ${r.type} ${r.driver} ${r.carrier}`
              }
              onCreate={() => setVOpen(true)}
              onEdit={() => setVOpen(true)}
            />
          </TabsContent>

          <TabsContent value="carriers" className="mt-4">
            <DataTable
              rows={carriers}
              columns={carrierColumns}
              filters={carrierFilters}
              entity="Carriers"
              createLabel="Add Carrier"
              getId={(r) => r.id}
              getLabel={(r) => r.name}
              searchText={(r) => `${r.code} ${r.name} ${r.contactPerson} ${r.email}`}
              onCreate={() => setCOpen(true)}
              onEdit={() => setCOpen(true)}
            />
          </TabsContent>
        </Tabs>
      </div>
      <RecordFormSheet open={vOpen} onOpenChange={setVOpen} entity="Vehicle" steps={vehicleSteps} />
      <RecordFormSheet open={cOpen} onOpenChange={setCOpen} entity="Carrier" steps={carrierSteps} />
    </div>
  );
}
