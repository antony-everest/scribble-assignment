# Quickstart Validation: Game Start & Drawer Flow

## Prerequisites

- Backend running on `http://localhost:3001` (`cd backend && npm run dev`)
- Frontend running on `http://localhost:5173` (`cd frontend && npm run dev`)

## Scenario 1: Successful Game Start

1. Open two browser tabs to `http://localhost:5173`
2. In Tab 1, enter a name (e.g. "Alice") and click "Create Room"
3. In Tab 2, enter the room code shown in Tab 1 and enter name "Bob", click "Join"
4. In Tab 1, verify the "Start Game" button is now visible (host-only)
5. Click "Start Game" in Tab 1

**Expected**:
- Tab 1 and Tab 2 both show game status as "playing" within ~2s
- Tab 1 shows "You are the drawer" and the secret word (e.g., "pizza")
- Tab 2 shows "Alice is the drawer" but NO secret word
- Both tabs show the drawer is clearly identified

## Scenario 2: Empty/Whitespace Name Rejection

1. Create a room with a player "Alice"
2. Join with a second player named `"   "` (whitespace)
3. In Tab 1, click "Start Game"

**Expected**: Game does not start. An error message is shown indicating the empty/whitespace name.

## Scenario 3: Duplicate Name After Trim Rejection

1. Create a room with player "Alice"
2. Join with a second player named `"Alice "` (with trailing space)
3. In Tab 1, click "Start Game"

**Expected**: Game does not start. An error message is shown indicating duplicate names after trimming.

## Scenario 4: Non-Host Cannot Start

1. Create a room with player "Alice" (Tab 1)
2. Join with "Bob" (Tab 2)
3. In Tab 2, verify the "Start Game" button is NOT visible (or disabled)
4. Try to start from Tab 2

**Expected**: Tab 2 cannot start the game. Error message "Only the host can start the game".

## Data Model Reference

See [data-model.md](../data-model.md) for entity definitions.

## API Contract Reference

See [contracts/api.md](../contracts/api.md) for endpoint details.
