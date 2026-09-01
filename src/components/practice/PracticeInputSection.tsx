import React from "react";
import { Mic, ArrowRight } from "lucide-react";
import AudioWaveform from "@/components/common/AudioWaveform";

interface PracticeInputSectionProps {
  showTypeInput: boolean;
  typedAnswer: string;
  onChangeTypedAnswer: (val: string) => void;
  onSubmitTypedAnswer: (e: React.SubmitEvent) => void;
  onCancelTypeInput: () => void;
  isRecording: boolean;
  onMicClick: () => void;
  showNextButton: boolean;
  onNext: () => void;
}

export default function PracticeInputSection({
  showTypeInput,
  typedAnswer,
  onChangeTypedAnswer,
  onSubmitTypedAnswer,
  onCancelTypeInput,
  isRecording,
  onMicClick,
  showNextButton,
  onNext,
}: PracticeInputSectionProps) {
  return (
    <>
      {/* Practice Instruction Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 text-center">
        <p className="text-xs text-primary font-semibold">
          Speak the vietnamese sentence you see in english
        </p>
      </div>

      {/* Practice Input Switcher */}
      {showTypeInput && (
        <form
          onSubmit={onSubmitTypedAnswer}
          className="w-full flex gap-2 animate-in slide-in-from-bottom-2 duration-200"
        >
          <input
            type="text"
            placeholder="Type translation in English..."
            value={typedAnswer}
            onChange={(e) => onChangeTypedAnswer(e.target.value)}
            className="grow px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm transition-all shadow-xs"
          />
          <button
            type="submit"
            id="btn-submit-typed-answer"
            className="bg-primary text-on-primary px-5 rounded-xl font-bold text-xs hover:bg-primary/95 transition-all cursor-pointer"
          >
            Check
          </button>
          <button
            type="button"
            id="btn-cancel-typed-answer"
            onClick={onCancelTypeInput}
            className="px-3 border border-outline-variant text-on-surface-variant rounded-xl hover:bg-surface cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Pronunciation Recording Circle */}
      {!showTypeInput && (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="relative">
            <button
              type="button"
              id="btn-record-mic"
              onClick={onMicClick}
              className={`w-20 h-20 rounded-full text-on-primary shadow-lg flex items-center justify-center transition-all cursor-pointer ${
                isRecording
                  ? "bg-error animate-pulse scale-105 shadow-error/20"
                  : "bg-primary hover:brightness-105 active:scale-95 shadow-primary/20"
              }`}
              title="Hold or tap to speak pronunciation"
              aria-label="Record pronunciation"
            >
              <Mic className="w-9 h-9" />
            </button>
          </div>

          <AudioWaveform isRecording={isRecording} />

          {!isRecording && (
            <p className="text-xs text-on-surface-variant font-medium select-none">
              Tap to record your pronunciation
            </p>
          )}
        </div>
      )}

      {/* Next brick CTA button */}
      {showNextButton && (
        <button
          type="button"
          id="btn-practice-next-brick"
          onClick={onNext}
          className="w-full bg-primary text-on-primary py-4 rounded-xl shadow-md active:scale-98 transition-all hover:shadow-lg flex items-center justify-center gap-2 font-bold animate-in fade-in duration-300 cursor-pointer"
        >
          <span>Next Brick</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
