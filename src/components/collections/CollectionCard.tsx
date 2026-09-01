import { useState, useRef, useEffect } from "react";
import { type Collection } from "@/types";
import { Trash2, MoreVertical, Pencil, Book } from "lucide-react";

interface CollectionCardProps {
  collection: Collection;
  onSelectCollection: (id: number) => void;
  onDeleteCollection: (id: number) => void;
  onEditCollection: (collection: Collection) => void;
}

export default function CollectionCard({
  collection,
  onSelectCollection,
  onDeleteCollection,
  onEditCollection,
}: CollectionCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const brickCount = collection.brickCount ?? 0;
  const learnedCount = collection.learnedCount ?? 0;
  const progressPercent =
    brickCount > 0 ? Math.round((learnedCount / brickCount) * 100) : 0;

  return (
    <div
      onClick={() => onSelectCollection(collection.id)}
      className="brick-card bg-surface-container-lowest border
      border-outline-variant/60 rounded-xl p-6 flex flex-col 
      justify-between min-h-55 cursor-pointer hover:border-primary/30 
      relative transition-all shadow-xs hover:shadow-md"
    >
      {/* Top Row with icon, brick count badge, and 3-dots action menu */}
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Book className="w-6 h-6 text-primary" />
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold px-2.5 py-1
            bg-surface-container rounded-lg
            text-on-surface-variant"
            >
              {brickCount} Bricks
            </span>

            {/* 3-Dots Dropdown Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1.5 rounded-lg text-outline
                hover:text-on-surface hover:bg-surface-container transition-all"
                aria-label="Collection options"
                title="More actions"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-8 z-20 w-44 bg-surface-container-lowest
                  border border-outline-variant/60 rounded-xl shadow-lg p-1 animate-in
                  fade-in zoom-in-95 duration-150"
                >
                  {onEditCollection && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEditCollection(collection);
                      }}
                      className="w-full px-3 py-2 text-xs font-bold
                      text-on-surface flex items-center gap-2.5 
                      rounded-lg hover:bg-surface-container transition-all"
                    >
                      <Pencil className="w-4 h-4 text-primary" />
                      <span>Edit Collection</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      if (
                        confirm(
                          `Are you sure you want to delete "${collection.name}"? All bricks inside will be deleted.`,
                        )
                      ) {
                        onDeleteCollection(collection.id);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs font-bold text-error 
                    flex items-center gap-2.5 rounded-lg hover:bg-error/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-error" />
                    <span>Delete Collection</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold font-display text-on-surface">
          {collection.name}
        </h3>

        {/* Optional Description */}
        {collection.description && (
          <p
            className="text-xs text-on-surface-variant line-clamp-2 
          mt-1.5 leading-relaxed font-normal"
          >
            {collection.description}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {collection.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-surface-container text-on-surface-variant 
              text-[10px] font-semibold rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between mt-4 pt-2 border-t border-outline-variant/20">
        <div className="h-1.5 flex-1 bg-surface-container rounded-full overflow-hidden mr-4">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <span className="text-xs font-bold text-primary">
          {progressPercent}%
        </span>
      </div>
    </div>
  );
}
