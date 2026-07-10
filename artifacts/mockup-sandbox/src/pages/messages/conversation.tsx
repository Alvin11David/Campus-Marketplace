import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import { BackButton } from "@/components/shared/back-button";
import {
  ArrowLeft, Send, AlertTriangle, Paperclip,
  Smile, ChevronDown, Check, CheckCheck, Copy, Reply,
  MoreHorizontal, Trash2, PartyPopper, Sparkles, Heart,
  ThumbsUp, Star, Trophy, BookOpen, Coffee, GraduationCap,
  MapPin, Sun, Moon, Flame, Music,
  File, FileText, Image as ImageIcon, X,
  Ban, Flag, User, ShieldAlert, Eraser,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartoonEmpty } from "@/components/shared/cartoon-empty";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiGet, apiPost, mapConversation, mapMessage, type Conversation, type Message } from "@/lib/api";
import { useUnread } from "@/contexts/unread-context";

// ── Emoji data ──────────────────────────────────────────────
interface EmojiCategory {
  name: string;
  icon: string;
  items: string[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: "Smileys", icon: "😊",
    items: ["😊","😂","😍","🥰","😘","😋","😎","🤩","😜","🤗","🤭","🫡","😇","🤠","🥳","🙃","😏","😌","🤓","😴","🥺","😢","😤","😈","🤡","👻","☠️"],
  },
  {
    name: "Gestures", icon: "👍",
    items: ["👍","👎","👌","✌️","🤞","🤟","🤘","🫶","🤲","🙌","👏","🤝","🙏","💪","🖐️","✋","🤚","👋","🤙","👊","🫳","🫴","👈","👉","👆","👇"],
  },
  {
    name: "Hearts", icon: "❤️",
    items: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💕","💗","💖","💘","💝","❣️","🩷","🩵","🩶","💋","💌","💑","💏","👩‍❤️‍💋‍👨"],
  },
  {
    name: "Nature", icon: "🌟",
    items: ["🌟","⭐","🔥","✨","💫","🌈","🌙","☀️","🌸","🌺","🌻","🌷","🌹","🍀","🌿","🌴","🌊","☁️","❄️","🌵","🍄","🐢","🦋","🐝","🌞"],
  },
  {
    name: "Food", icon: "🍕",
    items: ["🍕","🍔","🌮","🍜","🍣","🍩","🍪","🎂","🍫","🍿","🥤","☕","🍵","🍺","🍹","🧋","🍦","🥨","🥑","🍓","🥪","🌯","🥗","🍱","🍝"],
  },
  {
    name: "Objects", icon: "💻",
    items: ["💻","📱","🎧","⌚","📚","🎒","📷","🎵","🎮","🔧","📦","🎯","🏆","🎨","✏️","📖","🔬","🖥️","🖨️","📌","🔔","🎁","🔑","💡","📊"],
  },
];

// ── Sticker data ─────────────────────────────────────────────
interface StickerDef {
  icon: React.ElementType;
  gradient: string;
  label: string;
  emoji: string;
}

const STICKERS: StickerDef[] = [
  { icon: PartyPopper, gradient: "from-purple-500 to-pink-500", label: "Party", emoji: "🎉" },
  { icon: Sparkles, gradient: "from-amber-400 to-orange-500", label: "Amazing", emoji: "✨" },
  { icon: Heart, gradient: "from-rose-500 to-red-500", label: "Love", emoji: "❤️" },
  { icon: ThumbsUp, gradient: "from-blue-500 to-cyan-500", label: "Like", emoji: "👍" },
  { icon: Star, gradient: "from-yellow-400 to-amber-500", label: "Star", emoji: "⭐" },
  { icon: Trophy, gradient: "from-emerald-500 to-teal-500", label: "Winner", emoji: "🏆" },
  { icon: BookOpen, gradient: "from-indigo-500 to-purple-500", label: "Study", emoji: "📚" },
  { icon: Coffee, gradient: "from-amber-600 to-orange-600", label: "Coffee", emoji: "☕" },
  { icon: GraduationCap, gradient: "from-blue-600 to-indigo-600", label: "Graduate", emoji: "🎓" },
  { icon: MapPin, gradient: "from-red-500 to-rose-500", label: "Campus", emoji: "📍" },
  { icon: Sun, gradient: "from-yellow-500 to-orange-500", label: "Sunny", emoji: "☀️" },
  { icon: Moon, gradient: "from-indigo-600 to-violet-600", label: "Night", emoji: "🌙" },
  { icon: Flame, gradient: "from-red-600 to-orange-600", label: "Fire", emoji: "🔥" },
  { icon: Music, gradient: "from-pink-500 to-purple-500", label: "Music", emoji: "🎵" },
  { icon: Smile, gradient: "from-green-400 to-emerald-500", label: "Happy", emoji: "😊" },
  { icon: ArrowLeft, gradient: "from-teal-400 to-cyan-500", label: "Welcome", emoji: "👋" },
];

// ── Helpers ──────────────────────────────────────────────────
function getInitials(name: string) {
  return name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDateSeparator(date: Date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMM d");
}

function shouldShowDateSeparator(msgs: Message[], index: number): boolean {
  if (index === 0) return true;
  const curr = new Date(msgs[index].created_at);
  const prev = new Date(msgs[index - 1].created_at);
  return (
    curr.getFullYear() !== prev.getFullYear() ||
    curr.getMonth() !== prev.getMonth() ||
    curr.getDate() !== prev.getDate()
  );
}

function shouldGroupWithPrevious(msgs: Message[], index: number): boolean {
  if (index === 0) return false;
  const curr = msgs[index];
  const prev = msgs[index - 1];
  const currTime = new Date(curr.created_at).getTime();
  const prevTime = new Date(prev.created_at).getTime();
  return curr.sender_id === prev.sender_id && currTime - prevTime < 300000;
}

// ── EmojiPicker component ────────────────────────────────────
function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [activeTab, setActiveTab] = useState<"emojis" | "stickers">("emojis");
  const [emojiCategory, setEmojiCategory] = useState(0);

  return (
    <div className="w-[22rem] p-0 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-primary/5">
        <button
          onClick={() => setActiveTab("emojis")}
          className={cn(
            "flex-1 px-3 py-2.5 text-xs font-medium transition-colors relative",
            activeTab === "emojis" ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Emojis
          {activeTab === "emojis" && (
            <motion.div layoutId="picker-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("stickers")}
          className={cn(
            "flex-1 px-3 py-2.5 text-xs font-medium transition-colors relative",
            activeTab === "stickers" ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Stickers
          {activeTab === "stickers" && (
            <motion.div layoutId="picker-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Emoji tab */}
      {activeTab === "emojis" && (
        <div>
          {/* Sub-category tabs */}
          <div className="flex gap-0.5 px-2 py-2 overflow-x-auto border-b border-primary/5">
            {EMOJI_CATEGORIES.map((cat, i) => (
              <button
                key={cat.name}
                onClick={() => setEmojiCategory(i)}
                className={cn(
                  "h-8 w-8 shrink-0 flex items-center justify-center rounded-lg text-base transition-all",
                  i === emojiCategory
                    ? "bg-primary/10 scale-110"
                    : "hover:bg-accent",
                )}
                title={cat.name}
              >
                {cat.icon}
              </button>
            ))}
          </div>
          {/* Emoji grid */}
          <div className="h-52 overflow-y-auto p-2">
            <div className="grid grid-cols-8 gap-0.5">
              {EMOJI_CATEGORIES[emojiCategory].items.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onSelect(emoji)}
                  className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-accent text-xl active:scale-90 transition-all"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sticker tab */}
      {activeTab === "stickers" && (
        <div className="p-3">
          <p className="text-[11px] font-medium text-muted-foreground mb-3">Campus Pack</p>
          <div className="grid grid-cols-4 gap-3">
            {STICKERS.map((sticker) => {
              const Icon = sticker.icon;
              return (
                <button
                  key={sticker.label}
                  type="button"
                  onClick={() => onSelect(sticker.emoji + " " + sticker.label + "!")}
                  className="group flex flex-col items-center gap-1 active:scale-90 transition-all"
                  title={sticker.label}
                >
                  <div className={cn(
                    "h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-sm",
                    "group-hover:shadow-md group-hover:scale-105 transition-all",
                    sticker.gradient,
                  )}>
                    <Icon className="h-6 w-6 text-white drop-shadow-sm" />
                  </div>
                  <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                    {sticker.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { refresh: refreshUnread } = useUnread();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [listingUnavailable, setListingUnavailable] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [pendingFile, setPendingFile] = useState<{ file: File; preview: string } | null>(null);

  const [blocked, setBlocked] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [convLoaded, setConvLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setConvLoaded(false);
    setConversation(null);
    setMessages([]);
    setListingUnavailable(false);

    Promise.all([
      apiGet<any[]>("/conversations").then((list) => {
        const found = list.find((c) => c.id === Number(id));
        if (found && !cancelled) setConversation(mapConversation(found));
      }),
      apiGet<any[]>("/conversations/" + id + "/messages").then((list) => {
        if (!cancelled) {
          setMessages(
            list.map((m) => ({
              ...mapMessage(m),
              conversation_id: Number(id),
            }))
          );
        }
      }),
    ])
      .catch(() => {
        if (!cancelled) setConversation(null);
      })
      .finally(() => {
        if (!cancelled) setConvLoaded(true);
      });

    apiPost("/conversations/" + id + "/mark-read", {}).then(refreshUnread).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [id, user?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!newMessage.trim()) {
      setIsTyping(false);
      return;
    }
    setIsTyping(true);
    const timer = setTimeout(() => setIsTyping(false), 1500);
    return () => clearTimeout(timer);
  }, [newMessage]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
    setShowScrollBtn(!isNearBottom);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPendingFile({ file, preview: ev.target?.result as string });
    };
    if (file.type.startsWith("image/")) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsDataURL(file.slice(0, 100));
      setPendingFile({ file, preview: "" });
    }
    e.target.value = "";
  }, []);

  const clearPendingFile = useCallback(() => {
    setPendingFile(null);
  }, []);

  const handleSend = async () => {
    if ((!newMessage.trim() && !pendingFile) || !user || !conversation || !id) return;

    let body = newMessage.trim();
    if (pendingFile) {
      const f = pendingFile.file;
      const isImage = f.type.startsWith("image/");
      const label = isImage ? `📷 ${f.name}` : `📎 ${f.name}`;
      body = body ? `${body}\n${label}` : label;
    }

    try {
      const created = await apiPost<any>("/conversations/" + id + "/messages", { body });
      const msg: Message = {
        ...mapMessage(created),
        conversation_id: Number(id),
      };
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
      setPendingFile(null);
      setReplyTo(null);
      setIsTyping(false);
      setTimeout(scrollToBottom, 50);
      refreshUnread();
      toast.success("Message sent");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const handleReply = (msg: Message) => {
    setReplyTo(msg);
    inputRef.current?.focus();
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {}
  };

  const cancelReply = () => setReplyTo(null);

  const handleClearChat = () => {
    setMessages([]);
    setClearDialogOpen(false);
    toast.success("Chat cleared");
  };

  const handleDeleteConversation = () => {
    setDeleteDialogOpen(false);
    toast.success("Conversation deleted");
    navigate("/messages");
  };

  const handleBlockUser = () => {
    setBlocked((prev) => !prev);
    toast.success(blocked ? "User unblocked" : "User blocked");
  };

  const handleReportUser = () => {
    toast.success("Report submitted", { description: "We'll review this shortly." });
  };

  if (!convLoaded) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-3 text-sm text-muted-foreground">Loading conversation...</span>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <BackButton fallback="/messages" label="Back to Messages" className="mb-6" />
        
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium">Conversation not found</p>
          <p className="text-sm text-muted-foreground mt-1">
            This conversation may have been deleted or doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const initials = getInitials(conversation.other_participant.full_name);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-primary/5 px-4 py-3 shrink-0 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <BackButton fallback="/messages" label="Back to Messages" showLabel={false} className="-ml-0.5 px-1.5" />
        <Link to={`/profile/${conversation.other_participant.id}`} className="flex items-center gap-3 flex-1 min-w-0 group">
          <div className="relative shrink-0">
            <Avatar className="h-9 w-9 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
              <AvatarImage src={conversation.other_participant.profile_photo_url || undefined} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
              {conversation.other_participant.full_name}
            </p>
            <p className="text-[11px] text-emerald-500 font-medium">Online</p>
          </div>
        </Link>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground active:scale-90 transition-transform">
            <Paperclip className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground active:scale-90 transition-transform">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/profile/${conversation.other_participant.id}`)}>
                <User className="h-4 w-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setClearDialogOpen(true)}>
                <Eraser className="h-4 w-4 mr-2" />
                Clear Chat
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={handleBlockUser}>
                <Ban className={cn("h-4 w-4 mr-2", blocked && "text-destructive")} />
                {blocked ? "Unblock User" : "Block User"}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={handleReportUser}>
                <Flag className="h-4 w-4 mr-2" />
                Report User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                <span className="text-destructive">Delete Conversation</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Clear Chat Dialog */}
        <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Clear conversation?</DialogTitle>
              <DialogDescription>
                This will remove all messages from this conversation.
                {conversation.other_participant.full_name} will still have their copy.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 pt-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleClearChat}>
                <Eraser className="h-4 w-4 mr-2" /> Clear Messages
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Conversation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete conversation?</DialogTitle>
              <DialogDescription>
                This will permanently delete this conversation for you.
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 pt-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleDeleteConversation}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {listingUnavailable && (
        <Alert variant="destructive" className="mx-4 mt-2 mb-0 rounded-xl border-destructive/20 py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm">Listing no longer available</AlertTitle>
          <AlertDescription className="text-xs">
            This listing has been removed or is no longer active.
          </AlertDescription>
        </Alert>
      )}

      {/* Messages area */}
      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 relative"
        onScroll={handleScroll}
      >
        <div className="px-4 py-4 space-y-1 max-w-2xl mx-auto">
          {messages.length === 0 ? (
            <CartoonEmpty
              variant="message"
              title="No messages yet"
              description="Send a message to start the conversation"
            />
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => {
                const isSent = msg.sender_id === user?.id;
                const showDate = shouldShowDateSeparator(messages, idx);
                const grouped = shouldGroupWithPrevious(messages, idx);
                const isLastInGroup = idx === messages.length - 1 || messages[idx + 1].sender_id !== msg.sender_id;
                const isConsecutiveSent = idx < messages.length - 1 && messages[idx + 1].sender_id === msg.sender_id;

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="flex items-center justify-center py-3">
                        <span className="text-[11px] font-medium text-muted-foreground/60 bg-muted/50 px-3 py-1 rounded-full">
                          {formatDateSeparator(new Date(msg.created_at))}
                        </span>
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "flex gap-2 px-1",
                        isSent ? "justify-end" : "justify-start",
                        grouped && "mt-0.5",
                        !grouped && "mt-2",
                      )}
                    >
                      {!isSent && (
                        <div className={cn("w-7 shrink-0", grouped && "invisible")}>
                          {!grouped && (
                            <Avatar className="h-7 w-7 ring-1 ring-border">
                              <AvatarImage
                                src={conversation.other_participant.profile_photo_url || undefined}
                              />
                              <AvatarFallback className="text-[9px]">{initials}</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      )}

                      <div className={cn("flex flex-col", isSent ? "items-end" : "items-start", "max-w-[75%]")}>
                        <div className="group relative">
                          <div
                            className={cn(
                              "relative px-3.5 py-2 text-sm leading-relaxed shadow-sm transition-shadow hover:shadow-md",
                              isSent
                                ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
                                : "bg-card text-card-foreground rounded-2xl rounded-bl-md border border-primary/5",
                              grouped && "rounded-tr-md rounded-br-md",
                              grouped && isSent && isLastInGroup && "rounded-br-md",
                              grouped && !isSent && isLastInGroup && "rounded-bl-md",
                            )}
                          >
                            {msg.body}
                          </div>

                          <div className={cn(
                            "absolute top-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
                            isSent ? "-left-12" : "-right-12",
                          )}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-full bg-background shadow-sm border border-primary/5"
                              onClick={() => handleReply(msg)}
                            >
                              <Reply className="h-3 w-3" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-full bg-background shadow-sm border border-primary/5"
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align={isSent ? "end" : "start"} className="w-36">
                                <DropdownMenuItem className="cursor-pointer text-xs" onClick={() => handleCopy(msg.body)}>
                                  <Copy className="h-3.5 w-3.5 mr-2" /> Copy
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-xs" onClick={() => handleReply(msg)}>
                                  <Reply className="h-3.5 w-3.5 mr-2" /> Reply
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className={cn(
                          "flex items-center gap-1 mt-0.5 px-1",
                          isConsecutiveSent && isSent ? "invisible" : "",
                        )}>
                          <span className="text-[10px] text-muted-foreground/60">
                            {format(new Date(msg.created_at), "h:mm a")}
                          </span>
                          {isSent && (
                            <span className="text-[10px]">
                              {msg.is_read ? (
                                <CheckCheck className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Check className="h-3 w-3 text-muted-foreground/40" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </AnimatePresence>
          )}

          <AnimatePresence>
            {isTyping && messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex gap-2 justify-start px-1 mt-2"
              >
                <div className="w-7 shrink-0">
                  <Avatar className="h-7 w-7 ring-1 ring-border">
                    <AvatarFallback className="text-[9px]">{initials}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-card border border-primary/5">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={scrollRef} />
        </div>

        <AnimatePresence>
          {showScrollBtn && messages.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToBottom}
              className="absolute bottom-4 right-6 h-9 w-9 rounded-full bg-primary shadow-lg shadow-primary/25 flex items-center justify-center text-primary-foreground hover:shadow-xl hover:shadow-primary/30 active:scale-90 transition-all"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </ScrollArea>

      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="border-t border-primary/5 px-4 py-2 bg-accent/30"
          >
            <div className="flex items-center gap-2 max-w-2xl mx-auto">
              <div className="h-8 w-0.5 rounded-full bg-primary/40 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-primary">Replying to {replyTo.sender_id === user?.id ? "yourself" : conversation.other_participant.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{replyTo.body}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={cancelReply}>
                <ArrowLeft className="h-3 w-3 rotate-45" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Attachment preview */}
      <AnimatePresence>
        {pendingFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="border-t border-primary/5 px-4 py-2 bg-accent/30"
          >
            <div className="flex items-center gap-3 max-w-2xl mx-auto">
              {pendingFile.file.type.startsWith("image/") && pendingFile.preview ? (
                <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-muted">
                  <img src={pendingFile.preview} alt="" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center shrink-0">
                  {pendingFile.file.type.startsWith("image/") ? (
                    <ImageIcon className="h-5 w-5 text-primary/60" />
                  ) : (
                    <FileText className="h-5 w-5 text-primary/60" />
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{pendingFile.file.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {(pendingFile.file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={clearPendingFile}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blocked banner */}
      <AnimatePresence>
        {blocked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-destructive/10 px-4 py-2.5 bg-destructive/5"
          >
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <div className="flex items-center gap-2 text-sm text-destructive">
                <Ban className="h-4 w-4" />
                <span>You blocked {conversation.other_participant.full_name}</span>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={handleBlockUser}>
                Unblock
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="border-t border-primary/5 px-4 py-3 shrink-0 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent active:scale-90 transition-all"
              >
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" className="w-auto p-0 border-primary/10 shadow-xl">
              <EmojiPicker onSelect={addEmoji} />
            </PopoverContent>
          </Popover>

          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={blocked ? "You can't send messages to a blocked user" : "Type a message..."}
              disabled={blocked}
              className="h-10 pr-10 bg-muted/50 focus:bg-background transition-all rounded-xl"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground active:scale-90 transition-all"
              onClick={handleAttachClick}
              disabled={blocked}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>

          <Button
            size="icon"
            className={cn(
              "h-10 w-10 shrink-0 transition-all active:scale-90",
              (newMessage.trim() || pendingFile) && !blocked
                ? "shadow-lg shadow-primary/25"
                : "opacity-50"
            )}
            onClick={handleSend}
            disabled={(!newMessage.trim() && !pendingFile) || blocked}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
