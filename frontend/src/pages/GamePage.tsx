import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "../components/Canvas";
import { Card } from "../components/Card";
import { GuessForm } from "../components/GuessForm";
import { ResultPanel } from "../components/ResultPanel";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { Scoreboard } from "../components/Scoreboard";
import { useRoomState, useRoomStore } from "../state/roomStore";

export function GamePage() {
  const navigate = useNavigate();
  const { room, participantId, isLoading } = useRoomState();
  const store = useRoomStore();

  useEffect(() => {
    if (!room) {
      navigate("/", { replace: true });
    }
  }, [navigate, room]);

  if (!room) {
    return null;
  }

  const viewer = room.participants.find((participant) => participant.id === participantId) ?? null;
  const isDrawer = participantId === room.currentDrawerId;
  const drawer = room.participants.find((p) => p.id === room.currentDrawerId) ?? null;
  const isFinished = room.status === "finished";

  const alreadyCorrect = !isDrawer && room.guessHistory.some(
    (g) => g.participantId === participantId && g.isCorrect
  );

  async function handleGuess(text: string) {
    await store.submitGuess(text);
  }

  if (isFinished) {
    return (
      <section className="panel game-page">
        <div className="game-page__header">
          <div className="game-page__header-left">
            <span className="section-kicker">Round 1</span>
            <h1 className="game-page__title">Game Over!</h1>
          </div>
          <RoomCodeBadge code={room.code} />
        </div>

        <div className="game-page__layout">
          <aside className="game-page__sidebar game-page__sidebar--left">
            <Scoreboard participants={room.participants} scores={room.scores} currentDrawerId={room.currentDrawerId} />
            <ResultPanel guessHistory={room.guessHistory} />
          </aside>

          <div className="game-page__main">
            <Card title="Final Canvas">
              <Canvas strokes={room.canvasStrokes} isDrawer={false} />
            </Card>
          </div>

          <aside className="game-page__sidebar game-page__sidebar--right">
            <Card title="Player Info">
              <dl className="detail-list">
                <div>
                  <dt>Name</dt>
                  <dd>{viewer?.name ?? "Unknown player"}</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>{isDrawer ? "Drawer" : "Guesser"}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>Finished</dd>
                </div>
              </dl>
            </Card>
          </aside>
        </div>

        <div className="button-row">
          <button className="button button--primary" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="panel game-page">
      <div className="game-page__header">
        <div className="game-page__header-left">
          <span className="section-kicker">Round 1</span>
          <h1 className="game-page__title">Guess the Word!</h1>
        </div>
        <RoomCodeBadge code={room.code} />
      </div>

      <div className="game-page__layout">
        <aside className="game-page__sidebar game-page__sidebar--left">
          <Scoreboard participants={room.participants} scores={room.scores} currentDrawerId={room.currentDrawerId} />
          <ResultPanel guessHistory={room.guessHistory} />
        </aside>

        <div className="game-page__main">
          {isDrawer && (
            <Card title="Your Word">
              <div
                className="canvas-placeholder secret-word"
                style={{
                  marginBottom: "0.5rem",
                  padding: "0.75rem",
                  backgroundColor: "#fefce8",
                  border: "2px solid #eab308",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#854d0e"
                }}
              >
                {room.secretWord ?? "No word assigned"}
              </div>
            </Card>
          )}
          <Card title={isDrawer ? "Your Canvas" : "Canvas"}>
            <Canvas
              strokes={room.canvasStrokes}
              isDrawer={isDrawer}
              onStrokeComplete={async (stroke) => {
                await store.drawStroke(stroke);
              }}
              onClear={async () => {
                await store.clearCanvas();
              }}
            />
          </Card>
        </div>

        <aside className="game-page__sidebar game-page__sidebar--right">
          <Card title="Player Info">
            <dl className="detail-list">
              <div>
                <dt>Name</dt>
                <dd>{viewer?.name ?? "Unknown player"}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{isDrawer ? "Drawer" : "Guesser"}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>Playing</dd>
              </div>
            </dl>
          </Card>

          {!isDrawer && (
            <Card title="Your Guess">
              <GuessForm onGuess={handleGuess} disabled={isLoading} alreadyCorrect={alreadyCorrect} />
            </Card>
          )}
        </aside>
      </div>

      <div className="button-row">
        <button className="button button--secondary" onClick={() => navigate("/lobby")}>
          Exit Game
        </button>
      </div>
    </section>
  );
}
