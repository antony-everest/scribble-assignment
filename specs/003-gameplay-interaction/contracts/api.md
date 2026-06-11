# API Contracts: Gameplay Interaction

Base URL: `http://localhost:3001`

All responses return JSON. Errors return `{ "message": "<message>" }` with appropriate HTTP status codes.

---

## POST /rooms/:code/draw

Append a stroke to the canvas. Only the drawer may draw.

**Request Body**:
```json
{
  "points": [{ "x": 10, "y": 20 }, { "x": 15, "y": 25 }],
  "color": "#000000",
  "width": 3
}
```

**Query Parameters**: `?participantId=<uuid>` (required, identifies the drawer)

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
    ],
    "currentDrawerId": "uuid-of-drawer",
    "secretWord": null,
    "guessHistory": [],
    "scores": { "uuid-alice": 0, "uuid-bob": 0 },
    "canvasStrokes": [
      { "points": [{ "x": 10, "y": 20 }, { "x": 15, "y": 25 }], "color": "#000000", "width": 3 }
    ]
  }
}
```

**Error Responses**:
| Status | Condition | Body |
|--------|-----------|------|
| 400 | Missing or invalid stroke data | `{ "message": "Invalid stroke data" }` |
| 403 | Non-drawer attempts to draw | `{ "message": "Only the drawer can draw" }` |
| 404 | Room not found | `{ "message": "Room not found" }` |

---

## POST /rooms/:code/clear

Clear the canvas (reset strokes to empty). Only the drawer may clear.

**Request Body**: (empty)

**Query Parameters**: `?participantId=<uuid>` (required, identifies the drawer)

**Success Response** (200):
```json
{
  "room": {
    "code": "XK4M",
    "status": "playing",
    "hostId": "uuid-string",
    "participants": [ ... ],
    "currentDrawerId": "uuid-of-drawer",
    "secretWord": null,
    "guessHistory": [],
    "scores": { "uuid-alice": 0, "uuid-bob": 0 },
    "canvasStrokes": []
  }
}
```

**Error Responses**:
| Status | Condition | Body |
|--------|-----------|------|
| 403 | Non-drawer attempts to clear | `{ "message": "Only the drawer can clear the canvas" }` |
| 404 | Room not found | `{ "message": "Room not found" }` |

---

## POST /rooms/:code/guess

Submit a guess. Only guessers may submit; drawer and already-correct guessers are rejected.

**Query Parameters**: `?participantId=<uuid>` (required, identifies the guesser)

**Request Body**:
```json
{
  "text": " rocket "
}
```

**Success Response** (200) — correct guess:
```json
{
  "room": {
    "code": "XK4M",
    "status": "playing",
    "hostId": "uuid-string",
    "participants": [ ... ],
    "currentDrawerId": "uuid-of-drawer",
    "secretWord": null,
    "guessHistory": [
      { "participantId": "uuid-bob", "name": "Bob", "text": "rocket", "isCorrect": true, "timestamp": "..." }
    ],
    "scores": { "uuid-alice": 0, "uuid-bob": 100 },
    "canvasStrokes": [ ... ]
  }
}
```

**Success Response** (200) — guess that ends the game (all guessers correct):
```json
{
  "room": {
    "code": "XK4M",
    "status": "finished",
    ...
  }
}
```

**Error Responses**:
| Status | Condition | Body |
|--------|-----------|------|
| 400 | Empty or whitespace-only guess | `{ "message": "Guess cannot be empty" }` |
| 403 | Drawer attempts to guess | `{ "message": "The drawer cannot submit guesses" }` |
| 403 | Guesser already guessed correctly | `{ "message": "You have already guessed correctly" }` |
| 404 | Room not found | `{ "message": "Room not found" }` |

---

## GET /rooms/:code (updated)

Fetch the current room snapshot (polling endpoint). Now includes `guessHistory`, `scores`, and `canvasStrokes`.

**Query Parameters**: `?participantId=<uuid>` (optional, recommended)

**Success Response** (200):
```json
{
  "room": {
    "code": "XK4M",
    "status": "playing",
    "hostId": "uuid-string",
    "participants": [ ... ],
    "currentDrawerId": "uuid-of-drawer",
    "secretWord": "pizza",
    "guessHistory": [
      { "participantId": "uuid-bob", "name": "Bob", "text": "rocket", "isCorrect": true, "timestamp": "..." }
    ],
    "scores": { "uuid-alice": 0, "uuid-bob": 100 },
    "canvasStrokes": [
      { "points": [{ "x": 10, "y": 20 }], "color": "#000000", "width": 3 }
    ]
  }
}
```

**Error Responses**:
| Status | Condition | Body |
|--------|-----------|------|
| 404 | Room not found | `{ "message": "Room not found" }` |
