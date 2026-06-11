# Tasks: Result, Restart & Final Validation

**Input**: Design documents from `/specs/004-result-restart/`

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

- [x] T001 Review current RoomSnapshot secretWord visibility logic in `backend/src/services/roomStore.ts` (toRoomSnapshot) and finished game state in `frontend/src/pages/GamePage.tsx` to understand extension points

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core model changes that MUST be complete before any user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- (none needed — no new types or model changes required for this slice)

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - View Final Results (Priority: P1) 🎯 MVP

**Goal**: When the game is finished, all participants see the secret word, final scores, full guess history, and final canvas. This builds on the existing "Game Over" view from Slice 3.

**Independent Test**: Start a game, play until all guessers guess correctly, and verify all participants see the secret word, final scores, and guess history.

### Implementation for User Story 1

- [ ] T002 [P] [US1] Update `toRoomSnapshot` in `backend/src/services/roomStore.ts` to always include `secretWord` when `room.status === "finished"` (regardless of viewer identity)
- [ ] T003 [P] [US1] Update `frontend/src/pages/GamePage.tsx` to show the secret word to ALL participants in the "finished" view (currently only shown to drawer)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Host Restarts the Game (Priority: P1) 🎯 MVP

**Goal**: The host can restart a finished game. All participants return to the lobby with the same room code and players, but round state (guesses, canvas, scores, drawer, word) is cleared.

**Independent Test**: Finish a game as the host, click restart, and verify all participants see the lobby with the same room code, same players, and no round state.

### Implementation for User Story 2

- [ ] T004 [P] [US2] Add `restartGame` function in `backend/src/services/roomStore.ts` — validates room exists, requester is host, game is finished; resets `guessHistory`, `canvasStrokes`, `currentDrawerId`, `secretWord`; sets `status` to "lobby"; returns updated room
- [ ] T005 [US2] Add `POST /rooms/:code/restart` route in `backend/src/api/rooms.ts` — uses existing `roomViewerQuerySchema` and `roomCodeParamsSchema`; returns 400 if not finished, 403 if not host
- [ ] T006 [P] [US2] Add `restartGame` method to `api` object in `frontend/src/services/api.ts`
- [ ] T007 [US2] Add `restartGame` action in `frontend/src/state/roomStore.ts`
- [ ] T008 [US2] Update `frontend/src/pages/GamePage.tsx` — in the "finished" view: show a "Play Again" button for the host only (hidden/disabled for non-hosts); on click call `store.restartGame()`; on success navigate to `/lobby`
- [ ] T009 [US2] Verify `frontend/src/pages/LobbyPage.tsx` handles the lobby state after restart correctly: lobby shows the same room code and participant list; host sees the "Start Game" button; non-host participants do not see the "Start Game" button; no guess history, canvas, scores, drawer assignment, or secret word are displayed

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T010 Run build checks: `cd backend && npx tsc --noEmit` and `cd frontend && npx tsc --noEmit` to verify no type errors
- [ ] T011 Run quickstart.md validation scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: No blocking tasks
- **User Story 1 (Phase 3)**: Can start immediately after Setup
- **User Story 2 (Phase 4)**: Can start immediately after Setup — independent of US1
- **Polish (Phase 5)**: Depends on Phase 3 and Phase 4 completion

### User Story Dependencies

- **User Story 1 (P1)**: Independent — updates snapshot and finished view
- **User Story 2 (P1)**: Independent — adds restart endpoint and frontend button

### Within Each User Story

- Backend before frontend (where applicable)

### Parallel Opportunities

- T002 and T003 — different files (roomStore.ts vs GamePage.tsx)
- T004 and T006 — different files (roomStore.ts vs api.ts)
- T003 and T008 — same file (GamePage.tsx), sequential
- T004 and T005 — same file cluster but diff concerns, sequential recommended

---

## Parallel Example: Phase 3 (User Story 1)

```bash
# Launch both US1 tasks together:
Task: "T002 [US1] Update toRoomSnapshot in backend/src/services/roomStore.ts"
Task: "T003 [US1] Update GamePage.tsx finished view in frontend/src/pages/GamePage.tsx"
```

## Parallel Example: Phase 4 (User Story 2)

```bash
# Launch independent tasks together:
Task: "T004 [P] [US2] Add restartGame in backend/src/services/roomStore.ts"
Task: "T006 [P] [US2] Add restartGame method in frontend/src/services/api.ts"

# After backend and API tasks complete:
Task: "T005 [US2] Add POST /rooms/:code/restart route in backend/src/api/rooms.ts"
Task: "T007 [US2] Add restartGame action in frontend/src/state/roomStore.ts"

# After store task completes:
Task: "T008 [US2] Update GamePage.tsx finished view with restart button"
```

---

## Implementation Strategy

### MVP First (Both User Stories)

1. Complete Phase 1: Setup
2. Complete Phase 3: User Story 1 (reveal word on finished)
3. Complete Phase 4: User Story 2 (restart flow)
4. **STOP and VALIDATE**: Run quickstart.md scenarios
5. Complete Phase 5: Polish

### Incremental Delivery

1. Complete Setup → Ready
2. Add User Story 1 → Final results testable independently (secret word revealed to all)
3. Add User Story 2 → Restart flow testable independently (host restarts, lobby visible)
4. Polish → Build passes and validation scenarios pass
