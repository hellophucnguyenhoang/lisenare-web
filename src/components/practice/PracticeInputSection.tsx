import React from "react";
import {
  Mic,
  ArrowRight,
  Keyboard,
  Check,
  Trash2,
  Loader2,
} from "lucide-react";
import AudioWaveform from "@/components/common/AudioWaveform";

interface PracticeInputSectionProps {
  showTypeInput: boolean;
  onToggleTypeInput: () => void;
  typedAnswer: string;
  onChangeTypedAnswer: (val: string) => void;
  onSubmitTypedAnswer: (e: React.SubmitEvent) => void;
  onCancelTypeInput: () => void;
  isRecording: boolean;
  isEvaluating: boolean;
  onStartRecording: () => void;
  onSubmitRecording: () => void;
  onCancelRecording: () => void;
  showNextButton: boolean;
  onNext: () => void;
}

export default function PracticeInputSection({
  showTypeInput,
  onToggleTypeInput,
  typedAnswer,
  onChangeTypedAnswer,
  onSubmitTypedAnswer,
  onCancelTypeInput,
  isRecording,
  isEvaluating,
  onStartRecording,
  onSubmitRecording,
  onCancelRecording,
  showNextButton,
  onNext,
}: PracticeInputSectionProps) {
  return (
    <div className="w-full space-y-4">
      {/* Practice Instruction Banner */}
      <div className="text-center">
        <p className="text-xs text-primary font-medium">
          {showTypeInput
            ? "Type the target sentence"
            : "Speak the target sentence"}
        </p>
      </div>

      {/* Keyboard Typing Mode Form */}
      {showTypeInput && (
        <form
          onSubmit={onSubmitTypedAnswer}
          className="w-full flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-200"
        >
          <input
            type="text"
            placeholder="Type target sentence..."
            value={typedAnswer}
            onChange={(e) => onChangeTypedAnswer(e.target.value)}
            disabled={isEvaluating}
            className="grow px-4 py-3 bg-surface-container-lowest border border-outline-variant/70 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary focus:outline-none text-sm font-medium text-on-surface transition-all shadow-xs outline-none placeholder:text-outline disabled:opacity-50"
            autoFocus
          />
          <button
            type="submit"
            id="btn-submit-typed-answer"
            disabled={!typedAnswer.trim() || isEvaluating}
            className="bg-primary text-on-primary px-4 py-3 rounded-xl font-bold text-xs hover:bg-primary/95 transition-all cursor-pointer active:scale-95 shadow-xs disabled:opacity-40 flex items-center gap-1.5"
          >
            {isEvaluating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Check</span>
            )}
          </button>
          <button
            type="button"
            id="btn-cancel-typed-answer"
            onClick={onCancelTypeInput}
            disabled={isEvaluating}
            className="p-3 border border-outline-variant/60 bg-surface-container-lowest text-outline hover:text-primary rounded-xl hover:bg-surface-container transition-colors cursor-pointer active:scale-95 disabled:opacity-40"
            title="Switch to microphone"
            aria-label="Switch to microphone"
          >
            <Mic className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Pronunciation Recording Mode */}
      {!showTypeInput && (
        <div className="flex flex-col items-center gap-3 w-full">
          {isEvaluating ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-xs">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
              <p className="text-xs text-primary font-medium animate-pulse">
                Evaluating pronunciation...
              </p>
            </div>
          ) : isRecording ? (
            <div className="w-full flex flex-col items-center gap-3">
              <div className="w-full flex items-center justify-center gap-6 py-1">
                {/* Trash / Cancel button */}
                <button
                  type="button"
                  id="btn-cancel-recording"
                  onClick={onCancelRecording}
                  className="w-11 h-11 rounded-full border border-error/30 bg-error/10 hover:bg-error/20 text-error flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-xs"
                  title="Cancel recording"
                  aria-label="Cancel recording"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                {/* Submit Recording button (transformed from Mic) */}
                <button
                  type="button"
                  id="btn-submit-recording"
                  onClick={onSubmitRecording}
                  className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center transition-all active:scale-95 animate-pulse ring-4 ring-emerald-400/20 cursor-pointer"
                  title="Submit recording"
                  aria-label="Submit recording"
                >
                  <Check className="w-7 h-7 stroke-[2.5]" />
                </button>

                {/* Empty spacer on right for balance */}
                <div className="w-11 h-11 pointer-events-none" />
              </div>

              <AudioWaveform isRecording={isRecording} />

              <p className="text-xs text-on-surface-variant font-medium select-none">
                Tap checkmark to submit or trash to cancel
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-3">
              <div className="relative w-full flex items-center justify-center py-1">
                {/* Centered Microphone Button */}
                <button
                  type="button"
                  id="btn-record-mic"
                  onClick={onStartRecording}
                  className="w-14 h-14 rounded-full text-on-primary shadow-md flex items-center justify-center transition-all active:scale-95 cursor-pointer bg-primary hover:bg-primary/95 shadow-primary/20 hover:shadow-lg"
                  title="Tap to speak"
                  aria-label="Record pronunciation"
                >
                  <Mic className="w-6 h-6" />
                </button>

                {/* Compact Keyboard Toggle on the right */}
                <div className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2">
                  <button
                    type="button"
                    id="btn-toggle-keyboard-mode"
                    onClick={onToggleTypeInput}
                    className="p-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container text-outline hover:text-primary transition-all active:scale-90 cursor-pointer shadow-xs"
                    title="Switch to typing"
                    aria-label="Switch to typing"
                  >
                    <Keyboard className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <AudioWaveform isRecording={false} />
            </div>
          )}
        </div>
      )}

      {/* Next brick CTA button */}
      {showNextButton && (
        <button
          type="button"
          id="btn-practice-next-brick"
          onClick={onNext}
          className="w-full bg-primary text-on-primary py-3.5 rounded-xl shadow-md active:scale-98 transition-all hover:shadow-lg flex items-center justify-center gap-2 font-bold animate-in fade-in duration-300 cursor-pointer text-sm"
        >
          <span>Next Brick</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
