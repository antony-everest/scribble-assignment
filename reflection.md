# Reflection Report

## What the starter app already had
The starter provided a monorepo skeleton with an Express backend (TypeScript, Zod, in-memory state) and a React frontend (Vite, TypeScript, React Router v6). It had room creation/joining, a basic polling mechanism, and a canvas component. Game logic (word assignment, guessing, scoring, rounds, drawer rotation) was absent.

## What we added
- **Room setup & lobby**: Unique room codes, duplicate name detection, max 4 participants, host-only start
- **Game start & drawer flow**: Secret word assignment to drawer, role-based UI (drawer sees word + canvas, guessers see guess form)
- **Gameplay interaction**: Canvas drawing/clearing (drawer only), case-insensitive guess submission, correct-guess detection, automatic game finish when all guessers succeed
- **Result & restart**: Secret word revealed to all on finish, final scores and guess history displayed, host-only "Play Again" resets round state and returns everyone to lobby
- **Spec Kit artifacts**: Full SDD cycle for each slice — constitution, spec, plan, tasks, research, data model, API contracts, quickstart, and checklists — all committed and traceable
