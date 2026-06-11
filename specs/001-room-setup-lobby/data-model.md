# Data Model: Room Setup & Lobby

## Entities

### Room

| Field | Type | Description |
|-------|------|-------------|
| `code` | `string` | Unique 4-char uppercase alphanumeric room identifier (no vowels, no 0/1) |
| `status` | `RoomStatus` | Current room status: `"lobby"` |
| `hostId` | `string` | Participant ID of the room creator (host) |
| `participants` | `Participant[]` | List of participants in the room |
| `createdAt` | `string` | ISO 8601 timestamp of room creation |
| `updatedAt` | `string` | ISO 8601 timestamp of last update |

**Validation Rules**:
- Room codes are 4 characters, uppercase, excluding vowels and digits 0/1
- Host must be an existing participant in the room
- Status transitions: `"lobby" → "playing"` (when host starts game)
- Max 4 participants per room

### Participant

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | UUID v4 unique participant identifier |
| `name` | `string` | Display name (non-empty, trimmed, unique within room) |
| `joinedAt` | `string` | ISO 8601 timestamp of join |

**Validation Rules**:
- Name must be non-empty after trimming whitespace
- Name must be unique among current participants in the same room
- Max 4 participants per room

### RoomStatus

| Value | Description |
|-------|-------------|
| `"lobby"` | Room created, waiting for players; host can start game |

*Note: `"playing"` and `"finished"` statuses will be added in subsequent slices.*

## State Transitions

```
[Room Created] ──→ lobby
                      │
                      │ (host starts game, ≥2 players)
                      ↓
                   playing   ←── (added in Slice 2)
```

## Relationships

- **Room** 1───* **Participant**: A room contains 0 or more participants
- **Room.hostId** references **Participant.id**: The host is one of the participants
- Rooms are fully isolated — no cross-room relationships
