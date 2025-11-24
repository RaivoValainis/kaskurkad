import { 
  type Room, 
  type Player, 
  type Answer,
  type InsertPlayer,
  type InsertAnswer,
  GameState,
  QUESTIONS
} from "@shared/schema";
import { randomInt } from "crypto";

export interface IStorage {
  createRoom(creatorName: string): Promise<{ room: Room; playerId: string }>;
  getRoom(code: string): Promise<Room | undefined>;
  joinRoom(code: string, playerName: string): Promise<{ room: Room; playerId: string }>;
  startGame(code: string): Promise<Room>;
  submitAnswer(code: string, playerId: string, answer: InsertAnswer): Promise<Room>;
  generateResults(code: string): Promise<Room>;
  startNewGame(code: string): Promise<Room>;
  removePlayer(code: string, playerId: string): Promise<Room | undefined>;
}

export class MemStorage implements IStorage {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map();
  }

  private generateRoomCode(): string {
    let code: string;
    do {
      code = Array.from({ length: 6 }, () => 
        String.fromCharCode(65 + randomInt(0, 26))
      ).join('');
    } while (this.rooms.has(code));
    return code;
  }

  private generatePlayerId(): string {
    return `player_${Date.now()}_${randomInt(0, 10000)}`;
  }

  async createRoom(creatorName: string): Promise<{ room: Room; playerId: string }> {
    const code = this.generateRoomCode();
    const playerId = this.generatePlayerId();
    
    const creator: Player = {
      id: playerId,
      name: creatorName,
      isCreator: true,
      hasSubmitted: false,
    };

    const room: Room = {
      code,
      creatorId: playerId,
      players: [creator],
      gameState: GameState.LOBBY,
      answers: [],
      currentQuestion: null,
      mixedResults: null,
    };

    this.rooms.set(code, room);
    return { room, playerId };
  }

  async getRoom(code: string): Promise<Room | undefined> {
    return this.rooms.get(code);
  }

  async joinRoom(code: string, playerName: string): Promise<{ room: Room; playerId: string }> {
    const room = this.rooms.get(code);
    if (!room) {
      throw new Error("Istaba nav atrasta");
    }

    if (room.gameState !== GameState.LOBBY) {
      throw new Error("Nevar pievienoties - spēle jau ir sākusies");
    }

    const playerId = this.generatePlayerId();
    const player: Player = {
      id: playerId,
      name: playerName,
      isCreator: false,
      hasSubmitted: false,
    };

    room.players.push(player);
    this.rooms.set(code, room);
    
    return { room, playerId };
  }

  async startGame(code: string): Promise<Room> {
    const room = this.rooms.get(code);
    if (!room) {
      throw new Error("Istaba nav atrasta");
    }

    if (room.players.length < 2) {
      throw new Error("Nepieciešami vismaz 2 spēlētāji");
    }

    room.gameState = GameState.PLAYING;
    room.currentQuestion = 0;
    room.answers = [];
    room.mixedResults = null;
    room.players.forEach(p => p.hasSubmitted = false);

    this.rooms.set(code, room);
    return room;
  }

  async submitAnswer(code: string, playerId: string, answer: InsertAnswer): Promise<{ room: Room; allSubmitted: boolean }> {
    const room = this.rooms.get(code);
    if (!room) {
      throw new Error("Istaba nav atrasta");
    }

    room.answers.push(answer);

    const playerAnswersCount = room.answers.filter(a => a.playerId === playerId).length;
    if (playerAnswersCount === QUESTIONS.length) {
      const player = room.players.find(p => p.id === playerId);
      if (player) {
        player.hasSubmitted = true;
      }
    }

    const allSubmitted = room.players.every(p => p.hasSubmitted);
    
    this.rooms.set(code, room);
    return { room, allSubmitted };
  }

  generateResults(code: string): Room {
    const room = this.rooms.get(code);
    if (!room) {
      throw new Error("Istaba nav atrasta");
    }

    const playerCount = room.players.length;
    const mixedResults: string[][] = [];

    for (let setIndex = 0; setIndex < playerCount; setIndex++) {
      const storySet: string[] = [];
      
      for (let questionIndex = 0; questionIndex < QUESTIONS.length; questionIndex++) {
        const answersForQuestion = room.answers.filter(
          a => a.questionIndex === questionIndex
        );
        
        const sourcePlayerIndex = (setIndex + questionIndex) % playerCount;
        const answer = answersForQuestion[sourcePlayerIndex];
        
        storySet.push(answer ? answer.answer : "???");
      }
      
      mixedResults.push(storySet);
    }

    room.mixedResults = mixedResults;
    room.gameState = GameState.RESULTS;
    
    this.rooms.set(code, room);
    return room;
  }

  async startNewGame(code: string): Promise<Room> {
    const room = this.rooms.get(code);
    if (!room) {
      throw new Error("Istaba nav atrasta");
    }

    room.gameState = GameState.LOBBY;
    room.answers = [];
    room.currentQuestion = null;
    room.mixedResults = null;
    room.players.forEach(p => p.hasSubmitted = false);

    this.rooms.set(code, room);
    return room;
  }

  async removePlayer(code: string, playerId: string): Promise<Room | undefined> {
    const room = this.rooms.get(code);
    if (!room) {
      return undefined;
    }

    room.players = room.players.filter(p => p.id !== playerId);

    if (room.players.length === 0) {
      this.rooms.delete(code);
      return undefined;
    }

    if (room.players.find(p => p.id === room.creatorId) === undefined) {
      room.creatorId = room.players[0].id;
      room.players[0].isCreator = true;
    }

    this.rooms.set(code, room);
    return room;
  }
}

export const storage = new MemStorage();
