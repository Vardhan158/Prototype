import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { IdCard, Phone, ShieldCheck, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/apps/gate-pass-pro/components/wms/AppShell";

export const Route = createFileRoute("/gate-pass-pro/drivers/$id")({
  head: () => ({
    meta: [
      { title: "Driver Profile — NexusWMS" },
      { name: "description", content: "Driver master profile: licence validity, safety induction, visit history and compliance flags." },
      { property: "og:title", content: "Driver Profile — NexusWMS" },
      { property: "og:description", content: "Driver compliance and visit history." },
    ],
  }),
  component: DriverProfile,
});

function DriverProfile() {
  const { id } = useParams({ from: "/gate-pass-pro/drivers/$id" });

  return (
    <AppShell title="Driver Profile" subtitle={`Driver master · ${id}`}>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-5">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"><IdCard className="h-5 w-5" /></span>
          <h2 className="mt-3 text-base font-semibold">Ramesh Yadav</h2>
          <p className="text-xs text-muted-foreground">Licence MH12 20190034512 · valid till 14 Aug 2029</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge className="bg-success/15 text-[10px] text-success">Verified</Badge>
            <Badge className="bg-muted text-[10px] text-muted-foreground">Safety induction 12 Jan 2026</Badge>
          </div>
          <dl className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between"><dt className="text-muted-foreground">Mobile</dt><dd className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />+91 98200 45120</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Transporter</dt><dd>VRL Logistics Ltd.</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Total visits</dt><dd>68</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Incidents</dt><dd>0</dd></div>
          </dl>
        </div>

        <div className="surface-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold">Recent visits</h3>
          <div className="mt-3 divide-y divide-border">
            {[
              ["GE-2026-004821", "MH-12-AB-4521", "18 Feb 2026 · 08:42", "Completed"],
              ["GE-2026-004566", "MH-12-AB-4521", "11 Feb 2026 · 09:15", "Completed"],
              ["GE-2026-004301", "MH-14-QR-9087", "02 Feb 2026 · 14:05", "Completed"],
              ["GE-2026-004118", "MH-12-AB-4521", "24 Jan 2026 · 07:58", "On Hold – expired PUC"],
            ].map((r) => (
              <div key={r[0]} className="flex flex-wrap items-center gap-3 py-3 text-xs">
                <Link to="/gate-pass-pro/gate-entry" className="font-mono font-semibold text-primary hover:underline">{r[0]}</Link>
                <span className="inline-flex items-center gap-1 text-muted-foreground"><Truck className="h-3 w-3" />{r[1]}</span>
                <span className="ml-auto text-muted-foreground">{r[2]}</span>
                <span>{r[3]}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 inline-flex items-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> No blacklist entries against this driver.
          </p>
          <Button variant="outline" size="sm" className="mt-4" asChild><Link to="/gate-pass-pro/gate-entry">Back to register</Link></Button>
        </div>
      </div>
    </AppShell>
  );
}
