import { useState, useMemo } from "react";
import { Search, X, Video as VideoIcon, Sparkles } from "lucide-react";
import { type DiscoverVideo } from "@/types";
import { DUMMY_VIDEOS, DISCOVER_CATEGORIES } from "@/data/dummyVideos";
import VideoCard from "@/components/discover/VideoCard";
import VideoPlayerModal from "@/components/discover/VideoPlayerModal";
import SaveToCollectionModal from "@/components/collections/SaveToCollectionModal";
import PlainTextInput from "@/components/common/PlainTextInput";
import { useCollections } from "@/hooks/useCollections";
import { useCreateBrick } from "@/hooks/useBricks";
import { toast } from "sonner";

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeWatchVideo, setActiveWatchVideo] = useState<DiscoverVideo | null>(
    null,
  );
  const [videoToSave, setVideoToSave] = useState<DiscoverVideo | null>(null);

  const { data: collections = [] } = useCollections();
  const createBrick = useCreateBrick();

  // Filter videos based on category and search query
  const filteredVideos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return DUMMY_VIDEOS.filter((v) => {
      // Category filter
      if (selectedCategory !== "All" && v.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (!query) return true;

      const inTranscript = v.transcript.toLowerCase().includes(query);
      const inTranslation = v.translation.toLowerCase().includes(query);
      const inTitle = v.title.toLowerCase().includes(query);
      const inChannel = v.channel.toLowerCase().includes(query);
      const inTags = v.tags.some((t) => t.toLowerCase().includes(query));

      return inTranscript || inTranslation || inTitle || inChannel || inTags;
    });
  }, [searchQuery, selectedCategory]);

  const handleSaveToCollection = (collectionId: string) => {
    if (!videoToSave) return;

    const collection = collections.find((c) => c.id.toString() === collectionId);
    const collectionName = collection?.name || "Collection";

    const formData = new FormData();
    formData.append(
      "json_data",
      JSON.stringify({
        native_text: videoToSave.translation || videoToSave.transcript,
        target_text: videoToSave.transcript,
        target_pron: null,
        context: `From: "${videoToSave.title}" (${videoToSave.channel}) - https://www.youtube.com/watch?v=${videoToSave.ytbVideoId}&t=${Math.floor(videoToSave.start)}s`,
        unit_type: "sentence",
        collection_id: Number(collectionId),
        tags: videoToSave.tags,
      }),
    );
    formData.append("target_audio_file", new Blob());

    createBrick.mutate(formData, {
      onSuccess: () => {
        toast.success(
          `Added "${videoToSave.transcript}" to ${collectionName}!`,
        );
        setVideoToSave(null);
      },
      onError: () => {
        toast.error("Failed to save brick to collection. Please try again.");
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-32 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold font-display text-on-surface">
            Discover Real-World Clips
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Watch short video clips, listen to native phrasing in context, and save
          sentences directly into your brick collections.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
          <PlainTextInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search transcripts, phrases, translations, or topics..."
            className="w-full pl-12 pr-10 py-3 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl focus:ring-2 focus:ring-primary text-sm font-medium transition-all shadow-xs outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer p-1"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {DISCOVER_CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-primary text-on-primary shadow-xs"
                  : "bg-surface-container-lowest border border-outline-variant/60 text-on-surface-variant hover:border-primary/40 hover:text-on-surface"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Video Cards Grid */}
      {filteredVideos.length === 0 ? (
        <div className="border-2 border-dashed border-outline-variant/60 rounded-2xl p-12 text-center bg-surface-container-lowest/50 my-4">
          <VideoIcon className="w-10 h-10 text-outline mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-on-surface mb-1">
            No Video Clips Found
          </h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            {searchQuery
              ? `No clips matched "${searchQuery}". Try a different search term or category.`
              : "No clips found in this category."}
          </p>
          {(searchQuery || selectedCategory !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-4 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onWatch={setActiveWatchVideo}
              onSaveToCollection={setVideoToSave}
            />
          ))}
        </div>
      )}

      {/* Watch Video Modal */}
      <VideoPlayerModal
        video={activeWatchVideo}
        onClose={() => setActiveWatchVideo(null)}
        onSaveToCollection={setVideoToSave}
      />

      {/* Save to Collection Modal */}
      <SaveToCollectionModal
        isOpen={Boolean(videoToSave)}
        brick={
          videoToSave
            ? { nativeText: videoToSave.translation || videoToSave.transcript }
            : null
        }
        collections={collections}
        onSave={handleSaveToCollection}
        onClose={() => setVideoToSave(null)}
      />
    </div>
  );
}
