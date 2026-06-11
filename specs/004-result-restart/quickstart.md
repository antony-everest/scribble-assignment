# Quickstart Validation: Result, Restart & Final Validation

## Prerequisites

- Backend running on `http://localhost:3001` (`cd backend && npm run dev`)
- Frontend running on `http://localhost:5173` (`cd frontend && npm run dev`)

## Scenario 1: Final Results Display

1. Start a game with 3 players (1 drawer + 2 guessers) as per Slice 2/Slice 3 quickstart
2. Have both guessers submit correct guesses until the game ends

**Expected**:
- Within one poll cycle of the last correct guess, all players see:
  - Game status as "finished"
  - Secret word revealed to ALL players (not just the drawer)
  - Final scores for each player
  - Full guess history with names, texts, correct/incorrect markers
  - Final canvas drawing

## Scenario 2: Host Restarts Game

1. From Scenario 1 (game finished), verify the host sees a "Play Again" or "Restart" option
2. Non-host participants do NOT see the restart option
3. Host clicks restart

**Expected**:
- Within one poll cycle:
  - All players see the lobby with the same room code
  - All players are still in the room
  - Round state is cleared: no guess history, no canvas, no scores, no drawer, no secret word
  - The host sees the "Start Game" button again

## Scenario 3: New Game After Restart

1. From Scenario 2 (restarted, lobby visible), host clicks "Start Game"

**Expected**:
- Game starts as normal (following S2 game start flow)
- New secret word assigned
- New drawer assigned (host)
- All players transition to playing state
- No leftover state from the previous round

## Scenario 4: Non-Host Cannot Restart

1. From Scenario 1 (game finished), verify the non-host participant:
   - Does NOT see a restart button
   - If they attempt to call the restart API directly, receives 403

## Scenario 5: Restart Only Works From Finished State

1. Attempt to call `/rooms/:code/restart` when room status is not "finished"

**Expected**: Error 400 "Game is not finished"

## Data Model Reference

See [data-model.md](../data-model.md) for entity definitions.

## API Contract Reference

See [contracts/api.md](../contracts/api.md) for endpoint details.
