import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import type { WSMessage, Room } from "@shared/schema";

interface WebSocketContextType {
  socket: WebSocket | null;
  connected: boolean;
  room: Room | null;
  playerId: string | null;
  sendMessage: (message: WSMessage) => void;
  joinRoom: (code: string, playerId: string) => void;
  leaveRoom: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const currentRoomCodeRef = useRef<string | null>(null);
  const currentPlayerIdRef = useRef<string | null>(null);

  const connect = () => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnected(true);
      setSocket(ws);
      
      if (currentRoomCodeRef.current && currentPlayerIdRef.current) {
        ws.send(JSON.stringify({
          event: "JOIN_ROOM",
          data: { 
            code: currentRoomCodeRef.current,
            playerId: currentPlayerIdRef.current
          }
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        
        if (message.event === "ROOM_UPDATED" && message.data) {
          setRoom(message.data);
        } else if (message.event === "RESULTS_READY" && message.data) {
          setRoom(message.data);
        } else if (message.event === "GAME_STARTED" && message.data) {
          setRoom(message.data);
        } else if (message.event === "ERROR") {
          console.error("WebSocket error:", message.data);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      setSocket(null);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 2000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return ws;
  };

  useEffect(() => {
    const ws = connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      ws.close();
    };
  }, []);

  const sendMessage = (message: WSMessage) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  };

  const joinRoom = (code: string, playerIdValue: string) => {
    currentRoomCodeRef.current = code;
    currentPlayerIdRef.current = playerIdValue;
    setPlayerId(playerIdValue);
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        event: "JOIN_ROOM",
        data: { code, playerId: playerIdValue }
      }));
    }
  };

  const leaveRoom = () => {
    currentRoomCodeRef.current = null;
    currentPlayerIdRef.current = null;
    setPlayerId(null);
    setRoom(null);
  };

  return (
    <WebSocketContext.Provider value={{ 
      socket, 
      connected, 
      room, 
      playerId,
      sendMessage,
      joinRoom,
      leaveRoom
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
}
