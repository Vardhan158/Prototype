import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { poStatusDistribution } from "@/apps/ams-insights/mock/purchaseOrders";

export function DonutChartCard() {
  const total = poStatusDistribution.reduce((s, d) => s + d.value, 0);

  return (
    <section className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-card">
      <h3 className="text-base font-semibold tracking-tight">PO Status Distribution</h3>
      <p className="mt-1 text-xs text-muted-foreground">Current financial year</p>

      <div className="relative mt-4 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={poStatusDistribution}
              dataKey="value"
              nameKey="name"
              innerRadius={68}
              outerRadius={98}
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {poStatusDistribution.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid var(--color-border)",
                background: "var(--color-card)",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-semibold tracking-tight">{total.toLocaleString("en-IN")}</p>
          <p className="text-xs text-muted-foreground">Total POs</p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {poStatusDistribution.map((d) => (
          <li key={d.name} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 rounded-full" style={{ background: d.color }} />
            <span className="text-muted-foreground">{d.name}</span>
            <span className="ml-auto font-medium tabular-nums">{d.value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
