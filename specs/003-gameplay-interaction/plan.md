# Implementation Plan: Gameplay Interaction

**Branch**: `003-gameplay-interaction` | **Date**: 2026-06-11 | **Spec**: `specs/003-gameplay-interaction/spec.md`

**Input**: Feature specification from `/specs/003-gameplay-interaction/spec.md`

## Summary

Add core gameplay loop: the drawer draws/clears a canvas (strokes synced via polling), guessers submit text guesses (trimmed, case-insensitive, empty rejection), scores (+100 per correct guess) are computed from guess history, and the game ends when all guessers guess correctly. All state changes are visible within one poll cycle (~2s).

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 18+ backend, browser ESM via Vite frontend)

**Primary Dependencies**: Express 4 + Zod (backend), React 18 + React Router 6 (frontend)

**Storage**: In-memory `Map<string, Room>` on backend — no database

**Testing**: Vitest (both backend and frontend)

**Target Platform**: Node.js server (backend), browser (frontend)

**Project Type**: Web application (monorepo: `backend/` + `frontend/`)

**Performance Goals**: ~2s poll cycle; draw/guess response <500ms

**Constraints**: No WebSockets, no databases, no auth, single round, no drawer rotation, no timers, max 4 participants

**Scale/Scope**: Max 4 participants per room, single round per game

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Principle I (SOLID Architecture)**: Not violated. Drawing and guessing add new service functions; existing `startGame` and `toRoomSnapshot` are extended with new fields. No existing behavior is modified.

**Principle II (Type Safety & Contract Discipline)**: Not violated. New `Guess`, `Stroke`, `Point` types added; existing interfaces extended with optional/union types.

**Principle III (HTTP Polling Protocol)**: Not violated. Canvas strokes, guess history, and scores are transmitted via existing `GET /rooms/:code` polling endpoint. No push protocol introduced.

**Principle IV (In-Memory State Discipline)**: Not violated. All new state (guess history, canvas strokes, computed scores) stored in-memory on the Room object.

**Principle V (Determinism & Testability)**: Not violated. Guess comparison is a pure function (trim + lowercase + equality). Score computation is a pure function (filter correct guesses × 100). Game end detection is a pure function (check all non-drawers have a correct guess).

**Forbidden items check**: None violated. No WebSockets, databases, auth, multiplayer round features, custom word packs, spectator mode, moderation, room passwords, or rewrites.

**GATE: PASS** — No violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/003-gameplay-interaction/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md           # Phase 1 output
└── spec.md              # Feature specification
```

### Source Code (repository root)

```text
backend/
└── src/
    ├── models/
    │   └── game.ts          # Add Guess, Stroke, Point interfaces
    │                        # Add guessHistory, canvasStrokes to Room
    │                        # Add guessHistory, scores, canvasStrokes to RoomSnapshot
    ├── services/
    │   └── roomStore.ts     # Add drawStroke, clearCanvas, submitGuess functions
    │                        # Update toRoomSnapshot (compute scores, include new fields)
    │                        # Add allGuessersCorrect helper for game-end detection
    ├── api/
    │   ├── rooms.ts         # Add POST /draw, POST /clear, POST /guess routes
    │   └── schemas.ts       # Add drawStrokeSchema, guessSchema schemas
    └── seed/
        └── starterData.ts   # Unchanged

frontend/
└── src/
    ├── services/
    │   └── api.ts           # Add drawStroke, clearCanvas, submitGuess methods
    │                        # Update RoomSnapshot type with new fields
    ├── state/
    │   └── roomStore.ts     # Add drawStroke, clearCanvas, submitGuess actions
    ├── pages/
    │   └── GamePage.tsx     # Integrate canvas drawing for drawer
    │                        # Pass guess history and scores to sidebar
    │                        # Handle game "finished" status → show end state
    └── components/
        ├── GuessForm.tsx    # Wire up to actually submit guesses
        ├── ResultPanel.tsx  # Show real guess history
        ├── Scoreboard.tsx   # Show real scores
        └── Canvas.tsx       # New: drawing canvas component (drawer) / display canvas (guessers)
```

**Structure Decision**: Option 2 — Web application (frontend + backend). Mono-repo layout already established.

## Complexity Tracking

No constitution violations to justify.
