import { useState } from "react";
import { type Brick } from "@/types";
import { MoreVertical, Edit3, Trash2, CheckCircle2 } from "lucide-react";

interface BrickCardProps {
  brick: Brick;
  onEditBrick: (brick: Brick) => void;
  onDeleteBrick: (brickId: number) => void;
  onSelectBrick?: (brick: Brick) => void;
  onStudyBrick?: (brick: Brick) => void;
  onSelectTag?: (tag: string) => void;
}

export default function BrickCard({
  brick,
  onEditBrick,
  onDeleteBrick,
  onSelectBrick,
  onStudyBrick,
  onSelectTag,
}: BrickCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCardClick = () => {
    if (onSelectBrick) {
      onSelectBrick(brick);
    } else if (onStudyBrick) {
      onStudyBrick(brick);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="brick-card bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 flex flex-col justify-between shadow-xs relative group hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
    >
      {/* Header options */}
      <div className="flex justify-end items-start mb-2">
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="text-outline hover:text-primary transition-all p-1 rounded-full hover:bg-surface-container-low cursor-pointer"
            aria-label="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-8 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-30 py-1.5 w-36">
              {onEditBrick && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditBrick(brick);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-surface-container flex items-center gap-2 text-on-surface cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-outline" />
                  <span>Edit Brick</span>
                </button>
              )}
              {onDeleteBrick && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      confirm("Are you sure you want to delete this brick?")
                    ) {
                      onDeleteBrick(brick.id);
                    }
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-error/10 flex items-center gap-2 text-error cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Brick</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Vocabulary texts */}
      <div className="space-y-1 mb-6">
        <h3 className="text-xl font-bold font-display text-on-surface">
          {brick.targetText}
        </h3>
        <p className="text-sm font-medium text-on-surface-variant italic">
          {brick.nativeText}
        </p>
        {brick.context && (
          <p className="text-xs text-outline line-clamp-2 leading-relaxed">
            {brick.context}
          </p>
        )}
      </div>

      {/* Footer metadata & learned indicator */}
      <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30 min-h-10.5">
        <div className="flex flex-wrap gap-1">
          {brick.tags.slice(0, 3).map((t) => (
            <button
              key={t}
              type="button"
              onClick={(e) => {
                if (onSelectTag) {
                  e.stopPropagation();
                  onSelectTag(t);
                }
              }}
              className={`px-2 py-0.5 text-[10px] font-medium rounded-md transition-colors ${
                onSelectTag
                  ? "bg-surface-container hover:bg-surface-container-high text-on-surface-variant cursor-pointer active:scale-95"
                  : "bg-surface-container text-on-surface-variant cursor-default"
              }`}
              title={
                onSelectTag ? `Filter by #${t.replace(/^#/, "")}` : undefined
              }
            >
              #{t.replace(/^#/, "")}
            </button>
          ))}
        </div>

        {brick.learned && (
          <span
            className="text-primary flex items-center shrink-0 ml-2"
            title="Learned"
          >
            <CheckCircle2 className="w-5 h-5 fill-primary-fixed" />
          </span>
        )}
      </div>
    </div>
  );
}
