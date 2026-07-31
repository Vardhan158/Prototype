import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { StatusBadge } from "@/components/ams/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INSPECTORS } from "@/lib/ams/mock-data";
import { useAms } from "@/lib/ams/store";
import type { CheckpointResult } from "@/lib/ams/types";

export const Route = createFileRoute("/work-orders/$id/quality")({
  component: QualityPage,
});

function QualityPage() {
  const { id } = Route.useParams();
  const { workOrders, recordCheckpoint } = useAms();
  const wo = workOrders.find((w) => w.id === id);
  const [draft, setDraft] = useState<
    Record<string, { result: CheckpointResult; inspector: string; remarks: string }>
  >({});
  if (!wo) return null;

  return (
    <div className="space-y-4">
      <div className="surface-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Quality Checkpoints</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          BR-083 Quality Checkpoints. All checks are mandatory — a failed check blocks stage
          progression and raises an assembly exception.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {wo.checkpoints.map((cp) => {
          const d = draft[cp.name] ?? {
            result: cp.result,
            inspector: cp.inspector || INSPECTORS[0]!,
            remarks: cp.remarks,
          };
          const update = (patch: Partial<typeof d>) =>
            setDraft((prev) => ({ ...prev, [cp.name]: { ...d, ...patch } }));

          return (
            <div key={cp.name} className="surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{cp.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Mandatory check</p>
                </div>
                <StatusBadge value={cp.result} />
              </div>

              <div className="mt-4 space-y-3">
                <div className="space-y-1.5">
                  <Label>Result</Label>
                  <Select
                    value={d.result}
                    onValueChange={(v) => update({ result: v as CheckpointResult })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Pass">Pass</SelectItem>
                      <SelectItem value="Fail">Fail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Inspector</Label>
                  <Select value={d.inspector} onValueChange={(v) => update({ inspector: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select inspector" />
                    </SelectTrigger>
                    <SelectContent>
                      {INSPECTORS.map((i) => (
                        <SelectItem key={i} value={i}>
                          {i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Remarks</Label>
                  <Input
                    value={d.remarks}
                    placeholder="Observations"
                    onChange={(e) => update({ remarks: e.target.value })}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Date</span>
                  <span>{cp.date ?? "—"}</span>
                </div>
                <Button
                  className="w-full"
                  onClick={() =>
                    recordCheckpoint(id, cp.name, d.result, d.remarks, d.inspector)
                  }
                >
                  Save Checkpoint
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
