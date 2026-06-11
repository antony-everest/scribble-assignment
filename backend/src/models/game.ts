export type ParticipantRole = "drawer" | "guesser";
export type RoomStatus = "lobby" | "playing" | "finished";

export interface Participant {
  id: string;
  name: string;
  joinedAt: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

export interface Guess {
  participantId: string;
  name: string;
  text: string;
  isCorrect: boolean;
  timestamp: string;
}

export interface Room {
  code: string;
  status: RoomStatus;
  hostId: string;
  participants: Participant[];
  currentDrawerId: string | null;
  secretWord: string | null;
  guessHistory: Guess[];
  canvasStrokes: Stroke[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomSnapshot {
  code: string;
  status: RoomStatus;
  hostId: string;
  participants: Participant[];
  currentDrawerId: string | null;
  secretWord: string | null;
  guessHistory: Guess[];
  scores: Record<string, number>;
  canvasStrokes: Stroke[];
  availableWords: string[];
  roles: ParticipantRole[];
}

export interface RoomSessionResponse {
  participantId: string;
  room: RoomSnapshot;
}
