# API Contracts: Game Start & Drawer Flow

Base URL: `http://localhost:3001`

All responses return JSON. Errors return `{ "error": "<message>" }` with appropriate HTTP status codes.

---

## POST /rooms/:code/start

Start the game. Only the host can start, and at least 2 players must be present. All participant names are validated before the game starts.

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
| 400 | Empty/whitespace-only name after trimming | `{ "error": "Name is empty after trimming: '<name>'" }` |
| 400 | Duplicate names after trimming | `{ "error": "Duplicate names after trimming: Alice" }` |
| 400 | Fewer than 2 players | `{ "error": "At least 2 players are required to start" }` |
| 403 | Non-host attempts to start | `{ "error": "Only the host can start the game" }` |
| 404 | Room not found | `{ "error": "Room not found" }` |

---

## GET /rooms/:code

Fetch the current room snapshot (polling endpoint). The `secretWord` field is only present when the requesting participant is the drawer.

**Query Parameters**: `?participantId=<uuid>` (optional, recommended)

**Success Response** (200) — for the drawer:
```json
{
  "room": {
    "code": "XK4M",
    "status": "playing",
    "hostId": "uuid-string",
    "participants": [
      { "id": "uuid-string", "name": "Alice", "joinedAt": "..." },
      { "id": "uuid-string", "name": "Bob", "joinedAt": "..." }
    ],
    "currentDrawerId": "uuid-of-host",
    "secretWord": "pizza"
  }
}
```

**Success Response** (200) — for a non-drawer:
```json
{
  "room": {
    "code": "XK4M",
    "status": "playing",
    "hostId": "uuid-string",
    "participants": [
      { "id": "uuid-string", "name": "Alice", "joinedAt": "..." },
      { "id": "uuid-string", "name": "Bob", "joinedAt": "..." }
    ],
    "currentDrawerId": "uuid-of-host",
    "secretWord": null
  }
}
```

**Error Responses**:
| Status | Condition | Body |
|--------|-----------|------|
| 404 | Room not found (expired/never existed) | `{ "error": "Room not found" }` |
