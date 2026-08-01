import { StatusBadge } from "@/apps/ams-insights/common/StatusBadge";
import { asnList } from "@/apps/ams-insights/mock/asn";

export function RecentASNTable() {
  return (
    <section className="rounded-xl border border-border bg-card shadow-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-base font-semibold tracking-tight">Recent ASN (Shipments)</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">Latest advance shipping notices</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">ASN Number</th>
              <th className="px-5 py-3 font-medium">PO Number</th>
              <th className="px-5 py-3 font-medium">Supplier</th>
              <th className="px-5 py-3 font-medium">ETA</th>
              <th className="px-5 py-3 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {asnList.map((a) => (
              <tr
                key={a.id}
                className="border-b border-border last:border-0 transition-colors hover:bg-muted/50"
              >
                <td className="px-5 py-3.5 font-medium text-primary">{a.asnNumber}</td>
                <td className="px-5 py-3.5">{a.poNumber}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{a.supplier}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{a.eta}</td>
                <td className="px-5 py-3.5 text-right">
                  <StatusBadge status={a.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
