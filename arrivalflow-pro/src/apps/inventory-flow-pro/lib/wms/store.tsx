import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { SEED_INVENTORY, WAREHOUSES, type InventoryItem, type LifecycleEvent } from "./data";
import {
  ALL_STATUSES,
  STATUS_META,
  TRANSITIONS,
  canTransition,
  type InventoryStatus,
} from "./statuses";

export type TransitionResult = { ok: boolean; message: string };

type WmsContextValue = {
  items: InventoryItem[];
  warehouse: string;
  setWarehouse: (code: string) => void;
  currentUser: { name: string; role: string };
  setRole: (role: string) => void;
  dark: boolean;
  toggleDark: () => void;
  countByStatus: Record<InventoryStatus, number>;
  transition: (
    id: string,
    next: InventoryStatus,
    opts: { reason: string; remarks?: string; signature?: string },
  ) => TransitionResult;
  validate: (id: string, next: InventoryStatus) => TransitionResult;
  getItem: (id: string) => InventoryItem | undefined;
};

const WmsContext = createContext<WmsContextValue | null>(null);

const ROLE_LIST = [
  { name: "Karan Malhotra", role: "Warehouse Manager" },
  { name: "Anita Deshmukh", role: "Inventory Manager" },
  { name: "Ramesh Iyer", role: "Store Keeper" },
  { name: "Sunil Prakash", role: "Assembly Manager" },
  { name: "Fatima Al Zahra", role: "Quality Inspection" },
  { name: "Lena Brandt", role: "Procurement" },
];

export const AVAILABLE_ROLES = ROLE_LIST;

export function WmsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>(SEED_INVENTORY);
  const [warehouse, setWarehouse] = useState("ALL");
  const [currentUser, setCurrentUser] = useState(ROLE_LIST[0]!);
  const [dark, setDark] = useState(false);

  const toggleDark = useCallback(() => {
    setDark((d) => {
      const next = !d;
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", next);
      }
      return next;
    });
  }, []);

  const setRole = useCallback((role: string) => {
    const found = ROLE_LIST.find((r) => r.role === role);
    if (found) setCurrentUser(found);
  }, []);

  const getItem = useCallback((id: string) => items.find((i) => i.id === id), [items]);

  const validate = useCallback(
    (id: string, next: InventoryStatus): TransitionResult => {
      const item = items.find((i) => i.id === id);
      if (!item) return { ok: false, message: "Inventory record not found." };
      if (item.status === next)
        return { ok: false, message: `Record is already in ${STATUS_META[next].label}.` };
      if (item.status === "RECALL")
        return {
          ok: false,
          message:
            "Rule LC-009 — RECALL stock is hard-blocked. Only Return to Supplier, Scrap or Quarantine are permitted.",
        };
      if (item.status === "QUARANTINE" && next !== "AVAILABLE" && !TRANSITIONS.QUARANTINE.includes(next))
        return { ok: false, message: "Rule LC-008 — Quarantined stock cannot move until QA release." };
      if (next === "RESERVED" && item.status !== "AVAILABLE")
        return {
          ok: false,
          message: `Rule LC-001 — only AVAILABLE stock can be reserved. Current status is ${STATUS_META[item.status].label}.`,
        };
      if (next === "PICKED" && item.status !== "RESERVED")
        return {
          ok: false,
          message: `Rule LC-002 — only RESERVED stock can be picked. Current status is ${STATUS_META[item.status].label}.`,
        };
      if (next === "PACKED" && item.status !== "PICKED")
        return { ok: false, message: "Rule LC-003 — only PICKED stock can be packed." };
      if (next === "LOADED" && item.status !== "PACKED")
        return { ok: false, message: "Rule LC-004 — only PACKED stock can be loaded." };
      if (next === "DISPATCHED" && item.status !== "LOADED")
        return { ok: false, message: "Rule LC-005 — only LOADED stock can be dispatched." };
      if (!canTransition(item.status, next))
        return {
          ok: false,
          message: `Transition ${STATUS_META[item.status].label} → ${STATUS_META[next].label} is not defined in the lifecycle rule matrix.`,
        };
      return {
        ok: true,
        message: STATUS_META[next].approvalRequired
          ? "Transition allowed. Approval and digital signature required."
          : "Transition allowed by lifecycle rules.",
      };
    },
    [items],
  );

  const transition = useCallback<WmsContextValue["transition"]>(
    (id, next, opts) => {
      const check = validate(id, next);
      if (!check.ok) {
        toast.error("Transition blocked", { description: check.message });
        return check;
      }
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const now = new Date().toISOString();
          const event: LifecycleEvent = {
            id: `EVT-${item.id}-${item.events.length}`,
            status: next,
            title: `Status changed to ${STATUS_META[next].label}`,
            user: currentUser.name,
            role: currentUser.role,
            timestamp: now,
            location: `${item.warehouseCode} · ${item.zone} / ${item.rack}-${item.shelf}`,
            remarks: opts.remarks?.trim()
              ? `${opts.reason} — ${opts.remarks.trim()}`
              : `${opts.reason}${opts.signature ? ` · e-signed by ${opts.signature}` : ""}`,
            ...(opts.signature ? { document: `SIG-${opts.signature.replace(/\s+/g, "").toUpperCase()}` } : {}),
          };
          return { ...item, status: next, updatedAt: now, events: [...item.events, event] };
        }),
      );
      toast.success(`${id} → ${STATUS_META[next].label}`, {
        description: `Lifecycle updated by ${currentUser.name}. ${STATUS_META[next].notify.join(", ")} notified.`,
      });
      return { ok: true, message: "Status updated." };
    },
    [currentUser, validate],
  );

  const scoped = useMemo(
    () => (warehouse === "ALL" ? items : items.filter((i) => i.warehouseCode === warehouse)),
    [items, warehouse],
  );

  const countByStatus = useMemo(() => {
    const base = Object.fromEntries(ALL_STATUSES.map((s) => [s, 0])) as Record<
      InventoryStatus,
      number
    >;
    for (const item of scoped) base[item.status] += 1;
    return base;
  }, [scoped]);

  const value = useMemo<WmsContextValue>(
    () => ({
      items: scoped,
      warehouse,
      setWarehouse,
      currentUser,
      setRole,
      dark,
      toggleDark,
      countByStatus,
      transition,
      validate,
      getItem,
    }),
    [
      scoped,
      warehouse,
      currentUser,
      setRole,
      dark,
      toggleDark,
      countByStatus,
      transition,
      validate,
      getItem,
    ],
  );

  return <WmsContext.Provider value={value}>{children}</WmsContext.Provider>;
}

export function useWms() {
  const ctx = useContext(WmsContext);
  if (!ctx) throw new Error("useWms must be used inside WmsProvider");
  return ctx;
}

export { WAREHOUSES };
