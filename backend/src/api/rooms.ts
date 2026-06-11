import { Router } from "express";
import {
  createRoomSchema,
  drawStrokeSchema,
  guessSchema,
  HttpError,
  joinRoomSchema,
  requireParticipantIdQuerySchema,
  roomCodeParamsSchema,
  roomViewerQuerySchema,
  startGameSchema
} from "./schemas.js";
import {
  clearCanvas,
  createRoom,
  drawStroke,
  getRoom,
  joinRoom,
  restartGame,
  startGame,
  submitGuess,
  toRoomSnapshot
} from "../services/roomStore.js";

export function createRoomsRouter() {
  const router = Router();

  router.post("/", (request, response, next) => {
    try {
      const { playerName } = createRoomSchema.parse(request.body);
      const result = createRoom(playerName);

      response.status(201).json({
        participantId: result.participantId,
        room: toRoomSnapshot(result.room, result.participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/join", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { playerName } = joinRoomSchema.parse(request.body);
      const result = joinRoom(code.toUpperCase(), playerName);

      if (!result) {
        throw new HttpError(404, "Unable to join room");
      }

      if ("error" in result) {
        throw new HttpError(400, result.error);
      }

      response.json({
        participantId: result.participantId,
        room: toRoomSnapshot(result.room, result.participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/start", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      startGameSchema.parse(request.body);
      const { participantId } = roomViewerQuerySchema.parse(request.query);
      const result = startGame(code.toUpperCase(), participantId ?? "");

      if (!result) {
        throw new HttpError(404, "Room not found");
      }

      if ("error" in result) {
        if (result.error === "Room not found") {
          throw new HttpError(404, result.error);
        }
        if (result.error.startsWith("Only the host")) {
          throw new HttpError(403, result.error);
        }
        throw new HttpError(400, result.error);
      }

      response.json({
        room: toRoomSnapshot(result.room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/draw", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const stroke = drawStrokeSchema.parse(request.body);
      const { participantId } = requireParticipantIdQuerySchema.parse(request.query);
      const result = drawStroke(code.toUpperCase(), participantId, stroke);

      if (!result) {
        throw new HttpError(404, "Room not found");
      }

      if ("error" in result) {
        if (result.error === "Room not found") {
          throw new HttpError(404, result.error);
        }
        throw new HttpError(403, result.error);
      }

      response.json({
        room: toRoomSnapshot(result.room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/clear", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = requireParticipantIdQuerySchema.parse(request.query);
      const result = clearCanvas(code.toUpperCase(), participantId);

      if (!result) {
        throw new HttpError(404, "Room not found");
      }

      if ("error" in result) {
        if (result.error === "Room not found") {
          throw new HttpError(404, result.error);
        }
        throw new HttpError(403, result.error);
      }

      response.json({
        room: toRoomSnapshot(result.room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/guess", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { text } = guessSchema.parse(request.body);
      const { participantId } = requireParticipantIdQuerySchema.parse(request.query);
      const result = submitGuess(code.toUpperCase(), participantId, text);

      if (!result) {
        throw new HttpError(404, "Room not found");
      }

      if ("error" in result) {
        if (result.error === "Room not found") {
          throw new HttpError(404, result.error);
        }
        if (result.error.startsWith("The drawer")) {
          throw new HttpError(403, result.error);
        }
        if (result.error.startsWith("You have already")) {
          throw new HttpError(403, result.error);
        }
        throw new HttpError(400, result.error);
      }

      response.json({
        room: toRoomSnapshot(result.room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/restart", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = roomViewerQuerySchema.parse(request.query);
      const result = restartGame(code.toUpperCase(), participantId ?? "");

      if (!result) {
        throw new HttpError(404, "Room not found");
      }

      if ("error" in result) {
        if (result.error === "Room not found") {
          throw new HttpError(404, result.error);
        }
        if (result.error.startsWith("Only the host")) {
          throw new HttpError(403, result.error);
        }
        throw new HttpError(400, result.error);
      }

      response.json({
        room: toRoomSnapshot(result.room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:code", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = roomViewerQuerySchema.parse(request.query);
      const room = getRoom(code.toUpperCase());

      if (!room) {
        throw new HttpError(404, "Unable to load room");
      }

      response.json({
        room: toRoomSnapshot(room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
