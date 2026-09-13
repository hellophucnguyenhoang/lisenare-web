import { useState } from "react";
import {
  ArrowLeft,
  Search,
  X,
  Blocks,
  Video,
  ExternalLink,
} from "lucide-react";
import {
  useSearchContextBricks,
  useSearchContextVideos,
} from "@/hooks/useContextSearch";
import { useLearnerMe } from "@/hooks/useLearner";
import PlainTextInput from "@/components/common/PlainTextInput";

interface SearchPageProps {
  onBack: () => void;
  onNavigateToPractice?: (brickId?: number) => void;
}

type SearchTab = "bricks" | "videos";

const POPULAR_SUGGESTIONS = [
  "hang out",
  "job interview",
  "coffee shop",
  "daily routine",
  "travel",
  "making friends",
];

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function SearchPage({
  onBack,
  onNavigateToPractice,
}: SearchPageProps) {
  const { data: learner } = useLearnerMe();
  const isLoggedIn = Boolean(learner);

  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("bricks");

  const bricksQuery = useSearchContextBricks(activeQuery, isLoggedIn);
  const videosQuery = useSearchContextVideos(activeQuery);

  const handleSearchSubmit = (e?: React.SubmitEvent) => {
    if (e) e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) {
      setActiveQuery(trimmed);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchInput(suggestion);
    setActiveQuery(suggestion);
  };

  const bricks = bricksQuery.data ?? [];
  const videos = videosQuery.data ?? [];

  const isLoadingCurrentTab =
    activeTab === "bricks" ? bricksQuery.isLoading : videosQuery.isLoading;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-surface-container text-on-surface transition-all active:scale-95 cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-on-surface">
            Context Search
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Search vocabulary and real-life video clips by meaning or situation
          </p>
        </div>
      </div>

      {/* Main Search Input Form */}
      <form onSubmit={handleSearchSubmit} autoComplete="off" className="mb-6">
        <div className="relative flex items-center shadow-xs rounded-2xl bg-surface-container-lowest border border-outline-variant/60 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <div className="pl-4 pr-2 text-primary pointer-events-none">
            <Search className="w-5 h-5" />
          </div>
          <div className="grow">
            <PlainTextInput
              value={searchInput}
              onChange={setSearchInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchInput.trim()) {
                  handleSearchSubmit(e as unknown as React.SubmitEvent);
                }
              }}
              placeholder="Search by situation, meaning or phrase (e.g. hang out, restaurant)..."
              className="w-full py-3.5 pr-2 bg-transparent text-sm text-on-surface font-medium focus:outline-none"
              autoFocus
            />
          </div>
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="p-1.5 mr-1 text-outline hover:text-on-surface transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={!searchInput.trim()}
            className="mr-2 px-4 py-2 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-xs hover:bg-primary/95 active:scale-95 transition-all disabled:opacity-40 cursor-pointer shrink-0"
          >
            Search
          </button>
        </div>

        {/* Suggestion Chips */}
        {!activeQuery && (
          <div className="mt-4">
            <span className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-2">
              Popular Contexts
            </span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SUGGESTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 rounded-xl text-xs font-medium text-on-surface transition-all active:scale-95 cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Results View when query is active */}
      {activeQuery && (
        <>
          {/* Tab Navigation */}
          <div className="flex border-b border-outline-variant/40 mb-6 gap-2 sm:gap-6 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("bricks")}
              className={`pb-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === "bricks"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Blocks className="w-4 h-4" />
              <span>Bricks</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary font-bold">
                {bricks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("videos")}
              className={`pb-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === "videos"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Videos</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary font-bold">
                {videos.length}
              </span>
            </button>
          </div>

          {/* Tab Content */}
          {isLoadingCurrentTab ? (
            <div className="flex justify-center p-16">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div>
              {/* TAB 1: BRICKS */}
              {activeTab === "bricks" && (
                <div>
                  {bricks.length === 0 ? (
                    <div className="border-2 border-dashed border-outline-variant/60 rounded-2xl p-10 text-center bg-surface-container-lowest/50">
                      <Blocks className="w-8 h-8 text-outline mx-auto mb-2 opacity-50" />
                      <h3 className="text-base font-bold text-on-surface">
                        No Bricks Found
                      </h3>
                      <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1">
                        No bricks matched "{activeQuery}". Try searching with
                        related keywords or check the Videos tab.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {bricks.map((brick) => (
                        <div
                          key={brick.brick_id}
                          className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-primary/30 transition-all group"
                        >
                          <div className="space-y-1.5 mb-4">
                            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
                              Target Sentence
                            </span>
                            <h3 className="text-lg font-bold font-display text-primary leading-snug">
                              {brick.target_text}
                            </h3>
                            <p className="text-xs text-on-surface-variant italic pt-1">
                              {brick.native_text}
                            </p>
                          </div>

                          {onNavigateToPractice && (
                            <div className="pt-3 border-t border-outline-variant/30 flex justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  onNavigateToPractice?.(brick.brick_id)
                                }
                                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                              >
                                Practice
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: VIDEOS */}
              {activeTab === "videos" && (
                <div>
                  {videos.length === 0 ? (
                    <div className="border-2 border-dashed border-outline-variant/60 rounded-2xl p-10 text-center bg-surface-container-lowest/50">
                      <Video className="w-8 h-8 text-outline mx-auto mb-2 opacity-50" />
                      <h3 className="text-base font-bold text-on-surface">
                        No Context Videos Found
                      </h3>
                      <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1">
                        No YouTube video clips found for "{activeQuery}". Try a
                        different search phrase.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {videos.map((video, idx) => {
                        const youtubeWatchUrl = `https://www.youtube.com/watch?v=${video.ytb_video_id}&t=${Math.floor(video.start)}s`;
                        const thumbnailUrl = `https://img.youtube.com/vi/${video.ytb_video_id}/mqdefault.jpg`;

                        return (
                          <div
                            key={idx}
                            className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl overflow-hidden shadow-xs hover:border-primary/30 transition-all flex flex-col justify-between"
                          >
                            {/* Video Thumbnail Preview */}
                            <a
                              href={youtubeWatchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative aspect-video w-full bg-black/10 overflow-hidden group block"
                            >
                              <img
                                src={thumbnailUrl}
                                alt="Video context clip"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="p-3 rounded-full bg-primary text-on-primary shadow-lg scale-90 group-hover:scale-100 transition-transform">
                                  <ExternalLink className="w-5 h-5" />
                                </div>
                              </div>
                              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 text-white text-[11px] font-mono font-semibold">
                                {formatTimestamp(video.start)}
                              </span>
                            </a>

                            {/* Transcript Content */}
                            <div className="p-4 flex-1 flex flex-col justify-between">
                              <p className="text-xs sm:text-sm text-on-surface leading-relaxed mb-4">
                                "{video.transcript}"
                              </p>

                              <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30 text-xs">
                                <span className="text-outline text-[11px]">
                                  Clip length: ~{Math.round(video.duration)}s
                                </span>
                                <a
                                  href={youtubeWatchUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
                                >
                                  <span>Watch on YouTube</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
