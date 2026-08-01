import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useWms } from "@/apps/inventory-flow-pro/lib/wms/store";
import { STATUS_META } from "@/apps/inventory-flow-pro/lib/wms/statuses";

const SCREENS = [
  { label: "Inventory Lifecycle Dashboard", to: "/inventory-flow-pro" },
  { label: "Inventory Status Board (Kanban)", to: "/inventory-flow-pro/status-board" },
  { label: "Inventory List", to: "/inventory-flow-pro/inventory" },
  { label: "Inventory Timeline", to: "/inventory-flow-pro/timeline" },
  { label: "Status Transition", to: "/inventory-flow-pro/transition" },
  { label: "Reservation Management", to: "/inventory-flow-pro/reservations" },
  { label: "Picking Status", to: "/inventory-flow-pro/picking" },
  { label: "Packing Status", to: "/inventory-flow-pro/packing" },
  { label: "Dispatch Status", to: "/inventory-flow-pro/dispatch" },
  { label: "Quality Hold", to: "/inventory-flow-pro/quality-hold" },
  { label: "Damaged Inventory", to: "/inventory-flow-pro/damaged" },
  { label: "Quarantine Inventory", to: "/inventory-flow-pro/quarantine" },
  { label: "Recall Inventory", to: "/inventory-flow-pro/recall" },
  { label: "Movement History", to: "/inventory-flow-pro/movement-history" },
  { label: "Status Analytics", to: "/inventory-flow-pro/analytics" },
  { label: "Inventory Alerts", to: "/inventory-flow-pro/alerts" },
  { label: "Lifecycle Rules", to: "/inventory-flow-pro/lifecycle-rules" },
  { label: "Status Configuration", to: "/inventory-flow-pro/status-config" },
  { label: "Inventory Reports", to: "/inventory-flow-pro/reports" },
];

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { items } = useWms();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const go = (to: string) => {
    onOpenChange(false);
    void navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search inventory, serial, batch, GRN or a screen…" />
      <CommandList>
        <CommandEmpty>No matching inventory or screen.</CommandEmpty>
        <CommandGroup heading="Inventory records">
          {items.slice(0, 40).map((item) => (
            <CommandItem
              key={item.id}
              value={`${item.id} ${item.materialCode} ${item.materialName} ${item.serial} ${item.batch} ${item.grn}`}
              onSelect={() => go(`/inventory/${item.id}`)}
            >
              <span className="flex w-full items-center justify-between gap-3">
                <span className="truncate">
                  <span className="font-medium">{item.materialCode}</span>
                  <span className="text-muted-foreground"> · {item.materialName}</span>
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {item.serial} · {STATUS_META[item.status].label}
                </span>
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Screens">
          {SCREENS.map((s) => (
            <CommandItem key={s.to} value={s.label} onSelect={() => go(s.to)}>
              {s.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
