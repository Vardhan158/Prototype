import { useState } from "react";

import { Button } from "@work/components/ui/button";
import { Input } from "@work/components/ui/input";
import { Label } from "@work/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@work/components/ui/select";
import { Textarea } from "@work/components/ui/textarea";
import { BOM_VERSIONS, OPERATORS, PRODUCTS } from "@work/lib/ams/mock-data";
import type { Priority } from "@work/lib/ams/types";

export interface WorkOrderFormValues {
  workOrderNumber: string;
  finishedProduct: string;
  finishedGoodsSpecification: string;
  bomVersion: string;
  quantity: number;
  priority: Priority;
  startDate: string;
  expectedCompletionDate: string;
  assignedOperator: string;
  remarks: string;
}

export const EMPTY_WORK_ORDER: WorkOrderFormValues = {
  workOrderNumber: "",
  finishedProduct: "",
  finishedGoodsSpecification: "",
  bomVersion: "",
  quantity: 1,
  priority: "Medium",
  startDate: "",
  expectedCompletionDate: "",
  assignedOperator: "",
  remarks: "",
};

export function WorkOrderForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  lockNumber,
}: {
  initialValues: WorkOrderFormValues;
  submitLabel: string;
  onSubmit: (values: WorkOrderFormValues) => void;
  onCancel: () => void;
  lockNumber?: boolean;
}) {
  const [values, setValues] = useState<WorkOrderFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof WorkOrderFormValues>(key: K, value: WorkOrderFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!values.workOrderNumber.trim()) e["workOrderNumber"] = "Work Order Number is required.";
    if (!values.finishedProduct) e["finishedProduct"] = "Finished Product is required.";
    if (!values.finishedGoodsSpecification.trim())
      e["finishedGoodsSpecification"] = "Finished Goods Specification is required.";
    if (!values.bomVersion) e["bomVersion"] = "BOM Version is required.";
    if (!values.quantity || values.quantity < 1) e["quantity"] = "Quantity must be at least 1.";
    if (!values.startDate) e["startDate"] = "Start Date is required.";
    if (!values.expectedCompletionDate)
      e["expectedCompletionDate"] = "Expected Completion Date is required.";
    if (
      values.startDate &&
      values.expectedCompletionDate &&
      values.expectedCompletionDate < values.startDate
    )
      e["expectedCompletionDate"] = "Expected Completion Date cannot be before Start Date.";
    if (!values.assignedOperator) e["assignedOperator"] = "Assigned Operator is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const Err = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-xs text-destructive">{errors[field]}</p> : null;

  return (
    <form
      className="surface-card p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (validate()) onSubmit(values);
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="won">Work Order Number</Label>
          <Input
            id="won"
            value={values.workOrderNumber}
            disabled={lockNumber}
            onChange={(e) => set("workOrderNumber", e.target.value)}
            placeholder="WO-2026-0007"
          />
          <Err field="workOrderNumber" />
        </div>

        <div className="space-y-2">
          <Label>Finished Product</Label>
          <Select
            value={values.finishedProduct}
            onValueChange={(v) => set("finishedProduct", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select finished product" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCTS.map((p) => (
                <SelectItem key={p.code} value={p.name}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Err field="finishedProduct" />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="spec">Finished Goods Specification</Label>
          <Textarea
            id="spec"
            rows={3}
            value={values.finishedGoodsSpecification}
            onChange={(e) => set("finishedGoodsSpecification", e.target.value)}
            placeholder="Technical specification of the finished goods"
          />
          <Err field="finishedGoodsSpecification" />
        </div>

        <div className="space-y-2">
          <Label>BOM Version</Label>
          <Select value={values.bomVersion} onValueChange={(v) => set("bomVersion", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select BOM version" />
            </SelectTrigger>
            <SelectContent>
              {BOM_VERSIONS.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Err field="bomVersion" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="qty">Quantity</Label>
          <Input
            id="qty"
            type="number"
            min={1}
            value={values.quantity}
            onChange={(e) => set("quantity", Number(e.target.value))}
          />
          <Err field="quantity" />
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={values.priority}
            onValueChange={(v) => set("priority", v as Priority)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["Low", "Medium", "High", "Critical"] as Priority[]).map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Assigned Operator</Label>
          <Select
            value={values.assignedOperator}
            onValueChange={(v) => set("assignedOperator", v)}
          >
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
          <Err field="assignedOperator" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="start">Start Date</Label>
          <Input
            id="start"
            type="date"
            value={values.startDate}
            onChange={(e) => set("startDate", e.target.value)}
          />
          <Err field="startDate" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exp">Expected Completion Date</Label>
          <Input
            id="exp"
            type="date"
            value={values.expectedCompletionDate}
            onChange={(e) => set("expectedCompletionDate", e.target.value)}
          />
          <Err field="expectedCompletionDate" />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea
            id="remarks"
            rows={3}
            value={values.remarks}
            onChange={(e) => set("remarks", e.target.value)}
            placeholder="Additional remarks"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
