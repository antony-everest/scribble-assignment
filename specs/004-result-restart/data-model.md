# Data Model: Result, Restart & Final Validation

## Entities

### Room (updated)

| Field | Type | Description |
|-------|------|-------------|
| `code` | `string` | Unique 4-char uppercase alphanumeric room identifier |
| `status` | `RoomStatus` | Current room status: `"lobby"` \| `"playing"` \| `"finished"` |
| `hostId` | `string` | Participant ID of the room creator (host) |
| `participants` | `Participant[]` | List of participants in the room |
| `currentDrawerId` | `string \| null` | Participant ID of the current drawer; cleared on restart |
| `secretWord` | `string \| null` | Secret word for the round; cleared on restart; revealed to all when finished |
| `guessHistory` | `Guess[]` | Chronological list of guess submissions; cleared on restart |
| `canvasStrokes` | `Stroke[]` | Drawing strokes; cleared on restart |
| `createdAt` | `string` | ISO 8601 timestamp of room creation |
| `updatedAt` | `string` | ISO 8601 timestamp of last update |

**Validation Rules (added)**:
- Status transitions: `"playing" → "finished"` (existing) → `"finished" → "lobby"` (new: on restart)
- `status` MUST NOT transition from `"lobby"` directly to `"finished"` (must go through `"playing"`)
- On restart, `guessHistory`, `canvasStrokes`, `currentDrawerId`, and `secretWord` MUST be reset to initial/empty values
- On restart, `participants` array MUST NOT be modified

### Participant (unchanged from previous slices)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | UUID v4 unique participant identifier |
| `name` | `string` | Display name |
| `joinedAt` | `string` | ISO 8601 timestamp of join |

### Guess (unchanged)

| Field | Type | Description |
|-------|------|-------------|
| `participantId` | `string` | UUID of the guesser |
| `name` | `string` | Display name of the guesser |
| `text` | `string` | The trimmed guess text |
| `isCorrect` | `boolean` | Whether the guess matched the secret word |
| `timestamp` | `string` | ISO 8601 timestamp of submission |

### Stroke (unchanged)

| Field | Type | Description |
|-------|------|-------------|
| `points` | `Point[]` | Array of points comprising the stroke |
| `color` | `string` | Stroke color |
| `width` | `number` | Stroke width |

### RoomSnapshot (updated)

| Field | Type | Description |
|-------|------|-------------|
| `code` | `string` | Room code |
| `status` | `RoomStatus` | Current status |
| `hostId` | `string` | Host participant ID |
| `participants` | `Participant[]` | Participant list |
| `currentDrawerId` | `string \| null` | Drawer participant ID |
| `secretWord` | `string \| null` | Secret word: shown to all when `finished`, only to drawer when `playing`, null when `lobby` |
| `guessHistory` | `Guess[]` | All guesses (shown to all participants) |
| `scores` | `Record<string, number>` | Computed scores (shown to all participants) |
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
                      │ (all guessers guessed correctly)
                      ↓
                   finished  (word revealed to all, final scores displayed)
                      │
                      │ (host restarts — NEW TRANSITION)
                      ↓
                   lobby  (players preserved, round state cleared)
```

## Relationships

- **Room** 1───* **Participant**: Room contains 0-4 participants (unchanged)
- **Room** 1───* **Guess**: Room has a guess history (cleared on restart)
- **Room** 1───* **Stroke**: Room has a canvas stroke collection (cleared on restart)
- Rooms are fully isolated — no cross-room relationships
