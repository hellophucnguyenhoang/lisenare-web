interface PracticeHeaderProps {
  finishedCount: number;
  isAnswerRevealed: boolean;
  hasSubmittedThisTurn: boolean;
}

export default function PracticeHeader({
  finishedCount,
  isAnswerRevealed,
  hasSubmittedThisTurn,
}: PracticeHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2 py-1 text-xs text-on-surface-variant">
      {/* Finished count without words */}
      <span className="font-semibold text-on-surface-variant tracking-wide text-sm">
        {finishedCount}
      </span>

      <div className="flex items-center gap-3">
        {/* Reveal status: 🙈 when unrevealed, 🙉 when revealed */}
        <span
          className="text-lg leading-none cursor-default select-none transition-transform hover:scale-110"
          title={
            isAnswerRevealed ? "Answer revealed (🙉)" : "Answer hidden (🙈)"
          }
          aria-label={
            isAnswerRevealed ? "Answer revealed" : "Answer hidden"
          }
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
