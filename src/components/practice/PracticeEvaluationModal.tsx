import {
  Trophy,
  Mic,
  CheckCircle2,
  Volume2,
  Play,
  ArrowRight,
  X,
} from "lucide-react";
import { type Brick } from "@/types";

interface EvaluationFeedbackData {
  show: boolean;
  overall: number;
  pronunciation: number;
  accuracy: number;
  message: string;
  phonemes?: { word: string; status: "correct" | "partial" | "missed" }[];
}

interface PracticeEvaluationModalProps {
  feedback: EvaluationFeedbackData;
  activeBrick: Brick;
  onClose: () => void;
  onNext: () => void;
  onPlayTargetAudio: () => void;
  onPlayLearnerAudio: () => void;
}

export default function PracticeEvaluationModal({
  feedback,
  activeBrick,
  onClose,
  onNext,
  onPlayTargetAudio,
  onPlayLearnerAudio,
}: PracticeEvaluationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/50 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 w-full max-w-md p-6 flex flex-col items-center text-center relative animate-in zoom-in-95 duration-300">
        {/* Top Close / Cancel icon button */}
        <button
          type="button"
          id="btn-close-evaluation"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-container text-on-surface-variant/70 hover:text-on-surface transition-colors cursor-pointer"
          title="Close evaluation (stay on current brick)"
          aria-label="Close evaluation"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative w-full flex justify-center items-center mb-3 mt-1">
          <div className="p-3.5 bg-primary/10 rounded-full">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="relative flex items-center justify-center mb-4">
          <div className="w-20 h-20 rounded-full border-4 border-primary/20 bg-primary/5 flex items-center justify-center">
            <span className="text-2xl font-bold font-display text-primary">
              {feedback.overall}%
            </span>
          </div>
        </div>

        <h4 className="text-lg font-bold text-on-surface mb-1 font-display">
          {feedback.overall >= 90
            ? "Excellent Job!"
            : feedback.overall >= 75
              ? "Good Effort!"
              : "Keep Practicing!"}
        </h4>
        <p className="text-xs text-on-surface-variant mb-5 leading-relaxed px-2">
          {feedback.message}
        </p>

        {/* Score Breakdown Cards */}
        <div className="w-full grid grid-cols-2 gap-3 mb-4">
          <div className="bg-surface-container-low border border-outline-variant/50 rounded-xl p-3 flex flex-col items-center gap-1 shadow-xs">
            <Mic className="w-4 h-4 text-secondary" />
            <span className="text-sm font-bold text-on-surface">
              {feedback.pronunciation}%
            </span>
            <span className="text-[10px] text-outline uppercase font-extrabold tracking-wider">
              Pronunciation
            </span>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/50 rounded-xl p-3 flex flex-col items-center gap-1 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-on-surface">
              {feedback.accuracy}%
            </span>
            <span className="text-[10px] text-outline uppercase font-extrabold tracking-wider">
              Accuracy
            </span>
          </div>
        </div>

        {/* Detailed Target Text & Phoneme Word Evaluation */}
        <div className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3.5 mb-5 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
              Target Phrase & Breakdown
            </span>
            {activeBrick.targetPron && (
              <span className="text-[10px] font-mono text-outline">
                {activeBrick.targetPron}
              </span>
            )}
          </div>

          <p className="text-sm font-bold text-on-surface">
            {activeBrick.targetText}
          </p>

          {feedback.phonemes && feedback.phonemes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {feedback.phonemes.map((item, idx) => (
                <span
                  key={idx}
                  className={`text-xs px-2 py-0.5 rounded-md font-medium border ${
                    item.status === "correct"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : item.status === "partial"
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : "bg-surface-container text-on-surface-variant border-outline-variant/40"
                  }`}
                >
                  {item.word}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Audio Compare Controls (Target Audio & Learner Audio) */}
        <div className="w-full grid grid-cols-2 gap-2 mb-6">
          <button
            type="button"
            id="btn-eval-target-audio"
            onClick={onPlayTargetAudio}
            className="py-2.5 px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 border border-primary/20 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>Target Audio</span>
          </button>

          <button
            type="button"
            id="btn-eval-learner-audio"
            onClick={onPlayLearnerAudio}
            className="py-2.5 px-3 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 border border-secondary/20 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-secondary" />
            <span>Your Voice</span>
          </button>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col w-full gap-2">
          <button
            type="button"
            id="btn-eval-next-brick"
            onClick={onNext}
            className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold shadow-sm hover:bg-primary/95 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <span>Next Brick</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="btn-eval-cancel-stay"
            onClick={onClose}
            className="w-full py-2.5 text-xs text-outline font-semibold hover:text-on-surface transition-colors rounded-xl border border-outline-variant/30 hover:bg-surface-container cursor-pointer"
          >
            Cancel (Stay on Card)
          </button>
        </div>
      </div>
    </div>
  );
}
