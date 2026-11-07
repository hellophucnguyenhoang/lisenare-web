import { useEffect } from "react";
import { Volume2, Play, X, Loader2 } from "lucide-react";
import { type Rating } from "@/api/evaluation";

interface RetrievalEvaluationModalProps {
  score: number;
  targetText: string;
  learnerText: string;
  context?: string | null;
  imageUrl?: string | null;
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
  context,
  imageUrl,
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
    <div
      style={{ willChange: "opacity" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/50 p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        style={{ willChange: "transform, opacity" }}
        className="bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/40 w-full max-w-md p-5 sm:p-6 flex flex-col items-center animate-in zoom-in-95 duration-300 max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top header row: AI reference score on the left, close button on the right */}
        <div className="w-full flex items-center justify-between -mt-1 mb-2">
          <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant/80">
            <span>AI reference score:</span>
            <span className="font-semibold text-on-surface-variant">
              {percentage}%
            </span>
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

        {/* Comparison cards: Target and Learner sentences (clickable to play audio), plus optional Context */}
        <div className="w-full space-y-3 mb-2 text-left">
          {/* Target sentence card */}
          <button
            type="button"
            id="btn-eval-target-card"
            onClick={onPlayTargetAudio}
            disabled={isLoadingTargetAudio}
            className="w-full text-left bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 hover:border-primary/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs transition-all cursor-pointer group active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed select-none"
            title={
              isLoadingTargetAudio
                ? "Loading audio..."
                : "Click to listen to target sentence"
            }
            aria-label="Click to listen to target sentence"
          >
            <div className="space-y-0.5 flex-1 min-w-0">
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                Target sentence
              </span>
              <span className="text-sm font-semibold text-primary wrap-break-word block">
                {targetText}
              </span>
            </div>
            {isLoadingTargetAudio ? (
              <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
            ) : (
              <Volume2 className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors shrink-0" />
            )}
          </button>

          {/* Learner sentence card */}
          {hasLearnerAudio && onPlayLearnerAudio ? (
            <button
              type="button"
              id="btn-eval-learner-card"
              onClick={onPlayLearnerAudio}
              className="w-full text-left bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 hover:border-secondary/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs transition-all cursor-pointer group active:scale-[0.99] select-none"
              title="Click to listen to your sentence"
              aria-label="Click to listen to your sentence"
            >
              <div className="space-y-0.5 flex-1 min-w-0">
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                  Your sentence
                </span>
                <span className="text-sm font-semibold text-on-surface wrap-break-word block">
                  {learnerText || "(No speech detected)"}
                </span>
              </div>
              <Play className="w-4 h-4 text-secondary/60 fill-secondary/60 group-hover:text-secondary group-hover:fill-secondary transition-colors shrink-0" />
            </button>
          ) : (
            <div className="w-full text-left bg-surface-container-low border border-outline-variant/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
              <div className="space-y-0.5 flex-1 min-w-0">
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                  Your sentence
                </span>
                <span className="text-sm font-semibold text-on-surface wrap-break-word block">
                  {learnerText || "(No speech detected)"}
                </span>
              </div>
            </div>
          )}

          {/* Brick context card */}
          {((context && context.trim()) || imageUrl) && (
            <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-3.5 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                Brick context
              </span>
              {imageUrl && (
                <div className="relative rounded-xl overflow-hidden max-h-40 max-w-xs mx-auto border border-outline-variant/30 bg-surface-container-lowest">
                  <img
                    src={imageUrl}
                    alt="Brick context illustration"
                    className="max-h-40 w-auto object-contain mx-auto rounded-lg"
                    loading="lazy"
                  />
                </div>
              )}
              {context && context.trim() && (
                <p className="text-sm text-on-surface-variant italic wrap-break-word">
                  {context.trim()}
                </p>
              )}
            </div>
          )}
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
            <span className="text-[10px] font-normal text-white/80 leading-tight">
              wrong
            </span>
          </button>

          <button
            type="button"
            id="btn-rating-hard"
            onClick={() => onSubmitReview(2)}
            disabled={isSubmitting}
            className="py-2.5 px-1.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="font-bold text-xs sm:text-sm">Hard</span>
            <span className="text-[10px] font-normal text-white/80 leading-tight">
              right
            </span>
          </button>

          <button
            type="button"
            id="btn-rating-good"
            onClick={() => onSubmitReview(3)}
            disabled={isSubmitting}
            className="py-2.5 px-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="font-bold text-xs sm:text-sm">Good</span>
            <span className="text-[10px] font-normal text-white/80 leading-tight">
              right
            </span>
          </button>

          <button
            type="button"
            id="btn-rating-easy"
            onClick={() => onSubmitReview(4)}
            disabled={isSubmitting}
            className="py-2.5 px-1.5 rounded-2xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="font-bold text-xs sm:text-sm">Easy</span>
            <span className="text-[10px] font-normal text-white/80 leading-tight">
              right
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
