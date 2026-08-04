/** Client-side query/mutation helpers around the WMS server functions. */
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchActivity,
  fetchBackorders,
  fetchDashboard,
  fetchInventory,
  fetchNotifications,
  fetchOrders,
  fetchPacking,
  fetchPickLines,
  fetchReference,
  fetchSettings,
  fetchShipments,
  fetchWaves,
} from "./wms.functions";
import {
  hasWmsBackend,
  localDashboard,
  localData,
  localList,
  localOrders,
  localReference,
} from "./wms-local";
import type { ListParams } from "./wms-types";

export const ALL = { pageSize: 200 } satisfies ListParams;
export const ordersQuery = (p: ListParams = ALL) =>
  queryOptions({
    queryKey: ["orders", p],
    queryFn: () => (hasWmsBackend() ? fetchOrders({ data: p }) : localList(localOrders(), p)),
  });
export const inventoryQuery = (p: ListParams = ALL) =>
  queryOptions({
    queryKey: ["inventory", p],
    queryFn: () =>
      hasWmsBackend() ? fetchInventory({ data: p }) : localList(localData.inventory, p),
  });
export const wavesQuery = (p: ListParams = ALL) =>
  queryOptions({
    queryKey: ["waves", p],
    queryFn: () => (hasWmsBackend() ? fetchWaves({ data: p }) : localList(localData.waves, p)),
  });
export const pickLinesQuery = (p: ListParams = ALL) =>
  queryOptions({
    queryKey: ["pickLines", p],
    queryFn: () =>
      hasWmsBackend() ? fetchPickLines({ data: p }) : localList(localData.pickLines, p),
  });
export const packingQuery = (p: ListParams = ALL) =>
  queryOptions({
    queryKey: ["packing", p],
    queryFn: () =>
      hasWmsBackend() ? fetchPacking({ data: p }) : localList(localData.packingRecords, p),
  });
export const shipmentsQuery = (p: ListParams = ALL) =>
  queryOptions({
    queryKey: ["shipments", p],
    queryFn: () =>
      hasWmsBackend() ? fetchShipments({ data: p }) : localList(localData.shipments, p),
  });
export const backordersQuery = (p: ListParams = ALL) =>
  queryOptions({
    queryKey: ["backorders", p],
    queryFn: () =>
      hasWmsBackend() ? fetchBackorders({ data: p }) : localList(localData.backorders, p),
  });
export const referenceQuery = () =>
  queryOptions({
    queryKey: ["reference"],
    queryFn: () => (hasWmsBackend() ? fetchReference() : Promise.resolve(localReference)),
    staleTime: 5 * 60_000,
  });
export const dashboardQuery = () =>
  queryOptions({
    queryKey: ["dashboard"],
    queryFn: () => (hasWmsBackend() ? fetchDashboard() : Promise.resolve(localDashboard())),
  });
export const activityQuery = () =>
  queryOptions({
    queryKey: ["activity"],
    queryFn: () => (hasWmsBackend() ? fetchActivity() : Promise.resolve(localData.activities)),
  });
export const notificationsQuery = () =>
  queryOptions({
    queryKey: ["notifications"],
    queryFn: () =>
      hasWmsBackend() ? fetchNotifications() : Promise.resolve(localData.notifications),
  });
export const settingsQuery = () =>
  queryOptions({
    queryKey: ["settings"],
    queryFn: () => (hasWmsBackend() ? fetchSettings() : Promise.resolve([])),
  });

export const WORKFLOW_KEYS = [
  "orders",
  "inventory",
  "waves",
  "pickLines",
  "packing",
  "shipments",
  "backorders",
  "dashboard",
  "activity",
  "notifications",
] as const;
export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}
export function useWmsMutation<TArgs, TResult>(
  fn: (args: TArgs) => Promise<TResult>,
  options: {
    success?: (result: TResult, args: TArgs) => { title: string; description?: string };
  } = {},
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (result, args) => {
      for (const key of WORKFLOW_KEYS) void queryClient.invalidateQueries({ queryKey: [key] });
      const msg = options.success?.(result, args);
      if (msg)
        toast.success(msg.title, msg.description ? { description: msg.description } : undefined);
    },
    onError: (error) => toast.error("Action failed", { description: errorMessage(error) }),
  });
}
