# Research: Game Start & Drawer Flow

## Technical Decisions

### Name Validation Strategy
- **Decision**: Validate all participant names on game start: trim whitespace, reject empty/whitespace-only, reject duplicates after trim
- **Rationale**: Spec requires trimming at game-start time; existing join-time check does not trim, so two names like "Alice " and "Alice" could pass join but collide on start
- **Alternatives considered**: Trim at join time — would change Slice 1 behavior; cleaner to validate at start per spec

### Drawer Assignment
- **Decision**: Assign host participant (room creator) as the drawer
- **Rationale**: Spec explicitly states "the host (or first player) becomes the clearly-identified drawer"
- **Alternatives considered**: Random drawer selection — rejected (spec says host); first in participant list — same as host since host is always first

### Secret Word Selection Formula
- **Decision**: `STARTER_WORDS[(participantCount - 2) % STARTER_WORDS.length]` where participantCount ≥ 2
  - 2 players → word[0] = "rocket"
  - 3 players → word[1] = "pizza"
  - 4 players → word[2] = "castle"
- **Rationale**: Deterministic pure function of room state; scales with player count; always picks the same word for the same room composition
- **Alternatives considered**: Use room code character codes — less predictable; use round number — only 1 round per constitution

### Secret Word Visibility
- **Decision**: `toRoomSnapshot` includes `secretWord` field only when `viewerParticipantId === currentDrawerId`; otherwise field is `null`
- **Rationale**: Simplest enforcement at the snapshot layer; no risk of leaking via polling
- **Alternatives considered**: Separate drawer-only endpoint — unnecessary complexity; filter on frontend — insecure (data already sent)

### Participant Role Derivation
- **Decision**: Derive role (`"drawer"` or `"guesser"`) from `currentDrawerId` rather than storing a role per participant
- **Rationale**: Only one drawer exists per game; storing per-participant role would duplicate information
- **Alternatives considered**: Per-participant `role` field — redundant when drawer is a single ID; use existing `ParticipantRole` type — can be added if needed later

### Game Start Error Handling
- **Decision**: Return specific error messages for:
  - `"Name is empty after trimming"` (400)
  - `"Duplicate names after trimming: Alice"` (400)
  - Existing: `"Only the host can start the game"` (403), `"At least 2 players are required to start"` (400), `"Room not found"` (404)
- **Rationale**: Spec requires clear error messages for name validation failures
- **Alternatives considered**: Generic "cannot start" message — less helpful for debugging
