# API Contracts: Result, Restart & Final Validation

Base URL: `http://localhost:3001`

All responses return JSON. Errors return `{ "message": "<message>" }` with appropriate HTTP status codes.

---

## POST /rooms/:code/restart

Restart a finished game. Only the host may restart. All participants are preserved; round-specific state (guesses, canvas, scores, drawer, word) is cleared.

**Request Body**: (empty)

**Query Parameters**: `?participantId=<uuid>` (required, identifies the host)

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
    ],
    "currentDrawerId": null,
    "secretWord": null,
    "guessHistory": [],
    "scores": {},
    "canvasStrokes": [],
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

**Error Responses**:
| Status | Condition | Body |
|--------|-----------|------|
| 400 | Game is not finished | `{ "message": "Game is not finished" }` |
| 403 | Non-host attempts to restart | `{ "message": "Only the host can restart the game" }` |
| 404 | Room not found | `{ "message": "Room not found" }` |

---

## GET /rooms/:code (updated)

Fetch the current room snapshot. When `status` is `"finished"`, the `secretWord` is now visible to ALL participants (not just the drawer).

**Query Parameters**: `?participantId=<uuid>` (optional)

**Success Response** (200) — when status is "finished" (all viewers see the secret word):
```json
{
  "room": {
    "code": "XK4M",
    "status": "finished",
    "hostId": "uuid-string",
    "participants": [ ... ],
    "currentDrawerId": "uuid-of-drawer",
    "secretWord": "pizza",
    "guessHistory": [
      { "participantId": "uuid-bob", "name": "Bob", "text": "pizza", "isCorrect": true, "timestamp": "..." }
    ],
    "scores": { "uuid-alice": 0, "uuid-bob": 100 },
    "canvasStrokes": [ ... ],
    "availableWords": [...],
    "roles": ["drawer", "guesser"]
  }
}
```

**Success Response** (200) — when status is "lobby" (after restart, round state cleared):
```json
{
  "room": {
    "code": "XK4M",
    "status": "lobby",
    "hostId": "uuid-string",
    "participants": [ ... ],
    "currentDrawerId": null,
    "secretWord": null,
    "guessHistory": [],
    "scores": {},
    "canvasStrokes": [],
    "availableWords": [...],
    "roles": ["drawer", "guesser"]
  }
}
```

**Error Responses**:
| Status | Condition | Body |
|--------|-----------|------|
| 404 | Room not found | `{ "message": "Room not found" }` |

---

## POST /rooms/:code/start (unchanged from Slice 2)

After restart, the host can start a new game from the lobby. This endpoint is unchanged — it works identically whether the lobby is fresh or after a restart.
