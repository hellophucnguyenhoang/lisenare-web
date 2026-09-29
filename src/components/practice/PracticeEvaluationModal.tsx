import { Volume2, Play, ArrowRight, X, RotateCcw, Loader2 } from "lucide-react";

interface PracticeEvaluationModalProps {
  score: number;
  passed: boolean;
  targetText: string;
  learnerText: string;
  onClose: () => void;
  onNext: () => void;
  onPlayTargetAudio: () => void;
  onPlayLearnerAudio?: () => void;
  hasLearnerAudio?: boolean;
  isLoadingTargetAudio?: boolean;
}

export default function PracticeEvaluationModal({
  score,
  passed,
  targetText,
  learnerText,
  onClose,
  onNext,
  onPlayTargetAudio,
  onPlayLearnerAudio,
  hasLearnerAudio = false,
  isLoadingTargetAudio = false,
}: PracticeEvaluationModalProps) {
  const percentage = Math.round(score * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/50 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/40 w-full max-w-md p-6 flex flex-col items-center text-center relative animate-in zoom-in-95 duration-300">
        {/* Top Close icon */}
        <button
          type="button"
          id="btn-close-evaluation"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-container text-on-surface-variant/70 hover:text-on-surface transition-colors cursor-pointer"
          title="Close"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Minimal Score Circle */}
        <div className="flex items-center justify-center my-3">
          <div
            className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center shadow-xs transition-transform ${
              passed
                ? "border-primary bg-primary/5 text-primary"
                : "border-amber-500 bg-amber-500/10 text-amber-600"
            }`}
          >
            <span className="text-2xl font-bold font-display tracking-tight">
              {percentage}%
            </span>
          </div>
        </div>

        {/* Comparison Cards: Target and Learner sentences with audio buttons */}
        <div className="w-full space-y-3 my-3 text-left">
          {/* Target Sentence Card */}
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
            <div className="space-y-0.5 flex-1 min-w-0">
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                Target Sentence
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
              title={isLoadingTargetAudio ? "Loading audio..." : "Listen to Target Audio"}
              aria-label="Listen to Target Audio"
            >
              {isLoadingTargetAudio ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Learner Sentence Card */}
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
            <div className="space-y-0.5 flex-1 min-w-0">
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                Your Sentence
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
                title="Listen to Your Audio"
                aria-label="Listen to Your Audio"
              >
                <Play className="w-4 h-4 fill-secondary" />
              </button>
            )}
          </div>
        </div>

        {/* Action Button: Next Brick only if score >= 0.7 */}
        <div className="w-full pt-2">
          {passed ? (
            <button
              type="button"
              id="btn-eval-next-brick"
              onClick={onNext}
              className="w-full bg-primary text-on-primary py-3.5 rounded-2xl font-bold shadow-md hover:bg-primary/95 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <span>Next Brick</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              id="btn-eval-retry"
              onClick={onClose}
              className="w-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface py-3.5 rounded-2xl font-bold border border-outline-variant/60 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Practice Again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
