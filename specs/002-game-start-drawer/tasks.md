# Tasks: Game Start & Drawer Flow

**Input**: Design documents from `/specs/002-game-start-drawer/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Review existing structure before making changes

- [x] T001 Review current Room/RoomSnapshot types in `backend/src/models/game.ts` and `backend/src/services/roomStore.ts` to understand extension points

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core model changes that MUST be complete before any user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Add `currentDrawerId: string | null` and `secretWord: string | null` fields to the `Room` and `RoomSnapshot` interfaces in `backend/src/models/game.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 2 - Player Name Validation (Priority: P1) 🎯 MVP

**Goal**: Validate all participant names on game start: trim whitespace, reject empty/whitespace-only, reject duplicates after trimming

**Independent Test**: Join a room with a whitespace-only name and attempt to start. Game start is rejected with a clear error message.

### Implementation for User Story 2

- [x] T003 [P] [US2] Update `startGame` in `backend/src/services/roomStore.ts` to trim all participant names, reject empty/whitespace-only after trim, and reject duplicates after trim
- [x] T004 [US2] Update `POST /rooms/:code/start` in `backend/src/api/rooms.ts` to return 400 with descriptive error messages for name validation failures

**Checkpoint**: At this point, User Story 2 should be fully functional and testable independently

---

## Phase 4: User Story 1 - Game Starts with Drawer and Secret Word (Priority: P1) 🎯 MVP

**Goal**: On successful game start, assign the host as drawer, select a secret word deterministically, reveal it only to the drawer, and show drawer identity to all

**Independent Test**: Join a room with 2+ players, start the game. All players see the drawer identity; only the drawer sees the secret word.

### Implementation for User Story 1

- [x] T005 [US1] Update `startGame` in `backend/src/services/roomStore.ts` to set `currentDrawerId = hostId` and select a secret word deterministically from `STARTER_WORDS` (using participant count as index)
- [x] T006 [US1] Update `toRoomSnapshot` in `backend/src/services/roomStore.ts` to include `currentDrawerId` for all viewers and `secretWord` only when the viewer is the drawer (`null` otherwise)
- [x] T007 [P] [US1] Update `RoomSnapshot` type and `RoomSessionResponse` in `frontend/src/services/api.ts` to add `currentDrawerId: string | null` and `secretWord: string | null`
- [x] T008 [US1] Update room state handling in `frontend/src/state/roomStore.ts` to extract and expose `currentDrawerId` and `secretWord` from room snapshots
- [x] T009 [P] [US1] Update `frontend/src/pages/LobbyPage.tsx` to display drawer identity and secret word after game starts, and handle game start error messages
- [x] T010 [US1] Create `frontend/src/pages/GamePage.tsx` with post-start UI showing drawer status, player list with roles, and secret word (drawer only)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T011 Run build checks: `cd backend && npx tsc --noEmit` and `cd frontend && npx tsc --noEmit` to verify no type errors
- [ ] T012 Run quickstart.md validation scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 2 (Phase 3)**: Depends on Foundational — name validation gate
- **User Story 1 (Phase 4)**: Depends on Foundational and US2
- **Polish (Phase 5)**: Depends on Phase 3 and Phase 4 completion

### User Story Dependencies

- **User Story 2 (P1)**: Can start after Foundational — validates names on game start
- **User Story 1 (P1)**: Can start after User Story 2 — name validation must pass before drawer/word assignment

### Within Each User Story

- Models before services
- Services before endpoints
- Backend before frontend

### Parallel Opportunities

- T003 and T004 are [P] (different files: `roomStore.ts` vs `rooms.ts`)
- T007 and T009 are [P] (different files: `api.ts` vs `LobbyPage.tsx`)

---

## Parallel Example: Phase 3 (User Story 2)

```bash
# Launch both User Story 2 tasks together:
Task: "T003 [P] [US2] Update startGame in backend/src/services/roomStore.ts"
Task: "T004 [US2] Update POST /rooms/:code/start in backend/src/api/rooms.ts"
```

## Parallel Example: Phase 4 (User Story 1)

```bash
# Launch independent tasks together:
Task: "T007 [P] [US1] Update RoomSnapshot type in frontend/src/services/api.ts"
Task: "T009 [P] [US1] Update LobbyPage.tsx in frontend/src/pages/LobbyPage.tsx"

# After type and store tasks complete:
Task: "T008 [US1] Update roomStore.ts in frontend/src/state/roomStore.ts"

# After store and backend complete:
Task: "T010 [US1] Create GamePage.tsx in frontend/src/pages/GamePage.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 2 + User Story 1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (model changes — blocks all stories)
3. Complete Phase 3: User Story 2 (name validation)
4. Complete Phase 4: User Story 1 (drawer/word assignment)
5. **STOP and VALIDATE**: Run quickstart.md scenarios
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 2 → Name validation testable independently (game rejects bad names)
3. Add User Story 1 → Full game start flow testable (drawer assigned, word shown)
4. Polish → Build passes and validation scenarios pass

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
