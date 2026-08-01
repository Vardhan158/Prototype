import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Download, Factory, Network, ScanLine, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/apps/inventory-flow/components/PageHeader";
import { SectionCard } from "@/apps/inventory-flow/components/SectionCard";
import { StatusBadge } from "@/apps/inventory-flow/components/StatusBadge";
import { KpiCard } from "@/apps/inventory-flow/components/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { genealogy } from "@/apps/inventory-flow/lib/data";
import type { GenealogyNode } from "@/apps/inventory-flow/lib/types";
import { exportRows } from "@/apps/inventory-flow/lib/export";
import { useMockLoading } from "@/apps/inventory-flow/lib/useMockLoading";

export const Route = createFileRoute("/inventory-flow/genealogy")({
  head: () => ({
    meta: [
      { title: "Serial & Batch Genealogy — VoltCore WMS" },
      {
        name: "description",
        content:
          "Trace serial and batch genealogy of assembled power transformers down to component conductors, sensors and control cards.",
      },
      { property: "og:title", content: "Serial & Batch Genealogy — VoltCore WMS" },
      {
        property: "og:description",
        content: "Full component-level traceability tree for serialised power equipment assemblies.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GenealogyPage,
});

function flatten(node: GenealogyNode, depth = 0): (GenealogyNode & { depth: number })[] {
  return [
    { ...node, depth },
    ...(node.children ?? []).flatMap((c) => flatten(c, depth + 1)),
  ];
}

function TreeNode({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: GenealogyNode;
  depth: number;
  selectedId: string;
  onSelect: (n: GenealogyNode) => void;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = !!node.children?.length;

  return (
    <li>
      <div
        className={cn(
          "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-accent/60",
          selectedId === node.id && "bg-primary/5 ring-1 ring-primary/20",
        )}
        style={{ marginLeft: depth * 16 }}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={open ? "Collapse node" : "Expand node"}
            onClick={() => setOpen((o) => !o)}
            className="grid size-5 place-items-center rounded text-muted-foreground hover:text-foreground"
          >
            {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
        ) : (
          <span className="grid size-5 place-items-center">
            <span className="size-1.5 rounded-full bg-border" />
          </span>
        )}
        <button type="button" onClick={() => onSelect(node)} className="min-w-0 text-left">
          <p className="truncate text-sm font-medium">{node.name}</p>
          <p className="num truncate text-xs text-muted-foreground">
            {node.materialCode} · {node.serialNumber} · {node.batchNumber}
          </p>
        </button>
        <StatusBadge status={node.status} />
      </div>
      {hasChildren && open && (
        <ul className="mt-1 space-y-1 border-l border-border/70" style={{ marginLeft: depth * 16 + 10 }}>
          {node.children!.map((c) => (
            <TreeNode key={c.id} node={c} depth={0} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </li>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="num mt-0.5 truncate text-sm font-medium">{value}</p>
    </div>
  );
}

function GenealogyPage() {
  const loading = useMockLoading();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<GenealogyNode>(genealogy);

  const flat = useMemo(() => flatten(genealogy), []);
  const matches = useMemo(
    () =>
      query.trim()
        ? flat.filter((n) =>
            [n.name, n.serialNumber, n.batchNumber, n.materialCode]
              .join(" ")
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
        : [],
    [flat, query],
  );

  const maxDepth = Math.max(...flat.map((n) => n.depth)) + 1;

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Serial & Batch Genealogy"
        description="Component-level traceability for serialised assemblies · BR-069"
        breadcrumbs={[{ label: "Inventory Management", to: "/" }, { label: "Serial Genealogy" }]}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportRows(
                  flat.map(({ children: _children, ...rest }) => rest),
                  "genealogy-trace",
                  "csv",
                )
              }
            >
              <Download className="mr-1.5 size-4" /> Export Trace
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success("Scanner ready", { description: "Scan a serial or batch label to trace." })}
            >
              <ScanLine className="mr-1.5 size-4" /> Scan Serial
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Traced Components" value={String(flat.length)} icon={Network} loading={loading} />
        <KpiCard label="BOM Levels" value={String(maxDepth)} icon={Factory} tone="reserved" loading={loading} />
        <KpiCard
          label="Certified Nodes"
          value={String(flat.filter((n) => n.status === "Available").length)}
          icon={ShieldCheck}
          tone="available"
          loading={loading}
        />
        <KpiCard
          label="Held Components"
          value={String(flat.filter((n) => n.status === "Quarantine" || n.status === "Damaged").length)}
          icon={ScanLine}
          tone="quarantine"
          loading={loading}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <SectionCard
          title="Genealogy tree"
          description={`Top assembly: ${genealogy.name}`}
          actions={
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search serial / batch…"
              className="h-8 w-[180px]"
            />
          }
        >
          {query.trim() && (
            <p className="mb-3 text-xs text-muted-foreground">
              {matches.length} matching component{matches.length === 1 ? "" : "s"}
            </p>
          )}
          <ul className="space-y-1">
            <TreeNode node={genealogy} depth={0} selectedId={selected.id} onSelect={setSelected} />
          </ul>
        </SectionCard>

        <SectionCard title="Component detail" description="Traceability attributes for the selected node">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <p className="text-sm font-semibold">{selected.name}</p>
              <div className="mt-1.5">
                <StatusBadge status={selected.status} />
              </div>
            </div>
            <Field label="Material Code" value={selected.materialCode} />
            <Field label="Serial Number" value={selected.serialNumber} />
            <Field label="Batch Number" value={selected.batchNumber} />
            <Field label="Manufacturing Date" value={selected.manufacturingDate} />
            <Field label="Warranty" value={selected.warranty} />
            <Field label="Supplier" value={selected.supplier} />
          </div>

          <Separator className="my-4" />

          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Where-used path</p>
          <ol className="mt-2 space-y-2">
            {(() => {
              const path: GenealogyNode[] = [];
              const walk = (n: GenealogyNode, trail: GenealogyNode[]): boolean => {
                const next = [...trail, n];
                if (n.id === selected.id) {
                  path.push(...next);
                  return true;
                }
                return (n.children ?? []).some((c) => walk(c, next));
              };
              walk(genealogy, []);
              return path.map((n, i) => (
                <li key={n.id} className="flex items-center gap-2 text-xs">
                  <span className="num grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span className="truncate">{n.name}</span>
                </li>
              ));
            })()}
          </ol>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-muted/60 p-3">
              <p className="text-muted-foreground">Direct children</p>
              <p className="num mt-1 text-lg font-semibold">{selected.children?.length ?? 0}</p>
            </div>
            <div className="rounded-lg bg-muted/60 p-3">
              <p className="text-muted-foreground">Total descendants</p>
              <p className="num mt-1 text-lg font-semibold">{flatten(selected).length - 1}</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
