import { useEffect } from "react";
import { Volume2, Play, X, Loader2 } from "lucide-react";
import { type Rating } from "@/api/evaluation";

interface RetrievalEvaluationModalProps {
  score: number;
  targetText: string;
  learnerText: string;
  onClose: () => void;
  onSubmitReview: (rating: Rating) => void | Promise<void>;
  isSubmitting?: boolean;
  onPlayTargetAudio: () => void;
  onPlayLearnerAudio?: () => void;
  hasLearnerAudio?: boolean;
  isLoadingTargetAudio?: boolean;
}

export default function RetrievalEvaluationModal({
  score,
  targetText,
  learnerText,
  onClose,
  onSubmitReview,
  isSubmitting = false,
  onPlayTargetAudio,
  onPlayLearnerAudio,
  hasLearnerAudio = false,
  isLoadingTargetAudio = false,
}: RetrievalEvaluationModalProps) {
  const percentage = Math.round(score * 100);

  // Keyboard shortcut listeners (1-4 for ratings, Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (isSubmitting) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "1") {
        onSubmitReview(1);
      } else if (e.key === "2") {
        onSubmitReview(2);
      } else if (e.key === "3") {
        onSubmitReview(3);
      } else if (e.key === "4") {
        onSubmitReview(4);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onSubmitReview, isSubmitting]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/50 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/40 w-full max-w-md p-5 sm:p-6 flex flex-col items-center animate-in zoom-in-95 duration-300">
        {/* Top header row: AI reference score on the left, close button on the right */}
        <div className="w-full flex items-center justify-between -mt-1 mb-2">
          <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant/80">
            <span>AI reference score:</span>
            <span className="font-semibold text-on-surface-variant">{percentage}%</span>
          </div>
          <button
            type="button"
            id="btn-close-evaluation"
            onClick={onClose}
            className="-mr-1 p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant/70 hover:text-on-surface transition-colors cursor-pointer"
            title="Close"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison cards: Target and Learner sentences with audio buttons */}
        <div className="w-full space-y-3 mb-2 text-left">
          {/* Target sentence card */}
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
            <div className="space-y-0.5 flex-1 min-w-0">
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                Target sentence
              </span>
              <p className="text-sm font-semibold text-primary wrap-break-word">
                {targetText}
              </p>
            </div>
            <button
              type="button"
              id="btn-eval-target-audio"
              onClick={onPlayTargetAudio}
              disabled={isLoadingTargetAudio}
              className="p-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all active:scale-90 cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
              title={
                isLoadingTargetAudio
                  ? "Loading audio..."
                  : "Listen to target audio"
              }
              aria-label="Listen to target audio"
            >
              {isLoadingTargetAudio ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Learner sentence card */}
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
            <div className="space-y-0.5 flex-1 min-w-0">
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                Your sentence
              </span>
              <p className="text-sm font-semibold text-on-surface wrap-break-word">
                {learnerText || "(No speech detected)"}
              </p>
            </div>
            {hasLearnerAudio && onPlayLearnerAudio && (
              <button
                type="button"
                id="btn-eval-learner-audio"
                onClick={onPlayLearnerAudio}
                className="p-2.5 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-xl transition-all active:scale-90 cursor-pointer shrink-0"
                title="Listen to your audio"
                aria-label="Listen to your audio"
              >
                <Play className="w-4 h-4 fill-secondary" />
              </button>
            )}
          </div>
        </div>

        {/* Question: How easily did you recall this sentence? */}
        <div className="w-full mt-3 mb-2 text-center">
          <p className="text-sm font-semibold text-on-surface">
            How easily did you recall this sentence?
          </p>
        </div>

        {/* 4 Rating Buttons: Forget, Hard, Good, Easy */}
        <div className="grid grid-cols-4 gap-2 w-full mt-1">
          <button
            type="button"
            id="btn-rating-forget"
            onClick={() => onSubmitReview(1)}
            disabled={isSubmitting}
            className="py-2.5 px-1.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="font-bold text-xs sm:text-sm">Forget</span>
            <span className="text-[10px] font-normal text-white/80 leading-tight">wrong</span>
          </button>

          <button
            type="button"
            id="btn-rating-hard"
            onClick={() => onSubmitReview(2)}
            disabled={isSubmitting}
            className="py-2.5 px-1.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="font-bold text-xs sm:text-sm">Hard</span>
            <span className="text-[10px] font-normal text-white/80 leading-tight">right</span>
          </button>

          <button
            type="button"
            id="btn-rating-good"
            onClick={() => onSubmitReview(3)}
            disabled={isSubmitting}
            className="py-2.5 px-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="font-bold text-xs sm:text-sm">Good</span>
            <span className="text-[10px] font-normal text-white/80 leading-tight">right</span>
          </button>

          <button
            type="button"
            id="btn-rating-easy"
            onClick={() => onSubmitReview(4)}
            disabled={isSubmitting}
            className="py-2.5 px-1.5 rounded-2xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="font-bold text-xs sm:text-sm">Easy</span>
            <span className="text-[10px] font-normal text-white/80 leading-tight">right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
