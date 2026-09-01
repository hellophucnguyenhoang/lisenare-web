import { useState } from "react";
import { type Snippet } from "@/types";
import {
  Volume2,
  PlusCircle,
  ThumbsUp,
  Languages,
  Mic,
  Info,
  MoreVertical,
} from "lucide-react";
import { playShortAudio } from "@/utils/audio";

interface SnippetCardProps {
  snippet: Snippet;
  onOpenContributions: (snippet: Snippet) => void;
  onOpenSaveModal: (snippet: Snippet) => void;
}

export default function SnippetCard({
  snippet,
  onOpenContributions,
  onOpenSaveModal,
}: SnippetCardProps) {
  const contribCount = snippet.contributionCount;
  const authorName = snippet.creator.name;
  const [showTranslation, setShowTranslation] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div
      id={`snippet-card-${snippet.id}`}
      className="snippet-card bg-surface-container-lowest border border-outline-variant/60 rounded-2xl overflow-hidden shadow-xs hover:border-primary/20 transition-all"
    >
      <div className="p-6 space-y-4">
        {/* Main Phrase Heading */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-outline uppercase tracking-wider">
              By {authorName}
            </span>
            <div className="flex items-center gap-4">
              {/* Translate Icon Button */}
              <button
                type="button"
                onClick={() => setShowTranslation(!showTranslation)}
                className={`p-2 rounded-full transition-all active:scale-90 cursor-pointer ${
                  showTranslation
                    ? "text-primary bg-primary/15 "
                    : "text-outline hover:text-primary hover:bg-primary/5"
                }`}
                title={
                  showTranslation ? "Hide translation" : "Show translation"
                }
                aria-label={
                  showTranslation ? "Hide translation" : "Show translation"
                }
              >
                <Languages className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => playShortAudio(snippet.contentAudioPath)}
                className="p-2 text-primary bg-primary/15 ring-1 ring-primary/20 rounded-full active:scale-90 transition-transform cursor-pointer"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-on-surface">
            {snippet.content}
          </h2>
          {snippet.contentPron && (
            <p className="text-xs text-outline font-mono select-none">
              {snippet.contentPron}
            </p>
          )}
        </div>

        {/* Context Description Section */}
        {snippet.context && (
          <div className="bg-surface-container-low/70 border border-outline-variant/30 rounded-xl p-3.5 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <span className="font-bold text-on-surface">Context: </span>
              {snippet.context}
            </p>
          </div>
        )}

        {/* Translation Display (Toggled by Translate Icon) */}
        {showTranslation && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="p-4 bg-primary/5 rounded-xl border-l-4 border-primary space-y-1">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                Translation
              </span>
              <p className="text-base font-bold text-primary italic font-display">
                {snippet.translation}
              </p>
            </div>
          </div>
        )}

        {/* Contributions Button Row */}
        <div className="pt-1">
          <button
            type="button"
            id={`btn-contributions-${snippet.id}`}
            onClick={() => onOpenContributions(snippet)}
            className="w-full py-2.5 px-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs transition-all active:scale-99 flex items-center justify-between shadow-2xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-primary" />
              <span>Contributions</span>
            </div>
            <span className="bg-primary/15 text-primary px-2.5 py-0.5 rounded-full text-[11px] font-extrabold">
              {contribCount} Audio Clips
            </span>
          </button>
        </div>

        {/* Action Bar Bottom Row (Tags, Translate, Save, Like, Dislike) */}
        <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30">
          <div className="flex items-center gap-2 flex-wrap">
            {snippet.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-surface-container text-on-surface-variant rounded-lg text-[10px] font-bold"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Action Icons Row */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Add to Collection Button */}
            <button
              type="button"
              onClick={() => onOpenSaveModal(snippet)}
              className="p-2 text-outline hover:text-primary hover:bg-primary/5 rounded-full active:scale-90 transition-all cursor-pointer"
              title="Add to My Collections"
              aria-label="Add to My Collections"
            >
              <PlusCircle className="w-5 h-5" />
            </button>

            {/* Like Button */}
            <button
              type="button"
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-full active:scale-90 transition-all cursor-pointer ${
                isLiked
                  ? "text-primary bg-primary/10"
                  : "text-outline hover:text-primary hover:bg-primary/5"
              }`}
              title="Like phrase"
              aria-label="Like phrase"
            >
              <ThumbsUp className="w-5 h-5" />
            </button>

            {/* More Button */}
            <button
              onClick={() => {}}
              className="p-1.5 rounded-full text-outline hover:text-primary
               hover:bg-primary/5 transition-all cursor-pointer"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
