import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  CURRENT_USER,
  SEED_ALERTS,
  SEED_AUDIT,
  SEED_ITEMS,
  SEED_TASKS,
  STAFF,
  buildLocations,
  zoneById,
} from "./data";
import { CATEGORY_ZONES, allocate, validateStorageRules } from "./rules";
import { buildProductQrValue } from "./qr";
import type {
  AllocationResult,
  AuditEntry,
  Item,
  ItemCategory,
  PutAwayTask,
  StorageLocation,
  WarehouseAlert,
} from "./types";

let counter = 100;
const nextId = (prefix: string) => `${prefix}-${++counter}`;
const now = () => new Date().toISOString();

export interface ReceivingInput {
  name: string;
  category: ItemCategory;
  hazard: Item["hazard"];
  temp: Item["temp"];
  size: Item["size"];
  weightKg: number;
  valueUsd: number;
  po: string;
  asn: string;
  supplier: string;
  expectedQty: number;
  receivedQty: number;
}

interface WarehouseState {
  items: Item[];
  locations: StorageLocation[];
  tasks: PutAwayTask[];
  alerts: WarehouseAlert[];
  audit: AuditEntry[];
  receive: (input: ReceivingInput) => Item;
  inspect: (itemId: string, result: "Pass" | "Fail", notes: string) => void;
  generateCode: (itemId: string) => string;
  runValidation: (itemId: string) => void;
  runCapacity: (itemId: string) => AllocationResult;
  confirmPutAway: (taskId: string, itemScan: string, locationScan: string) => { ok: boolean; message: string };
  resolveAlert: (id: string) => void;
  reassignTask: (taskId: string, assignee: string) => void;
  log: (action: string, entity: string, before: string, after: string, actor?: string) => void;
  raise: (
    severity: WarehouseAlert["severity"],
    type: string,
    message: string,
    suggestion: string,
    itemId?: string,
  ) => void;
}

const Ctx = createContext<WarehouseState | null>(null);

export function WarehouseProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>(SEED_ITEMS);
  const [locations, setLocations] = useState<StorageLocation[]>(() => buildLocations());
  const [tasks, setTasks] = useState<PutAwayTask[]>(SEED_TASKS);
  const [alerts, setAlerts] = useState<WarehouseAlert[]>(SEED_ALERTS);
  const [audit, setAudit] = useState<AuditEntry[]>(SEED_AUDIT);

  const log = useCallback(
    (action: string, entity: string, before: string, after: string, actor = CURRENT_USER) => {
      setAudit((prev) => [
        { id: nextId("AUD"), actor, action, entity, before, after, createdAt: now() },
        ...prev,
      ]);
    },
    [],
  );

  const raise = useCallback(
    (
      severity: WarehouseAlert["severity"],
      type: string,
      message: string,
      suggestion: string,
      itemId?: string,
    ) => {
      setAlerts((prev) => [
        {
          id: nextId("ALR"),
          severity,
          type,
          message,
          suggestion,
          itemId,
          resolved: false,
          createdAt: now(),
        },
        ...prev,
      ]);
    },
    [],
  );

  const patchItem = useCallback((id: string, patch: Partial<Item>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }, []);

  const receive = useCallback(
    (input: ReceivingInput) => {
      const id = nextId("ITM");
      const variance = input.receivedQty - input.expectedQty;
      const item: Item = {
        id,
        name: input.name,
        category: input.category,
        code: "",
        hazard: input.hazard,
        temp: input.temp,
        size: input.size,
        weightKg: input.weightKg,
        valueUsd: input.valueUsd,
        qty: input.receivedQty,
        po: input.po,
        asn: input.asn,
        supplier: input.supplier,
        stage: "receiving",
        status: "In Pipeline",
        variance,
        createdAt: now(),
      };
      setItems((prev) => [item, ...prev]);
      log("Document Management & OCR", id, `${input.asn} expected ${input.expectedQty}`, `Received ${input.receivedQty}`);
      if (variance !== 0) {
        raise(
          "warning",
          variance < 0 ? "Short Received" : "Over Received",
          `${input.asn} declared ${input.expectedQty} units, ${input.receivedQty} received against ${input.po}.`,
          "Record the variance and route the shipment to the inspection zone before put-away.",
          id,
        );
      }
      patchItem(id, { stage: "inspection" });
      return item;
    },
    [log, patchItem, raise],
  );

  const inspect = useCallback(
    (itemId: string, result: "Pass" | "Fail", notes: string) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;
      patchItem(itemId, {
        inspection: { result, notes },
        stage: result === "Pass" ? "qr" : "completed",
        status: result === "Pass" ? "In Pipeline" : "Quarantine",
        locationId: result === "Fail" ? "RETURN-R1-S1" : item.locationId,
      });
      log("Quality Inspection", itemId, "Awaiting inspection", `${result} — ${notes || "no notes"}`);
      if (result === "Fail") {
        raise(
          "critical",
          "Quality Failed",
          `${itemId} failed inspection: ${notes || "damage reported"}.`,
          "Item moved to Return/Repair Zone (RETURN-R1-S1). Raise a supplier RMA claim.",
          itemId,
        );
      }
    },
    [items, log, patchItem, raise],
  );

  const generateCode = useCallback(
    (itemId: string) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return "";

      const payload = buildProductQrValue(item);
      const existing = items.map((i) => i.code);
      let code = `DC-${itemId.replace("ITM-", "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      if (existing.includes(code)) {
        code = `${code}-R`;
        raise("info", "Duplicate QR", `Duplicate code detected for ${itemId}.`, "A new unique code was generated automatically.", itemId);
      }
      patchItem(itemId, { code: payload, stage: "rules" });
      log("QR / Barcode Generation", itemId, "no code", payload);
      return payload;
    },
    [items, log, patchItem, raise],
  );

  const runValidation = useCallback(
    (itemId: string) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;
      const res = validateStorageRules(item);
      log(
        "Storage Rule Validation",
        itemId,
        `preferred ${zoneById(res.preferredZone).name}`,
        `${res.passed ? "Passed" : "Adjusted"} → ${zoneById(res.recommendedZone).name}`,
      );
      if (!res.passed) {
        raise(
          "warning",
          "Rule Mismatch",
          `${itemId} failed a storage rule check (hazard/temp/value).`,
          `Auto-recommended zone: ${zoneById(res.recommendedZone).name}.`,
          itemId,
        );
      }
      patchItem(itemId, { stage: "capacity" });
    },
    [items, log, patchItem, raise],
  );

  const runCapacity = useCallback(
    (itemId: string) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return { steps: [], overflow: false, failed: true } as AllocationResult;
      const validation = validateStorageRules(item);
      const order = [
        validation.recommendedZone,
        ...(CATEGORY_ZONES[item.category] ?? []).filter((z) => z !== validation.recommendedZone),
      ];
      const result = allocate(item, locations, order);

      if (result.failed) {
        raise(
          "critical",
          "All Zones Full",
          `No capacity anywhere for ${itemId} (${item.qty} units).`,
          "Create New Rack · Create New Zone · Transfer Inventory · Expand Warehouse.",
          itemId,
        );
        log("Capacity Check", itemId, "searching", "Escalated to Warehouse Manager");
        return result;
      }

      const task: PutAwayTask = {
        id: nextId("TSK"),
        itemId,
        locationCode: result.locationCode!,
        assignee: STAFF[Math.floor(Math.random() * STAFF.length)] as string,
        priority: item.valueUsd > 10000 ? "High" : "Normal",
        status: "Pending",
        createdAt: now(),
      };
      setTasks((prev) => [task, ...prev]);
      patchItem(itemId, { stage: "task", status: result.overflow ? "Overflow" : "In Pipeline" });
      log("Put-Away Task Creation", itemId, "unassigned", `${task.id} → ${task.locationCode} (${task.assignee})`);
      if (result.overflow) {
        raise(
          "warning",
          "Overflow Storage",
          `${itemId} was routed to the overflow area at ${result.locationCode}.`,
          "Schedule a transfer back to the primary zone once capacity frees up.",
          itemId,
        );
      }
      return result;
    },
    [items, locations, log, patchItem, raise],
  );

  const confirmPutAway = useCallback(
    (taskId: string, itemScan: string, locationScan: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return { ok: false, message: "Task not found." };
      const item = items.find((i) => i.id === task.itemId);
      if (!item) return { ok: false, message: "Item not found." };
      const loc = locations.find((l) => l.code === task.locationCode);

      if (itemScan.trim().toUpperCase() !== item.code.toUpperCase()) {
        raise("warning", "Wrong QR Scan", `Scanned code ${itemScan} does not match ${item.code}.`, "Re-scan the item label or reprint the QR code.", item.id);
        return { ok: false, message: `Item QR mismatch — expected ${item.code}.` };
      }
      if (locationScan.trim().toUpperCase() !== task.locationCode.toUpperCase()) {
        raise("warning", "Wrong Location Scan", `Scanned location ${locationScan} does not match task ${task.id}.`, `Move to ${task.locationCode} and re-scan the location label.`, item.id);
        return { ok: false, message: `Location mismatch — expected ${task.locationCode}.` };
      }
      if (loc && loc.used + item.qty > loc.capacity) {
        raise("critical", "Capacity Exceeded", `${loc.code} cannot hold ${item.qty} more units.`, "Re-run the capacity check to obtain a new location.", item.id);
        return { ok: false, message: "Capacity exceeded at scanned location." };
      }

      setLocations((prev) =>
        prev.map((l) =>
          l.code === task.locationCode
            ? {
                ...l,
                used: l.used + item.qty,
                status: l.used + item.qty >= l.capacity ? "Full" : l.status,
              }
            : l,
        ),
      );
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "Done" } : t)));
      patchItem(item.id, {
        stage: "completed",
        status: item.status === "Overflow" ? "Overflow" : "Stored",
        locationId: task.locationCode,
      });
      log("Scan & Confirm Put-Away", item.id, `Task ${task.id} pending`, `Confirmed @ ${task.locationCode}`, task.assignee);
      log("Store & Update Inventory", item.id, "not in inventory", `+${item.qty} units @ ${task.locationCode}`);
      log("Storage Completed", item.id, "In Pipeline", `Stored @ ${task.locationCode}`);
      return { ok: true, message: `${item.id} stored at ${task.locationCode}.` };
    },
    [items, locations, log, patchItem, raise, tasks],
  );

  const resolveAlert = useCallback(
    (id: string) => {
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
      log("Alert Resolved", id, "open", "resolved");
    },
    [log],
  );

  const reassignTask = useCallback(
    (taskId: string, assignee: string) => {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, assignee, status: "In Progress" } : t)));
      log("Task Reassigned", taskId, "previous assignee", assignee);
    },
    [log],
  );

  const value = useMemo(
    () => ({
      items,
      locations,
      tasks,
      alerts,
      audit,
      receive,
      inspect,
      generateCode,
      runValidation,
      runCapacity,
      confirmPutAway,
      resolveAlert,
      reassignTask,
      log,
      raise,
    }),
    [items, locations, tasks, alerts, audit, receive, inspect, generateCode, runValidation, runCapacity, confirmPutAway, resolveAlert, reassignTask, log, raise],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWarehouse() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWarehouse must be used inside WarehouseProvider");
  return ctx;
}
