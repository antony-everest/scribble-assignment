# Quickstart Validation: Gameplay Interaction

## Prerequisites

- Backend running on `http://localhost:3001` (`cd backend && npm run dev`)
- Frontend running on `http://localhost:5173` (`cd frontend && npm run dev`)

## Scenario 1: Drawer Draws and Clearers

1. Open two browser tabs to `http://localhost:5173`
2. Start a game with 2+ players (as per Quickstart in Slice 2)
3. In the drawer's tab, verify the canvas is blank
4. Draw a stroke on the canvas — verify it appears
5. Click "Clear Canvas" — verify the canvas resets to blank

**Expected**:
- Drawing appears immediately on the drawer's screen
- After one poll cycle (~2s), the guesser sees the same drawing
- After clearing, both players see a blank canvas within one poll cycle

## Scenario 2: Guesser Submits Guesses

1. From Scenario 1, as a guesser, type an empty/whitespace guess and submit
2. Type an incorrect word and submit
3. Type the correct secret word (e.g., "pizza" for 3-player game) with mixed case and trailing spaces

**Expected**:
- Empty/whitespace guess is rejected with an error message (no state change)
- Incorrect guess adds to history marked as incorrect (score unchanged)
- Correct guess is accepted, score increases by 100, history shows correct, guesser cannot submit more guesses

## Scenario 3: All Players See Guess History and Scores

1. As guesser 1, submit an incorrect guess and a correct guess
2. As guesser 2, submit a correct guess
3. After each submission, verify via polling

**Expected**:
- Both guessers see the full guess history (names, texts, correct/incorrect markers)
- Each correct guess adds 100 to that guesser's score
- After all guessers have guessed correctly, game status transitions to "finished"

## Scenario 4: Game Ends When All Guessers Guess Correctly

1. Start a game with 3 players (1 drawer + 2 guessers)
2. Both guessers submit correct guesses
3. After the second correct guess, verify game status

**Expected**:
- After all guessers have a correct guess, status is "finished"
- All players see the "finished" status within one poll cycle

## Scenario 5: Drawer Cannot Guess

1. In the drawer's tab (after game start), attempt to submit a guess

**Expected**:
- The guess form is not visible to the drawer
- If attempted via API, receives 403 "The drawer cannot submit guesses"

## Data Model Reference

See [data-model.md](../data-model.md) for entity definitions.

## API Contract Reference

See [contracts/api.md](../contracts/api.md) for endpoint details.
