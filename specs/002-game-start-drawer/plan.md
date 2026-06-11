# Implementation Plan: Game Start & Drawer Flow

**Branch**: `002-game-start-drawer` | **Date**: 2026-06-11 | **Spec**: `specs/002-game-start-drawer/spec.md`

**Input**: Feature specification from `/specs/002-game-start-drawer/spec.md`

## Summary

When the host starts a game from the lobby, the system validates all participant names (trimmed, no empty/whitespace-only, no duplicates after trimming). On success, the host is assigned as the drawer, a secret word is selected deterministically from the starter list, and the word is revealed only to the drawer via polls. All participants see who the drawer is.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 18+ backend, browser ESM via Vite frontend)

**Primary Dependencies**: Express 4 + Zod (backend), React 18 + React Router 6 (frontend)

**Storage**: In-memory `Map<string, Room>` on backend

**Testing**: Vitest (both backend and frontend)

**Target Platform**: Node.js server (backend), browser (frontend)

**Project Type**: Web application (monorepo: `backend/` + `frontend/`)

**Performance Goals**: ~2s poll cycle; game start response <500ms

**Constraints**: No WebSockets, no databases, no auth, single round, no drawer rotation, no timers

**Scale/Scope**: Max 4 participants per room, single round per game

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Principle I (SOLID Architecture)**: Not violated. Business logic changes stay in `roomStore.ts`; new `startGame` validation and drawer assignment are single-responsibility additions.

**Principle II (Type Safety & Contract Discipline)**: Not violated. All new fields typed in TypeScript; Zod schemas updated if needed.

**Principle III (HTTP Polling Protocol)**: Not violated. Game state changes propagated via existing `GET /rooms/:code` polling. No push protocol introduced.

**Principle IV (In-Memory State Discipline)**: Not violated. Drawer ID and secret word stored in-memory on the Room object. No persistence added.

**Principle V (Determinism & Testability)**: Not violated. Word selection uses a pure function of room state (participant count). No randomness.

**Forbidden items check**: None violated. No WebSockets, databases, auth, multiplayer round features, custom word packs, spectator mode, moderation, room passwords, or rewrites.

**GATE: PASS** — No violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/002-game-start-drawer/
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
    │   └── game.ts          # Add currentDrawerId, secretWord to Room/RoomSnapshot
    ├── services/
    │   └── roomStore.ts     # Update startGame (name validation, drawer assign, word select)
    │                        # Update toRoomSnapshot (secret word visibility)
    ├── api/
    │   └── rooms.ts         # Update POST /rooms/:code/start error handling
    └── seed/
        └── starterData.ts   # Unchanged (word list reference)

frontend/
└── src/
    ├── services/
    │   └── api.ts           # Update RoomSnapshot types
    ├── state/
    │   └── roomStore.ts     # Add drawerId, secretWord to store
    └── pages/
        └── LobbyPage.tsx    # Handle game start errors, display drawer info
        └── GamePage.tsx     # New: post-start drawing/guessing UI

tests/
├── backend/
│   └── src/
│       └── services/
│           └── roomStore.test.ts   # Tests for name validation, drawer assign, word selection
└── frontend/
    └── src/
        └── pages/
            └── LobbyPage.test.tsx  # Tests for game start error states
```

**Structure Decision**: Option 2 — Web application (frontend + backend). Mono-repo layout already established by starter.

## Complexity Tracking

No constitution violations to justify.
