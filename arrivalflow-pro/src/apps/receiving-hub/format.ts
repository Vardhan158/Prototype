export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(n);

export const qty = (n: number) => new Intl.NumberFormat("en-IN").format(n);

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const fmtDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export const TOLERANCE = 0.02;

export type Variance = "ok" | "over" | "under" | "none";

export function variance(ordered: number, received: number): Variance {
  if (received === 0) return "none";
  const v = (received - ordered) / ordered;
  if (v > TOLERANCE) return "over";
  if (v < -TOLERANCE) return "under";
  return "ok";
}
