# Research: Result, Restart & Final Validation

## Technical Decisions

### Secret Word Reveal Strategy
- **Decision**: Modify `toRoomSnapshot` to always include `secretWord` when `room.status === "finished"`, regardless of viewer identity.
- **Rationale**: Once the game ends, there is no reason to hide the secret word. All participants should see it. This is a single condition check in the snapshot function.
- **Alternatives considered**: Create a separate field `revealedWord` — unnecessary duplication; `secretWord` already exists and can be conditionally exposed.

### Restart API Design
- **Decision**: Add `POST /rooms/:code/restart` endpoint. Only the host can call it. It resets room state and returns the updated room with status "lobby".
- **Rationale**: Single atomic endpoint mirrors the existing `POST /rooms/:code/start` pattern. Consistent with host-only authorization model.
- **Alternatives considered**: Reuse `POST /rooms/:code/start` from finished state — would overload the start endpoint with two distinct behaviors; separate endpoint is cleaner.

### State Reset on Restart
- **Decision**: On restart, set: `guessHistory = []`, `canvasStrokes = []`, `currentDrawerId = null`, `secretWord = null`, `status = "lobby"`. Participants array is untouched.
- **Rationale**: Participants are preserved per spec. Scores are derived from guessHistory so they auto-clear. Drawer and word must be unset so the next `startGame` flow can assign new values deterministically.
- **Alternatives considered**: Reset all fields including participants — violates FR-006 (players preserved); set scores to zero map — unnecessary since scores derive from history.

### Finished State Secret Word in Snapshot
- **Decision**: In `toRoomSnapshot`, when `status === "finished"`, always include `secretWord` (ignore `viewerParticipantId` check).
- **Rationale**: Simplest way to satisfy FR-001. Single condition that overrides the drawer-only visibility rule when the game is over.
- **Alternatives considered**: Store a separate `revealedSecretWord` field — introduces redundant state that must be kept in sync.

### Frontend Restart Handling
- **Decision**: In the GamePage "Game Over" view, show a "Play Again" button for the host only. On click, call the restart API. Navigate to lobby page on success.
- **Rationale**: Host initiates restart and all players follow via polling. Navigating to lobby gives consistent experience. Non-host players see the "Game Over" view until their next poll picks up the "lobby" status change.
- **Alternatives considered**: Show inline countdown — adds complexity; auto-navigate — confusing if user is reading results.

### Lobby Page After Restart
- **Decision**: The existing LobbyPage handles lobby status already. The Start Game button will become visible again (host-only, as before). No special "restarted" banner needed — the cleared state is self-evident.
- **Rationale**: The lobby page already polls and renders for "lobby" status. After restart, the room status transitions back to "lobby", so the existing UI handles it naturally.
- **Alternatives considered**: Add a "Round 2" indicator — unnecessary for first version; keep scores from previous round — violates spec (scores should reset).
