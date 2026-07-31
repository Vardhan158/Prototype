import { createFileRoute } from "@tanstack/react-router";
import { IdCard } from "lucide-react";
import { useState } from "react";

import { DataTable, type Column, type TableFilter } from "@master/components/masters/DataTable";
import { PageHeader } from "@master/components/masters/PageHeader";
import { RecordFormSheet, type FormStep } from "@master/components/masters/RecordFormSheet";
import { StatusChip } from "@master/components/masters/StatusChip";
import { Avatar, AvatarFallback } from "@master/components/ui/avatar";
import { Badge } from "@master/components/ui/badge";
import { employees, type Employee } from "@master/data/masters";

export const Route = createFileRoute("/master-core/employees")({
  head: () => ({
    meta: [
      { title: "Employee Master — Meridia ERP MDM" },
      {
        name: "description",
        content:
          "Employee master with department, designation, shift, warehouse assignment and role-based access.",
      },
      { property: "og:title", content: "Employee Master — Meridia ERP" },
      {
        property: "og:description",
        content: "Workforce master data with shift planning and permission roles.",
      },
    ],
  }),
  component: EmployeeMaster,
});

const steps: FormStep[] = [
  {
    title: "Basic Information",
    description: "Personal and organisational details",
    fields: [
      { name: "code", label: "Employee ID", required: true, placeholder: "EMP-4011" },
      { name: "name", label: "Full Name", required: true },
      {
        name: "department",
        label: "Department",
        type: "select",
        required: true,
        options: ["Warehouse Operations", "Logistics", "Inventory", "Procurement", "Quality", "Finance", "Master Data", "Manufacturing"],
      },
      { name: "designation", label: "Designation" },
      { name: "joiningDate", label: "Joining Date", type: "date" },
      { name: "manager", label: "Reporting Manager" },
      { name: "status", label: "Status", type: "switch" },
    ],
  },
  {
    title: "Contact",
    description: "Work contact and assignment",
    fields: [
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone", type: "tel", required: true },
      {
        name: "shift",
        label: "Shift",
        type: "select",
        options: ["Shift A (06:00-14:00)", "Shift B (14:00-22:00)", "Shift C (22:00-06:00)"],
      },
      { name: "warehouse", label: "Warehouse Assignment" },
      {
        name: "role",
        label: "Role Based Access",
        type: "select",
        options: ["Administrator", "Manager", "Editor", "Viewer"],
      },
    ],
  },
  {
    title: "Documents",
    description: "Identity documents and photo",
    fields: [{ name: "idProof", label: "ID Proof Reference" }],
  },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

function EmployeeMaster() {
  const [open, setOpen] = useState(false);

  const columns: Column<Employee>[] = [
    {
      key: "code",
      header: "Employee ID",
      value: (r) => r.code,
      render: (r) => <span className="num text-xs font-semibold text-primary">{r.code}</span>,
    },
    {
      key: "name",
      header: "Employee",
      value: (r) => r.name,
      render: (r) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary-soft text-[11px] font-semibold text-accent-foreground">
              {initials(r.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{r.name}</p>
            <p className="truncate text-xs text-muted-foreground">{r.designation}</p>
          </div>
        </div>
      ),
    },
    { key: "department", header: "Department", value: (r) => r.department },
    { key: "email", header: "Email", value: (r) => r.email, hiddenByDefault: true },
    { key: "phone", header: "Phone", value: (r) => r.phone, hiddenByDefault: true },
    { key: "manager", header: "Manager", value: (r) => r.manager },
    { key: "shift", header: "Shift", value: (r) => r.shift },
    { key: "warehouse", header: "Assignment", value: (r) => r.warehouse },
    {
      key: "role",
      header: "Access role",
      value: (r) => r.role,
      render: (r) => <Badge variant="secondary">{r.role}</Badge>,
    },
    {
      key: "joining",
      header: "Joined",
      value: (r) => r.joiningDate,
      render: (r) => <span className="num text-xs">{r.joiningDate}</span>,
    },
    {
      key: "status",
      header: "Status",
      value: (r) => r.status,
      render: (r) => <StatusChip value={r.status} />,
    },
  ];

  const filters: TableFilter<Employee>[] = [
    {
      key: "department",
      label: "Department",
      options: [...new Set(employees.map((e) => e.department))],
      match: (r, v) => r.department === v,
    },
    {
      key: "shift",
      label: "Shift",
      options: [...new Set(employees.map((e) => e.shift))],
      match: (r, v) => r.shift === v,
    },
    {
      key: "role",
      label: "Role",
      options: ["Administrator", "Manager", "Editor", "Viewer"],
      match: (r, v) => r.role === v,
    },
  ];

  return (
    <div className="min-h-full">
      <PageHeader
        crumbs={[{ label: "Master Data Management", to: "/master-core/" }, { label: "Employee Master" }]}
        icon={<IdCard className="h-5 w-5" />}
        title="Employee Master"
        description="Workforce records with shift, site assignment and role-based access control."
      />
      <div className="p-4 sm:p-6">
        <DataTable
          rows={employees}
          columns={columns}
          filters={filters}
          entity="Employees"
          createLabel="Add Employee"
          getId={(r) => r.id}
          getLabel={(r) => r.name}
          searchText={(r) => `${r.code} ${r.name} ${r.department} ${r.designation} ${r.email}`}
          onCreate={() => setOpen(true)}
          onEdit={() => setOpen(true)}
        />
      </div>
      <RecordFormSheet open={open} onOpenChange={setOpen} entity="Employee" steps={steps} />
    </div>
  );
}
