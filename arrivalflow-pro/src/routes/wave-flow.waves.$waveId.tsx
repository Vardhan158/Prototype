import { createFileRoute, Link, notFound, useParams } from "@tanstack/react-router";
import { ArrowLeft, CheckCheck, Rocket, Users, Route as RouteIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Metric,
  PageHeader,
  ProgressBar,
  SectionCard,
  StatusBadge,
  Timeline,
} from "@/apps/wave-flow/components/wms/ui";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getWave, orders, pickTasks } from "@/apps/wave-flow/lib/wms-data";

export const Route = createFileRoute("/wave-flow/waves/$waveId")({
  head: ({ params }) => ({
    meta: [
      { title: `Wave ${params.waveId} â€” NexusWMS` },
      {
        name: "description",
        content: `Wave ${params.waveId} workflow: orders, optimisation, approval, release and pick task progress.`,
      },
      { property: "og:title", content: `Wave ${params.waveId} â€” NexusWMS` },
      { property: "og:description", content: "Wave workflow, optimisation and release control." },
    ],
  }),
  loader: ({ params }) => {
    if (!getWave(params.waveId)) throw notFound();
    return null;
  },
  component: WaveDetail,
});

const stages = ["Created", "Optimised", "Approved", "Released", "Picking", "Completed"];

function WaveDetail() {
  const { waveId } = useParams({ from: "/wave-flow/waves/$waveId" });
  const wave = getWave(waveId);
  if (!wave) return null;

  const stageIdx =
    wave.status === "Draft"
      ? 0
      : wave.status === "Pending Approval"
        ? 1
        : wave.status === "Approved"
          ? 2
          : wave.status === "Released"
            ? 3
            : wave.status === "In Progress"
              ? 4
              : 5;

  const tasks = pickTasks.filter((t) => t.wave === wave.id);
  const saved = wave.travelMeters
    ? Math.round((1 - wave.optimizedMeters / wave.travelMeters) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <Link
        to="/wave-flow/waves"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Back to waves
      </Link>

      <PageHeader
        title={wave.id}
        description={`${wave.strategy} Â· ${wave.warehouse} Â· created ${wave.createdAt} by ${wave.createdBy}`}
        breadcrumb={["Outbound", "Waves", wave.id]}
        actions={
          <>
            <StatusBadge status={wave.priority} />
            <StatusBadge status={wave.status} />
            <Button
              variant="outline"
              onClick={() => toast.success("Route re-optimised â€” 12 stops resequenced")}
            >
              <RouteIcon className="size-4" /> Optimise
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <CheckCheck className="size-4" /> Approve
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Approve {wave.id}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Approval locks the order set ({wave.orders.length} orders, {wave.totalItems}{" "}
                    units) and makes the wave eligible for release to the floor.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => toast.success(`${wave.id} approved`)}>
                    Confirm approval
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>
                  <Rocket className="size-4" /> Release wave
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Release {wave.id} to the floor?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Releasing generates {wave.totalLines * 2} pick tasks, allocates bins and
                    notifies assigned pickers on their RF devices.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      toast.success(`${wave.id} released`, {
                        description: "Pick tasks generated and dispatched to RF",
                      })
                    }
                  >
                    Release now
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        }
      />

      <SectionCard title="Wave workflow">
        <ol className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stages.map((s, i) => (
            <li key={s} className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`num grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                    i <= stageIdx
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`truncate text-sm ${i <= stageIdx ? "font-medium" : "text-muted-foreground"}`}
                >
                  {s}
                </span>
              </div>
              <div className="mt-2">
                <ProgressBar value={i < stageIdx ? 100 : i === stageIdx ? wave.progress : 0} />
              </div>
            </li>
          ))}
        </ol>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <SectionCard title="Wave summary">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <Metric label="Warehouse" value={wave.warehouse} />
              <Metric label="Strategy" value={wave.strategy} />
              <Metric label="Total orders" value={wave.orders.length} />
              <Metric label="Total lines" value={wave.totalLines} />
              <Metric label="Total items" value={wave.totalItems.toLocaleString()} />
              <Metric label="Dispatch window" value={wave.dispatchWindow} />
              <Metric label="Estimated completion" value={wave.estimatedCompletion} />
              <Metric
                label="Assigned pickers"
                value={wave.assignedPickers.join(", ") || "Unassigned"}
              />
              <Metric label="Planned travel" value={`${wave.travelMeters} m`} />
              <Metric label="Optimised travel" value={`${wave.optimizedMeters} m`} />
              <Metric label="Travel saved" value={`${saved}%`} />
              <Metric label="Progress" value={`${wave.progress}%`} />
            </div>
          </SectionCard>

          <SectionCard title="Orders in wave" bodyClassName="p-0">
            {wave.orders.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                No orders assigned yet â€” use the manual planner to build this wave.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-surface-muted text-xs text-muted-foreground">
                    <tr>
                      {["Order", "Customer", "Lines", "Units", "Priority", "Status", ""].map(
                        (h) => (
                          <th key={h} className="px-4 py-2.5 text-left font-medium">
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {wave.orders.map((id) => {
                      const o = orders.find((x) => x.id === id);
                      if (!o) return null;
                      return (
                        <tr key={id} className="hover:bg-muted/50">
                          <td className="num px-4 py-3 font-medium">{o.id}</td>
                          <td className="px-4 py-3">{o.customer}</td>
                          <td className="num px-4 py-3">{o.lines.length}</td>
                          <td className="num px-4 py-3">
                            {o.lines.reduce((s, l) => s + l.qtyOrdered, 0)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={o.priority} />
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={o.status} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              to="/wave-flow/orders/$orderId"
                              params={{ orderId: o.id }}
                              className="text-xs text-primary"
                            >
                              Open
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Generated pick tasks" bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {tasks.length === 0 && (
                <li className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Pick tasks are generated when the wave is released.
                </li>
              )}
              {tasks.map((t) => (
                <li
                  key={t.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="num truncate text-sm font-medium">
                      {t.id} Â· {t.material}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.bin} Â· {t.description} Â· {t.picker}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="num text-xs text-muted-foreground">
                      {t.picked}/{t.qty}
                    </span>
                    <StatusBadge status={t.status} />
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard
            title="Picker assignment"
            actions={<Users className="size-4 text-muted-foreground" />}
          >
            {wave.assignedPickers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pickers assigned. Assignment happens automatically at release based on zone
                availability.
              </p>
            ) : (
              <ul className="space-y-2">
                {wave.assignedPickers.map((p) => (
                  <li key={p} className="glass-panel flex items-center gap-3 rounded-xl p-3">
                    <span className="grid size-8 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                      {p
                        .split(" ")
                        .map((x) => x[0])
                        .join("")}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p}</p>
                      <p className="text-xs text-muted-foreground">Assigned Â· RF-114</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Wave timeline">
            <Timeline
              steps={[
                { label: "Wave created", at: wave.createdAt, by: wave.createdBy, done: true },
                {
                  label: "Route optimised",
                  at: "18 Mar Â· 07:18",
                  by: "Optimisation engine",
                  done: stageIdx >= 1,
                },
                { label: "Approved", at: "18 Mar Â· 07:26", by: "M. Duarte", done: stageIdx >= 2 },
                { label: "Released", at: "18 Mar Â· 07:30", by: "M. Duarte", done: stageIdx >= 3 },
                {
                  label: "Picking in progress",
                  at: "18 Mar Â· 07:41",
                  by: wave.assignedPickers[0] ?? "â€”",
                  done: stageIdx >= 4,
                },
                {
                  label: "Completed",
                  at: wave.estimatedCompletion,
                  by: "System",
                  done: stageIdx >= 5,
                },
              ]}
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
