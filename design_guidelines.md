# Design Guidelines: Multiplayer Question-Mixing Game

## Design Approach

**Reference-Based Approach**: Drawing inspiration from successful multiplayer party games like Jackbox Games and Kahoot - emphasizing playful clarity, bold typography, and intuitive game flow. The design should feel welcoming, social, and fun while maintaining excellent readability and usability across all game states.

## Core Design Principles

1. **Playful Clarity**: Game mechanics should be immediately understandable
2. **Mobile-First**: Players use personal devices - optimize for phone screens
3. **Social Energy**: Design should feel lively and engaging for group play
4. **Status Transparency**: Always clear what's happening and who we're waiting for

## Typography System

**Primary Font**: 'Poppins' (Google Fonts) - rounded, friendly, highly legible
- Game Title/Logo: 700 weight, 3xl-4xl size
- Screen Headers: 600 weight, 2xl-3xl size
- Questions: 600 weight, xl-2xl size
- Body/Answers: 400 weight, base-lg size
- Status Text: 500 weight, sm size
- Room Codes: 700 weight, 3xl size, mono variant for clarity

**Secondary Font**: 'Inter' (Google Fonts) for UI elements and buttons
- 500-600 weights for buttons and controls

## Layout System

**Spacing Scale**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20 consistently
- Screen padding: px-4 md:px-8
- Component spacing: gap-4 to gap-8
- Section spacing: mb-8 to mb-12
- Button padding: px-6 py-3 to px-8 py-4

**Container Strategy**:
- Max-width: max-w-2xl for game content (optimal for questions/answers)
- Full-width for status bars and headers
- Centered layout: mx-auto for all major content

## Screen-by-Screen Layout

### Home Screen
- Centered vertical layout
- Large game title at top (mb-12)
- Two prominent action buttons stacked vertically (w-full max-w-sm, gap-4)
- "Create Room" button (larger, primary)
- "Join Room" button (secondary style)
- Footer with minimal instructions (mt-16)

### Room Creation/Join Screen
- Header with back button (absolute top-left)
- Centered content card (max-w-md)
- Large room code display (text-5xl, tracking-wider, py-8)
- Share instruction text below code
- Player list section (mt-8, space-y-3)
- "Start Game" button at bottom (fixed or sticky, w-full)
- Minimum players indicator

### Question Screen
- Question number indicator (top, text-sm, centered)
- Large question text (text-2xl, font-semibold, mb-8, min-h-24 for consistency)
- Single textarea input (w-full, h-32, text-lg, rounded-lg)
- Character counter (text-sm, opacity-70)
- Submit button (w-full, py-4, text-lg, mt-6)

### Waiting Screen
- Progress indicator at top (fraction: "3/4 players ready")
- Animated loader/spinner (centered, mb-6)
- Status message ("Waiting for other players...")
- List of player statuses with checkmarks/loading icons (space-y-2)
- Cannot navigate away - committed state

### Results Screen
- Scrollable content area
- Story-style presentation of mixed answers
- Each line shows: Question label (text-sm, opacity-70) + Answer (text-lg, font-medium)
- Clear visual separation between answer sets (border-b, py-6)
- "New Game" button at bottom (sticky, only for room creator)
- "Leave Room" option for non-creators

## Component Library

### Buttons
- Primary: Large rounded corners (rounded-xl), bold text, px-8 py-4, shadow-lg
- Secondary: Outlined style, medium rounded (rounded-lg), px-6 py-3
- Icon buttons: Square (w-10 h-10), rounded-lg, minimal

### Input Fields
- Text inputs: rounded-lg, border-2, px-4 py-3, text-lg, focus ring
- Textareas: Same styling, min-h-32
- Room code input: Centered text, text-3xl, tracking-widest, uppercase

### Cards
- Room lobby card: rounded-2xl, p-6 to p-8, shadow-xl
- Answer cards: rounded-xl, p-6, border-l-4 accent

### Status Indicators
- Player badges: Inline-flex, rounded-full, px-3 py-1, text-sm
- Checkmark icons: w-5 h-5, inline with player names
- Progress bars: h-2, rounded-full, animated width transitions

### Icons
Use **Heroicons** (outline style) for:
- Back arrow (arrow-left)
- Checkmark (check-circle)
- Loading spinner (arrow-path with animate-spin)
- Players (user-group)
- Share (share)

## Animation Principles

**Minimal & Purposeful**:
- Page transitions: Simple fade-in (300ms)
- Button interactions: Scale on press (active:scale-95)
- Loading states: Gentle pulse or spin only
- Results reveal: Staggered fade-in for answer lines (100ms delay each)
- No background animations or decorative motion

## Accessibility

- Minimum touch targets: 44x44px (py-3 ensures this)
- Focus indicators on all interactive elements (ring-2)
- Clear visual hierarchy with size and weight
- High contrast text throughout
- Screen reader friendly status updates

## Mobile Optimization

- Portrait-first design
- Touch-friendly spacing (min gap-4)
- Sticky/fixed positioning for key actions
- Minimal horizontal scrolling
- Large tap targets for game actions
- Keyboard dismissal after input submission

## Key UX Patterns

1. **Room Code Display**: Extra large, monospace, easy to read aloud
2. **Player Status**: Real-time updates with clear visual states
3. **Question Consistency**: Same position/size reduces cognitive load
4. **Progressive Disclosure**: Show only relevant actions per game state
5. **Error States**: Inline validation with helpful messages (e.g., "Room not found")

This design creates an engaging, social gaming experience that works beautifully on mobile devices while maintaining clarity and ease of use throughout the entire game flow.