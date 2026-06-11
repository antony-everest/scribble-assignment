# Feature Specification: Result, Restart & Final Validation

**Feature Branch**: `004-result-restart`

**Created**: 2026-06-11

**Status**: Draft

**Input**: User description: "Slice 4 — Result, Restart & Final Validation. Given a round has ended, When the result state is displayed and the host restarts, Then all players see the correct word, final scores, and full guess history; on restart, everyone returns to the lobby with players preserved and all round state cleared."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Final Results (Priority: P1)

As any player, when the game has finished (all guessers guessed correctly), I want to see the secret word, final scores, and full guess history so that I can see how everyone performed.

**Why this priority**: Core interaction — without displaying results, players have no closure and cannot verify the correct answer.

**Independent Test**: Can be tested by starting a game, playing until all guessers guess correctly, and verifying the game-over state shows the secret word, each player's final score, and all guesses made during the round.

**Acceptance Scenarios**:

1. **Given** the game status is "finished", **When** any participant views the game state, **Then** they see the secret word that was assigned at game start
2. **Given** the game status is "finished", **When** any participant views the game state, **Then** they see each participant's final score (0 + 100 for each correct guess)
3. **Given** the game status is "finished", **When** any participant views the game state, **Then** they see the full guess history including each guesser's name, their submitted text, and whether it was correct or incorrect
4. **Given** the game status is "finished", **When** a participant views the game state, **Then** they see the final state of the canvas (drawing)

---

### User Story 2 - Host Restarts the Game (Priority: P1)

As the host, when the game has finished, I want to restart the game so that all participants can play another round without recreating the room.

**Why this priority**: Core interaction — without restart, players would have to leave and create a new room each time, severely limiting replayability.

**Independent Test**: Can be tested by finishing a game as the host, clicking restart, and verifying all participants return to the lobby with players preserved and round state cleared.

**Acceptance Scenarios**:

1. **Given** the game status is "finished" and I am the host, **When** I click restart, **Then** all participants see the lobby with the same room code and player list
2. **Given** the game status is "finished" and I am NOT the host, **When** I attempt to restart, **Then** the restart action is rejected
3. **Given** a game has been restarted, **When** participants view the lobby, **Then** the guess history, canvas drawings, scores, drawer assignment, and secret word are all cleared
4. **Given** a game has been restarted, **When** the host starts a new game from the lobby, **Then** a new round begins with a new secret word and drawer assignment (following the existing game start flow)

---

### Edge Cases

- What happens when the host restarts and a new player joins the lobby before the next game starts? — Same as Slice 1 lobby flow; new player can join if there is space (max 4)
- What happens if the host closes their browser after the game ends? — The game stays finished; no restart is possible without the host. Other players see the results but cannot restart.
- What happens if a player disconnects during the results screen? — Results persist in memory; if they reconnect (via polling), they see the same results.
- What happens to the canvas drawing when returning to lobby? — Canvas state is cleared on restart; the lobby shows no drawing.
- Can the host restart multiple times? — Yes, there is no limit on number of restarts within a session.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST reveal the secret word to all participants when the game status is "finished"
- **FR-002**: The system MUST display each participant's final score (0 + 100 per correct guess) when the game status is "finished"
- **FR-003**: The system MUST display the full guess history (guesser name, guess text, correct/incorrect) when the game status is "finished"
- **FR-004**: The system MUST display the final canvas state when the game status is "finished"
- **FR-005**: Only the host MUST be able to restart a finished game
- **FR-006**: On restart, all existing participants MUST remain in the room (players preserved)
- **FR-007**: On restart, the room code MUST remain unchanged
- **FR-008**: On restart, round-specific state MUST be cleared: guess history, canvas strokes, scores, drawer assignment, and secret word
- **FR-009**: On restart, the room status MUST transition to "lobby"
- **FR-010**: After restart, the host MUST be able to start a new game from the lobby, following the existing game start flow (name validation, drawer assignment, word selection)

### Key Entities *(include if feature involves data)*

- **Game Room**: Holds game status, participant list, and round state. On restart, round-specific fields are cleared but the room and participants persist.
- **Room Status**: Transitions "playing" → "finished" (existing) → "lobby" (new transition on restart).
- **Results View**: The finished game state includes the secret word (now visible to all), final scores (derived from guess history), full guess history, and final canvas state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

*Poll interval is ~2 seconds (standard frontend polling rate).*

- **SC-001**: Within one poll cycle of the game ending, all participants see the secret word, final scores, and full guess history
- **SC-002**: Only the host can trigger the restart action; non-host participants see the restart option disabled or hidden
- **SC-003**: On restart, all participants see the lobby with the same room code and the same player list within one poll cycle
- **SC-004**: After restart, round-specific state (drawing, guesses, scores, drawer assignment, secret word) is cleared for all participants within one poll cycle
- **SC-005**: A completed game can be restarted and a new game started and played to completion without errors

## Assumptions

- Only the host can restart (same privilege model as starting the game)
- Restart does not create a new room; the same room code and participants persist
- The host can restart as many times as desired
- If the host disconnects after game end, no restart is possible without them
- Players who join after restart follow the existing lobby join flow (max 4 participants)
- The canvas is cleared on restart (not preserved for the next round)
- Scores reset to 0 on restart (each round is independent)
- Manual restart by the host does not constitute "multiple rounds" as defined by the architecture constraints (which refer to automated drawer rotation and round progression); each restart is an explicit host action that resets all state to the lobby, and a new game must be started manually
