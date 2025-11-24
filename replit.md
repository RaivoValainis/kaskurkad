# Latvian Party Game - Multiplayer Web App

## Project Overview
A multiplayer web game built in Latvian where players answer 6 funny questions (Kas? Ar ko? Kad? Kur? Ko darīja? Kāpēc?) and their answers get mixed together to create hilarious combinations. Players create rooms with shareable codes, and the game requires real-time synchronization for all game states.

## Current Status
✅ **FULLY FUNCTIONAL AND READY TO DEPLOY**

### Completed Features
- **Room Management**: Create rooms with unique 6-letter codes, join with codes
- **Real-time WebSocket Sync**: All players see updates instantly
- **Game Flow**: Lobby → Questions → Answer Collection → Results mixing
- **Answer Mixing Algorithm**: Each story gets answers from different players in a rotating pattern
- **Minimum Players**: Game requires 2+ players to start
- **Room Creator Only**: Only the room creator can start new rounds
- **State Management**: Proper state transitions and resets between rounds
- **Error Handling**: User-friendly error messages in Latvian
- **Loading States**: Proper UI feedback during async operations

### Tech Stack
- **Frontend**: React + TypeScript, TailwindCSS, shadcn/ui, React Hook Form, TanStack Query, Wouter routing
- **Backend**: Express.js, Node.js
- **Real-time**: WebSocket server on /ws path
- **Storage**: In-memory (MemStorage) for prototype
- **Languages**: Full Latvian localization

### Architecture Decisions
1. **WebSocket Path**: `/ws` endpoint avoids Vite HMR conflicts
2. **In-Memory Storage**: Ideal for multiplayer games without persistence needs
3. **Frontend-Heavy**: Backend only handles persistence and API calls
4. **Mobile-First Design**: Responsive layout following Jackbox Games style

### Game Questions (Latvian)
1. Kas? (Who?)
2. Ar ko? (With what?)
3. Kad? (When?)
4. Kur? (Where?)
5. Ko darīja? (What did [they] do?)
6. Kāpēc? (Why?)

### Last Session Changes
- Fixed WebSocket connection handling with proper JOIN_ROOM events
- Fixed submitAnswer return type to include allSubmitted flag
- Implemented auto-trigger of results generation when all players submit
- Fixed React Query mutation response parsing
- Added proper broadcasts after all critical operations (create, join, start, submit)
- Verified all game flows work end-to-end with multiple test runs

### How to Deploy
1. Click "Publish" button in Replit
2. Select "Autoscale Deployment"
3. System auto-configures and deploys
4. Get your `.replit.app` public URL
5. Share the URL with friends - they can create/join game rooms!

### Testing Checklist (All Verified)
✅ Create room and get shareable code
✅ Join room with code
✅ Multiple players see each other in lobby
✅ Room creator can start game
✅ All 6 questions appear in sequence
✅ Each player can submit 6 answers
✅ Real-time updates across all players
✅ Results automatically mix answers
✅ Can start new game round
✅ Proper error handling for invalid codes
✅ Responsive design on mobile/desktop

### User Preferences
- Game must be in Latvian ✓
- Playful, Jackbox Games-inspired design ✓
- Mobile-first approach ✓
- Multiplayer with room codes ✓
- Real-time synchronization ✓
