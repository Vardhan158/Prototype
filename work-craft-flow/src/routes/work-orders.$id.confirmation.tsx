import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

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
import { Textarea } from "@/components/ui/textarea";
import { OPERATORS } from "@/lib/ams/mock-data";
import { mandatoryChecksPassed, useAms } from "@/lib/ams/store";

export const Route = createFileRoute("/work-orders/$id/confirmation")({
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { id } = Route.useParams();
  const { workOrders, confirmAssembly } = useAms();
  const wo = workOrders.find((w) => w.id === id);
  const [form, setForm] = useState({
    operator: "",
    startTime: "",
    endTime: "",
    labourHours: 0,
    remarks: "",
  });
  const [error, setError] = useState<string | null>(null);
  if (!wo) return null;

  const operator = form.operator || wo.assignedOperator;
  const allStagesDone = wo.stages.every((s) => s.status === "Completed");
  const checksPassed = mandatoryChecksPassed(wo);
  const confirmed = wo.confirmation !== null;

  const submit = () => {
    if (!allStagesDone) return setError("All assembly stages must be completed first.");
    if (!checksPassed) return setError("All mandatory quality checkpoints must pass.");
    if (!form.startTime || !form.endTime) return setError("Start and end time are required.");
    setError(null);
    confirmAssembly(id, {
      operator,
      startTime: form.startTime,
      endTime: form.endTime,
      labourHours: Number(form.labourHours),
      completionTime: form.endTime,
      remarks: form.remarks,
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="surface-card p-6 lg:col-span-2">
        <h2 className="text-sm font-semibold text-foreground">Assembly Confirmation</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          BR-084 Assembly Confirmation. Confirming generates the finished goods serial (BR-086) and
          the assembly completion certificate (BR-088).
        </p>

        {confirmed ? (
          <div className="mt-5 rounded-xl bg-success/12 p-4 text-sm text-foreground">
            Assembly confirmed by {wo.confirmation!.operator} on {wo.confirmation!.completionTime}{" "}
            with {wo.confirmation!.labourHours} labour hours.
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Operator</Label>
              <Select value={operator} onValueChange={(v) => setForm({ ...form, operator: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  {OPERATORS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Labour Hours</Label>
              <Input
                type="number"
                min={0}
                step="0.5"
                value={form.labourHours}
                onChange={(e) => setForm({ ...form, labourHours: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Start Time</Label>
              <Input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>End Time</Label>
              <Input
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Remarks</Label>
              <Textarea
                rows={3}
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              />
            </div>
            {error ? (
              <p className="text-sm font-medium text-destructive sm:col-span-2">{error}</p>
            ) : null}
            <div className="sm:col-span-2">
              <Button onClick={submit}>Confirm Assembly</Button>
            </div>
          </div>
        )}
      </div>

      <div className="surface-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Readiness</h2>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex justify-between">
            <span className="text-muted-foreground">All stages completed</span>
            <span className={allStagesDone ? "text-success" : "text-destructive"}>
              {allStagesDone ? "Yes" : "No"}
            </span>
          </li>
          <li className="flex justify-between">
            <span className="text-muted-foreground">Mandatory checks passed</span>
            <span className={checksPassed ? "text-success" : "text-destructive"}>
              {checksPassed ? "Yes" : "No"}
            </span>
          </li>
          <li className="flex justify-between">
            <span className="text-muted-foreground">Assigned operator</span>
            <span className="text-foreground">{wo.assignedOperator}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
