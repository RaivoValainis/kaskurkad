import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  createRoomSchema, 
  joinRoomSchema, 
  submitAnswerSchema,
  WS_EVENTS,
  type WSMessage 
} from "@shared/schema";

interface ExtendedWebSocket extends WebSocket {
  roomCode?: string;
  playerId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const broadcast = (roomCode: string, message: WSMessage) => {
    wss.clients.forEach((client) => {
      const wsClient = client as ExtendedWebSocket;
      if (wsClient.readyState === WebSocket.OPEN && wsClient.roomCode === roomCode) {
        wsClient.send(JSON.stringify(message));
      }
    });
  };

  wss.on('connection', (ws: ExtendedWebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.event === 'JOIN_ROOM' && data.data) {
          const { code, playerId } = data.data;
          ws.roomCode = code;
          ws.playerId = playerId;
          
          const room = await storage.getRoom(code);
          if (room) {
            ws.send(JSON.stringify({
              event: WS_EVENTS.ROOM_UPDATED,
              data: room,
            }));
          }
        }
        
        if (data.event === 'REJOIN_ROOM' && data.data) {
          const { code, playerId } = data.data;
          ws.roomCode = code;
          ws.playerId = playerId;
          
          const room = await storage.getRoom(code);
          if (room) {
            ws.send(JSON.stringify({
              event: WS_EVENTS.ROOM_UPDATED,
              data: room,
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', async () => {
      console.log('WebSocket client disconnected');
      if (ws.roomCode && ws.playerId) {
        const room = await storage.removePlayer(ws.roomCode, ws.playerId);
        if (room) {
          broadcast(ws.roomCode, {
            event: WS_EVENTS.ROOM_UPDATED,
            data: room,
          });
        }
      }
    });
  });

  app.post("/api/rooms/create", async (req, res) => {
    try {
      const data = createRoomSchema.parse(req.body);
      const { room, playerId } = await storage.createRoom(data.playerName);
      
      res.json({ code: room.code, playerId, room });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Neizdevās izveidot istabu" });
    }
  });

  app.post("/api/rooms/join", async (req, res) => {
    try {
      const data = joinRoomSchema.parse(req.body);
      const { room, playerId } = await storage.joinRoom(data.code, data.playerName);
      
      broadcast(room.code, {
        event: WS_EVENTS.ROOM_UPDATED,
        data: room,
      });
      
      res.json({ playerId, room });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Neizdevās pievienoties istabai" });
    }
  });

  app.post("/api/rooms/start", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ message: "Istabas kods ir nepieciešams" });
      }

      const room = await storage.startGame(code);
      
      broadcast(room.code, {
        event: WS_EVENTS.GAME_STARTED,
        data: room,
      });

      broadcast(room.code, {
        event: WS_EVENTS.ROOM_UPDATED,
        data: room,
      });
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Neizdevās sākt spēli" });
    }
  });

  app.post("/api/answers/submit", async (req, res) => {
    try {
      const data = submitAnswerSchema.parse(req.body);
      const { room, allSubmitted } = await storage.submitAnswer(data.roomCode, data.playerId, {
        playerId: data.playerId,
        questionIndex: data.questionIndex,
        answer: data.answer,
      });
      
      broadcast(room.code, {
        event: WS_EVENTS.ROOM_UPDATED,
        data: room,
      });
      
      if (allSubmitted) {
        const updatedRoom = storage.generateResults(room.code);
        broadcast(updatedRoom.code, {
          event: WS_EVENTS.RESULTS_READY,
          data: updatedRoom,
        });
        broadcast(updatedRoom.code, {
          event: WS_EVENTS.ROOM_UPDATED,
          data: updatedRoom,
        });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Neizdevās iesniegt atbildi" });
    }
  });

  app.post("/api/rooms/new-game", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ message: "Istabas kods ir nepieciešams" });
      }

      const room = await storage.startNewGame(code);
      
      broadcast(room.code, {
        event: WS_EVENTS.ROOM_UPDATED,
        data: room,
      });
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Neizdevās sākt jaunu spēli" });
    }
  });

  return httpServer;
}
