---

description: "Task list for Room Setup & Lobby feature implementation"

---

# Tasks: Room Setup & Lobby

**Input**: Design documents from `specs/001-room-setup-lobby/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic bug fixes

- [x] T001 Fix fallback API URL in frontend/src/services/api.ts (replace `/bug` suffix with empty path)

**Checkpoint**: Setup complete

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend model and schema changes that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Add `hostId: string` field and `RoomStatus` enum (`"lobby" | "playing" | "finished"`) to Room model in backend/src/models/game.ts
- [x] T003 [P] Add `startGameSchema` (empty body) and update `joinRoomSchema` (add player name uniqueness field description) in backend/src/api/schemas.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Host Creates a Room (Priority: P1) 🎯 MVP

**Goal**: A player can create a room with a display name, receive a unique room code, and be designated as the host.

**Independent Test**: A single player can create a room, see the room code, confirm they are the host, and land on the lobby screen.

### Implementation for User Story 1

- [x] T004 [US1] Update `createRoom` service in backend/src/services/roomStore.ts to set `hostId` to the creating participant's ID
- [x] T005 [US1] Update POST /rooms endpoint response in backend/src/api/rooms.ts to return `hostId` in RoomSnapshot

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Player creates room → lands on lobby → sees room code and Start Game button.

---

## Phase 4: User Story 2 - Player Joins a Room (Priority: P1)

**Goal**: A player can join an existing room by entering a valid room code and display name. Invalid codes, empty names, and duplicate names are rejected with clear error messages.

**Independent Test**: A player can join an existing room by entering a valid room code and see themselves appear in the lobby participant list.

### Implementation for User Story 2

- [x] T006 [US2] Add display name uniqueness validation to `joinRoom` service in backend/src/services/roomStore.ts (check against existing participant names)
- [x] T007 [US2] Add max participants check (4) to `joinRoom` service in backend/src/services/roomStore.ts
- [x] T008 [US2] Update POST /rooms/:code/join endpoint in backend/src/api/rooms.ts with duplicate name error (400) and room full error (403)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Create + Join flows with all validation errors work.

---

## Phase 5: User Story 3 - Lobby Auto-Refresh (Priority: P2)

**Goal**: The lobby participant list refreshes automatically via ~2s polling without manual action.

**Independent Test**: Two browser tabs show the same room; when a new player joins, the existing player's lobby updates automatically within ~2 seconds.

### Implementation for User Story 3

- [x] T009 [US3] Add auto-polling with `setInterval` (~2s) in frontend/src/pages/LobbyPage.tsx using `fetchRoom` from roomStore
- [x] T010 [US3] Add polling cleanup on component unmount (clearInterval) in frontend/src/pages/LobbyPage.tsx
- [x] T011 [US3] Add loading state indicator during polling in frontend/src/pages/LobbyPage.tsx

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work. Participants appear in lobby automatically within ~2s.

---

## Phase 6: User Story 4 - Host Starts the Game (Priority: P2)

**Goal**: Only the host can start the game from the lobby once at least 2 players are present. Non-host players see no start button; insufficient players see an error.

**Independent Test**: A host with at least 2 players in the lobby can start the game; a host with only 1 player cannot.

### Implementation for User Story 4

- [x] T012 [P] [US4] Add `startGame` method to backend/src/services/roomStore.ts: validate hostId matches requester, validate ≥2 participants, set status to `"playing"`
- [x] T013 [US4] Add POST /rooms/:code/start endpoint in backend/src/api/rooms.ts that calls startGame and returns updated room
- [x] T014 [P] [US4] Add `startGame` API call function in frontend/src/services/api.ts
- [x] T015 [US4] Add `startGame` action and loading/error state to frontend/src/state/roomStore.ts
- [x] T016 [US4] Update LobbyPage in frontend/src/pages/LobbyPage.tsx: host-only Start Game button, error display for <2 players, non-host hides the button

**Checkpoint**: At this point, all user stories should be independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [x] T017 Run validation scenarios from quickstart.md (specs/001-room-setup-lobby/quickstart.md) in two browser tabs

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 creates host concept → US4 depends on US1 for host tracking
  - US2 adds join validation → US3 depends on room state being correct
  - US3 can proceed after US2 since polling fetches existing GET /rooms/:code endpoint
  - US4 depends on US1 + US2 (needs hostId + participants)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - No dependencies on other stories (can be parallel with US1)
- **User Story 3 (P2)**: Can start after Foundational + US2 (needs valid participants to observe polling)
- **User Story 4 (P2)**: Depends on US1 (hostId) + US2 (participants for 2-player check)

### Within Each User Story

- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- US1 and US2 can run in parallel (different service methods, different endpoints)
- T012 and T014 [P] can run in parallel (backend endpoint vs frontend API call)
- Once Foundational phase completes, US1 and US2 can start in parallel

---

## Parallel Example: User Story 1

```bash
# US1 is sequential within itself (service → endpoint):
Task: "Update createRoom service in backend/src/services/roomStore.ts"
Task: "Update POST /rooms endpoint in backend/src/api/rooms.ts"
```

## Parallel Example: User Story 4

```bash
# Launch backend endpoint and frontend API call in parallel:
Task: "Add startGame method to backend/src/services/roomStore.ts"
Task: "Add startGame API call in frontend/src/services/api.ts"

# Then launch endpoint (depends on service):
Task: "Add POST /rooms/:code/start endpoint in backend/src/api/rooms.ts"

# Then launch store (depends on API call):
Task: "Add startGame action to frontend/src/state/roomStore.ts"

# Then LobbyPage (depends on store):
Task: "Update LobbyPage in frontend/src/pages/LobbyPage.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Create Room)
4. Complete Phase 4: User Story 2 (Join Room)
5. **STOP and VALIDATE**: Test create + join flows independently
6. Validate with two browser tabs using quickstart.md Scenarios 1-2, 6-7

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Create room works independently
3. Add User Story 2 → Join room works independently
4. Add User Story 3 → Lobby auto-refresh works
5. Add User Story 4 → Host can start game
6. Run all quickstart.md scenarios to validate end-to-end

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
