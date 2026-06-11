import type { Participant } from "../services/api";
import { Card } from "./Card";

interface ScoreboardProps {
  participants: Participant[];
  scores: Record<string, number>;
  currentDrawerId: string | null;
}

export function Scoreboard({ participants, scores, currentDrawerId }: ScoreboardProps) {
  return (
    <Card title="Scoreboard">
      <div className="scoreboard">
        {participants.map((p) => (
          <div key={p.id} className="scoreboard__row">
            <span className="scoreboard__name">
              {p.name}
              {p.id === currentDrawerId ? <span className="scoreboard__role"> (drawer)</span> : null}
            </span>
            <strong className="scoreboard__score">{scores[p.id] ?? 0}</strong>
          </div>
        ))}
      </div>
    </Card>
  );
}
