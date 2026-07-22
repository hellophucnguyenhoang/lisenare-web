import { useState } from "react";
import { type Brick, type Collection } from "../types";
import {
  Search,
  SlidersHorizontal,
  Volume2,
  PlusCircle,
  ThumbsUp,
  ThumbsDown,
  Check,
  X,
} from "lucide-react";

interface DiscoverViewProps {
  discoverBricks: Brick[];
  collections: Collection[];
  onAddBrickToCollection: (
    brick: Omit<Brick, "id" | "createdAt">,
    collectionId: string,
  ) => void;
  onIncrementPoints: (pts: number) => void;
}

export default function DiscoverView({
  discoverBricks,
  collections,
  onAddBrickToCollection,
  onIncrementPoints,
}: DiscoverViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [revealedBrickIds, setRevealedBrickIds] = useState<string[]>([]);
  const [upvotedIds, setUpvotedIds] = useState<string[]>([]);
  const [downvotedIds, setDownvotedIds] = useState<string[]>([]);

  // State for choosing collection to save to
  const [activeSaveBrick, setActiveSaveBrick] = useState<Brick | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filter bricks by query
  const filtered = discoverBricks.filter(
    (b) =>
      b.nativeText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.targetText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const toggleReveal = (id: string) => {
    setRevealedBrickIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleUpvote = (id: string) => {
    setUpvotedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      setDownvotedIds((d) => d.filter((x) => x !== id)); // clear downvote
      onIncrementPoints(2);
      return [...prev, id];
    });
  };

  const toggleDownvote = (id: string) => {
    setDownvotedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      setUpvotedIds((u) => u.filter((x) => x !== id)); // clear upvote
      return [...prev, id];
    });
  };

  const playAudio = (brick: Brick) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(brick.targetText);
      utterance.lang = "es-ES";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSaveToCollection = (collectionId: string) => {
    if (!activeSaveBrick) return;

    // Add brick to user list
    onAddBrickToCollection(
      {
        nativeText: activeSaveBrick.nativeText,
        targetText: activeSaveBrick.targetText,
        pronunciation: activeSaveBrick.pronunciation,
        status: "new",
        tags: activeSaveBrick.tags,
        collectionId: collectionId,
      },
      collectionId,
    );

    // Trigger success notification
    const collectionName =
      collections.find((c) => c.id === collectionId)?.name || "Collection";
    setSuccessToast(
      `Added "${activeSaveBrick.nativeText}" to ${collectionName}!`,
    );
    setActiveSaveBrick(null);
    onIncrementPoints(5);

    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-container-padding pt-6 pb-32 animate-in fade-in duration-300">
      {/* Search & Filter Bar */}
      <div className="mb-8 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
          <input
            type="text"
            placeholder="Search bricks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-outline"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <button className="p-3 bg-primary/10 text-primary rounded-xl active:scale-95 transition-transform">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* vertical feed */}
      <div className="space-y-4">
        {filtered.map((brick) => {
          const isRevealed = revealedBrickIds.includes(brick.id);
          const isUpvoted = upvotedIds.includes(brick.id);
          const isDownvoted = downvotedIds.includes(brick.id);

          // Check if this brick corresponds to the Coffee milk latte
          const isCoffeeBrick =
            brick.nativeText.includes("latte") || brick.id === "d3";

          return (
            <div
              key={brick.id}
              className="brick-card bg-surface-container-lowest border border-outline-variant/60 rounded-2xl overflow-hidden shadow-xs hover:border-primary/20 transition-all"
            >
              {/* If coffee, show a beautiful banner image */}
              {isCoffeeBrick && (
                <div
                  className="h-44 bg-cover bg-center"
                  style={{
                    backgroundImage: "/coder_cat.png",
                  }}
                  aria-label="Artisan Coffee Latte"
                ></div>
              )}

              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold font-display text-on-surface">
                      {brick.nativeText}
                    </h2>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">
                      {brick.tags.join(" • ")}
                    </p>
                  </div>

                  {/* TTS sound play trigger */}
                  <button
                    onClick={() => playAudio(brick)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary active:scale-90 transition-transform"
                    aria-label="Play translation audio"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Translation display container */}
                {isRevealed && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="p-4 bg-surface-container rounded-xl border-l-4 border-primary">
                      <p className="text-sm font-bold text-on-surface-variant italic">
                        {brick.targetText}
                      </p>
                      {brick.pronunciation && (
                        <p className="text-xs text-outline font-mono mt-1 select-none">
                          {brick.pronunciation}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Reveal Translate trigger */}
                <button
                  onClick={() => toggleReveal(brick.id)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-secondary-container bg-secondary-container/5 text-secondary font-bold text-xs hover:bg-secondary-container/10 active:scale-99 transition-all cursor-pointer"
                >
                  {isRevealed ? "Hide Translation" : "See Translation"}
                </button>

                {/* Footer metadata & buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30">
                  <div className="flex gap-1">
                    {brick.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-surface-container text-on-surface-variant rounded-lg text-[10px] font-bold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions column */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveSaveBrick(brick)}
                      className="p-1.5 text-primary hover:bg-primary/5 rounded-full active:scale-90 transition-all"
                      title="Add to My Collections"
                    >
                      <PlusCircle className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => toggleUpvote(brick.id)}
                      className={`p-1.5 rounded-full active:scale-90 transition-all ${
                        isUpvoted
                          ? "text-primary bg-primary/10"
                          : "text-outline hover:text-primary hover:bg-primary/5"
                      }`}
                      title="Like"
                    >
                      <ThumbsUp className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => toggleDownvote(brick.id)}
                      className={`p-1.5 rounded-full active:scale-90 transition-all ${
                        isDownvoted
                          ? "text-error bg-error/10"
                          : "text-outline hover:text-error hover:bg-error/5"
                      }`}
                      title="Dislike"
                    >
                      <ThumbsDown className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination button */}
      <div className="mt-12 text-center pb-12">
        <button className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold text-sm active:scale-95 transition-all shadow-md">
          Load More Bricks
        </button>
      </div>

      {/* Save Brick To Collection Modal */}
      {activeSaveBrick && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-300 text-center">
            <h3 className="text-lg font-bold text-primary mb-1 font-display">
              Save to Collection
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Select which collection to save "{activeSaveBrick.nativeText}" to:
            </p>

            <div className="space-y-2 mb-6">
              {collections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => handleSaveToCollection(col.id)}
                  className="w-full text-left px-4 py-3 bg-surface hover:bg-primary/10 hover:text-primary transition-all border border-outline-variant/60 rounded-xl text-sm font-semibold flex items-center justify-between"
                >
                  <span>{col.name}</span>
                  <PlusCircle className="w-4 h-4" />
                </button>
              ))}
            </div>

            <button
              onClick={() => setActiveSaveBrick(null)}
              className="text-xs text-outline font-bold hover:text-on-surface"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Success alert toast */}
      {successToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-6 duration-300 z-50">
          <Check className="w-5 h-5 text-primary-fixed" />
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}
    </div>
  );
}
