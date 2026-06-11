# Feature Specification: Gameplay Interaction

**Feature Branch**: `003-gameplay-interaction`

**Created**: 2026-06-11

**Status**: Draft

**Input**: User description: "Slice 3 — Gameplay Interaction. Given a round is active with a drawer and guessers (all scores start at 0), When the drawer draws/clears the canvas and guessers submit their guesses, Then the drawing is visible on the drawer's screen; guesses are trimmed, case-insensitively compared, and empty ones rejected; the guess history is synced to all players via polling; correct guesses score 100 (incorrect add 0)."

## Clarifications

### Session 2026-06-11

- Q: When does the game end? → A: After all guessers have guessed correctly (most inclusive, aligns with single-round no-timer design)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Drawer Draws and Clears Canvas (Priority: P1)

As the drawer, when the game round is active, I want to draw on a canvas and clear it when needed so that guessers can see my drawing and try to guess the word.

**Why this priority**: Core interaction — without a drawing, guessers have nothing to go on.

**Independent Test**: Can be tested by starting a game as the drawer, drawing on the canvas, and verifying the drawing appears. Clear the canvas and confirm it resets.

**Acceptance Scenarios**:

1. **Given** a game in progress where I am the drawer, **When** I draw on the canvas, **Then** the drawing is visible on my screen
2. **Given** I have drawn on the canvas, **When** I clear the canvas, **Then** the canvas resets to a blank state
3. **Given** I have drawn on the canvas, **When** other players view the game state, **Then** they see the current drawing

---

### User Story 2 - Guessers Submit Guesses (Priority: P1)

As a guesser, when a round is active, I want to submit text guesses that are compared case-insensitively against the secret word so that I can try to guess correctly.

**Why this priority**: Core interaction — without guesses, the game has no progression.

**Independent Test**: Can be tested by joining as a guesser and submitting various guesses (correct, incorrect, empty, mixed case). Correct guesses score 100 points; incorrect add 0; empty guesses are rejected.

**Acceptance Scenarios**:

1. **Given** a game in progress where I am a guesser, **When** I submit an empty or whitespace-only guess, **Then** the guess is rejected with an error message
2. **Given** a game in progress where I am a guesser, **When** I submit a guess, **Then** leading/trailing whitespace is trimmed before comparison
3. **Given** a game in progress where I am a guesser, **When** I submit a guess that matches the secret word (case-insensitively), **Then** my score increases by 100 and the guess is marked as correct
4. **Given** a game in progress where I am a guesser, **When** I submit a guess that does not match the secret word, **Then** my score remains unchanged and the guess is marked as incorrect

---

### User Story 3 - Guess History and Scores Are Synced (Priority: P1)

As any player, when guesses are submitted, I want to see the guess history and updated scores for all players so that I can track the game's progress.

**Why this priority**: Without shared state, players cannot coordinate and the game stalls.

**Independent Test**: Can be tested by having multiple guessers submit guesses (correct and incorrect) and verifying all players see the same guess history and scores within one poll cycle.

**Acceptance Scenarios**:

1. **Given** guesses have been submitted in a game, **When** any player views the game state, **Then** they see the full guess history with each guesser's name, guess text, and result (correct/incorrect)
2. **Given** a guesser has submitted a correct guess, **When** all players view the game state, **Then** they see the guesser's updated score (previous score + 100)
3. **Given** a guesser has submitted an incorrect guess, **When** all players view the game state, **Then** they see the guesser's score unchanged
4. **Given** all guessers have submitted a correct guess, **When** any player views the game state, **Then** the game status is "finished"

---

### Edge Cases

- What happens when a guesser submits a guess after already guessing correctly?
- How does the system handle rapid successive guesses from the same guesser?
- What happens if the drawer clears the canvas after guessers have seen a previous drawing?
- How does a guesser know their guess was received while waiting for the next poll cycle?
- What happens to the game state when all guessers have guessed correctly (who sees the "finished" status)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST capture drawing actions from the drawer and make the current canvas state available to all participants via polling
- **FR-002**: The drawer MUST be able to clear the canvas to a blank state
- **FR-003**: The system MUST reject empty or whitespace-only guesses with an error message
- **FR-004**: The system MUST trim leading and trailing whitespace from guesses before comparison
- **FR-005**: The system MUST compare guesses against the secret word case-insensitively
- **FR-006**: A correct guess MUST increase the guesser's score by exactly 100 points
- **FR-007**: An incorrect guess MUST NOT change the guesser's score
- **FR-008**: The system MUST maintain a guess history containing each guesser's name, guess text, and result (correct/incorrect)
- **FR-009**: The guess history MUST be visible to all participants via polling
- **FR-010**: All participants' scores MUST be visible to all participants via polling
- **FR-011**: The game MUST end (status transitions to "finished") when all guessers have submitted a correct guess
- **FR-012**: Once a guesser has guessed correctly, subsequent guesses from that guesser MUST be rejected

### Key Entities *(include if feature involves data)*

- **Game Room**: Holds game status, secret word, drawer ID, participant list with scores, guess history, and current canvas state
- **Guess**: A single guess submission containing the guesser ID, trimmed guess text, result (correct/incorrect), and timestamp
- **Score**: A running integer score per participant (starts at 0, increments by 100 for each correct guess)
- **Canvas State**: The current visual state of the drawing, updated by the drawer's actions

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The drawer can draw and clear the canvas, and all participants see the updated drawing within one poll cycle (~2s)
- **SC-002**: Empty or whitespace-only guesses are rejected with a clear error message before affecting game state
- **SC-003**: Correct case-insensitive guesses result in a 100-point score increase, visible to all within one poll cycle
- **SC-004**: All participants see the same guess history and scores within one poll cycle of any guess submission

## Assumptions

- The canvas drawing is synced to all players via HTTP polling (not real-time); drawings appear within one poll cycle
- Guessers see the current drawing on their screen (the description's "visible on the drawer's screen" applies to all participants)
- Each guesser can guess multiple times; only the first correct guess scores 100; subsequent guesses from that guesser are rejected
- Incorrect guesses do not penalize the guesser (no negative scoring)
- The drawer does not submit guesses and does not accumulate guess-based score
- All participants' scores start at 0 when the game begins
- Guesses are compared against the single secret word assigned at game start
