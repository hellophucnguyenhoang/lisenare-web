import { useState } from "react";
import { Folder, FolderPlus, Pencil, ChevronDown, Check } from "lucide-react";
import {
  useCollections,
  useCreateCollection,
  useUpdateCollection,
} from "@/hooks/useCollections";
import { type Collection } from "@/types";
import AddCollectionModal from "./AddCollectionModal";

interface BrickCollectionSelectorProps {
  selectedCollectionId: number | null;
  onSelectCollection: (id: number) => void;
}

export default function BrickCollectionSelector({
  selectedCollectionId,
  onSelectCollection,
}: BrickCollectionSelectorProps) {
  const { data: collections = [], isLoading } = useCollections();
  const createCollection = useCreateCollection();
  const updateCollection = useUpdateCollection();

  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null,
  );

  const selectedCollection = collections.find(
    (c) => c.id === selectedCollectionId,
  );

  const handleCreate = (data: {
    name: string;
    description: string;
    tags: string[];
  }) => {
    createCollection.mutate(data, {
      onSuccess: (newCol) => {
        onSelectCollection(newCol.id);
        setShowAddModal(false);
      },
    });
  };

  const handleEdit = (
    id: number,
    data: { name: string; description: string; tags: string[] },
  ) => {
    updateCollection.mutate(
      { collectionId: id, data },
      {
        onSuccess: () => {
          setEditingCollection(null);
        },
      },
    );
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
        To Collection <span className="text-error">*</span>
      </label>

      <div className="flex items-center gap-2">
        {/* Dropdown container */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-3.5 py-2.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/60 rounded-xl flex items-center justify-between text-sm font-medium transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Folder className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate text-on-surface">
                {isLoading
                  ? "Loading collections..."
                  : selectedCollection?.name || "Choose a collection"}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-outline shrink-0 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isOpen && (
            <div className="absolute left-0 top-full mt-1.5 z-50 w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-xl max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
              {collections.length === 0 ? (
                <div className="p-4 text-center text-xs text-outline">
                  No collections available yet.
                </div>
              ) : (
                collections.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => {
                      onSelectCollection(col.id);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-left text-xs font-medium flex items-center justify-between hover:bg-surface-container transition-colors ${
                      selectedCollectionId === col.id
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-on-surface"
                    }`}
                  >
                    <span className="truncate">{col.name}</span>
                    {selectedCollectionId === col.id && (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </button>
                ))
              )}

              <div className="h-px bg-outline-variant/30 mx-2" />

              {/* Create new collection trigger */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowAddModal(true);
                }}
                className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-primary flex items-center gap-2 hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Create New Collection</span>
              </button>
            </div>
          )}
        </div>

        {/* Edit selected collection button */}
        {selectedCollection && (
          <button
            type="button"
            onClick={() => setEditingCollection(selectedCollection)}
            className="p-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary transition-all active:scale-95 cursor-pointer shrink-0"
            title="Edit selected collection"
            aria-label="Edit selected collection"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}

        {/* Create collection button */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="p-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary transition-all active:scale-95 cursor-pointer shrink-0"
          title="Create a new collection"
          aria-label="Create a new collection"
        >
          <FolderPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Add / Edit Collection Modals */}
      {(showAddModal || editingCollection) && (
        <AddCollectionModal
          onClose={() => {
            setShowAddModal(false);
            setEditingCollection(null);
          }}
          onAddCollection={handleCreate}
          onEditCollection={handleEdit}
          collectionToEdit={editingCollection || undefined}
        />
      )}
    </div>
  );
}
