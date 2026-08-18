import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { apiGet } from "@/lib/api";
import { useWebSocketContext } from "@/contexts/websocket-context";

interface UnreadContextType {
  totalUnread: number;
  unreadNotifications: number;
  refresh: () => void;
}

const UnreadContext = createContext<UnreadContextType | null>(null);

export function UnreadProvider({ children }: { children: ReactNode }) {
  const [totalUnread, setTotalUnread] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { subscribeUser } = useWebSocketContext();

  const refresh = useCallback(() => {
    apiGet<any[]>("/conversations")
      .then((list) => setTotalUnread(list.reduce((sum: number, c: any) => sum + c.unreadCount, 0)))
      .catch(() => {});
    apiGet<number>("/notifications/unread-count")
      .then(setUnreadNotifications)
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const unsub = subscribeUser("/queue/unread", (update: any) => {
      if (update && typeof update.unreadCount === "number") {
        refresh();
      }
    });
    return unsub;
  }, [subscribeUser, refresh]);

  return (
    <UnreadContext.Provider value={{ totalUnread, unreadNotifications, refresh }}>
      {children}
    </UnreadContext.Provider>
  );
}

export function useUnread() {
  const ctx = useContext(UnreadContext);
  if (!ctx) throw new Error("useUnread must be used within UnreadProvider");
  return ctx;
}
