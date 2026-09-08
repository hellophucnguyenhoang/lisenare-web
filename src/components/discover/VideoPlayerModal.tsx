import { useEffect } from "react";
import { X, ExternalLink, Sparkles } from "lucide-react";
import { type DiscoverVideo } from "@/types";

interface VideoPlayerModalProps {
  video: DiscoverVideo | null;
  onClose: () => void;
  onSaveToCollection?: (video: DiscoverVideo) => void;
}

export default function VideoPlayerModal({
  video,
  onClose,
  onSaveToCollection,
}: VideoPlayerModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (video) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [video, onClose]);

  if (!video) return null;

  const startSeconds = Math.floor(video.start);
  const embedUrl = `https://www.youtube.com/embed/${video.ytbVideoId}?start=${startSeconds}&autoplay=1&rel=0`;
  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${video.ytbVideoId}&t=${startSeconds}s`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Container */}
      <div className="relative bg-surface-container-lowest border border-outline-variant/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-outline-variant/50 bg-surface-container/40">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary uppercase">
              {video.category}
            </span>
            <h3 className="text-sm font-bold text-on-surface truncate">
              {video.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-outline hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Close player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={embedUrl}
            title={video.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Content Info */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div>
            <span className="text-[11px] font-semibold text-outline uppercase tracking-wider block mb-1">
              Context Transcript ({video.channel})
            </span>
            <blockquote className="text-base sm:text-lg font-bold font-display text-on-surface leading-snug">
              "{video.transcript}"
            </blockquote>
            <p className="mt-2 text-xs sm:text-sm text-on-surface-variant bg-surface-container/60 p-3 rounded-xl border border-outline-variant/30">
              {video.translation}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/40 text-xs">
            <a
              href={youtubeWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
            >
              <span>Watch full video on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {onSaveToCollection && (
              <button
                type="button"
                onClick={() => {
                  onSaveToCollection(video);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:bg-primary-container transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Save as Brick</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
