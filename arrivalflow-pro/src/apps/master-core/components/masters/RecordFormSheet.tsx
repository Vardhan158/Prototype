import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CloudUpload,
  Loader2,
  Paperclip,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@master/components/ui/alert-dialog";
import { Button } from "@master/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@master/components/ui/sheet";
import { Input } from "@master/components/ui/input";
import { Label } from "@master/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@master/components/ui/select";
import { Switch } from "@master/components/ui/switch";
import { Textarea } from "@master/components/ui/textarea";
import { cn } from "@master/lib/utils";

export type FormField = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "number" | "date" | "textarea" | "select" | "switch";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  colSpan?: 1 | 2;
};

export type FormStep = { title: string; description: string; fields: FormField[] };

export function RecordFormSheet({
  open,
  onOpenChange,
  entity,
  steps,
  initial,
  mode = "create",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  entity: string;
  steps: FormStep[];
  initial?: Record<string, string>;
  mode?: "create" | "edit";
}) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>(initial ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle");
  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(0);
      setValues(initial ?? {});
      setErrors({});
      setDirty(false);
      setSaving("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!dirty) return;
    setSaving("saving");
    const t = window.setTimeout(() => setSaving("saved"), 900);
    return () => window.clearTimeout(t);
  }, [values, dirty]);

  const allSteps = useMemo(() => [...steps, { title: "Preview", description: "Review before submitting", fields: [] }], [steps]);
  const isPreview = step === allSteps.length - 1;
  const currentStep = allSteps[step] ?? allSteps[0]!;

  const setValue = (name: string, v: string) => {
    setValues((s) => ({ ...s, [name]: v }));
    setErrors((e) => ({ ...e, [name]: "" }));
    setDirty(true);
  };

  const validateStep = () => {
    const next: Record<string, string> = {};
    for (const f of currentStep.fields) {
      const v = (values[f.name] ?? "").trim();
      if (f.required && !v) next[f.name] = `${f.label} is required`;
      else if (f.type === "email" && v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v))
        next[f.name] = "Enter a valid email address";
    }
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Please correct the highlighted fields", {
        description: `${Object.keys(next).length} field(s) need attention.`,
      });
      return false;
    }
    return true;
  };

  const requestClose = () => {
    if (dirty) setConfirmClose(true);
    else onOpenChange(false);
  };

  const submit = () => {
    toast.success(
      mode === "create" ? `${entity} created successfully` : `${entity} updated successfully`,
      { description: "Record published to the master data governance queue." },
    );
    setDirty(false);
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => (v ? onOpenChange(true) : requestClose())}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <SheetHeader className="border-b border-border px-6 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <SheetTitle className="truncate">
                  {mode === "create" ? `New ${entity}` : `Edit ${entity}`}
                </SheetTitle>
                <SheetDescription className="truncate">
                  {currentStep.description}
                </SheetDescription>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                {saving === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {saving === "saved" && <Check className="h-3.5 w-3.5 text-success" />}
                {saving === "saving" ? "Auto-saving…" : saving === "saved" ? "Draft saved" : ""}
              </span>
            </div>

            <ol className="mt-4 flex items-center gap-2 overflow-x-auto scroll-slim">
              {allSteps.map((s, i) => (
                <li key={s.title} className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => i < step && setStep(i)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      i === step
                        ? "border-primary bg-primary text-primary-foreground"
                        : i < step
                          ? "border-primary/30 bg-primary-soft text-accent-foreground"
                          : "border-border bg-background text-muted-foreground",
                    )}
                  >
                    <span className="num">{i < step ? <Check className="h-3 w-3" /> : i + 1}</span>
                    {s.title}
                  </button>
                  {i < allSteps.length - 1 && (
                    <span className="h-px w-4 shrink-0 bg-border" aria-hidden />
                  )}
                </li>
              ))}
            </ol>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto scroll-slim px-6 py-5">
            {!isPreview ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {currentStep.fields.map((f) => (
                  <div
                    key={f.name}
                    className={cn("space-y-1.5", f.colSpan === 2 && "sm:col-span-2")}
                  >
                    <Label htmlFor={f.name} className="text-xs font-medium">
                      {f.label}
                      {f.required && <span className="ml-0.5 text-destructive">*</span>}
                    </Label>
                    {f.type === "textarea" ? (
                      <Textarea
                        id={f.name}
                        rows={3}
                        value={values[f.name] ?? ""}
                        placeholder={f.placeholder}
                        onChange={(e) => setValue(f.name, e.target.value)}
                      />
                    ) : f.type === "select" ? (
                      <Select
                        value={values[f.name] ?? ""}
                        onValueChange={(v) => setValue(f.name, v)}
                      >
                        <SelectTrigger id={f.name}>
                          <SelectValue placeholder={f.placeholder ?? `Select ${f.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {(f.options ?? []).map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : f.type === "switch" ? (
                      <div className="flex h-9 items-center gap-3 rounded-md border border-input px-3">
                        <Switch
                          id={f.name}
                          checked={values[f.name] === "true"}
                          onCheckedChange={(v) => setValue(f.name, String(v))}
                        />
                        <span className="text-sm text-muted-foreground">
                          {values[f.name] === "true" ? "Active" : "Inactive"}
                        </span>
                      </div>
                    ) : (
                      <Input
                        id={f.name}
                        type={f.type ?? "text"}
                        value={values[f.name] ?? ""}
                        placeholder={f.placeholder}
                        onChange={(e) => setValue(f.name, e.target.value)}
                        aria-invalid={!!errors[f.name]}
                        className={cn(errors[f.name] && "border-destructive")}
                      />
                    )}
                    {errors[f.name] && (
                      <p className="text-xs text-destructive">{errors[f.name]}</p>
                    )}
                  </div>
                ))}

                {currentStep.title === "Documents" && (
                  <div className="sm:col-span-2">
                    <div className="grid place-items-center rounded-xl border border-dashed border-primary/30 bg-primary-soft/50 px-6 py-10 text-center">
                      <CloudUpload className="h-8 w-8 text-primary" />
                      <p className="mt-3 text-sm font-medium">Drop files or browse</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        PDF, DOCX, XLSX or images up to 25 MB each
                      </p>
                      <Button variant="outline" size="sm" className="mt-4">
                        <Paperclip className="h-4 w-4" /> Attach documents
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {steps.map((s) => (
                  <div key={s.title} className="surface-panel p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {s.title}
                    </p>
                    <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                      {s.fields.map((f) => (
                        <div key={f.name} className="min-w-0">
                          <dt className="text-[11px] text-muted-foreground">{f.label}</dt>
                          <dd className="truncate text-sm font-medium">
                            {values[f.name] || "—"}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border px-6 py-4">
            <Button variant="ghost" onClick={requestClose}>
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
              )}
              {!isPreview ? (
                <Button onClick={() => validateStep() && setStep(step + 1)}>
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={submit} className="shadow-[var(--shadow-primary)]">
                  <Check className="h-4 w-4" /> {mode === "create" ? "Create" : "Save changes"}
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved edits on this {entity.toLowerCase()} record. Closing now will discard
              the working draft.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setConfirmClose(false);
                setDirty(false);
                onOpenChange(false);
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
