import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  FilePlus2,
  FileSignature,
  Building2,
  Truck,
  CheckCircle2,
} from "lucide-react";

const actions = [
  {
    title: "Create Purchase Order",
    description: "Raise a new PO for a supplier",
    icon: FilePlus2,
    to: "/ams-insights/procurement/purchase-orders",
  },
  {
    title: "Create Blanket PO",
    description: "Set up a long-term contract",
    icon: FileSignature,
    to: "/ams-insights/procurement/contracts",
  },
  {
    title: "Record ASN",
    description: "Log an incoming shipment",
    icon: Truck,
    to: "/ams-insights/procurement/asn",
  },
  {
    title: "Supplier Master",
    description: "Manage supplier records",
    icon: Building2,
    to: "/ams-insights/procurement/suppliers",
  },
  {
    title: "PO Approval Dashboard",
    description: "Review pending approvals",
    icon: CheckCircle2,
    to: "/ams-insights/procurement/approvals",
  },
];

export function QuickActionsCard() {
  return (
    <section className="rounded-xl border border-border bg-card shadow-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-base font-semibold tracking-tight">Quick Actions</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">Frequently used procurement tasks</p>
      </div>
      <div className="space-y-2 p-4">
        {actions.map((a) => (
          <Link
            key={a.title}
            to={a.to}
            className="group flex items-center gap-3 rounded-lg border border-border px-4 py-3 transition-all duration-200 hover:border-primary/30 hover:bg-accent"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105">
              <a.icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{a.title}</span>
              <span className="block truncate text-xs text-muted-foreground">{a.description}</span>
            </span>
            <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </section>
  );
}
