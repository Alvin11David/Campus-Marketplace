import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flag, ChevronDown, ChevronUp, XCircle, Ban, MessageSquare, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose,
} from "@/components/ui/dialog";
import { CartoonEmpty } from "@/components/shared/cartoon-empty";
import { apiGet, apiPost, mapReport } from "@/lib/api";
import type { Report } from "@/lib/api";
import { toast } from "sonner";

const targetTypeStyles: Record<string, string> = {
  listing: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  review: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
  user: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
};

const reasonStyles: Record<string, string> = {
  misleading: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  inappropriate: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  scam: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  other: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  resolved: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  dismissed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const reporterNames: Record<number, string> = {
  3: "Sarah Nakato",
  5: "Peter Okello",
  1: "Richard Seko Anundu",
};

type ActionType = "dismiss" | "deactivate_listing" | "suspend_user";

interface ActionState {
  report: Report;
  action: ActionType;
  notes: string;
}

export default function AdminReports() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<Record<number, string>>({});
  const [actionTarget, setActionTarget] = useState<ActionState | null>(null);
  const [actionTab, setActionTab] = useState("all");
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    apiGet<any>(`/admin/reports?page=0&pageSize=50`)
      .then((data) => setReports((data.content ?? []).map(mapReport)))
      .catch(() => {});
  }, []);

  const filteredReports = reports.filter((r) => {
    if (actionTab === "all") return true;
    return r.status === actionTab;
  });

  async function handleAction() {
    if (!actionTarget) return;
    const { report, action, notes } = actionTarget;
    try {
      const linkedAction = action !== "dismiss"
        ? { type: action === "deactivate_listing" ? "deactivate_listing" : "suspend_user", target_id: report.target_id }
        : undefined;
      await apiPost(`/admin/reports/${report.id}/resolve`, {
        resolution: action === "dismiss" ? "dismissed" : "resolved",
        resolution_notes: notes,
        linked_action: linkedAction,
      });
      setReports((prev) =>
        prev.map((r) =>
          r.id === report.id
            ? { ...r, status: action === "dismiss" ? "dismissed" : "resolved" }
            : r
        )
      );
      if (notes.trim()) {
        setResolutionNotes((prev) => ({ ...prev, [report.id]: notes }));
      }
      const actionLabels: Record<ActionType, string> = {
        dismiss: "dismissed",
        deactivate_listing: "resolved (listing deactivated)",
        suspend_user: "resolved (user suspended)",
      };
      toast.success(`Report ${actionLabels[action]}`);
    } catch {
      toast.error("Failed to resolve report");
    }
    setActionTarget(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Moderation Queue</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and manage reported content and users
        </p>
      </div>

      <Tabs value={actionTab} onValueChange={setActionTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
        </TabsList>

        <TabsContent value={actionTab} className="mt-6">
          {filteredReports.length === 0 ? (
            <CartoonEmpty
              variant="report"
              title="All Clear"
              description={`No ${actionTab === "all" ? "" : actionTab} reports to review.`}
            />
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredReports.map((report, index) => {
                  const isExpanded = expandedId === report.id;
                  const notes = resolutionNotes[report.id];
                  return (
                    <motion.div
                      key={report.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                    >
                      <Card
                        className={cn(
                          "cursor-pointer transition-shadow hover:shadow-sm",
                          isExpanded && "shadow-md",
                        )}
                        onClick={() => setExpandedId(isExpanded ? null : report.id)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0 space-y-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={targetTypeStyles[report.target_type] ?? ""}>
                                  {report.target_type.charAt(0).toUpperCase() + report.target_type.slice(1)}
                                </Badge>
                                <Badge className={reasonStyles[report.reason] || reasonStyles.other}>
                                  {report.reason.charAt(0).toUpperCase() + report.reason.slice(1)}
                                </Badge>
                                <Badge className={statusStyles[report.status]}>
                                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                </Badge>
                              </div>
                              {report.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {report.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>
                                  Reported by {report.reporter.full_name}
                                </span>
                                <span>{new Date(report.created_at).toLocaleDateString()}</span>
                              </div>
                              {notes && (
                                <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/30 rounded-lg p-2">
                                  <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                                  <span>{notes}</span>
                                </div>
                              )}
                            </div>
                            <div className="shrink-0 mt-1">
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-4 pt-4 border-t space-y-4"
                            >
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); setActionTarget({ report, action: "dismiss", notes: resolutionNotes[report.id] || "" }); }}
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                  Dismiss
                                </Button>
                                {report.target_type === "listing" && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); setActionTarget({ report, action: "deactivate_listing", notes: resolutionNotes[report.id] || "" }); }}
                                  >
                                    <Ban className="h-3.5 w-3.5 mr-1.5" />
                                    Deactivate Listing
                                  </Button>
                                )}
                                {report.target_type === "user" && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); setActionTarget({ report, action: "suspend_user", notes: resolutionNotes[report.id] || "" }); }}
                                  >
                                    <Ban className="h-3.5 w-3.5 mr-1.5" />
                                    Suspend User
                                  </Button>
                                )}
                              </div>

                              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                                <Label htmlFor={`notes-${report.id}`}>Resolution Notes</Label>
                                <Textarea
                                  id={`notes-${report.id}`}
                                  placeholder="Add resolution notes..."
                                  value={resolutionNotes[report.id] || ""}
                                  onChange={(e) => setResolutionNotes((prev) => ({ ...prev, [report.id]: e.target.value }))}
                                />
                              </div>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!actionTarget} onOpenChange={(o) => { if (!o) setActionTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionTarget?.action === "dismiss" ? "Dismiss Report" :
               actionTarget?.action === "deactivate_listing" ? "Deactivate Listing" :
               "Suspend User"}
            </DialogTitle>
            <DialogDescription>
              {actionTarget?.action === "dismiss" && "Are you sure you want to dismiss this report? It will be marked as dismissed and no action will be taken."}
              {actionTarget?.action === "deactivate_listing" && "Are you sure you want to deactivate this listing? It will be immediately removed from the marketplace."}
              {actionTarget?.action === "suspend_user" && "Are you sure you want to suspend this user? They will be unable to access the platform until reactivated."}
            </DialogDescription>
          </DialogHeader>
          {actionTarget?.notes && (
            <div className="bg-muted/30 rounded-lg p-3 text-sm">
              <span className="font-medium text-xs text-muted-foreground block mb-1">Resolution notes:</span>
              <p className="text-muted-foreground">{actionTarget.notes}</p>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button
              variant={actionTarget?.action === "dismiss" ? "default" : "destructive"}
              onClick={handleAction}
              className="gap-2"
            >
              {actionTarget?.action === "dismiss" ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
              {actionTarget?.action === "dismiss" ? "Dismiss Report" :
               actionTarget?.action === "deactivate_listing" ? "Deactivate Listing" :
               "Suspend User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
