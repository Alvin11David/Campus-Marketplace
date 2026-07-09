import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Search, CheckCheck, Check, Trash2, Mail, MoreHorizontal, Archive } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartoonEmpty } from "@/components/shared/cartoon-empty";
import { StaggerFade, StaggerItem } from "@/components/shared/stagger-fade";
import { SwipeableRow } from "@/components/shared/swipeable-row";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { apiGet, apiPost, mapConversation, type Conversation } from "@/lib/api";

function getInitials(name: string) {
  return name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function MessagesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const filtered = useMemo(
    () =>
      conversations.filter((c) =>
        c.other_participant.full_name.toLowerCase().includes(search.toLowerCase()) ||
        c.listing_title.toLowerCase().includes(search.toLowerCase())
      ),
    [search, conversations]
  );

  useEffect(() => {
    setLoading(true);
    apiGet<any[]>("/conversations")
      .then((data) => setConversations(data.map(mapConversation)))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (conv: Conversation) => {
    setConversations((prev) => prev.filter((c) => c.id !== conv.id));
    toast.success("Conversation deleted");
  };

  const handleMarkRead = (conv: Conversation) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conv.id ? { ...c, unread_count: 0 } : c
      )
    );
    toast.success(conv.unread_count > 0 ? "Marked as read" : "Marked as unread");
  };

  const handleToggleRead = (conv: Conversation) => {
    const wasUnread = conv.unread_count > 0;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conv.id
          ? { ...c, unread_count: wasUnread ? 0 : 1 }
          : c
      )
    );
    if (wasUnread) {
      apiPost(`/conversations/${conv.id}/mark-read`, {}).catch(() => {});
    }
  };

  const handleArchive = (conv: Conversation) => {
    setConversations((prev) => prev.filter((c) => c.id !== conv.id));
    toast.success("Conversation archived");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12 4xl:max-w-4xl">
        <div className="mb-6 flex items-center gap-3">
          <BackButton className="-ml-1" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
            <p className="mt-1 text-muted-foreground">
              Your conversations with sellers and buyers
            </p>
          </div>
        </div>

        <div className="relative mb-4 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="pl-9 h-10 bg-muted/50 focus:bg-background transition-all"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="ml-3 text-sm text-muted-foreground">Loading conversations...</span>
          </div>
        ) : filtered.length === 0 ? (
          search ? (
            <CartoonEmpty
              variant="search"
              title="No conversations match"
              description="Try a different name or listing title."
            />
          ) : (
            <CartoonEmpty
              variant="mailbox"
              title="No conversations yet"
              description="When you message a seller or a buyer messages you, your conversations will appear here."
              action={<Button asChild variant="outline" size="sm"><Link to="/search">Browse Listings</Link></Button>}
            />
          )
        ) : (
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <StaggerFade className="space-y-1">
              {filtered.map((conv, i) => {
                const initials = getInitials(conv.other_participant.full_name);

                const swipeActions = [
                  {
                    label: conv.unread_count > 0 ? "Read" : "Unread",
                    icon: conv.unread_count > 0 ? Check : Mail,
                    onClick: () => handleToggleRead(conv),
                    className: "bg-blue-500",
                  },
                  {
                    label: "Archive",
                    icon: Archive,
                    onClick: () => handleArchive(conv),
                    className: "bg-amber-500",
                  },
                  {
                    label: "Delete",
                    icon: Trash2,
                    onClick: () => handleDelete(conv),
                    className: "bg-destructive",
                  },
                ];

                return (
                  <StaggerItem key={conv.id} index={i}>
                    <SwipeableRow
                      actions={swipeActions}
                      onTap={() => navigate(`/messages/${conv.id}`)}
                    >
                      <div
                        className={cn(
                          "flex items-start gap-3 rounded-xl p-4 transition-all duration-200 group",
                          "hover:bg-accent/50 hover:shadow-sm border border-transparent hover:border-primary/5",
                          conv.unread_count > 0 && "bg-accent/30 border-primary/10",
                        )}
                      >
                        <div className="relative shrink-0">
                          <Avatar className={cn("h-10 w-10 ring-1", conv.unread_count > 0 ? "ring-primary/20" : "ring-border")}>
                            <AvatarImage src={conv.other_participant.profile_photo_url || undefined} />
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={cn(
                                "text-sm truncate",
                                conv.unread_count > 0 && "font-semibold",
                              )}
                            >
                              {conv.other_participant.full_name}
                            </span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            Re: {conv.listing_title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {conv.unread_count === 0 ? (
                              <CheckCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                            )}
                            <p
                              className={cn(
                                "text-sm truncate",
                                conv.unread_count > 0 ? "font-medium" : "text-muted-foreground",
                              )}
                            >
                              {conv.last_message_preview}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {conv.unread_count > 0 && (
                            <Badge className="h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full text-[10px] font-bold">
                              {conv.unread_count}
                            </Badge>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 md:opacity-0 md:group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleRead(conv); }}>
                                {conv.unread_count > 0 ? (
                                  <><Check className="h-3.5 w-3.5 mr-2" /> Mark as read</>
                                ) : (
                                  <><Mail className="h-3.5 w-3.5 mr-2" /> Mark as unread</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleArchive(conv); }}>
                                <Archive className="h-3.5 w-3.5 mr-2" /> Archive
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => { e.stopPropagation(); handleDelete(conv); }}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </SwipeableRow>
                  </StaggerItem>
                );
              })}
            </StaggerFade>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
