import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import {
  GRNS,
  INSPECTIONS,
  INVENTORY,
  NOTIFICATIONS,
  SHIPMENTS,
  type MaterialLine,
  type ReceivingStatus,
  type Shipment,
} from "./wms-data";

type Grn = (typeof GRNS)[number];
type InventoryRow = (typeof INVENTORY)[number];
type Inspection = (typeof INSPECTIONS)[number];
type Notification = (typeof NOTIFICATIONS)[number];

interface State {
  shipments: Shipment[];
  grns: Grn[];
  inventory: InventoryRow[];
  inspections: Inspection[];
  notifications: Notification[];
  warehouse: string;
  role: string;
  settings: {
    qtyTolerance: number;
    varianceLimit: number;
    grnPrefix: string;
    autoDock: boolean;
    mandatoryPhotos: boolean;
    duplicateSerialBlock: boolean;
    expiryShelfLife: number;
  };
}

type Action =
  | { type: "assign-dock"; id: string; dock: string }
  | { type: "status"; id: string; status: ReceivingStatus; note?: string; actor?: string }
  | { type: "line"; id: string; lineId: string; patch: Partial<MaterialLine> }
  | { type: "grn"; id: string }
  | { type: "quality"; id: string; inspector: string; priority: string; due: string }
  | { type: "inventory"; id: string; zone: string; location: string }
  | { type: "read-all" }
  | { type: "warehouse"; value: string }
  | { type: "role"; value: string }
  | { type: "settings"; patch: Partial<State["settings"]> };

const initial: State = {
  shipments: SHIPMENTS,
  grns: GRNS,
  inventory: INVENTORY,
  inspections: INSPECTIONS,
  notifications: NOTIFICATIONS,
  warehouse: "WH-NCR-01",
  role: "Warehouse Manager",
  settings: {
    qtyTolerance: 2,
    varianceLimit: 5,
    grnPrefix: "GRN-2026-",
    autoDock: true,
    mandatoryPhotos: true,
    duplicateSerialBlock: true,
    expiryShelfLife: 70,
  },
};

const clock = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

function patchShipment(state: State, id: string, fn: (s: Shipment) => Shipment): Shipment[] {
  return state.shipments.map((s) => (s.id === id ? fn(s) : s));
}

function notify(state: State, n: Omit<Notification, "id" | "read" | "at">): Notification[] {
  return [
    { ...n, id: `N-${Math.random().toString(36).slice(2, 8)}`, at: "Just now", read: false },
    ...state.notifications,
  ];
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "assign-dock":
      return {
        ...state,
        shipments: patchShipment(state, action.id, (s) => ({
          ...s,
          dock: action.dock,
          status: "Dock Assigned",
          timeline: [
            ...s.timeline,
            { at: clock(), label: `Dock ${action.dock} assigned`, actor: `${state.role}` },
          ],
        })),
      };
    case "status":
      return {
        ...state,
        shipments: patchShipment(state, action.id, (s) => ({
          ...s,
          status: action.status,
          timeline: [
            ...s.timeline,
            {
              at: clock(),
              label: action.note ?? `Status changed to ${action.status}`,
              actor: action.actor ?? state.role,
            },
          ],
        })),
        notifications:
          action.status === "Receiving Started"
            ? notify(state, {
                type: "Receiving Started",
                title: `Receiving started for ${action.id}`,
                body: "Operator has begun unloading and verification.",
                severity: "info",
              })
            : action.status === "Discrepancy"
              ? notify(state, {
                  type: "Discrepancy Found",
                  title: `Discrepancy raised on ${action.id}`,
                  body: action.note ?? "Quantity mismatch pending manager approval.",
                  severity: "destructive",
                })
              : action.status === "Partial Receipt"
                ? notify(state, {
                    type: "Partial Receipt",
                    title: `Partial receipt on ${action.id}`,
                    body: action.note ?? "Balance quantity scheduled for a follow-up delivery.",
                    severity: "warning",
                  })
                : state.notifications,
      };
    case "line":
      return {
        ...state,
        shipments: patchShipment(state, action.id, (s) => ({
          ...s,
          lines: s.lines.map((l) => (l.id === action.lineId ? { ...l, ...action.patch } : l)),
        })),
      };
    case "grn": {
      const shipment = state.shipments.find((s) => s.id === action.id);
      if (!shipment) return state;
      const grnNo = `${state.settings.grnPrefix}${String(2188 + state.grns.length).padStart(6, "0")}`;
      const qty = shipment.lines.reduce((a, l) => a + l.accepted, 0);
      const value = shipment.lines.reduce((a, l) => a + l.accepted * l.unitPrice, 0);
      return {
        ...state,
        shipments: patchShipment(state, action.id, (s) => ({
          ...s,
          grn: grnNo,
          status: "GRN Generated",
          timeline: [
            ...s.timeline,
            { at: clock(), label: `${grnNo} generated`, actor: state.role },
          ],
        })),
        grns: [
          {
            grn: grnNo,
            shipment: shipment.id,
            vendor: shipment.vendor,
            po: shipment.po,
            warehouse: shipment.warehouse,
            date: "2026-08-01",
            lines: shipment.lines.length,
            qty,
            value,
            status: "Pending Inspection",
          },
          ...state.grns,
        ],
        notifications: notify(state, {
          type: "GRN Generated",
          title: `${grnNo} created`,
          body: `${shipment.vendor} Â· ${qty.toLocaleString("en-IN")} units posted against ${shipment.po}.`,
          severity: "success",
        }),
      };
    }
    case "quality": {
      const shipment = state.shipments.find((s) => s.id === action.id);
      if (!shipment) return state;
      const qi = `QI-${4472 + state.inspections.length}`;
      return {
        ...state,
        shipments: patchShipment(state, action.id, (s) => ({
          ...s,
          status: "Transferred To Quality",
          timeline: [
            ...s.timeline,
            { at: clock(), label: `Transferred to Quality Inspection (${qi})`, actor: state.role },
          ],
        })),
        inspections: [
          {
            id: qi,
            grn: shipment.grn ?? "â€”",
            material: shipment.lines[0]?.code ?? "â€”",
            inspector: action.inspector,
            priority: action.priority,
            due: action.due,
            status: "Assigned",
            sample: "AQL 2.5 Â· sampling plan applied",
          },
          ...state.inspections,
        ],
        notifications: notify(state, {
          type: "Quality Inspection Assigned",
          title: `${qi} assigned to ${action.inspector}`,
          body: `${shipment.grn ?? shipment.id} moved to QA staging. Due ${action.due}.`,
          severity: "info",
        }),
      };
    }
    case "inventory": {
      const shipment = state.shipments.find((s) => s.id === action.id);
      if (!shipment) return state;
      const rows: InventoryRow[] = shipment.lines.map((l, i) => ({
        id: `INV-${88240 + state.inventory.length + i}`,
        material: l.code,
        name: l.name,
        grn: shipment.grn ?? "â€”",
        qty: l.accepted,
        uom: l.uom,
        zone: action.zone,
        location: action.location,
        status: "Pending Put Away",
      }));
      return {
        ...state,
        shipments: patchShipment(state, action.id, (s) => ({
          ...s,
          status: "Completed",
          timeline: [
            ...s.timeline,
            {
              at: clock(),
              label: `Inventory created Â· ${action.zone}`,
              actor: "System Â· Inventory Engine",
            },
          ],
        })),
        inventory: [...rows, ...state.inventory],
        notifications: notify(state, {
          type: "Inventory Created",
          title: `Inventory created for ${shipment.grn ?? shipment.id}`,
          body: `${rows.length} line(s) staged at ${action.location}, pending put away.`,
          severity: "success",
        }),
      };
    }
    case "read-all":
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };
    case "warehouse":
      return { ...state, warehouse: action.value };
    case "role":
      return { ...state, role: action.value };
    case "settings":
      return { ...state, settings: { ...state.settings, ...action.patch } };
    default:
      return state;
  }
}

const Ctx = createContext<{ state: State; dispatch: (a: Action) => void } | null>(null);

export function WmsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWms() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWms must be used inside WmsProvider");
  return ctx;
}

export function useShipment(id: string) {
  const { state } = useWms();
  return state.shipments.find((s) => s.id === id);
}
