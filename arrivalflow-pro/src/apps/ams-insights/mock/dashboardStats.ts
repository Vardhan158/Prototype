export interface KpiStat {
  id: string;
  label: string;
  value: string;
  sub: string;
  tone: "blue" | "green" | "orange" | "purple" | "cyan";
  icon: "file" | "clock" | "truck" | "check" | "users";
}

export const dashboardStats: KpiStat[] = [
  { id: "total", label: "Total POs", value: "1,248", sub: "This Year", tone: "blue", icon: "file" },
  { id: "open", label: "Open POs", value: "356", sub: "Amount ₹48.75 Cr", tone: "green", icon: "clock" },
  { id: "pending", label: "Pending Receipts", value: "128", sub: "Amount ₹16.20 Cr", tone: "orange", icon: "truck" },
  { id: "completed", label: "Completed POs", value: "764", sub: "Amount ₹125.30 Cr", tone: "purple", icon: "check" },
  { id: "suppliers", label: "Active Suppliers", value: "532", sub: "Across 18 Countries", tone: "cyan", icon: "users" },
];
