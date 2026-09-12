interface PracticeHeaderProps {
  finishedCount: number;
  elapsedSeconds?: number;
  isAnswerRevealed: boolean;
  hasSubmittedThisTurn: boolean;
}

function formatTimer(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function PracticeHeader({
  finishedCount,
  elapsedSeconds = 0,
  isAnswerRevealed,
  hasSubmittedThisTurn,
}: PracticeHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2 py-1 text-xs text-on-surface-variant">
      {/* Left: Finished count & Timer */}
      <div className="flex items-baseline gap-2.5 sm:gap-3">
        {/* Finished count */}
        <span
          className="font-semibold text-on-surface tracking-wide text-sm"
          title="Bricks completed this session"
        >
          {finishedCount}
        </span>

        {/* Bullet separator */}
        <span className="text-outline-variant/60 font-light select-none align-middle">
          •
        </span>

        {/* Session Timer */}
        <span
          className="text-outline font-mono text-xs leading-none"
          title="Session time"
        >
          {formatTimer(elapsedSeconds)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Reveal status: 🙈 when unrevealed, 🙉 when revealed */}
        <span
          className="text-lg leading-none cursor-default select-none transition-transform hover:scale-110"
          title={
            isAnswerRevealed ? "Answer revealed (🙉)" : "Answer hidden (🙈)"
          }
          aria-label={isAnswerRevealed ? "Answer revealed" : "Answer hidden"}
        >
          {isAnswerRevealed ? "🙉" : "🙈"}
        </span>

        {/* Submission status: 🙊 when unsubmitted, 🐵 when submitted */}
        <span
          className="text-lg leading-none cursor-default select-none transition-transform hover:scale-110"
          title={
            hasSubmittedThisTurn
              ? "Answer submitted (🐵)"
              : "Not submitted yet (🙊)"
          }
          aria-label={
            hasSubmittedThisTurn ? "Answer submitted" : "Not submitted yet"
          }
        >
          {hasSubmittedThisTurn ? "🐵" : "🙊"}
        </span>
      </div>
    </div>
  );
}
