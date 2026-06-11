# API Contracts: Room Setup & Lobby

Base URL: `http://localhost:3001`

All responses return JSON. Errors return `{ "error": "<message>" }` with appropriate HTTP status codes.

---

## POST /rooms

Create a new room. The creator is automatically designated as host.

**Request Body**:
```json
{
  "playerName": "Alice"
}
```

**Success Response** (201):
```json
{
  "participantId": "uuid-string",
  "room": {
    "code": "XK4M",
    "status": "lobby",
    "hostId": "uuid-string",
    "participants": [
      {
        "id": "uuid-string",
        "name": "Alice",
        "joinedAt": "2026-06-11T12:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses**:
| Status | Condition | Body |
|--------|-----------|------|
| 400 | Empty/whitespace-only name | `{ "error": "Player name is required" }` |

---

## POST /rooms/:code/join

Join an existing room by code.

**Request Body**:
```json
{
  "playerName": "Bob"
}
```

**Success Response** (200):
```json
{
  "participantId": "uuid-string",
  "room": {
    "code": "XK4M",
    "status": "lobby",
    "hostId": "uuid-string",
    "participants": [
      { "id": "uuid-string", "name": "Alice", "joinedAt": "..." },
      { "id": "uuid-string", "name": "Bob", "joinedAt": "..." }
    ]
  }
}
```

**Error Responses**:
| Status | Condition | Body |
|--------|-----------|------|
| 400 | Empty/whitespace-only name | `{ "error": "Player name is required" }` |
| 400 | Empty room code | `{ "error": "Room code is required" }` |
| 400 | Display name already taken | `{ "error": "Name 'Bob' is already taken in this room" }` |
| 404 | Invalid/non-existent room code | `{ "error": "Room not found" }` |
| 403 | Room is full (max 4 participants) | `{ "error": "Room is full" }` |

**Note**: Room codes are trimmed of leading/trailing whitespace before lookup.

---

## GET /rooms/:code

Fetch the current room snapshot (polling endpoint).

**Query Parameters**: `?participantId=<uuid>` (optional)

**Success Response** (200):
```json
{
  "room": {
    "code": "XK4M",
    "status": "lobby",
    "hostId": "uuid-string",
    "participants": [
      { "id": "uuid-string", "name": "Alice", "joinedAt": "..." },
      { "id": "uuid-string", "name": "Bob", "joinedAt": "..." }
    ]
  }
}
```

**Error Responses**:
| Status | Condition | Body |
|--------|-----------|------|
| 404 | Room not found (expired/never existed) | `{ "error": "Room not found" }` |

---

## POST /rooms/:code/start

Start the game. Only the host can start, and at least 2 players must be present.

**Request Body**: (empty)

**Success Response** (200):
```json
{
  "room": {
    "code": "XK4M",
    "status": "playing",
    "hostId": "uuid-string",
    "participants": [
      { "id": "uuid-string", "name": "Alice", "joinedAt": "..." },
      { "id": "uuid-string", "name": "Bob", "joinedAt": "..." }
    ]
  }
}
```

**Error Responses**:
| Status | Condition | Body |
|--------|-----------|------|
| 403 | Non-host attempts to start | `{ "error": "Only the host can start the game" }` |
| 400 | Fewer than 2 players | `{ "error": "At least 2 players are required to start" }` |
| 404 | Room not found | `{ "error": "Room not found" }` |
