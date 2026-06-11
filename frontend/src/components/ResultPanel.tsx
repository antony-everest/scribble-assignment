import type { Guess } from "../services/api";
import { Card } from "./Card";

interface ResultPanelProps {
  guessHistory: Guess[];
}

export function ResultPanel({ guessHistory }: ResultPanelProps) {
  return (
    <Card title="Activity">
      {guessHistory.length === 0 ? (
        <div className="placeholder-block" style={{ backgroundColor: "#f9fafb" }}>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>No guesses yet.</p>
        </div>
      ) : (
        <ul className="guess-history">
          {guessHistory.map((guess, index) => (
            <li key={index} className={`guess-history__item ${guess.isCorrect ? "guess-history__item--correct" : "guess-history__item--incorrect"}`}>
              <span className="guess-history__name">{guess.name}</span>
              <span className="guess-history__text">"{guess.text}"</span>
              <span className={`guess-history__result ${guess.isCorrect ? "guess-history__result--correct" : "guess-history__result--incorrect"}`}>
                {guess.isCorrect ? "✓ Correct" : "✗ Wrong"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
