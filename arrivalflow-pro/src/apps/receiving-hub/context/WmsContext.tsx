import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  purchaseOrders as seedPos,
  seedDiscrepancies,
  seedGrns,
} from "@/apps/receiving-hub/data";
import type { Discrepancy, Grn, PurchaseOrder } from "@/apps/receiving-hub/types";

interface WmsState {
  pos: PurchaseOrder[];
  grns: Grn[];
  discrepancies: Discrepancy[];
  activeWarehouse: string;
  setActiveWarehouse: (id: string) => void;
  nextGrnId: () => string;
  nextDiscrepancyId: () => string;
  commitGrn: (grn: Grn, discrepancies: Discrepancy[]) => void;
  updateDiscrepancy: (id: string, patch: Partial<Discrepancy>) => void;
}

const WmsContext = createContext<WmsState | null>(null);

export function WmsProvider({ children }: { children: ReactNode }) {
  const [pos, setPos] = useState<PurchaseOrder[]>(seedPos);
  const [grns, setGrns] = useState<Grn[]>(seedGrns);
  const [discrepancies, setDiscrepancies] =
    useState<Discrepancy[]>(seedDiscrepancies);
  const [activeWarehouse, setActiveWarehouse] = useState("WH-01");

  const nextGrnId = useCallback(() => {
    const max = grns.reduce((m, g) => {
      const n = Number(g.id.split("-")[2]);
      return Number.isFinite(n) ? Math.max(m, n) : m;
    }, 0);
    return `GRN-2026-${String(max + 2).padStart(4, "0")}`;
  }, [grns]);

  const nextDiscrepancyId = useCallback(() => {
    const max = discrepancies.reduce((m, d) => {
      const n = Number(d.id.split("-")[2]);
      return Number.isFinite(n) ? Math.max(m, n) : m;
    }, 0);
    return `DSC-2026-${String(max + 1).padStart(4, "0")}`;
  }, [discrepancies]);

  const commitGrn = useCallback((grn: Grn, newDiscrepancies: Discrepancy[]) => {
    setGrns((prev) => [grn, ...prev.filter((g) => g.id !== grn.id)]);
    if (newDiscrepancies.length) {
      setDiscrepancies((prev) => [...newDiscrepancies, ...prev]);
    }
    if (!grn.poNumber) return;
    setPos((prev) =>
      prev.map((po) => {
        if (po.poNumber !== grn.poNumber) return po;
        const lines = po.lines.map((l) => {
          const gl = grn.lines.find((g) => g.sku === l.sku);
          if (!gl) return l;
          return { ...l, receivedQty: l.receivedQty + gl.receivedQty };
        });
        const fully = lines.every((l) => l.receivedQty >= l.orderedQty);
        const some = lines.some((l) => l.receivedQty > 0);
        return {
          ...po,
          lines,
          status: fully ? "Fully Received" : some ? "Partially Received" : po.status,
        };
      }),
    );
  }, []);

  const updateDiscrepancy = useCallback(
    (id: string, patch: Partial<Discrepancy>) =>
      setDiscrepancies((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      ),
    [],
  );

  const value = useMemo(
    () => ({
      pos,
      grns,
      discrepancies,
      activeWarehouse,
      setActiveWarehouse,
      nextGrnId,
      nextDiscrepancyId,
      commitGrn,
      updateDiscrepancy,
    }),
    [
      pos,
      grns,
      discrepancies,
      activeWarehouse,
      nextGrnId,
      nextDiscrepancyId,
      commitGrn,
      updateDiscrepancy,
    ],
  );

  return <WmsContext.Provider value={value}>{children}</WmsContext.Provider>;
}

export function useWms() {
  const ctx = useContext(WmsContext);
  if (!ctx) throw new Error("useWms must be used inside WmsProvider");
  return ctx;
}
