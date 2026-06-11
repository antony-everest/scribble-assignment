# Quickstart: Room Setup & Lobby

End-to-end validation scenarios for the Room Setup & Lobby feature.

## Prerequisites

- Backend running on `http://localhost:3001` (`cd backend && npm run dev`)
- Frontend running on `http://localhost:5173` (`cd frontend && npm run dev`)
- Two browser tabs open to `http://localhost:5173`

## Validation Scenarios

### Scenario 1: Create a Room

1. Open the app in Tab A
2. Click **Create Room**
3. Enter `Alice` as the display name
4. Click **Create**
5. **Expected**: You land on the lobby page showing:
   - A 4-character room code badge
   - `Alice` in the participant list
   - A **Start Game** button visible

### Scenario 2: Join a Room

1. In Tab B, click **Join Room**
2. Enter `Bob` as the display name
3. Enter the room code from Tab A
4. Click **Join**
5. **Expected**: Tab B lands on the lobby showing:
   - The same room code
   - `Alice` and `Bob` in the participant list
   - **No** Start Game button (Bob is not host)

### Scenario 3: Auto-Refresh (Polling)

1. After Scenario 2, look at Tab A (Alice's lobby)
2. Wait ~2 seconds
3. **Expected**: Tab A's participant list automatically shows both `Alice` and `Bob` without clicking a refresh button

### Scenario 4: Host Starts Game

1. Ensure Tab A (Alice, host) shows 2+ participants
2. Click **Start Game**
3. **Expected**: Both tabs transition to the game screen

### Scenario 5: Start Game Denied (Fewer Than 2 Players)

1. Create a new room with only 1 player
2. Click **Start Game**
3. **Expected**: An error message appears: at least 2 players required
4. The game does not start

### Scenario 6: Invalid Inputs

| Action | Input | Expected Error |
|--------|-------|----------------|
| Create with empty name | (empty) | "Player name is required" |
| Create with whitespace name | `"   "` | "Player name is required" |
| Join with invalid code | `"ZZZZ"` | "Room not found" |
| Join with empty code | (empty) | "Room code is required" |
| Join with taken name | `"Alice"` into Alice's room | "Name is already taken" |

### Scenario 7: Room Isolation

1. Create Room A in Tab A, Room B in Tab B (different browsers/sessions)
2. Verify Room A's participant list only shows Room A's players
3. Verify Room B's participant list only shows Room B's players

## Verification Matrix

| # | Test | Status |
|---|------|--------|
| 1 | Create room with valid name | ✅ / ❌ |
| 2 | Create room with empty name (rejected) | ✅ / ❌ |
| 3 | Join room with valid code | ✅ / ❌ |
| 4 | Join room with invalid code (rejected) | ✅ / ❌ |
| 5 | Join with taken display name (rejected) | ✅ / ❌ |
| 6 | Lobby auto-refresh (~2s) | ✅ / ❌ |
| 7 | Host-only start game | ✅ / ❌ |
| 8 | Start denied with <2 players | ✅ / ❌ |
| 9 | Room isolation (separate participants) | ✅ / ❌ |
