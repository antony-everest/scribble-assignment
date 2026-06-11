# Data Model: Game Start & Drawer Flow

## Entities

### Room

| Field | Type | Description |
|-------|------|-------------|
| `code` | `string` | Unique 4-char uppercase alphanumeric room identifier |
| `status` | `RoomStatus` | Current room status: `"lobby"` | `"playing"` | `"finished"` |
| `hostId` | `string` | Participant ID of the room creator (host) |
| `participants` | `Participant[]` | List of participants in the room |
| `currentDrawerId` | `string \| null` | Participant ID of the current drawer; set when game starts |
| `secretWord` | `string \| null` | The secret word for the current round; set when game starts |
| `createdAt` | `string` | ISO 8601 timestamp of room creation |
| `updatedAt` | `string` | ISO 8601 timestamp of last update |

**Validation Rules (added or updated from Slice 1)**:
- Status transitions: `"lobby" → "playing"` (when host starts game with ≥2 valid participants)
- `currentDrawerId` MUST be one of the participant IDs when status is `"playing"`
- `secretWord` MUST be a word from the starter list when status is `"playing"`

### Participant

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | UUID v4 unique participant identifier |
| `name` | `string` | Display name (non-empty after trim, no duplicates after trim, unique within room) |
| `joinedAt` | `string` | ISO 8601 timestamp of join |

**Validation Rules (updated)**:
- Name must be non-empty after trimming whitespace (checked at join time and game start)
- Name must be unique among current participants (checked at join time; re-checked after trim at game start)
- Max 4 participants per room

### RoomSnapshot

| Field | Type | Description |
|-------|------|-------------|
| `code` | `string` | Room code |
| `status` | `RoomStatus` | Current status |
| `hostId` | `string` | Host participant ID |
| `participants` | `Participant[]` | Participant list |
| `currentDrawerId` | `string \| null` | Drawer participant ID (visible to all) |
| `secretWord` | `string \| null` | Secret word (`null` for non-drawer viewers; the word for the drawer) |
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
                      │ (game ends — future slice)
                      ↓
                  finished
```

## Relationships

- **Room** 1───* **Participant**: A room contains 0 or more participants
- **Room.hostId** references **Participant.id**: The host is one of the participants
- **Room.currentDrawerId** references **Participant.id**: The drawer is one of the participants (set when game starts)
- Rooms are fully isolated — no cross-room relationships
