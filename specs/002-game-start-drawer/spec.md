# Feature Specification: Game Start & Drawer Flow

**Feature Branch**: `002-game-start-drawer`

**Created**: 2026-06-11

**Status**: Draft

**Input**: User description: "Slice 2 — Game Start & Drawer Flow. Given a game is starting and player names are trimmed (empty/whitespace-only rejected with a message), When the first round begins, Then the host (or first player) becomes the clearly-identified drawer, and the secret word (deterministically selected from the starter list) is visible only to the drawer."

## Clarifications

### Session 2026-06-11

- Q: When trimming produces duplicate names (e.g. "Alice " and "Alice" both become "Alice"), how should the system handle the collision? → A: Reject game start with an error message listing the conflicting names.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Game Starts with Drawer and Secret Word (Priority: P1)

As players in a lobby with 2+ participants, when the host starts the game, I want the game to begin by assigning a drawer and revealing a secret word only to that drawer so that the drawing round can proceed.

**Why this priority**: Core flow of the feature — without drawer assignment and word revelation the game cannot progress beyond the lobby.

**Independent Test**: Can be tested by joining a room with 2+ players and starting the game. Each player's game state reveals the drawer identity; only the drawer sees the word.

**Acceptance Scenarios**:

1. **Given** a room with 2 or more participants, **When** the host starts the game, **Then** the game status changes to "playing" for all participants within one poll cycle
2. **Given** a game that has started, **When** any participant views the game state, **Then** exactly one participant is identified as the drawer and all others as guessers
3. **Given** a game that has started, **When** the drawer views the game state, **Then** the secret word is visible in the response
4. **Given** a game that has started, **When** a non-drawer participant views the game state, **Then** the secret word is absent or obscured

---

### User Story 2 - Player Name Validation on Game Start (Priority: P1)

As a host trying to start a game, I want participant names to be trimmed and empty/whitespace-only names to be rejected so that all players have meaningful display names during gameplay.

**Why this priority**: Prevents anonymous or unidentifiable participants from entering gameplay, which would break the drawing/guessing experience.

**Independent Test**: Can be tested by joining a room with a whitespace-only name and attempting to start the game. Game start is rejected with an error message.

**Acceptance Scenarios**:

1. **Given** a room with 2+ participants where at least one participant's name is empty or whitespace-only after trimming, **When** the host attempts to start the game, **Then** the game does not start and an error message is returned
2. **Given** a room where all participant names are non-empty after trimming, **When** the host starts the game, **Then** names are trimmed and the game starts successfully
3. **Given** a room where two or more participant names become identical after trimming, **When** the host attempts to start the game, **Then** the game does not start and an error message listing the conflicting names is returned

---

### Edge Cases

- What happens when all participants in a 2+ player room have empty/whitespace-only names?
- What happens when two participant names become identical after trimming (e.g. "Alice " and "Alice")?
- How does the system ensure the secret word is never leaked to non-drawer players via game state updates?
- What happens if the host leaves the room before starting the game (room is hostless)?
- How is the word deterministically selected when the room has the same participants and starter list each time?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When the host requests game start, the system MUST trim leading/trailing whitespace from all participant names
- **FR-002**: If any participant name is empty or whitespace-only after trimming, the system MUST reject the game start and return an error message
- **FR-002b**: If trimming causes two or more participant names to become identical, the system MUST reject the game start and return an error message listing the conflicting names
- **FR-003**: On successful game start, the system MUST assign exactly one participant as the drawer
- **FR-004**: The system MUST assign the host participant as the drawer
- **FR-005**: The system MUST select a secret word deterministically from the starter list such that identical room state always produces the same word
- **FR-006**: The system MUST reveal the secret word only when the requesting participant is the drawer
- **FR-007**: Non-drawer participants MUST NOT be able to see the secret word in any game data returned to them
- **FR-008**: All participants MUST be able to identify who the current drawer is from the game state

### Key Entities *(include if feature involves data)*

- **Game Room**: Holds game status ("playing"), participant list, drawer assignment, and the secret word for the current round
- **Participant**: A player in the room with a trimmed display name, assigned role (drawer or guesser), and optional visibility of the secret word
- **Secret Word**: A word deterministically selected from the starter word list, visible only to the assigned drawer

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every participant can identify who the drawer is within one poll cycle (~2s) of game start
- **SC-002**: Non-drawer participants never see the secret word in any game data they receive
- **SC-003**: Empty, whitespace-only, or collision-causing names are rejected with a clear error message before game start
- **SC-004**: Given identical room state (same participants, same starter list), the same secret word is selected every time

## Assumptions

- The starter word list contains exactly 5 words: "rocket", "pizza", "castle", "guitar", "sunflower"
- The game has a single round only (multiple rounds and drawer rotation are out of scope per architecture constraints)
- The host is always the first participant in the room and is designated as the drawer
- Name validation occurs at game-start time, not at join time (players may join with empty/whitespace names but cannot start the game)
- The room snapshot polling mechanism from Slice 1 is reused to propagate game state changes
