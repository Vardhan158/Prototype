import { supplierPerformance } from "@/apps/ams-insights/mock/supplierPerformance";

export function SupplierPerformanceTable() {
  return (
    <section className="rounded-xl border border-border bg-card shadow-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-base font-semibold tracking-tight">Supplier Performance</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">Top 5 suppliers by score</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Supplier</th>
              <th className="px-5 py-3 font-medium">On-Time</th>
              <th className="px-5 py-3 font-medium">Quality</th>
              <th className="px-5 py-3 text-right font-medium">Rating</th>
            </tr>
          </thead>
          <tbody>
            {supplierPerformance.map((s) => (
              <tr
                key={s.supplier}
                className="border-b border-border last:border-0 transition-colors hover:bg-muted/50"
              >
                <td className="px-5 py-3.5 font-medium">{s.supplier}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${s.onTime}%` }} />
                    </div>
                    <span className="tabular-nums text-muted-foreground">{s.onTime}%</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-success" style={{ width: `${s.quality}%` }} />
                    </div>
                    <span className="tabular-nums text-muted-foreground">{s.quality}%</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span className="inline-flex min-w-9 justify-center rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                    {s.rating}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
