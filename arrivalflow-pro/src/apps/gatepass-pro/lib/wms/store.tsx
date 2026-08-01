import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { PO_DB, SEED_ENTRIES, SEED_NOTIFICATIONS, WAREHOUSES, newTimeline } from "./data";
import type { AppNotification, Delivery, Driver, EntryStatus, GateEntry, Vehicle } from "./types";

export interface Draft {
  vehicle: Partial<Vehicle>;
  driver: Partial<Driver>;
  delivery: Partial<Delivery>;
  voiceNote?: number | undefined;
}

const emptyDraft: Draft = { vehicle: {}, driver: {}, delivery: {} };

interface Ctx {
  entries: GateEntry[];
  notifications: AppNotification[];
  draft: Draft;
  online: boolean;
  officer: { name: string; empId: string; shift: string; gate: string; warehouse: string };
  theme: "light" | "dark";
  toggleTheme: () => void;
  setOnline: (v: boolean) => void;
  patchDraft: (p: Partial<Draft>) => void;
  resetDraft: () => void;
  commitDraft: (status: EntryStatus, holdReason?: string) => GateEntry;
  setStatus: (id: string, status: EntryStatus, holdReason?: string) => void;
  acceptByWarehouse: (id: string) => void;
  exitVehicle: (id: string) => void;
  markAllRead: () => void;
  pushNotification: (n: Omit<AppNotification, "id" | "time" | "read">) => void;
  lastEntryId: string | null;
}

const WmsContext = createContext<Ctx | null>(null);

function nowTime() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function WmsProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<GateEntry[]>(SEED_ENTRIES);
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED_NOTIFICATIONS);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [online, setOnline] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lastEntryId, setLastEntryId] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const pushNotification: Ctx["pushNotification"] = useCallback((n) => {
    setNotifications((prev) => [
      { ...n, id: `n${Date.now()}`, time: "just now", read: false },
      ...prev,
    ]);
  }, []);

  const commitDraft = useCallback(
    (status: EntryStatus, holdReason?: string) => {
      const arrival = nowTime();
      const seq = 149 + entries.length - SEED_ENTRIES.length;
      const po = draft.delivery.po ?? "4500128743";
      const pod = PO_DB[po];
      const created: GateEntry = {
        id: `GE-${Date.now()}`,
        gateNo: `GE-2608-0${seq}`,
        status,
        arrival,
        warehouse: WAREHOUSES[0]!,
        gate: "Gate 02 - Inbound",
        holdReason,
        voiceNote: draft.voiceNote,
        vehicle: {
          number: draft.vehicle.number ?? "MH 12 QR 8841",
          type: draft.vehicle.type ?? "32 ft Multi-Axle Container",
          transporter: draft.vehicle.transporter ?? "VRL Roadlines",
          truckPhoto: !!draft.vehicle.truckPhoto,
          platePhoto: !!draft.vehicle.platePhoto,
        },
        driver: {
          name: draft.driver.name ?? "Ramesh Kumar Yadav",
          phone: draft.driver.phone ?? "+91 98213 44520",
          license: draft.driver.license ?? "MH1420190004512",
          licenseExpiry: draft.driver.licenseExpiry ?? "14 Mar 2029",
          govId: draft.driver.govId ?? "XXXX XXXX 4471 (Aadhaar)",
          photo: !!draft.driver.photo,
        },
        delivery: {
          po,
          vendor: draft.delivery.vendor ?? pod?.vendor ?? "Aditya Polymers Ltd",
          category: draft.delivery.category ?? pod?.category ?? "Raw Material",
          expected: draft.delivery.expected ?? pod?.expected ?? "Today",
          dock: draft.delivery.dock ?? pod?.dock ?? "Dock 04",
          pallets: draft.delivery.pallets ?? pod?.pallets ?? 18,
        },
        timeline: newTimeline(status, arrival),
      };
      setEntries((prev) => [created, ...prev]);
      setLastEntryId(created.id);
      return created;
    },
    [draft, entries.length],
  );

  const setStatus = useCallback((id: string, status: EntryStatus, holdReason?: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status, holdReason: holdReason ?? e.holdReason, timeline: newTimeline(status, e.arrival) }
          : e,
      ),
    );
  }, []);

  const acceptByWarehouse = useCallback(
    (id: string) => {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, status: "Accepted", timeline: newTimeline("Accepted", e.arrival) } : e,
        ),
      );
      const target = entries.find((e) => e.id === id);
      pushNotification({
        kind: "accepted",
        title: `Warehouse accepted ${target?.vehicle.number ?? "vehicle"}`,
        body: `${target?.delivery.dock ?? "Dock"} assigned. Unloading team notified.`,
      });
    },
    [entries, pushNotification],
  );

  const exitVehicle = useCallback((id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "Exited", exitTime: nowTime() } : e)),
    );
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      entries,
      notifications,
      draft,
      online,
      theme,
      lastEntryId,
      officer: {
        name: "Arjun Deshmukh",
        empId: "SEC-10428",
        shift: "Shift A · 06:00 - 14:00",
        gate: "Gate 02 - Inbound",
        warehouse: WAREHOUSES[0]!,
      },
      toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
      setOnline,
      patchDraft: (p) =>
        setDraft((d) => ({
          ...d,
          ...p,
          vehicle: { ...d.vehicle, ...(p.vehicle ?? {}) },
          driver: { ...d.driver, ...(p.driver ?? {}) },
          delivery: { ...d.delivery, ...(p.delivery ?? {}) },
        })),
      resetDraft: () => setDraft(emptyDraft),
      commitDraft,
      setStatus,
      acceptByWarehouse,
      exitVehicle,
      markAllRead: () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
      pushNotification,
    }),
    [entries, notifications, draft, online, theme, lastEntryId, commitDraft, setStatus, acceptByWarehouse, exitVehicle, pushNotification],
  );

  return <WmsContext.Provider value={value}>{children}</WmsContext.Provider>;
}

export function useWms() {
  const ctx = useContext(WmsContext);
  if (!ctx) throw new Error("useWms must be used inside WmsProvider");
  return ctx;
}