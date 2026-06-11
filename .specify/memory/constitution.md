<!-- Sync Impact Report: v0.0.0 → v1.0.0 | Initial constitution creation. All sections populated. No modified principles (none existed). Added: 5 Core Principles, Architecture Constraints, Development Workflow, Governance. Removed: none. Templates: .specify/templates/plan-template.md ✅ (generic, no changes needed), .specify/templates/spec-template.md ✅ (generic, no changes needed), .specify/templates/tasks-template.md ✅ (generic, no changes needed), .specify/templates/checklist-template.md ✅ (generic, no changes needed). Follow-up TODOs: none. -->

# Scribble Constitution

## Core Principles

### I. SOLID Architecture
Every module MUST adhere to SOLID principles: Single Responsibility (each class/component has one reason to change), Open/Closed (extend without modifying), Liskov Substitution (subtypes replace parents transparently), Interface Segregation (small focused interfaces), Dependency Inversion (depend on abstractions). Backend services MUST follow the existing `src/services/` pattern. Frontend components MUST follow the functional-component-with-hooks pattern. Rationale: SOLID keeps the codebase maintainable as features are layered incrementally.

### II. Type Safety & Contract Discipline
All code MUST be strictly typed TypeScript. Avoid `any`; use `unknown` for truly dynamic values. Backend request/response payloads MUST be validated with Zod schemas. Frontend API calls MUST infer types from backend responses. Shared types MUST be kept in sync between frontend and backend. Rationale: TypeScript + Zod provides compile-time and runtime safety without a database schema layer.

### III. HTTP Polling Protocol
All real-time sync MUST use HTTP polling (~2s interval for lobby and game state). No WebSockets, Server-Sent Events, or push protocols are permitted. Frontend polling MUST use `setInterval` with cleanup on unmount. Polling MUST NOT cause UI flicker or lost state. Rationale: HTTP polling is simpler to implement, debug, and review than push protocols, and aligns with the stateless backend model.

### IV. In-Memory State Discipline
All game state MUST be stored in-memory only. No databases (SQL, NoSQL, SQLite) are permitted. Rooms MUST be explicitly cleaned up when empty or inactive. The backend MUST handle server restarts gracefully (state loss is acceptable; clients reconnect). Rationale: In-memory state keeps deployment minimal and avoids persistence complexity.

### V. Determinism & Testability
Game logic MUST be deterministic: word selection, scoring, and round transitions MUST produce identical outcomes given identical inputs. No randomness in gameplay. Scoring MUST be pure functions. State transitions MUST be testable without a running server. Rationale: Deterministic logic makes the game predictable for players and straightforward to test.

## Architecture Constraints

The following are FORBIDDEN:
- WebSockets or any real-time push protocol
- Databases or persistent storage of any kind
- Authentication, accounts, sessions, or JWT
- Deployment, hosting, CI/CD, or Docker configuration
- New state-management or routing libraries beyond what the starter ships
- Multiple rounds, drawer rotation, timers, countdowns, speed bonuses, or drawer bonuses
- Custom or random word packs beyond the starter's seed list
- Spectator mode
- Moderation features (kick, mute, etc.)
- Room passwords or invite links
- Rewriting the starter from scratch
- Unjustified top-level dependencies
- Unrelated refactors

Rationale: These boundaries keep the project focused on Spec Kit artifact discipline and incremental brownfield enhancement.

## Development Workflow

All implementation MUST follow this workflow:
1. **Discovery**: read starter files, document gaps and assumptions
2. **Specify**: write acceptance criteria in the spec
3. **Clarify**: resolve ambiguity before planning
4. **Plan**: document state model, data flow, file-level changes
5. **Tasks**: decompose plan into ordered, testable units
6. **Implement**: one meaningful slice at a time, commit after each
7. **Validate**: verify acceptance criteria with two browser tabs
8. Move forward only after the current scenario passes

Commits MUST be granular and meaningful. Self-review is REQUIRED before every commit.

## Governance

This constitution supersedes all other development practices. Amendments require a documented rationale, maintainer approval, and a migration plan for affected artifacts.

Versioning follows Semantic Versioning:
- **MAJOR**: backward-incompatible governance/principle removals or redefinitions
- **MINOR**: new principles or materially expanded guidance
- **PATCH**: clarifications, wording fixes, non-semantic refinements

All PRs and reviews MUST verify constitution compliance. Complexity MUST be justified when it conflicts with a stated principle.

**Version**: 1.0.0 | **Ratified**: 2026-06-11 | **Last Amended**: 2026-06-11
