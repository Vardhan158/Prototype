import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Download, ScrollText, Monitor, Globe2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppShell } from "@/apps/gate-pass-pro/components/wms/AppShell";
import { auditTrail } from "@/apps/gate-pass-pro/lib/wms-data";

export const Route = createFileRoute("/gate-pass-pro/audit")({
  head: () => ({
    meta: [
      { title: "Audit Trail — NexusWMS" },
      { name: "description", content: "Immutable audit log of every gate action with user, timestamp, IP address, device and remarks." },
      { property: "og:title", content: "Audit Trail — NexusWMS" },
      { property: "og:description", content: "Tamper-evident gate operations audit log." },
    ],
  }),
  component: Audit,
});

function Audit() {
  const [q, setQ] = useState("");
  const [user, setUser] = useState("All users");
  const users = ["All users", ...Array.from(new Set(auditTrail.map((a) => a.user)))];
  const rows = auditTrail.filter(
    (a) => `${a.action} ${a.remarks} ${a.user}`.toLowerCase().includes(q.toLowerCase()) && (user === "All users" || a.user === user),
  );

  return (
    <AppShell
      title="Audit Trail"
      subtitle="GE-2026-004821 · immutable log · retained for 7 years per compliance policy"
      actions={
        <Button variant="outline" onClick={() => toast.success("Signed audit export generated (PDF)")}>
          <Download className="mr-2 h-4 w-4" />Export signed log
        </Button>
      }
    >
      <div className="surface-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search action or remark…" className="pl-9" />
          </div>
          <Select value={user} onValueChange={setUser}>
            <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
            <SelectContent>{users.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        {rows.length === 0 ? (
          <div className="p-16 text-center">
            <ScrollText className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">No audit events match your filter</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => { setQ(""); setUser("All users"); }}>Reset filters</Button>
          </div>
        ) : (
          <ol className="p-5">
            {rows.map((a, i) => (
              <li key={i} className="relative pb-6 pl-8 last:pb-0">
                <span className="absolute left-0 top-1 grid h-5 w-5 place-items-center rounded-full bg-primary/12 text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                </span>
                {i < rows.length - 1 && <span className="absolute left-[9px] top-6 h-full w-px bg-border" />}
                <p className="text-sm font-medium">{a.action}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{a.time} · {a.user}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Globe2 className="h-3 w-3" />{a.ip}</span>
                  <span className="inline-flex items-center gap-1"><Monitor className="h-3 w-3" />{a.device}</span>
                </div>
                <p className="mt-1 text-[11px] italic text-muted-foreground">“{a.remarks}”</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </AppShell>
  );
}
