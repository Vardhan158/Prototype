import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Field, PageHeader, SectionCard, Timeline } from "@/apps/supplier-flow/components/page-parts";
import { StatusBadge } from "@/apps/supplier-flow/components/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { compactMoney, deliveryPerformance, getSupplier } from "@/apps/supplier-flow/data/procurement";

export const Route = createFileRoute("/supplier-flow/vendor-performance/$supplierId")({
  loader: ({ params }) => {
    if (!getSupplier(params.supplierId)) throw notFound();
    return null;
  },
  head: ({ params }) => {
    const s = getSupplier(params.supplierId);
    if (!s) return { meta: [{ title: "Scorecard not found | AxisWMS" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: `${s.name} — Vendor Scorecard | AxisWMS` },
        { name: "description", content: `Delivery, quality, cost and lead-time scorecard for ${s.name}.` },
        { property: "og:title", content: `${s.name} — Vendor Scorecard | AxisWMS` },
        { property: "og:description", content: `Rating ${s.rating}/5 · OTD ${s.onTimeDelivery}% · defect rate ${s.defectRate}%.` },
      ],
    };
  },
  component: Scorecard,
});

function Scorecard() {
  const { supplierId } = Route.useParams();
  const s = getSupplier(supplierId)!;
  const trend = deliveryPerformance.map((d) => ({ month: d.month, otd: Math.max(60, d.onTime - (100 - s.onTimeDelivery)) }));

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        breadcrumbs={[{ label: "Home", to: "/supplier-flow" }, { label: "Vendor Performance", to: "/supplier-flow/vendor-performance" }, { label: s.name }]}
        title={`${s.name} — scorecard`}
        subtitle={`${s.category} · ${s.city}, ${s.country} · Reviewed quarterly by the category council`}
        meta={<><StatusBadge status={s.status} /><StatusBadge status={s.risk} /><span className="num rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium">★ {s.rating.toFixed(1)}</span></>}
        actions={
          <>
            <Button variant="outline" asChild><Link to="/supplier-flow/suppliers/$supplierId" params={{ supplierId: s.id }}>Supplier profile</Link></Button>
            <Button onClick={() => toast.success("Corrective action raised", { description: "CAPA-2026-021 assigned to supplier quality." })}>Raise corrective action</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { l: "On-time delivery", v: `${s.onTimeDelivery}%` },
          { l: "Quality acceptance", v: `${s.qualityScore}%` },
          { l: "Defect rate", v: `${s.defectRate}%` },
          { l: "Avg lead time", v: `${s.leadTimeDays} d` },
          { l: "Spend YTD", v: compactMoney(s.spendYtd) },
        ].map((k) => (
          <div key={k.l} className="card-elevate rounded-xl p-3.5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{k.l}</p>
            <p className="num mt-1.5 text-lg font-semibold">{k.v}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <SectionCard className="xl:col-span-2" title="On-time delivery trend" description="Rolling six-month performance against the 95% target">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis domain={[50, 100]} tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }} />
                <Line type="monotone" dataKey="otd" name="On-time %" stroke="var(--chart-1)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Scorecard breakdown">
          {[
            { l: "Delivery", v: s.onTimeDelivery },
            { l: "Quality", v: s.qualityScore },
            { l: "Cost competitiveness", v: 100 - s.defectRate * 6 },
            { l: "Responsiveness", v: s.riskScores.operational },
            { l: "Compliance", v: s.riskScores.compliance },
          ].map((m) => (
            <div key={m.l} className="mb-3">
              <div className="flex justify-between text-sm"><span>{m.l}</span><span className="num font-medium">{m.v.toFixed(1)}</span></div>
              <Progress value={Math.min(100, m.v)} className="mt-1.5 h-2" />
            </div>
          ))}
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <SectionCard className="xl:col-span-2" title="Performance history"><Timeline events={s.timeline} /></SectionCard>
        <SectionCard title="Commercial context">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Field label="Payment terms" value={s.paymentTerms} />
            <Field label="Currency" value={s.currency} />
            <Field label="Open POs" value={s.openPOs} />
            <Field label="Contracts" value={s.contracts.length} />
            <Field label="Last audit" value={s.audits[0]?.date ?? "—"} />
            <Field label="Audit score" value={s.audits[0] ? `${s.audits[0].score}/100` : "—"} />
          </dl>
        </SectionCard>
      </div>
    </div>
  );
}
