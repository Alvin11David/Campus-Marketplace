import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const REPORT_REASONS: Record<string, string[]> = {
  listing: ["misleading", "inappropriate", "spam", "duplicate", "rule_violation"],
  review: ["fake_review", "offensive", "spam", "conflict_of_interest"],
  user: ["scam", "harassment", "impersonation", "inappropriate_behavior"],
};

const REASON_LABELS: Record<string, string> = {
  misleading: "Misleading description or price",
  inappropriate: "Inappropriate content",
  spam: "Spam or irrelevant",
  duplicate: "Duplicate listing",
  rule_violation: "Violates platform rules",
  fake_review: "Fake or incentivized review",
  offensive: "Offensive or abusive language",
  conflict_of_interest: "Conflict of interest (review by competitor)",
  scam: "Scam or fraudulent activity",
  harassment: "Harassment or bullying",
  impersonation: "Impersonation or fake identity",
  inappropriate_behavior: "Inappropriate behavior",
};

interface ReportDialogProps {
  targetType: "listing" | "review" | "user";
  targetId: number;
  targetLabel: string;
  trigger?: React.ReactNode;
}

export function ReportDialog({ targetType, targetId, targetLabel, trigger }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reasons = REPORT_REASONS[targetType] || REPORT_REASONS.listing;

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setOpen(false);
    setReason("");
    setDescription("");
    toast.success("Report submitted", {
      description: "Thank you. Our moderation team will review this content.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs text-muted-foreground">
            <Flag className="h-3.5 w-3.5" /> Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this {targetType}</DialogTitle>
          <DialogDescription>
            Let us know why you're reporting this {targetType}. Your report is anonymous.
            <span className="block mt-1 font-medium text-foreground">{targetLabel}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Reason for report</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {reasons.map((r) => (
                <div key={r} className="flex items-center gap-2">
                  <RadioGroupItem value={r} id={`reason-${r}`} />
                  <Label htmlFor={`reason-${r}`} className="text-sm font-normal cursor-pointer">
                    {REASON_LABELS[r] || r}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="report-desc">Additional details (optional)</Label>
            <Textarea
              id="report-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional context..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!reason || submitting}>
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
