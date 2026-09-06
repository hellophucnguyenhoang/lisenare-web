import { useMemo } from "react";
import { Volume2, Eye, EyeOff } from "lucide-react";
import { type Brick } from "@/types";
import { useForcedAlignment } from "@/hooks/useBricks";
import { type WordSegmentSecond } from "@/api/evaluation";

interface PracticeFlashcardProps {
  activeBrick: Brick;
  isRevealed: boolean;
  onToggleReveal: () => void;
  onPlayAudio: (startTimeSec?: number) => void;
}

export default function PracticeFlashcard({
  activeBrick,
  isRevealed,
  onToggleReveal,
  onPlayAudio,
}: PracticeFlashcardProps) {
  const { data: alignmentSegments } = useForcedAlignment(
    activeBrick.targetAudioPath,
    Boolean(activeBrick.targetAudioPath),
  );

  // Split targetText into words and match with forced alignment segments
  const wordsWithTiming = useMemo(() => {
    if (!activeBrick.targetText) return [];
    const words = activeBrick.targetText.trim().split(/\s+/);
    if (!alignmentSegments || alignmentSegments.length === 0) {
      return words.map((word) => ({ word, segment: null }));
    }

    const clean = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
    let segIdx = 0;

    return words.map((word, idx) => {
      const cleaned = clean(word);
      let matchedSegment: WordSegmentSecond | null = null;

      if (cleaned) {
        for (let i = segIdx; i < alignmentSegments.length; i++) {
          if (clean(alignmentSegments[i].word) === cleaned) {
            matchedSegment = alignmentSegments[i];
            segIdx = i + 1;
            break;
          }
        }
      }

      // Fallback by index if lengths match
      if (!matchedSegment && alignmentSegments[idx]) {
        matchedSegment = alignmentSegments[idx];
      }

      return { word, segment: matchedSegment };
    });
  }, [activeBrick.targetText, alignmentSegments]);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-md p-8 sm:p-10 flex flex-col items-center text-center relative overflow-hidden transition-all">
      <span className="px-3 py-1 bg-surface-container text-on-surface-variant rounded-lg text-[10px] font-bold tracking-wider uppercase mb-5">
        Native Sentence
      </span>

      {/* Native Phrase */}
      <div className="mb-6">
        <h2 className="text-base md:text-lg lg:text-xl font-bold font-display text-on-background tracking-tight leading-snug">
          {activeBrick.nativeText}
        </h2>
      </div>

      {/* Action controls: Target Audio Listen & Reveal Toggle */}
      <div className="flex items-center justify-center gap-3 my-2">
        <button
          type="button"
          id="btn-practice-listen-audio"
          onClick={() => onPlayAudio()}
          className="p-3.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-full active:scale-90 transition-all shadow-xs cursor-pointer"
          title="Listen to target pronunciation"
          aria-label="Listen to target pronunciation"
        >
          <Volume2 className="w-5 h-5" />
        </button>

        <button
          type="button"
          id="btn-practice-toggle-reveal"
          onClick={onToggleReveal}
          className={`p-3.5 rounded-full transition-all active:scale-90 shadow-xs cursor-pointer ${
            isRevealed
              ? "bg-secondary/15 text-secondary ring-2 ring-secondary/20 hover:bg-secondary/25"
              : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-secondary"
          }`}
          title={isRevealed ? "Hide target sentence" : "Reveal target sentence"}
          aria-label={
            isRevealed ? "Hide target sentence" : "Reveal target sentence"
          }
        >
          {isRevealed ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Revealed Target Content */}
      {isRevealed && (
        <div className="w-full animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center mt-4 pt-5 border-t border-outline-variant/30">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold tracking-wider uppercase mb-2">
            Target Sentence
          </span>
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary mb-1 font-display flex flex-wrap justify-center gap-x-1.5 leading-snug">
            {wordsWithTiming.map(({ word, segment }, idx) => (
              <span
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayAudio(segment?.start_sec);
                }}
                className="cursor-pointer hover:underline hover:opacity-80 active:opacity-60 transition-all select-text"
                title={
                  segment
                    ? `Play from ${segment.start_sec.toFixed(2)}s`
                    : "Play word"
                }
              >
                {word}
              </span>
            ))}
          </h3>
          {activeBrick.targetPron && (
            <p className="text-xs text-outline font-mono select-none mt-1">
              {activeBrick.targetPron}
            </p>
          )}
        </div>
      )}

      {/* Context pill if available */}
      {activeBrick.context && (
        <p className="text-xs text-on-surface-variant/80 italic mt-6 border-t border-outline-variant/20 pt-4 w-full">
          "{activeBrick.context}"
        </p>
      )}
    </div>
  );
}
