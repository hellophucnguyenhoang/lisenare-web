import { useMemo, useState, useEffect, useRef } from "react";
import {
  Volume2,
  Eye,
  EyeOff,
  Edit3,
  Loader2,
  MoreVertical,
  SkipForward,
  Flag,
} from "lucide-react";
import { type Brick } from "@/types";
import { useForcedAlignment, useBrickImage } from "@/hooks/useBricks";
import { type WordSegmentSecond } from "@/api/evaluation";

interface RetrievalFlashcardProps {
  activeBrick: Brick;
  isRevealed: boolean;
  isLoadingAudio?: boolean;
  onToggleReveal: () => void;
  onPlayAudio: (startTimeSec?: number) => void;
  onEditBrick?: () => void;
  onSkipBrick?: () => void;
  onReportBrick?: () => void;
}

export default function RetrievalFlashcard({
  activeBrick,
  isRevealed,
  isLoadingAudio = false,
  onToggleReveal,
  onPlayAudio,
  onEditBrick,
  onSkipBrick,
  onReportBrick,
}: RetrievalFlashcardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { data: imageUrl } = useBrickImage(
    activeBrick.id,
    activeBrick.imagePath,
  );

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [activeBrick?.id]);

  const { data: alignmentSegments } = useForcedAlignment(
    activeBrick.id,
    Boolean(activeBrick.id),
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
    <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-md p-5 sm:p-8 flex flex-col items-center text-center relative transition-all">
      {/* Header options menu */}
      <div
        className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20"
        ref={menuRef}
      >
        <button
          type="button"
          id="btn-retrieval-more-options"
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className="text-outline hover:text-primary transition-all p-1.5 rounded-full hover:bg-surface-container cursor-pointer active:scale-95"
          aria-label="More options"
          title="More options"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-9 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-30 py-1.5 w-36 text-left animate-in fade-in zoom-in-95 duration-150">
            {onEditBrick && (
              <button
                type="button"
                id="btn-retrieval-menu-edit"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  onEditBrick();
                }}
                className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-surface-container flex items-center gap-2 text-on-surface cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-outline" />
                <span>Edit brick</span>
              </button>
            )}
            {onSkipBrick && (
              <button
                type="button"
                id="btn-retrieval-menu-skip"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  onSkipBrick();
                }}
                className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-surface-container flex items-center gap-2 text-on-surface cursor-pointer"
              >
                <SkipForward className="w-4 h-4 text-outline" />
                <span>
                  {activeBrick.isSkipped ? "Unskip brick" : "Skip brick"}
                </span>
              </button>
            )}
            {onReportBrick && (
              <button
                type="button"
                id="btn-retrieval-menu-report"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  onReportBrick();
                }}
                className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-surface-container flex items-center gap-2 text-on-surface cursor-pointer"
              >
                <Flag className="w-4 h-4 text-outline" />
                <span>Report brick</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3 sm:mb-5">
        <span className="px-3 py-1 bg-surface-container text-on-surface-variant rounded-lg text-[10px] font-bold tracking-wider uppercase">
          Native sentence
        </span>
        {activeBrick.isSkipped && (
          <span
            className="px-2 py-0.5 bg-surface-container text-outline rounded-md text-[10px] font-semibold flex items-center gap-1 border border-outline-variant/40"
            title="This brick is skipped from retrieval"
          >
            <SkipForward className="w-3 h-3" />
            <span>Skipped</span>
          </span>
        )}
      </div>

      {/* Native phrase */}
      <div className="mb-3 sm:mb-4">
        <h2 className="text-base md:text-lg lg:text-xl font-bold font-display text-on-background tracking-tight leading-snug">
          {activeBrick.nativeText}
        </h2>
      </div>

      {/* Context & image if available */}
      {(activeBrick.context || imageUrl) && (
        <div className="mb-4 sm:mb-5 w-full flex flex-col items-center gap-2.5">
          {imageUrl && (
            <div className="relative rounded-2xl overflow-hidden max-h-52 max-w-xs sm:max-w-sm border border-outline-variant/40 bg-surface-container-low shadow-2xs">
              <img
                src={imageUrl}
                alt="Brick context illustration"
                className="max-h-52 w-auto object-contain mx-auto rounded-xl"
                loading="lazy"
              />
            </div>
          )}
          {activeBrick.context && (
            <p className="text-xs text-on-surface-variant/80 italic text-center">
              {activeBrick.context}
            </p>
          )}
        </div>
      )}

      {/* Action controls: Target audio listen & Reveal toggle */}
      <div className="flex items-center justify-center gap-3 my-2">
        <button
          type="button"
          id="btn-retrieval-listen-audio"
          onClick={() => onPlayAudio()}
          disabled={isLoadingAudio}
          className="p-3.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-full active:scale-90 transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
          title={
            isLoadingAudio
              ? "Loading audio..."
              : "Listen to target pronunciation"
          }
          aria-label="Listen to target pronunciation"
        >
          {isLoadingAudio ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>

        <button
          type="button"
          id="btn-retrieval-toggle-reveal"
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

      {/* Revealed target content */}
      {isRevealed && (
        <div className="w-full animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center mt-4 pt-5 border-t border-outline-variant/30">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold tracking-wider uppercase mb-2">
            Target sentence
          </span>
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary mb-1 font-display flex flex-wrap justify-center gap-x-1.5 leading-snug">
            {wordsWithTiming.map(({ word, segment }, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isLoadingAudio) return;
                  onPlayAudio(segment?.start_sec);
                }}
                className={`transition-all bg-transparent p-0 border-0 font-inherit text-inherit inline-block cursor-pointer select-text touch-manipulation ${
                  isLoadingAudio
                    ? "opacity-60 cursor-not-allowed pointer-events-none"
                    : "hover:underline hover:opacity-80 active:opacity-60"
                }`}
                title={
                  segment
                    ? `Play from ${segment.start_sec.toFixed(2)}s`
                    : "Play word"
                }
                aria-label={
                  segment
                    ? `Play "${word}" from ${segment.start_sec.toFixed(2)}s`
                    : `Play "${word}"`
                }
              >
                {word}
              </button>
            ))}
          </h3>
          {activeBrick.targetPron && (
            <p className="text-xs text-outline font-mono select-none mt-1">
              {activeBrick.targetPron}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
