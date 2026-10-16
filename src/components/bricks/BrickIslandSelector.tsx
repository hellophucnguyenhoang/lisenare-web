import { useState } from "react";
import { Folder, FolderPlus, Pencil, ChevronDown, Check } from "lucide-react";
import {
  useIslands,
  useCreateIsland,
  useUpdateIsland,
} from "@/hooks/useIslands";
import { type Island } from "@/types";
import AddIslandModal from "./AddIslandModal";

interface BrickIslandSelectorProps {
  selectedIslandId: number | null;
  onSelectIsland: (id: number) => void;
}

export default function BrickIslandSelector({
  selectedIslandId,
  onSelectIsland,
}: BrickIslandSelectorProps) {
  const { data: islands = [], isLoading } = useIslands();
  const createIsland = useCreateIsland();
  const updateIsland = useUpdateIsland();

  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIsland, setEditingIsland] = useState<Island | null>(null);

  const selectedIsland = islands.find((c) => c.id === selectedIslandId);

  const handleCreate = (data: {
    name: string;
    description: string;
    tags: string[];
  }) => {
    createIsland.mutate(data, {
      onSuccess: (newCol) => {
        onSelectIsland(newCol.id);
        setShowAddModal(false);
      },
    });
  };

  const handleEdit = (
    id: number,
    data: { name: string; description: string; tags: string[] },
  ) => {
    updateIsland.mutate(
      { islandId: id, data },
      {
        onSuccess: () => {
          setEditingIsland(null);
        },
      },
    );
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
        To island <span className="text-error">*</span>
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
                  ? "Loading islands..."
                  : selectedIsland?.name || "Choose an island"}
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
              {islands.length === 0 ? (
                <div className="p-4 text-center text-xs text-outline">
                  No islands available yet.
                </div>
              ) : (
                islands.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => {
                      onSelectIsland(col.id);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-left text-xs font-medium flex items-center justify-between hover:bg-surface-container transition-colors ${
                      selectedIslandId === col.id
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-on-surface"
                    }`}
                  >
                    <span className="truncate">{col.name}</span>
                    {selectedIslandId === col.id && (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </button>
                ))
              )}

              <div className="h-px bg-outline-variant/30 mx-2" />

              {/* Create new island trigger */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowAddModal(true);
                }}
                className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-primary flex items-center gap-2 hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Create new sland</span>
              </button>
            </div>
          )}
        </div>

        {/* Edit selected island button */}
        {selectedIsland && (
          <button
            type="button"
            onClick={() => setEditingIsland(selectedIsland)}
            className="p-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary transition-all active:scale-95 cursor-pointer shrink-0"
            title="Edit selected island"
            aria-label="Edit selected island"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}

        {/* Create island button */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="p-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary transition-all active:scale-95 cursor-pointer shrink-0"
          title="Create a new island"
          aria-label="Create a new island"
        >
          <FolderPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Add / Edit island Modals */}
      {(showAddModal || editingIsland) && (
        <AddIslandModal
          onClose={() => {
            setShowAddModal(false);
            setEditingIsland(null);
          }}
          onAddIsland={handleCreate}
          onEditIsland={handleEdit}
          islandToEdit={editingIsland || undefined}
        />
      )}
    </div>
  );
}
