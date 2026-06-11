# Research: Gameplay Interaction

## Technical Decisions

### Canvas Drawing Serialization
- **Decision**: Store drawing as an array of strokes, each stroke being an array of `{x, y}` points with `color` and `width` metadata. Transmitted as JSON via HTTP polling.
- **Rationale**: Strokes are trivially serializable, replayable on any canvas, and support incremental addition without data loss. Base64 images would be larger and harder to diff; SVG would require a DOM parser.
- **Alternatives considered**: Base64 PNG snapshots — larger payloads, no incremental support; SVG path data — more complex on the drawing side; single flat point array — loses stroke boundaries for rendering.

### Canvas Clear Implementation
- **Decision**: `POST /rooms/:code/clear` resets `canvasStrokes` to an empty array on the server. No soft-delete or undo history.
- **Rationale**: Spec requires only clear (not undo). Simple array reset matches spec requirements exactly.
- **Alternatives considered**: Tombstone/marker stroke to indicate clear point — unnecessary complexity for a single clear action.

### Score Derivation
- **Decision**: Scores are derived from `guessHistory` at snapshot time: for each participant, count their correct guesses and multiply by 100.
- **Rationale**: Single source of truth (guess history). No risk of scores drifting out of sync. Minimal computation cost (max 4 participants, limited guesses per round).
- **Alternatives considered**: Store `scores: Record<string, number>` on Room — duplicated state that must be manually kept in sync.

### Guess Validation Strategy
- **Decision**: Trim whitespace server-side before comparison. Empty/whitespace-only → 400 error. Case-insensitive comparison via `.toLowerCase()`. Reject guesses from the drawer and from guessers who already guessed correctly.
- **Rationale**: Server-side validation ensures consistency across clients. Case-insensitive comparison matches spec requirement.
- **Alternatives considered**: Client-only validation — insecure (malformed requests could bypass).

### Game End Detection
- **Decision**: After each correct guess, check if every non-drawer participant has at least one correct guess in `guessHistory`. If so, transition room status to `"finished"`.
- **Rationale**: Matches the clarified requirement: "game ends when all guessers have guessed correctly." Simple linear scan of guess history with max 4 participants.
- **Alternatives considered**: Track a count of correct guessers — more complex state to update.

### Drawing Authorization
- **Decision**: `POST /rooms/:code/draw` and `POST /rooms/:code/clear` validate that `requesterId === currentDrawerId`. Non-drawers receive 403.
- **Rationale**: Prevents guessers from modifying the canvas. Consistent with existing `startGame` authorization pattern.
- **Alternatives considered**: No authorization — guessers could erase/draw over the canvas.

### Guess Authorization
- **Decision**: Reject guesses from the drawer (participant ID matches `currentDrawerId`). Reject guesses from guessers who already have a correct guess in history.
- **Rationale**: Drawer knows the secret word so guessing is meaningless. FR-012 requires rejecting subsequent guesses after a correct one.
- **Alternatives considered**: Allow any guess but ignore drawer guesses — confusing UX.
