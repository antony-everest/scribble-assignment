import { randomUUID } from "node:crypto";
import type { Participant, Room, RoomSnapshot } from "../models/game.js";
import { STARTER_ROLES, STARTER_WORDS } from "../seed/starterData.js";

const rooms = new Map<string, Room>();

function now() {
  return new Date().toISOString();
}

function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let index = 0; index < 4; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

function generateUniqueCode() {
  let code = generateCode();

  while (rooms.has(code)) {
    code = generateCode();
  }

  return code;
}

function displayName(name?: string) {
  return name || "Player";
}

function createParticipant(name?: string): Participant {
  return {
    id: randomUUID(),
    name: displayName(name),
    joinedAt: now()
  };
}

function cloneRoom(room: Room) {
  return structuredClone(room);
}

export function listWords() {
  return [...STARTER_WORDS];
}

export function createRoom(playerName?: string) {
  const participant = createParticipant(playerName);
  const room: Room = {
    code: generateUniqueCode(),
    status: "lobby",
    hostId: participant.id,
    participants: [participant],
    currentDrawerId: null,
    secretWord: null,
    createdAt: now(),
    updatedAt: now()
  };

  rooms.set(room.code, room);

  return {
    room: cloneRoom(room),
    participantId: participant.id
  };
}

export function joinRoom(code: string, playerName?: string): { room: Room; participantId: string } | { error: string } | null {
  const room = rooms.get(code);

  if (!room) {
    return null;
  }

  const resolvedName = displayName(playerName);

  if (room.participants.some((p) => p.name === resolvedName)) {
    return { error: `Name '${resolvedName}' is already taken in this room` };
  }

  const MAX_PARTICIPANTS = 4;
  if (room.participants.length >= MAX_PARTICIPANTS) {
    return { error: "Room is full" };
  }

  const participant = createParticipant(playerName);
  room.participants.push(participant);
  room.updatedAt = now();
  rooms.set(room.code, room);

  return {
    room: cloneRoom(room),
    participantId: participant.id
  };
}

export function getRoom(code: string) {
  const room = rooms.get(code);
  return room ? cloneRoom(room) : null;
}

export function saveRoom(room: Room) {
  room.updatedAt = now();
  rooms.set(room.code, cloneRoom(room));
  return getRoom(room.code);
}

export function startGame(code: string, requesterId: string): { room: Room } | { error: string } | null {
  const room = rooms.get(code);

  if (!room) {
    return { error: "Room not found" };
  }

  if (room.hostId !== requesterId) {
    return { error: "Only the host can start the game" };
  }

  if (room.participants.length < 2) {
    return { error: "At least 2 players are required to start" };
  }

  const trimmedNames = room.participants.map((p) => ({
    id: p.id,
    name: p.name.trim()
  }));

  const emptyName = trimmedNames.find((p) => p.name.length === 0);
  if (emptyName) {
    return { error: `Name is empty after trimming` };
  }

  const seen = new Map<string, string[]>();
  for (const p of trimmedNames) {
    const existing = seen.get(p.name) ?? [];
    existing.push(p.id);
    seen.set(p.name, existing);
  }

  const duplicates = [...seen.entries()].filter(([, ids]) => ids.length > 1);
  if (duplicates.length > 0) {
    const names = duplicates.map(([name]) => name).join(", ");
    return { error: `Duplicate names after trimming: ${names}` };
  }

  for (const p of room.participants) {
    p.name = p.name.trim();
  }

  const wordIndex = (room.participants.length - 2) % STARTER_WORDS.length;

  room.currentDrawerId = room.hostId;
  room.secretWord = STARTER_WORDS[wordIndex];
  room.status = "playing";
  room.updatedAt = now();
  rooms.set(room.code, room);

  return { room: cloneRoom(room) };
}

export function toRoomSnapshot(room: Room, viewerParticipantId?: string): RoomSnapshot {
  return {
    code: room.code,
    status: room.status,
    hostId: room.hostId,
    participants: room.participants.map((participant) => ({ ...participant })),
    currentDrawerId: room.currentDrawerId,
    secretWord: viewerParticipantId === room.currentDrawerId ? room.secretWord : null,
    availableWords: listWords(),
    roles: [...STARTER_ROLES]
  };
}
