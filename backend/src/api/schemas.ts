import { z } from "zod";

export const createRoomSchema = z.object({
  playerName: z.string().optional()
});

export const joinRoomSchema = z.object({
  playerName: z.string().optional()
});

export const roomCodeParamsSchema = z.object({
  code: z.string()
});

export const startGameSchema = z.object({});

export const roomViewerQuerySchema = z.object({
  participantId: z.string().optional()
});

export const requireParticipantIdQuerySchema = z.object({
  participantId: z.string().min(1, "participantId query parameter is required")
});

export const pointSchema = z.object({
  x: z.number(),
  y: z.number()
});

export const drawStrokeSchema = z.object({
  points: z.array(pointSchema).min(1, "Stroke must have at least one point"),
  color: z.string().min(1),
  width: z.number().positive()
});

export const clearCanvasSchema = z.object({});

export const guessSchema = z.object({
  text: z.string()
});

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
