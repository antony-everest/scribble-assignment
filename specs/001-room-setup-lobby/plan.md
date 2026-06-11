# Implementation Plan: Room Setup & Lobby

**Branch**: `001-room-setup-lobby` | **Date**: 2026-06-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-room-setup-lobby/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Enable players to create and join drawing-game rooms with unique codes, see room participants update automatically via ~2s polling, and allow the host to start the game once at least 2 players are present. The room creator is automatically host; display names must be unique within a room; invalid/empty codes and names are rejected with clear errors.

## Technical Context

**Language/Version**: TypeScript 5.x (backend Node.js 18+, frontend browser ESM via Vite)

**Primary Dependencies**: Express 4 (backend), React 18 + React Router 6 (frontend), Zod (backend validation), Vitest (testing both)

**Storage**: In-memory (no database). Room state stored in a `Map<string, Room>` on the backend; lost on server restart.

**Testing**: Vitest (backend unit + integration, frontend unit). Run `cd backend && npm test` and `cd frontend && npm test`.

**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge) + Node.js server

**Project Type**: Web application (separate backend + frontend)

**Performance Goals**: API responses under 200ms; lobby polling at ~2s interval; participant list visible within one poll cycle after join.

**Constraints**: No WebSockets (HTTP polling only); no databases (in-memory only); no authentication; max 4 participants per room; room codes are 4-char uppercase alphanumeric.

**Scale/Scope**: Local multiplayer (2-4 players per room), single server instance, no horizontal scaling.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment |
|-----------|------------|
| I. SOLID Architecture | ✅ Services follow existing `src/services/` pattern; components follow hooks pattern |
| II. Type Safety & Contract Discipline | ✅ Zod schemas for request validation; strict TypeScript throughout |
| III. HTTP Polling Protocol | ✅ Auto-refresh uses setInterval polling at ~2s; no WebSockets |
| IV. In-Memory State Discipline | ✅ All room state in-memory Map; no database; rooms cleaned when empty |
| V. Determinism & Testability | ✅ Room creation/joining is deterministic; testable without running server |

**Gate result**: PASS — no violations. All constraints align with constitution principles.

## Project Structure

### Documentation (this feature)

```text
specs/001-room-setup-lobby/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   └── game.ts          # Room, Participant types (extend with hostId, status)
│   ├── services/
│   │   └── roomStore.ts     # Extend: unique name check, host tracking, start game
│   └── api/
│       ├── rooms.ts         # Add POST /rooms/:code/start endpoint
│       └── schemas.ts       # Add startGameSchema, update join schemas

frontend/
├── src/
│   ├── pages/
│   │   └── LobbyPage.tsx    # Add auto-polling, host-only start button, error display
│   ├── components/
│   │   └── GuessForm.tsx    # No changes for this slice
│   ├── state/
│   │   └── roomStore.ts     # Add startGame action, auto-poll timer
│   └── services/
│       └── api.ts           # Add startGame API call, fix /bug fallback URL
```

**Structure Decision**: Web application with separate `backend/` and `frontend/` directories. Backend follows Express route → service → model layering. Frontend follows page → component → store → API layering.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. Complexity tracking is not required.

## Phase 0: Research

All technical context items are derivable from the existing codebase. No NEEDS CLARIFICATION markers remain. Research artifacts consolidated in [research.md](./research.md).

## Phase 1: Design

Data model, API contracts, and validation guide generated in:
- [data-model.md](./data-model.md) — entities, fields, relationships, state transitions
- [contracts/](./contracts/) — REST API endpoint contracts
- [quickstart.md](./quickstart.md) — end-to-end validation scenarios
