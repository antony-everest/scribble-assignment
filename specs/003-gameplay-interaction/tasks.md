# Tasks: Gameplay Interaction

**Input**: Design documents from `/specs/003-gameplay-interaction/`

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

- [ ] T001 Review current Room/RoomSnapshot types and roomStore functions to understand extension points for guess history, canvas strokes, and scoring

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core model changes that MUST be complete before any user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 Add `Guess`, `Stroke`, and `Point` interfaces to `backend/src/models/game.ts`; add `guessHistory` and `canvasStrokes` fields to `Room`; add `guessHistory`, `scores`, and `canvasStrokes` fields to `RoomSnapshot`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Drawer Draws and Clears Canvas (Priority: P1) 🎯 MVP

**Goal**: The drawer can draw strokes on a canvas and clear it. All participants see the current drawing via polling.

**Independent Test**: Start a game as the drawer, draw a stroke, verify it appears. Clear the canvas, verify it resets. The guesser sees both updates within one poll cycle.

### Implementation for User Story 1

- [ ] T003 [P] [US1] Add `drawStroke` function in `backend/src/services/roomStore.ts` — appends a stroke to room.canvasStrokes (validates room exists, requester is drawer)
- [ ] T004 [P] [US1] Add `clearCanvas` function in `backend/src/services/roomStore.ts` — resets room.canvasStrokes to `[]` (validates room exists, requester is drawer)
- [ ] T005 [US1] Add `drawStrokeSchema` and `clearCanvasSchema` in `backend/src/api/schemas.ts` using Zod
- [ ] T006 [US1] Add `POST /rooms/:code/draw` and `POST /rooms/:code/clear` routes in `backend/src/api/rooms.ts`
- [ ] T007 [P] [US1] Update `RoomSnapshot` type and add `requireParticipantIdQuerySchema` in `frontend/src/services/api.ts`; add `drawStroke` and `clearCanvas` methods to `api` object
- [ ] T008 [US1] Add `drawStroke` and `clearCanvas` actions in `frontend/src/state/roomStore.ts`
- [ ] T009 [P] [US1] Create `frontend/src/components/Canvas.tsx` — drawing canvas (drawer: interactive with mouse/touch; guesser: read-only replay)
- [ ] T010 [US1] Update `frontend/src/pages/GamePage.tsx` — replace canvas placeholder with `<Canvas>` component; pass drawing callbacks for drawer

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Guessers Submit Guesses (Priority: P1) 🎯 MVP

**Goal**: Guessers can submit text guesses. Empty/whitespace guesses are rejected. Guesses are trimmed and compared case-insensitively. Correct guesses score 100.

**Independent Test**: Join as a guesser, submit an empty guess (rejected), an incorrect guess (no score change), and a correct guess (+100 points, marked correct, subsequent guesses rejected).

### Implementation for User Story 2

- [ ] T011 [P] [US2] Add `submitGuess` function in `backend/src/services/roomStore.ts` — validates room/participant, trims text, compares case-insensitively, records in guessHistory, detects game end (all guessers correct), computes scores
- [ ] T012 [P] [US2] Add `guessSchema` in `backend/src/api/schemas.ts` using Zod
- [ ] T013 [US2] Add `POST /rooms/:code/guess` route in `backend/src/api/rooms.ts`
- [ ] T014 [P] [US2] Add `submitGuess` method to `api` object in `frontend/src/services/api.ts`
- [ ] T015 [US2] Add `submitGuess` action in `frontend/src/state/roomStore.ts`
- [ ] T016 [US2] Update `frontend/src/components/GuessForm.tsx` — wire up form submission to call store.submitGuess; display error and success states; disable input after correct guess

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Guess History and Scores Synced (Priority: P1) 🎯 MVP

**Goal**: All participants see the same guess history and scores within one poll cycle. Game ends with "finished" status when all guessers have guessed correctly.

**Independent Test**: Submit guesses from multiple guessers. Verify all players see identical history, scores, and game-end transition within one poll cycle.

### Implementation for User Story 3

- [ ] T017 [US3] Update `toRoomSnapshot` in `backend/src/services/roomStore.ts` to compute and include `scores` (derived from guessHistory) and pass through `guessHistory` and `canvasStrokes`
- [ ] T018 [P] [US3] Update `frontend/src/components/Scoreboard.tsx` to display real participant names and scores from `room.scores`
- [ ] T019 [US3] Update `frontend/src/components/ResultPanel.tsx` to display real guess history from `room.guessHistory`
- [ ] T020 [US3] Update `frontend/src/pages/GamePage.tsx` to handle `room.status === "finished"` — show game-over state (final scores, disable drawing/guessing)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T021 Run build checks: `cd backend && npx tsc --noEmit` and `cd frontend && npx tsc --noEmit` to verify no type errors
- [ ] T022 Run quickstart.md validation scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational — canvas drawing
- **User Story 2 (Phase 4)**: Depends on Foundational — guess submission
- **User Story 3 (Phase 5)**: Depends on Phases 3 and 4 — builds on guess history + canvas state
- **Polish (Phase 6)**: Depends on all user stories

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — independent of other stories
- **User Story 2 (P1)**: Can start after Foundational — independent of other stories
- **User Story 3 (P1)**: Integrates data from US1 and US2 but implementation is additive (updating existing components)

### Within Each User Story

- Models before services
- Services before endpoints
- Backend before frontend

### Parallel Opportunities

- T003 and T004 (roomStore functions) — same file, sequential
- T007 and T009 (frontend api.ts vs Canvas.tsx) — different files
- T011 and T012 (roomStore vs schemas) — different files
- T018 and T019 (Scoreboard vs ResultPanel) — different files

---

## Implementation Strategy

### MVP First (All Three User Stories)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (model changes — blocks all stories)
3. Complete Phase 3: User Story 1 (drawing)
4. Complete Phase 4: User Story 2 (guessing)
5. Complete Phase 5: User Story 3 (sync + game end)
6. **STOP and VALIDATE**: Run quickstart.md scenarios
7. Complete Phase 6: Polish

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Drawing testable independently (drawer draws, guessers see it)
3. Add User Story 2 → Guessing testable independently (guess validation, scoring)
4. Add User Story 3 → Full gameplay testable (history, sync, game end)
5. Polish → Build passes and validation scenarios pass
