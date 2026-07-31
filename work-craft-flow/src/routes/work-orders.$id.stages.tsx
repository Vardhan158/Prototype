import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Lock, Play } from "lucide-react";

import { StatusBadge } from "@/components/ams/StatusBadge";
import { Button } from "@/components/ui/button";
import { mandatoryChecksPassed, useAms } from "@/lib/ams/store";
import { STAGE_SEQUENCE } from "@/lib/ams/types";

export const Route = createFileRoute("/work-orders/$id/stages")({
  component: StagesPage,
});

function StagesPage() {
  const { id } = Route.useParams();
  const { workOrders, startStage, completeStage } = useAms();
  const wo = workOrders.find((w) => w.id === id);
  if (!wo) return null;

  const checksPassed = mandatoryChecksPassed(wo);

  return (
    <div className="space-y-4">
      <div className="surface-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Assembly Stage Tracking</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          BR-082 Assembly Stage Tracking. Mandatory quality checkpoints must pass before moving to
          the next stage.
        </p>
        {!checksPassed ? (
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-warning/12 p-4">
            <Lock className="mt-0.5 size-4 text-warning-foreground" />
            <p className="text-sm text-warning-foreground">
              Progression to the next stage is blocked until all mandatory checkpoints pass.
            </p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {wo.stages.map((stage, index) => {
          const previousCompleted =
            index === 0 || wo.stages[index - 1]!.status === "Completed";
          const canStart = stage.status === "Not Started" && previousCompleted && checksPassed;
          const canComplete = stage.status === "In Progress" && checksPassed;
          return (
            <div key={stage.name} className="surface-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Stage {index + 1} of {STAGE_SEQUENCE.length}
                  </p>
                  <h3 className="text-base font-semibold text-foreground">{stage.name}</h3>
                </div>
                <StatusBadge value={stage.status} />
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Start Time</dt>
                  <dd className="text-foreground">
                    {stage.startTime ? stage.startTime.replace("T", " ") : "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">End Time</dt>
                  <dd className="text-foreground">
                    {stage.endTime ? stage.endTime.replace("T", " ") : "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Assigned Operator</dt>
                  <dd className="text-foreground">{stage.operator}</dd>
                </div>
              </dl>
              <div className="mt-5 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!canStart}
                  onClick={() => startStage(id, stage.name)}
                >
                  <Play className="size-4" /> Start Stage
                </Button>
                <Button
                  size="sm"
                  disabled={!canComplete}
                  onClick={() => completeStage(id, stage.name)}
                >
                  <CheckCircle2 className="size-4" /> Complete Stage
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
