import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Star, ShieldAlert, Bell, Check, Trash2, Archive, MoreHorizontal, ArchiveRestore, Inbox } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CartoonEmpty } from "@/components/shared/cartoon-empty";
import { StaggerFade, StaggerItem } from "@/components/shared/stagger-fade";
import { SwipeableRow } from "@/components/shared/swipeable-row";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { apiGet, apiPost, apiDelete, mapNotification, type Notification } from "@/lib/api";
import { useUnread } from "@/contexts/unread-context";

const iconMap: Record<string, React.ElementType> = {
  new_message: MessageSquare,
  new_review: Star,
  admin_action: ShieldAlert,
};

const iconBgMap: Record<string, string> = {
  new_message: "bg-blue-100 text-blue-600",
  new_review: "bg-amber-100 text-amber-600",
  admin_action: "bg-red-100 text-red-600",
};

type ViewTab = "active" | "archived";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { refresh: refreshUnread } = useUnread();
  const [active, setActive] = useState<Notification[]>([]);
  const [archived, setArchived] = useState<Notification[]>([]);
  const [view, setView] = useState<ViewTab>("active");
  const [loading, setLoading] = useState(true);

  const unreadCount = useMemo(
    () => active.filter((n) => !n.is_read).length,
    [active],
  );

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiGet<{ results: any[] }>("/notifications?archived=false&page=0&pageSize=50")
        .then((data) => setActive((data.results ?? []).map(mapNotification))),
      apiGet<{ results: any[] }>("/notifications?archived=true&page=0&pageSize=50")
        .then((data) => setArchived((data.results ?? []).map(mapNotification))),
    ])
      .catch(() => toast.error("Failed to load notifications"))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setActive((prev) => prev.map((n) => ({ ...n, is_read: true })));
    apiPost("/notifications/mark-all-read", {}).then(refreshUnread).catch(() => {});
    toast.success("All notifications marked as read");
  }, []);

  const handleToggleRead = useCallback((notif: Notification, list: "active" | "archived") => {
    apiPost("/notifications/" + notif.id + "/mark-read", {}).then(refreshUnread).catch(() => {});
    const updater = (prev: Notification[]) =>
      prev.map((n) => (n.id === notif.id ? { ...n, is_read: !n.is_read } : n));
    if (list === "active") setActive(updater);
    else setArchived(updater);
  }, []);

  const handleDelete = useCallback((notif: Notification, list: "active" | "archived") => {
    apiDelete("/notifications/" + notif.id).then(refreshUnread).catch(() => {});
    const updater = (prev: Notification[]) => prev.filter((n) => n.id !== notif.id);
    if (list === "active") setActive(updater);
    else setArchived(updater);
    toast.success("Notification deleted");
  }, []);

  const handleArchive = useCallback((notif: Notification) => {
    apiPost("/notifications/" + notif.id + "/archive", {}).then(refreshUnread).catch(() => {});
    setActive((prev) => prev.filter((n) => n.id !== notif.id));
    setArchived((prev) => [...prev, notif]);
    toast.success("Notification archived");
  }, []);

  const handleRestore = useCallback((notif: Notification) => {
    apiPost("/notifications/" + notif.id + "/restore", {}).then(refreshUnread).catch(() => {});
    setArchived((prev) => prev.filter((n) => n.id !== notif.id));
    setActive((prev) => [...prev, { ...notif, is_read: true }]);
    toast.success("Notification restored");
  }, []);

  const handleRestoreAll = useCallback(() => {
    archived.forEach((n) => apiPost("/notifications/" + n.id + "/restore", {}).then(refreshUnread).catch(() => {}));
    setActive((prev) => [...prev, ...archived.map((n) => ({ ...n, is_read: true }))]);
    setArchived([]);
    toast.success("All notifications restored");
  }, [archived]);

  const handleNotificationClick = useCallback(
    (notif: Notification) => {
      if (!notif.is_read) {
        setActive((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)),
        );
        refreshUnread();
      }
      if (notif.related_type && notif.related_id != null) {
        if (notif.related_type === "conversation") {
          navigate(`/messages/${notif.related_id}`);
        } else if (notif.related_type === "listing") {
          navigate(`/listings/${notif.related_id}`);
        } else {
          navigate(`/${notif.related_type}s/${notif.related_id}`);
        }
      }
    },
    [navigate],
  );

  const currentList = view === "active" ? active : archived;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12 4xl:max-w-4xl">
        <div className="mb-3 md:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3">
            <BackButton className="-ml-1" />
            <div>
              <h1 className="text-xl md:text-3xl font-bold tracking-tight">Notifications</h1>
              <p className="hidden sm:block mt-0.5 md:mt-1 text-xs md:text-sm text-muted-foreground">
                {view === "active" ? "Stay updated on your activity" : "Archived notifications"}
              </p>
            </div>
          </div>
          <div className="flex gap-2 sm:justify-end">
            {view === "active" && unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="active:scale-95 transition-transform w-full sm:w-auto text-xs sm:text-sm">
                Mark All as Read
              </Button>
            )}
            {view === "archived" && archived.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleRestoreAll} className="active:scale-95 transition-transform w-full sm:w-auto gap-1.5 text-xs sm:text-sm">
                <ArchiveRestore className="h-3.5 w-3.5" /> Restore All
              </Button>
            )}
          </div>
        </div>

        {/* View tabs */}
        <Tabs value={view} onValueChange={(v) => setView(v as ViewTab)} className="mb-4 md:mb-6">
          <TabsList className="h-9 w-full sm:w-auto">
            <TabsTrigger value="active" className="flex-1 sm:flex-initial gap-1.5 text-xs">
              <Inbox className="h-3.5 w-3.5" /> Active
              {active.length > 0 && (
                <span className="text-[10px] text-muted-foreground ml-0.5">({active.length})</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex-1 sm:flex-initial gap-1.5 text-xs">
              <Archive className="h-3.5 w-3.5" /> Archived
              {archived.length > 0 && (
                <span className="text-[10px] text-muted-foreground ml-0.5">({archived.length})</span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="ml-3 text-sm text-muted-foreground">Loading notifications...</span>
          </div>
        ) : currentList.length === 0 ? (
          view === "active" ? (
            <CartoonEmpty
              variant="bell"
              title="All caught up!"
              description="When someone messages you or reviews your listings, you'll see it here."
            />
          ) : (
            <CartoonEmpty
              variant="general"
              title="No archived notifications"
              description="Archive notifications to keep your inbox tidy — they'll appear here."
            />
          )
        ) : (
          <div className="rounded-xl border border-primary/5 overflow-hidden">
            <ScrollArea className="h-[calc(100vh-20rem)]">
              <StaggerFade className="space-y-0">
                {currentList.map((notif, index) => {
                  const Icon = iconMap[notif.notif_type] || Bell;

                  const swipeActions = view === "active"
                    ? [
                        notif.is_read ? {
                          label: "Unread",
                          icon: Bell,
                          onClick: () => handleToggleRead(notif, "active"),
                          className: "bg-blue-500",
                        } : {
                          label: "Read",
                          icon: Check,
                          onClick: () => handleToggleRead(notif, "active"),
                          className: "bg-blue-500",
                        },
                        {
                          label: "Archive",
                          icon: Archive,
                          onClick: () => handleArchive(notif),
                          className: "bg-amber-500",
                        },
                        {
                          label: "Delete",
                          icon: Trash2,
                          onClick: () => handleDelete(notif, "active"),
                          className: "bg-destructive",
                        },
                      ]
                    : [
                        {
                          label: "Restore",
                          icon: ArchiveRestore,
                          onClick: () => handleRestore(notif),
                          className: "bg-blue-500",
                        },
                        {
                          label: "Delete",
                          icon: Trash2,
                          onClick: () => handleDelete(notif, "archived"),
                          className: "bg-destructive",
                        },
                      ];

                  return (
                    <StaggerItem key={notif.id} index={index}>
                      <SwipeableRow
                        actions={swipeActions}
                        onTap={view === "active" ? () => handleNotificationClick(notif) : undefined}
                      >
                        <div
                          className={cn(
                            "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-accent/50 group",
                            !notif.is_read && view === "active" && "bg-accent/20",
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                              iconBgMap[notif.notif_type] || "bg-muted text-muted-foreground",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={cn(
                                  "text-sm truncate",
                                  !notif.is_read && view === "active" && "font-semibold",
                                )}
                              >
                                {notif.title}
                              </span>
                              <span className="text-xs text-muted-foreground shrink-0">
                                {formatDistanceToNow(new Date(notif.created_at), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                            {notif.body && (
                              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                {notif.body}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {!notif.is_read && view === "active" && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 opacity-100 md:opacity-0 md:group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                {view === "active" ? (
                                  <>
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleRead(notif, "active"); }}>
                                      {notif.is_read ? (
                                        <><Bell className="h-3.5 w-3.5 mr-2" /> Mark as unread</>
                                      ) : (
                                        <><Check className="h-3.5 w-3.5 mr-2" /> Mark as read</>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleArchive(notif); }}>
                                      <Archive className="h-3.5 w-3.5 mr-2" /> Archive
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onClick={(e) => { e.stopPropagation(); handleDelete(notif, "active"); }}
                                    >
                                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  </>
                                ) : (
                                  <>
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRestore(notif); }}>
                                      <ArchiveRestore className="h-3.5 w-3.5 mr-2" /> Restore
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onClick={(e) => { e.stopPropagation(); handleDelete(notif, "archived"); }}
                                    >
                                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete permanently
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </SwipeableRow>
                      {index < currentList.length - 1 && <Separator className="ml-16" />}
                    </StaggerItem>
                  );
                })}
              </StaggerFade>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
