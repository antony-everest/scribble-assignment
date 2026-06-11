# Feature Specification: Room Setup & Lobby

**Feature Branch**: `001-room-setup-lobby`

**Created**: 2026-06-11

**Status**: Draft

**Input**: User description: "Slice 1 — Room Setup & Lobby. Given a player wants to host or join a drawing game, When they create or join a room via a unique code, Then the creator is automatically the host; invalid/empty codes are rejected with clear feedback; rooms are fully isolated; the lobby refreshes via polling (~2s); and only the host can start the game once at least 2 players are present."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Host Creates a Room (Priority: P1)

A player opens the game, enters their display name, and creates a new room. They receive a unique room code and are automatically designated as the host.

**Why this priority**: Room creation is the entry point for the entire game flow. Without it, no other scenario is possible.

**Independent Test**: A single player can create a room, see the room code, confirm they are the host, and land on the lobby screen.

**Acceptance Scenarios**:

1. **Given** the game has not started, **When** a player creates a room with a valid non-empty display name, **Then** the system returns a unique 4-character room code, the player is marked as the host, and they are redirected to the lobby.

2. **Given** a player attempts to create a room, **When** the display name is empty or contains only whitespace, **Then** the system rejects the request with a clear error message and does not create a room.

3. **Given** a room has been created, **When** another player attempts to create a room, **Then** they receive a different unique room code, ensuring room isolation.

---

### User Story 2 - Player Joins a Room (Priority: P1)

A player opens the game, enters their display name and a room code, and joins an existing room as a participant.

**Why this priority**: Joining rooms is required for multiplayer gameplay. Both create and join are equally fundamental.

**Independent Test**: A player can join an existing room by entering a valid room code and see themselves appear in the lobby participant list.

**Acceptance Scenarios**:

1. **Given** a room exists, **When** a player enters the correct room code and a valid display name, **Then** they are added to the room's participant list and redirected to the lobby.

2. **Given** a player attempts to join a room, **When** the room code is invalid or does not exist, **Then** the system returns a clear error message and does not add them to any room.

3. **Given** a player attempts to join a room, **When** the room code is empty, **Then** the system rejects with a clear error message.

4. **Given** a player attempts to join a room, **When** their display name is empty or whitespace-only, **Then** the system rejects with a clear error message.

---

### User Story 3 - Lobby Auto-Refresh (Priority: P2)

All players in the lobby see an up-to-date participant list that refreshes automatically.

**Why this priority**: Without automatic refresh, players would need to manually reload to see new participants. This is essential for a smooth multiplayer experience.

**Independent Test**: Two browser tabs show the same room; when a new player joins, the existing player's lobby updates automatically within ~2 seconds.

**Acceptance Scenarios**:

1. **Given** a player is in the lobby, **When** another player joins the room, **Then** the first player's participant list updates within approximately 2 seconds without manual action.

2. **Given** a player is in the lobby, **When** they navigate away and return, **Then** the current participant list is displayed.

---

### User Story 4 - Host Starts the Game (Priority: P2)

The host can start the game from the lobby once a minimum of 2 players are present.

**Why this priority**: Starting the game is a precondition for all gameplay scenarios. The 2-player minimum ensures the game is playable.

**Independent Test**: A host with at least 2 players in the lobby can start the game; a host with only 1 player cannot.

**Acceptance Scenarios**:

1. **Given** a room has at least 2 players in the lobby, **When** the host clicks the start button, **Then** the game round begins and all players transition to the game screen.

2. **Given** a room has fewer than 2 players, **When** the host clicks the start button, **Then** the system shows a message that at least 2 players are required and does not start the game.

3. **Given** a room has at least 2 players, **When** a non-host player attempts to start the game, **Then** the system ignores the request or shows a permission error.

---

### Edge Cases

- What happens when a player enters a room code with leading/trailing whitespace? The system SHOULD trim the code before lookup.
- What happens when the room is full? The system SHOULD reject new join attempts with a clear message.
- What happens when the server restarts and all rooms are lost? Players SHOULD see that the room no longer exists and be redirected appropriately.
- What happens when a player disconnects or closes their browser? Their participant entry MAY remain until explicitly removed or the room is cleaned up.
- What happens when the host disconnects? The room becomes hostless; remaining players see the lobby but cannot start the game. No auto-promotion occurs.
- What happens when a player tries to join a room with a display name that matches an existing participant? The system SHOULD reject the join with a message that the name is taken.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow a player to create a room with a display name and receive a unique room code.
- **FR-002**: System MUST designate the room creator as the host.
- **FR-003**: System MUST reject room creation with empty or whitespace-only display names.
- **FR-004**: System MUST allow a player to join an existing room by providing a room code and a unique display name.
- **FR-005**: System MUST reject join attempts with invalid or non-existent room codes.
- **FR-006**: System MUST reject join attempts with empty or whitespace-only display names.
- **FR-014**: System MUST reject join attempts when the requested display name is already taken by another participant in the same room.
- **FR-007**: System MUST reject join attempts with empty room codes.
- **FR-008**: System MUST ensure rooms are fully isolated (actions in one room do not affect another).
- **FR-009**: System MUST auto-refresh the lobby participant list approximately every 2 seconds via polling.
- **FR-010**: System MUST allow only the host to start the game.
- **FR-011**: System MUST require at least 2 players before the game can be started.
- **FR-012**: System MUST return a clear error message when start is attempted with fewer than 2 players.
- **FR-013**: System MUST trim leading and trailing whitespace from room codes before processing.

### Key Entities *(include if feature involves data)*

- **Room**: A game session identified by a unique 4-character code. Contains a list of participants, a host designation, and a status (lobby, playing, finished). Rooms are stored in-memory and are fully isolated from each other.
- **Participant**: A player within a room, identified by a unique participant ID and a display name. Display names MUST be unique within a room. One participant is designated as the host.
- **Host**: The participant who created the room. Has exclusive permission to start the game. If the host disconnects, the room becomes hostless and no participant can start the game (players must create a new room).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can create a room and see a unique room code within 2 seconds.
- **SC-002**: A second player can join an existing room by entering the correct room code within 2 seconds.
- **SC-003**: The lobby participant list updates within approximately 2 seconds of a new player joining, without manual refresh.
- **SC-004**: A host with 2+ players can start the game; a host with only 1 player sees a clear message explaining 2 players are needed.
- **SC-005**: Invalid room codes and empty display names always produce a clear, user-facing error message.

## Clarifications

### Session 2026-06-11

- Q: Can two participants in the same room share the same display name, or must names be unique within a room? → A: Names MUST be unique within a room; joining with a taken name shows an error message.
- Q: What happens when the host leaves or disconnects? → A: Host departure leaves the room hostless; remaining players see the lobby but cannot start the game. Auto-promotion is not implemented.

## Assumptions

- Room codes are 4-character alphanumeric strings generated by the system (not user-chosen).
- The server runs in-memory only; room state is lost on server restart.
- Display names are trimmed and must be non-empty after trimming.
- A maximum of 4 participants is reasonable for a drawing game room.
- Players use modern browsers (Chrome, Firefox, Safari, Edge) with JavaScript enabled.
- Network latency for polling is within normal local/cloud ranges (sub-200ms response time).
