import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export const SUPERVISORS = [
  "V. Ramachandran — Receiving Head",
  "S. Fernandes — Warehouse Manager",
  "N. Deshpande — Procurement Lead",
];

export interface ApprovalResult {
  supervisor: string;
  code: string;
  note: string;
  at: string;
}

export function ApprovalDialog({
  open,
  onOpenChange,
  reason,
  onApprove,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  reason: string;
  onApprove: (r: ApprovalResult) => void;
}) {
  const [supervisor, setSupervisor] = useState<string>(SUPERVISORS[0]!);
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const valid = code.trim().length >= 4 && note.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Supervisor Approval Required
          </DialogTitle>
          <DialogDescription>{reason}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label className="label-xs">Approving supervisor</Label>
            <Select value={supervisor} onValueChange={setSupervisor}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPERVISORS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="label-xs">Approval code</Label>
            <Input
              className="h-9"
              placeholder="Enter 4+ digit authorisation code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="label-xs">Justification</Label>
            <Textarea
              rows={3}
              placeholder="Reason for authorising this exception"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Reject
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              onApprove({
                supervisor,
                code,
                note,
                at: new Date().toISOString(),
              });
              onOpenChange(false);
            }}
          >
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
