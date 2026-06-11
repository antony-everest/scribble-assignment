import { useState } from "react";

interface GuessFormProps {
  onGuess: (text: string) => Promise<void>;
  disabled?: boolean;
  alreadyCorrect?: boolean;
}

export function GuessForm({ onGuess, disabled = false, alreadyCorrect = false }: GuessFormProps) {
  const [guessText, setGuessText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (guessText.trim().length === 0) {
      setError("Guess cannot be empty");
      return;
    }

    setSubmitting(true);

    try {
      await onGuess(guessText);
      setGuessText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit guess");
    } finally {
      setSubmitting(false);
    }
  }

  if (alreadyCorrect) {
    return (
      <div className="guess-form__correct" style={{ textAlign: "center", padding: "1rem", color: "#16a34a", fontWeight: "bold" }}>
        You guessed correctly!
      </div>
    );
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="form__field">
        <input
          className="form__input"
          value={guessText}
          onChange={(event) => setGuessText(event.target.value)}
          placeholder="Type your guess here..."
          disabled={disabled || submitting}
        />
      </label>
      {error && <p className="form__error" style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.25rem" }}>{error}</p>}
      <div className="button-row button-row--compact">
        <button className="button button--primary" type="submit" disabled={disabled || submitting}>
          {submitting ? "Submitting..." : "Submit Guess"}
        </button>
      </div>
    </form>
  );
}
