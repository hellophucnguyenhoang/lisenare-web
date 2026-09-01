import { useState } from "react";
import { type Brick } from "@/types";
import {
  MoreVertical,
  Edit3,
  Trash2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

interface BrickCardProps {
  brick: Brick;
  onEditBrick: (brickId: number) => void;
  onDeleteBrick: (brickId: number) => void;
  onStudyBrick: (brick: Brick) => void;
}

export default function BrickCard({
  brick,
  onEditBrick,
  onDeleteBrick,
  onStudyBrick,
}: BrickCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="brick-card bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 flex flex-col justify-between shadow-xs relative group hover:border-primary/20 transition-all">
      {/* Header status badge & dropdown options */}
      <div className="flex justify-between items-start mb-4">
        {brick.learned ? (
          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-lg uppercase tracking-wide">
            Learned
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-surface-variant text-on-surface-variant text-[10px] font-bold rounded-lg uppercase tracking-wide">
            New
          </span>
        )}

        {
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="text-outline hover:text-primary transition-all p-1 rounded-full hover:bg-surface-container-low"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-8 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-30 py-1.5 w-36">
                {onEditBrick && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditBrick(brick.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-surface-container flex items-center gap-2 text-on-surface"
                  >
                    <Edit3 className="w-4 h-4 text-outline" />
                    <span>Edit Brick</span>
                  </button>
                )}
                {onDeleteBrick && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm("Are you sure you want to delete this brick?")
                      ) {
                        onDeleteBrick(brick.id);
                      }
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-error/10 flex items-center gap-2 text-error"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Brick</span>
                  </button>
                )}
              </div>
            )}
          </div>
        }
      </div>

      {/* Vocabulary texts */}
      <div className="space-y-1 mb-6">
        <h3 className="text-xl font-bold font-display text-on-surface">
          {brick.targetText}
        </h3>
        <p className="text-sm font-medium text-on-surface-variant italic">
          {brick.nativeText}
        </p>
        {brick.targetPron && (
          <p className="text-xs text-outline font-mono">{brick.targetPron}</p>
        )}
      </div>

      {/* Footer metadata & Call to study */}
      <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
        <div className="flex flex-wrap gap-1">
          {brick.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-[10px] font-medium rounded-md"
            >
              {t}
            </span>
          ))}
        </div>

        {brick.learned ? (
          <CheckCircle2 className="w-5 h-5 text-primary fill-primary-fixed" />
        ) : onStudyBrick ? (
          <button
            onClick={() => onStudyBrick(brick)}
            className="text-primary hover:text-primary-container text-xs font-bold uppercase tracking-wide flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
          >
            <span>Study</span>
            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
