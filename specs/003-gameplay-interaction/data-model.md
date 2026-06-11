# Data Model: Gameplay Interaction

## Entities

### Room (updated)

| Field | Type | Description |
|-------|------|-------------|
| `code` | `string` | Unique 4-char uppercase alphanumeric room identifier |
| `status` | `RoomStatus` | Current room status: `"lobby"` \| `"playing"` \| `"finished"` |
| `hostId` | `string` | Participant ID of the room creator (host) |
| `participants` | `Participant[]` | List of participants in the room |
| `currentDrawerId` | `string \| null` | Participant ID of the current drawer; set when game starts |
| `secretWord` | `string \| null` | The secret word for the current round; set when game starts |
| `guessHistory` | `Guess[]` | Chronological list of all guess submissions |
| `canvasStrokes` | `Stroke[]` | Chronological list of all drawing strokes |
| `createdAt` | `string` | ISO 8601 timestamp of room creation |
| `updatedAt` | `string` | ISO 8601 timestamp of last update |

**Validation Rules (added)**:
- Status transitions: `"playing" → "finished"` (when all guessers have guessed correctly)
- `guessHistory` is append-only — entries may not be removed or modified
- `canvasStrokes` is append-only for draw actions; may be reset to `[]` by clear action

### Participant (unchanged from Slice 2)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | UUID v4 unique participant identifier |
| `name` | `string` | Display name (non-empty after trim, unique within room) |
| `joinedAt` | `string` | ISO 8601 timestamp of join |

### Guess (new)

| Field | Type | Description |
|-------|------|-------------|
| `participantId` | `string` | UUID of the participant who submitted the guess |
| `name` | `string` | Display name of the guesser (denormalized for history display) |
| `text` | `string` | The trimmed guess text |
| `isCorrect` | `boolean` | Whether the guess matched the secret word |
| `timestamp` | `string` | ISO 8601 timestamp of submission |

**Validation Rules**:
- `text` must be non-empty after trimming whitespace
- `participantId` must belong to a current room participant
- `participantId` must NOT equal `currentDrawerId`
- If the participant already has a correct guess in `guessHistory`, subsequent guesses must be rejected

### Stroke (new)

| Field | Type | Description |
|-------|------|-------------|
| `points` | `Point[]` | Array of points comprising the stroke |
| `color` | `string` | Stroke color (hex, e.g. `"#000000"`) |
| `width` | `number` | Stroke width in pixels |

### Point (new)

| Field | Type | Description |
|-------|------|-------------|
| `x` | `number` | X coordinate relative to canvas |
| `y` | `number` | Y coordinate relative to canvas |

### RoomSnapshot (updated)

| Field | Type | Description |
|-------|------|-------------|
| `code` | `string` | Room code |
| `status` | `RoomStatus` | Current status |
| `hostId` | `string` | Host participant ID |
| `participants` | `Participant[]` | Participant list |
| `currentDrawerId` | `string \| null` | Drawer participant ID |
| `secretWord` | `string \| null` | Secret word (`null` for non-drawer viewers) |
| `guessHistory` | `Guess[]` | All guesses submitted so far (visible to all) |
| `scores` | `Record<string, number>` | Computed scores: participantId → score (100 per correct guess) |
| `canvasStrokes` | `Stroke[]` | Current canvas strokes |
| `availableWords` | `string[]` | Starter word list |
| `roles` | `ParticipantRole[]` | Available role values |

## State Transitions

```
[Room Created] ──→ lobby
                      │
                      │ (host starts game, ≥2 players, names valid)
                      ↓
                   playing  (drawer assigned, secret word selected)
                      │
                      │ (all guessers have guessed correctly)
                      ↓
                   finished
```

## Relationships

- **Room** 1───* **Guess**: A room has a guess history
- **Room** 1───* **Stroke**: A room has a canvas stroke collection
- **Room.hostId** references **Participant.id**: The host is one of the participants
- **Room.currentDrawerId** references **Participant.id**: The drawer is one of the participants
- **Guess.participantId** references **Participant.id**: Each guess belongs to a participant
- Rooms are fully isolated — no cross-room relationships
