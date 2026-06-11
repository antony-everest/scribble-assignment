import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { useRoomState, useRoomStore } from "../state/roomStore";

const POLL_INTERVAL = 2000;

export function LobbyPage() {
  const navigate = useNavigate();
  const roomStore = useRoomStore();
  const { room, error, isLoading } = useRoomState();
  const [actionError, setActionError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!room) {
      navigate("/", { replace: true });
    }
  }, [navigate, room]);

  useEffect(() => {
    if (!room) {
      return;
    }

    async function poll() {
      try {
        await roomStore.fetchRoom();
      } catch (caughtError) {
        setActionError(caughtError instanceof Error ? caughtError.message : "Unable to refresh room");
      }
    }

    pollingRef.current = setInterval(poll, POLL_INTERVAL);

    return () => {
      if (pollingRef.current !== null) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [room, roomStore]);

  useEffect(() => {
    if (room && room.status === "playing") {
      navigate("/game");
    }
  }, [room, navigate]);

  async function handleRefresh() {
    try {
      setActionError(null);
      await roomStore.fetchRoom();
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : "Unable to refresh room");
    }
  }

  const handleStartGame = useCallback(async () => {
    try {
      setActionError(null);
      const updatedRoom = await roomStore.startGame();
      if (updatedRoom.status === "playing") {
        navigate("/game");
      }
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : "Unable to start game");
    }
  }, [roomStore, navigate]);

  const snapshot = roomStore.getSnapshot();
  const isHost = room ? room.hostId === snapshot.participantId : false;

  if (!room) {
    return null;
  }

  return (
    <section className="panel placeholder-page">
      <div className="lobby-header">
        <PageHeader
          kicker="Waiting for players"
          title="Lobby"
          description="Share the room code with friends so they can join your game."
        />
        <RoomCodeBadge code={room.code} />
      </div>

      <div className="summary-grid">
        <Card title="Participants">
          {room.participants.length === 0 ? (
            <p>No participants are connected to this room yet.</p>
          ) : (
            <ul className="player-list">
              {room.participants.map((participant) => (
                <li key={participant.id}>
                  <span>{participant.name}</span>
                  <span className="player-list__meta">joined</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Status">
          <p className="status-line" style={{ backgroundColor: isLoading ? '#fef3c7' : '#e0e7ff', color: isLoading ? '#b45309' : '#3730a3' }}>
            {isLoading ? "Processing..." : "Ready to play"}
          </p>
          <p style={{ marginTop: '8px' }}>
            {actionError && <span style={{ color: '#dc2626' }}>{actionError}</span>}
            {!actionError && (error ?? "Waiting for the host to start the game.")}
          </p>
        </Card>
      </div>

      <div className="button-row button-row--spread">
        <button className="button button--secondary" disabled={isLoading} onClick={handleRefresh}>
          {isLoading ? "Refreshing..." : "Refresh Room"}
        </button>
        {isHost && (
          <button className="button button--primary" disabled={isLoading} onClick={handleStartGame}>
            Start Game
          </button>
        )}
      </div>
    </section>
  );
}
