import { createContext, useContext, useCallback, type ReactNode } from "react";
import { useWebSocket as useWebSocketHook } from "@/hooks/useWebSocket";

interface WebSocketContextType {
  isConnected: boolean;
  subscribe: (topic: string, handler: (message: any) => void) => () => void;
  subscribeUser: (destination: string, handler: (message: any) => void) => () => void;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { isConnected, subscribe, subscribeUser, reconnect } = useWebSocketHook();

  return (
    <WebSocketContext.Provider value={{ isConnected, subscribe, subscribeUser, reconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("useWebSocketContext must be used within WebSocketProvider");
  return ctx;
}
