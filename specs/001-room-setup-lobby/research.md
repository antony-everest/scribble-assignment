# Research: Room Setup & Lobby

## Technical Decisions

### Language & Runtime
- **Decision**: TypeScript 5.x on Node.js 18+ (backend) and browser ESM via Vite (frontend)
- **Rationale**: Existing project foundation; both environments already use TypeScript + ES Modules
- **Alternatives considered**: None — constrained by starter project

### Backend Framework
- **Decision**: Express 4 with Zod validation
- **Rationale**: Existing starter uses Express; Zod provides runtime type safety for request payloads
- **Alternatives considered**: None — constrained by starter project

### Frontend Framework
- **Decision**: React 18 with functional components and hooks
- **Rationale**: Existing starter uses React 18; functional components are the established pattern
- **Alternatives considered**: None — constrained by starter project

### State Management
- **Decision**: Custom store via `useSyncExternalStore` (existing pattern in `roomStore.ts`)
- **Rationale**: No additional state libraries required per project constraints
- **Alternatives considered**: Zustand, Context API — out of scope per constitution

### Real-time Sync
- **Decision**: HTTP polling at ~2s interval
- **Rationale**: Constitution mandates no WebSockets; polling is the simplest HTTP-based approach
- **Alternatives considered**: WebSockets, SSE — explicitly forbidden

### Data Storage
- **Decision**: In-memory `Map<string, Room>` on backend
- **Rationale**: Constitution mandates no databases; existing pattern in `roomStore.ts`
- **Alternatives considered**: SQLite, PostgreSQL — explicitly forbidden

### Testing
- **Decision**: Vitest (both backend and frontend)
- **Rationale**: Existing starter uses Vitest with `vitest.config.ts` in both directories
- **Alternatives considered**: Jest — not in existing project

## Host Tracking Implementation
- **Decision**: Add `hostId` field to Room model; set on creation; checked on start-game
- **Rationale**: Simplest approach; no role object needed; host is just the creator's participant ID
- **Alternatives considered**: Separate host entity, role array — over-engineered for a single host

## Display Name Uniqueness
- **Decision**: Check name against existing participants at join time; reject duplicates
- **Rationale**: Clarified during clarification phase; prevents scoreboard ambiguity
- **Alternatives considered**: Allow duplicates — rejected to avoid UX confusion
