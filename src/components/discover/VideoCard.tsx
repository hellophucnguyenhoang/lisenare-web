import { useState } from "react";
import { Play, Plus, Languages, Clock, ExternalLink } from "lucide-react";
import { type DiscoverVideo } from "@/types";

interface VideoCardProps {
  video: DiscoverVideo;
  onWatch: (video: DiscoverVideo) => void;
  onSaveToCollection: (video: DiscoverVideo) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function VideoCard({
  video,
  onWatch,
  onSaveToCollection,
}: VideoCardProps) {
  const [showTranslation, setShowTranslation] = useState(false);

  const thumbnailUrl = `https://img.youtube.com/vi/${video.ytbVideoId}/mqdefault.jpg`;
  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${video.ytbVideoId}&t=${Math.floor(video.start)}s`;

  const levelColor =
    video.level === "Beginner"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      : video.level === "Intermediate"
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
        : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl overflow-hidden shadow-xs hover:border-primary/30 transition-all flex flex-col justify-between group">
      {/* Top: Video Thumbnail */}
      <div className="relative aspect-video w-full bg-surface-container overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Play overlay button */}
        <button
          type="button"
          onClick={() => onWatch(video)}
          className="absolute inset-0 bg-black/25 flex items-center justify-center cursor-pointer group/btn"
          aria-label={`Watch clip from ${video.title}`}
        >
          <div className="p-3.5 rounded-full bg-primary text-on-primary shadow-xl scale-95 group-hover/btn:scale-110 active:scale-95 transition-all">
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          </div>
        </button>

        {/* Timestamp badge */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[11px] font-mono font-semibold flex items-center gap-1">
          <Clock className="w-3 h-3 text-white/80" />
          <span>{formatTime(video.start)}</span>
        </div>

        {/* Level & Category badge */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-xs ${levelColor}`}
          >
            {video.level}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/60 text-white backdrop-blur-xs">
            {video.category}
          </span>
        </div>
      </div>

      {/* Center: Content & Transcript */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-outline mb-1.5">
            <span className="font-semibold text-on-surface-variant truncate">
              {video.channel}
            </span>
            <span className="text-[11px] font-mono text-outline shrink-0 ml-2">
              ~{Math.round(video.duration)}s clip
            </span>
          </div>

          <h3 className="text-base font-bold font-display text-on-surface leading-snug">
            "{video.transcript}"
          </h3>

          {/* Translation toggleable */}
          {showTranslation && (
            <p className="mt-2 text-xs font-medium text-on-surface-variant bg-surface-container/60 p-2.5 rounded-xl border border-outline-variant/30 animate-in fade-in">
              {video.translation}
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 pt-1">
          {video.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-[10px] font-medium rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30 text-xs">
          <button
            type="button"
            onClick={() => setShowTranslation((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary font-semibold transition-colors cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5 text-primary" />
            <span>{showTranslation ? "Hide Translation" : "Translation"}</span>
          </button>

          <div className="flex items-center gap-2">
            <a
              href={youtubeWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-outline hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
              title="Open directly on YouTube"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={() => onSaveToCollection(video)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save as Brick</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
