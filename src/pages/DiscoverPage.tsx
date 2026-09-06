import { useState } from "react";
import { type Snippet } from "@/types";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import SnippetCard from "@/components/discover/SnippetCard";
import SaveToCollectionModal from "@/components/collections/SaveToCollectionModal";
import PlainTextInput from "@/components/common/PlainTextInput";
import { useRandomSnippets } from "@/hooks/useSnippets";
import { useCollections } from "@/hooks/useCollections";
import { toast } from "sonner";

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSaveSnippet, setActiveSaveSnippet] = useState<Snippet | null>(
    null,
  );

  const { data: snippets = [], isLoading, refetch } = useRandomSnippets();
  const { data: collections = [] } = useCollections();

  const filteredSnippets = snippets.filter(
    (s) =>
      s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.translation &&
        s.translation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.context &&
        s.context.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleOpenContributions = (snippet: Snippet) => {
    // SnippetCard handles internal stuff, if we need to open contributions globally,
    // we could do it here, but per instructions, we don't use CommunityContributionsView directly anymore.
    // However, the SnippetCard takes this prop.
    console.log("Open contributions for snippet:", snippet.id);
  };

  const handleSaveToCollection = (collectionId: string) => {
    if (!activeSaveSnippet) return;

    // Actual API call to save would go here

    const collectionName =
      collections.find((c) => c.id.toString() === collectionId)?.name ||
      "Collection";
    toast.success(`Added "${activeSaveSnippet.content}" to ${collectionName}!`);
    setActiveSaveSnippet(null);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-32 animate-in fade-in duration-300">
      {/* Search & Filter Bar */}
      <div className="mb-8 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
          <PlainTextInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search snippets or context..."
            className="w-full pl-12 pr-10 py-3 bg-surface-container-lowest border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary text-sm font-medium transition-all shadow-xs outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-outline cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <button
          type="button"
          className="p-3 bg-primary/10 text-primary rounded-xl active:scale-95 transition-transform shadow-xs cursor-pointer"
          aria-label="Filters"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Feed list */}
      <div className="space-y-5">
        {isLoading ? (
          <div className="flex justify-center py-12 text-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          filteredSnippets.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              onOpenContributions={handleOpenContributions}
              onOpenSaveModal={setActiveSaveSnippet}
            />
          ))
        )}
      </div>

      {!isLoading && snippets.length > 0 && (
        <div className="mt-12 text-center pb-12">
          <button
            type="button"
            onClick={() => refetch()}
            className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold text-sm active:scale-95 transition-all shadow-md cursor-pointer hover:bg-primary-container"
          >
            Load More Snippets
          </button>
        </div>
      )}

      {/* Save to Collection Modal */}
      <SaveToCollectionModal
        isOpen={Boolean(activeSaveSnippet)}
        brick={
          activeSaveSnippet
            ? { nativeText: activeSaveSnippet.content }
            : null
        }
        collections={collections}
        onSave={handleSaveToCollection}
        onClose={() => setActiveSaveSnippet(null)}
      />
    </div>
  );
}
