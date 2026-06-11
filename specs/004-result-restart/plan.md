# Implementation Plan: Result, Restart & Final Validation

**Branch**: `004-result-restart` | **Date**: 2026-06-11 | **Spec**: `specs/004-result-restart/spec.md`

**Input**: Feature specification from `/specs/004-result-restart/spec.md`

## Summary

When the game ends (all guessers correct), all participants see the secret word, final scores, full guess history, and final canvas. The host can restart the game — players are preserved but round state (guesses, canvas, scores, drawer, word) is cleared, returning everyone to the lobby for a new round.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 18+ backend, browser ESM via Vite frontend)

**Primary Dependencies**: Express 4 + Zod (backend), React 18 + React Router 6 (frontend)

**Storage**: In-memory `Map<string, Room>` on backend — no database

**Testing**: Vitest (both backend and frontend)

**Target Platform**: Node.js server (backend), browser (frontend)

**Project Type**: Web application (monorepo: `backend/` + `frontend/`)

**Performance Goals**: ~2s poll cycle; restart response <500ms

**Constraints**: No WebSockets, no databases, no auth, single round per game session, max 4 participants, no drawer rotation

**Scale/Scope**: Max 4 participants per room, restart returns to lobby with players preserved

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Principle I (SOLID Architecture)**: Not violated. Adding a single `restartGame` function to `roomStore.ts` and a REST endpoint to `rooms.ts`. Existing `toRoomSnapshot` gains one condition for secret word reveal. Single-responsibility additions.

**Principle II (Type Safety & Contract Discipline)**: Not violated. No new types needed; existing `Room` fields are reused with modified visibility rules.

**Principle III (HTTP Polling Protocol)**: Not violated. Result display and status transition propagate via existing `GET /rooms/:code` polling. No push protocol.

**Principle IV (In-Memory State Discipline)**: Not violated. Restart clears in-memory fields on the existing Room object. No persistence.

**Principle V (Determinism & Testability)**: Not violated. Restart is a pure state reset; word reveal on finished is a deterministic condition. Testable without a running server.

**Forbidden items check**: None violated. No WebSockets, databases, auth, multi-round features, timers, or other forbidden items.

**GATE: PASS** — No violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/004-result-restart/
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
    ├── services/
    │   └── roomStore.ts     # Add restartGame function
    │                        # Update toRoomSnapshot: reveal secretWord when finished
    ├── api/
    │   ├── rooms.ts         # Add POST /rooms/:code/restart route
    │   └── schemas.ts       # Unchanged (existing schemas cover restart)

frontend/
└── src/
    ├── services/
    │   └── api.ts           # Add restartGame method
    ├── state/
    │   └── roomStore.ts     # Add restartGame action
    ├── pages/
    │   └── GamePage.tsx     # Update finished view: reveal word to all, add restart button (host only)
    │   └── LobbyPage.tsx    # Handle lobby after restart (mostly works already; ensure start button visible)
    └── components/
        └── ResultPanel.tsx  # Unchanged (already shows guess history)
        └── Scoreboard.tsx   # Unchanged (already shows scores)
```

**Structure Decision**: Option 2 — Web application (frontend + backend). Mono-repo layout already established.

## Complexity Tracking

No constitution violations to justify.
