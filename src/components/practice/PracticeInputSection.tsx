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
import PlainTextInput from "@/components/common/PlainTextInput";

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
    <div className="w-full max-w-full space-y-4 min-w-0">
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
          autoComplete="none"
          className="w-full max-w-full flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-200 min-w-0"
        >
          <div className="grow min-w-0">
            <PlainTextInput
              placeholder="Type target sentence..."
              value={typedAnswer}
              onChange={onChangeTypedAnswer}
              disabled={isEvaluating}
              autoFocus
              onFocus={() => {
                requestAnimationFrame(() => {
                  window.scrollTo({ top: 0, behavior: "instant" });
                });
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: "instant" });
                }, 80);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && typedAnswer.trim() && !isEvaluating) {
                  onSubmitTypedAnswer(e as unknown as React.SubmitEvent);
                }
              }}
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/70 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm font-medium text-on-surface transition-all shadow-xs outline-none"
            />
          </div>
          <button
            type="submit"
            id="btn-submit-typed-answer"
            disabled={!typedAnswer.trim() || isEvaluating}
            className="shrink-0 bg-primary text-on-primary px-4 py-3 rounded-xl font-bold text-xs hover:bg-primary/95 transition-all cursor-pointer active:scale-95 shadow-xs disabled:opacity-40 flex items-center gap-1.5"
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
            className="shrink-0 p-3 border border-outline-variant/60 bg-surface-container-lowest text-outline hover:text-primary rounded-xl hover:bg-surface-container transition-colors cursor-pointer active:scale-95 disabled:opacity-40"
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
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="w-full flex items-center justify-center gap-6 py-1">
                <div className="w-11 h-11 shrink-0" />
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-xs">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
                <div className="w-11 h-11 shrink-0" />
              </div>

              <AudioWaveform isRecording={false} />

              <div className="h-5 flex items-center justify-center">
                <p className="text-xs text-primary font-medium animate-pulse">
                  Evaluating pronunciation...
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="w-full flex items-center justify-center gap-6 py-1">
                {/* Left Slot: Fixed 44x44px for Trash / Cancel Button */}
                <div className="w-11 h-11 shrink-0 flex items-center justify-center">
                  {isRecording && (
                    <button
                      type="button"
                      id="btn-cancel-recording"
                      onClick={onCancelRecording}
                      className="w-11 h-11 rounded-full border border-error/30 bg-error/10 hover:bg-error/20 text-error flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-xs animate-in fade-in zoom-in-75 duration-200"
                      title="Cancel recording"
                      aria-label="Cancel recording"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Center Slot: Persistent Main Action Button (Mic / Submit) */}
                <button
                  type="button"
                  id={isRecording ? "btn-submit-recording" : "btn-record-mic"}
                  onClick={isRecording ? onSubmitRecording : onStartRecording}
                  className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shadow-md ${
                    isRecording
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 ring-4 ring-emerald-400/25"
                      : "bg-primary hover:bg-primary/95 text-on-primary shadow-primary/20 hover:shadow-lg"
                  }`}
                  title={isRecording ? "Submit recording" : "Tap to speak"}
                  aria-label={
                    isRecording ? "Submit recording" : "Record pronunciation"
                  }
                >
                  {isRecording ? (
                    <Check className="w-6 h-6 stroke-[2.5] transition-transform duration-200 animate-in zoom-in-75" />
                  ) : (
                    <Mic className="w-6 h-6 transition-transform duration-200 animate-in zoom-in-75" />
                  )}
                </button>

                {/* Right Slot: Fixed 44x44px for Keyboard Toggle */}
                <div className="w-11 h-11 shrink-0 flex items-center justify-center">
                  {!isRecording && (
                    <button
                      type="button"
                      id="btn-toggle-keyboard-mode"
                      onClick={onToggleTypeInput}
                      className="p-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container text-outline hover:text-primary transition-all active:scale-90 cursor-pointer shadow-xs animate-in fade-in zoom-in-75 duration-200"
                      title="Switch to typing"
                      aria-label="Switch to typing"
                    >
                      <Keyboard className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Waveform */}
              <AudioWaveform isRecording={isRecording} />

              {/* Fixed-Height Instruction Caption */}
              <div className="h-5 flex items-center justify-center">
                <p className="text-xs text-on-surface-variant font-medium select-none transition-opacity duration-200">
                  {isRecording && "Tap checkmark to submit or trash to cancel"}
                </p>
              </div>
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
