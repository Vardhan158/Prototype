import {
  activities,
  backorders,
  carriers,
  customers,
  dailyFulfillmentChart,
  docks,
  inventory,
  notifications,
  ordersByPriorityChart,
  packingRecords,
  pickLines,
  products,
  routes,
  salesOrders,
  shipmentTrendChart,
  shipments,
  vehicles,
  warehouses,
  waves,
  waveStatusChart,
  zones,
} from "../data/mock-data";
import type { ListParams, SalesOrder, SalesOrderInput } from "./wms-types";

const ORDERS_KEY = "wave-flow.sales-orders";
export function hasWmsBackend() {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  );
}
export function localOrders(): SalesOrder[] {
  if (typeof window === "undefined") return salesOrders;
  try {
    const saved = window.localStorage.getItem(ORDERS_KEY);
    return saved ? (JSON.parse(saved) as SalesOrder[]) : salesOrders;
  } catch {
    return salesOrders;
  }
}
function saveOrders(rows: SalesOrder[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(ORDERS_KEY, JSON.stringify(rows));
}
export async function createLocalOrder(input: SalesOrderInput) {
  const rows = localOrders();
  const next = Math.max(0, ...rows.map((row) => Number(row.id.match(/(\d+)$/)?.[1] ?? 0))) + 1;
  const order: SalesOrder = {
    ...input,
    id: input.id || `SO-2026-${next}`,
    items: input.lines.length,
    quantity: input.lines.reduce((sum, line) => sum + line.quantity, 0),
  };
  saveOrders([order, ...rows.filter((row) => row.id !== order.id)]);
  return order;
}
export async function updateLocalOrder(id: string, input: SalesOrderInput) {
  const current = localOrders().find((row) => row.id === id);
  if (!current) throw new Error(`Order ${id} was not found.`);
  const order: SalesOrder = {
    ...current,
    ...input,
    id,
    items: input.lines.length,
    quantity: input.lines.reduce((sum, line) => sum + line.quantity, 0),
  };
  saveOrders(localOrders().map((row) => (row.id === id ? order : row)));
  return order;
}
export async function deleteLocalOrder(id: string) {
  saveOrders(localOrders().filter((row) => row.id !== id));
  return { id };
}
export async function transitionLocalOrder(
  id: string,
  status: SalesOrder["status"],
  validation?: SalesOrder["validation"],
) {
  const row = localOrders().find((order) => order.id === id);
  if (!row) throw new Error(`Order ${id} was not found.`);
  const updated = { ...row, status, ...(validation ? { validation } : {}) };
  saveOrders(localOrders().map((order) => (order.id === id ? updated : order)));
  return updated;
}
export function localList<T>(rows: T[], p: ListParams) {
  const page = p.page ?? 1,
    pageSize = p.pageSize ?? 25,
    start = (page - 1) * pageSize;
  return { rows: rows.slice(start, start + pageSize), total: rows.length, page, pageSize };
}
export const localReference = {
  customers,
  products,
  warehouses,
  zones,
  carriers,
  routes,
  docks,
  vehicles,
};
export const localData = {
  inventory,
  waves,
  pickLines,
  packingRecords,
  shipments,
  backorders,
  activities,
  notifications,
};
export function localDashboard() {
  const orderRows = localOrders();
  const count = <T>(rows: T[], match: (row: T) => boolean) => rows.filter(match).length;
  const status = new Map<string, number>(),
    carrier = new Map<string, number>();
  orderRows.forEach((row) => status.set(row.status, (status.get(row.status) ?? 0) + 1));
  shipments.forEach((row) => carrier.set(row.carrier, (carrier.get(row.carrier) ?? 0) + 1));
  const picked = pickLines.reduce((sum, row) => sum + row.pickedQty, 0),
    total = pickLines.reduce((sum, row) => sum + row.quantity, 0);
  return {
    totalOrders: orderRows.length,
    ordersToday: 0,
    openWaves: count(waves, (row) => row.status === "Planned" || row.status === "Draft"),
    releasedWaves: count(waves, (row) => row.status === "Released" || row.status === "Picking"),
    pickLinesPending: count(
      pickLines,
      (row) => row.status === "Pending" || row.status === "In Progress",
    ),
    packagesPacked: count(packingRecords, (row) => row.status === "Completed"),
    shipmentsInTransit: count(shipments, (row) => row.status === "In Transit"),
    awaitingDispatch: count(shipments, (row) => row.dispatch === "Awaiting Dispatch"),
    openBackorders: count(
      backorders,
      (row) => row.status === "Open" || row.status === "Partially Allocated",
    ),
    unitsShipped: picked,
    fulfilmentRate: orderRows.length
      ? Math.round((count(orderRows, (row) => row.status === "Shipped") / orderRows.length) * 100)
      : 0,
    onTimeRate: total ? Math.round((picked / total) * 100) : 0,
    waveStatusChart,
    ordersByPriorityChart,
    shipmentTrendChart,
    dailyFulfillmentChart,
    orderStatusChart: [...status].map(([name, orders]) => ({ status: name, orders })),
    carrierChart: [...carrier].map(([name, totalShipments]) => ({
      carrier: name,
      shipments: totalShipments,
    })),
  };
}
