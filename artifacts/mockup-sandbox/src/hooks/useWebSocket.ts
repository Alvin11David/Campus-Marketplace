import { useCallback, useEffect, useRef, useState } from "react";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? "http://localhost:8080";
const WS_URL = `${API_ORIGIN}/ws`;

type MessageHandler = (message: any) => void;

interface Subscription {
  unsubscribe: () => void;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<any>(null);
  const subscriptionsRef = useRef<Map<string, Subscription>>(new Map());
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  const connect = useCallback(() => {
    const token = localStorage.getItem("cm_token");
    if (!token || clientRef.current?.connected) return;

    if (typeof global === "undefined") (window as any).global = window;
    import("sockjs-client").then(({ default: SockJS }) => {
      import("stompjs").then(({ default: Stomp }) => {
        const socket = new SockJS(`${WS_URL}?token=${token}`, null, { transports: ['websocket'] });
        const client = Stomp.over(socket);

        client.debug = null;
        client.heartbeat.outgoing = 20000;
        client.heartbeat.incoming = 20000;

        client.connect(
          {},
          () => {
            setIsConnected(true);
            reconnectAttemptsRef.current = 0;

            subscriptionsRef.current.forEach((sub, topic) => {
              sub.unsubscribe();
            });
            subscriptionsRef.current.clear();
          },
          (error: any) => {
            console.error("WebSocket connection error:", error);
            setIsConnected(false);
            clientRef.current = null;
            scheduleReconnect();
          }
        );

        clientRef.current = client;
      });
    }).catch((err) => {
      console.error("Failed to load WebSocket libraries:", err);
      scheduleReconnect();
    });
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.warn("Max WebSocket reconnect attempts reached");
      return;
    }

    const delay = Math.min(3000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
    reconnectAttemptsRef.current++;

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect]);

  const subscribe = useCallback((topic: string, handler: MessageHandler) => {
    if (!clientRef.current?.connected) {
      return () => {};
    }

    const existing = subscriptionsRef.current.get(topic);
    if (existing) {
      existing.unsubscribe();
    }

    const sub = clientRef.current.subscribe(topic, (message: any) => {
      try {
        const payload = JSON.parse(message.body);
        handler(payload);
      } catch {
        handler(message.body);
      }
    });

    subscriptionsRef.current.set(topic, sub);

    return () => {
      sub.unsubscribe();
      subscriptionsRef.current.delete(topic);
    };
  }, []);

  const subscribeUser = useCallback((destination: string, handler: MessageHandler) => {
    return subscribe(`/user${destination}`, handler);
  }, [subscribe]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
    subscriptionsRef.current.clear();

    if (clientRef.current?.connected) {
      clientRef.current.disconnect();
    }
    clientRef.current = null;
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    subscribe,
    subscribeUser,
    disconnect,
    reconnect: connect,
  };
}
