import { z } from "zod";

// Game questions in Latvian
export const QUESTIONS = [
  "Kas?",
  "Ar ko?",
  "Kad?",
  "Kur?",
  "Ko darīja?",
  "Kāpēc?"
] as const;

export type QuestionType = typeof QUESTIONS[number];

// Game states
export const GameState = {
  LOBBY: "LOBBY",
  PLAYING: "PLAYING",
  RESULTS: "RESULTS"
} as const;

export type GameStateType = typeof GameState[keyof typeof GameState];

// Player schema
export const playerSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  isCreator: z.boolean(),
  hasSubmitted: z.boolean(),
});

export type Player = z.infer<typeof playerSchema>;

// Answer schema
export const answerSchema = z.object({
  playerId: z.string(),
  questionIndex: z.number().min(0).max(5),
  answer: z.string().min(1).max(200),
});

export type Answer = z.infer<typeof answerSchema>;

// Room schema
export const roomSchema = z.object({
  code: z.string().length(6),
  creatorId: z.string(),
  players: z.array(playerSchema),
  gameState: z.enum([GameState.LOBBY, GameState.PLAYING, GameState.RESULTS]),
  answers: z.array(answerSchema),
  currentQuestion: z.number().min(0).max(5).nullable(),
  mixedResults: z.array(z.array(z.string())).nullable(),
});

export type Room = z.infer<typeof roomSchema>;

// Insert schemas
export const insertPlayerSchema = playerSchema.omit({ id: true, hasSubmitted: true });
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

export const insertAnswerSchema = answerSchema;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;

export const createRoomSchema = z.object({
  playerName: z.string().min(1).max(50),
});
export type CreateRoom = z.infer<typeof createRoomSchema>;

export const joinRoomSchema = z.object({
  code: z.string().length(6),
  playerName: z.string().min(1).max(50),
});
export type JoinRoom = z.infer<typeof joinRoomSchema>;

export const submitAnswerSchema = z.object({
  roomCode: z.string().length(6),
  playerId: z.string(),
  questionIndex: z.number().min(0).max(5),
  answer: z.string().min(1).max(200),
});
export type SubmitAnswer = z.infer<typeof submitAnswerSchema>;

// WebSocket message types
export const WS_EVENTS = {
  ROOM_UPDATED: "ROOM_UPDATED",
  PLAYER_JOINED: "PLAYER_JOINED",
  PLAYER_LEFT: "PLAYER_LEFT",
  GAME_STARTED: "GAME_STARTED",
  ANSWER_SUBMITTED: "ANSWER_SUBMITTED",
  ALL_ANSWERS_SUBMITTED: "ALL_ANSWERS_SUBMITTED",
  RESULTS_READY: "RESULTS_READY",
  ERROR: "ERROR",
} as const;

export type WSEvent = typeof WS_EVENTS[keyof typeof WS_EVENTS];

export interface WSMessage {
  event: WSEvent;
  data?: any;
}
