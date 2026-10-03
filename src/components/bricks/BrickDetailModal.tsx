import { useState } from "react";
import { useBrickDetail, useCheckBrickExists } from "@/hooks/useBricks";
import { getBrickAudioUrl } from "@/api/bricks";
import { playShortAudio, stopShortAudio } from "@/utils/audio";
import { type Brick, type AuthMode } from "@/types";
import {
  X,
  Volume2,
  Folder,
  FolderPlus,
  Tag,
  Play,
  Plus,
  Check,
  Edit3,
  User,
  UserCheck,
  FileText,
  Languages,
} from "lucide-react";
import { toast } from "sonner";

interface BrickDetailModalProps {
  isOpen: boolean;
  brickId: number | null;
  onClose: () => void;
  onPractice?: (brickId: number) => void;
  onEdit?: (brick: Brick) => void;
  onAddToCollection?: (brick: {
    brick_id: number;
    target_text: string;
    native_text: string;
  }) => void;
  onAddCollection?: (collection: {
    collection_id: number;
    collection_name: string;
  }) => void;
  isLoggedIn?: boolean;
  currentLearnerId?: number;
  onOpenAuth?: (mode: AuthMode) => void;
}

export default function BrickDetailModal({
  isOpen,
  brickId,
  onClose,
  onPractice,
  onEdit,
  onAddToCollection,
  onAddCollection,
  isLoggedIn = false,
  currentLearnerId,
  onOpenAuth,
}: BrickDetailModalProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const {
    data: detail,
    isLoading: isLoadingDetail,
    isError,
    error,
  } = useBrickDetail(brickId, isOpen && Boolean(brickId) && isLoggedIn);

  const isOwner = detail
    ? currentLearnerId !== undefined && detail.creatorId === currentLearnerId
    : false;

  // Check if brick exists in learner's library using bricks/exists
  const { data: alreadyExists, isLoading: isCheckingExists } =
    useCheckBrickExists(
      detail?.targetText || "",
      isOpen && Boolean(detail?.targetText) && isLoggedIn && !isOwner,
      0,
    );

  const handleClose = () => {
    stopShortAudio();
    setIsPlayingAudio(false);
    onClose();
  };

  if (!isOpen || !brickId) return null;

  const handlePlayAudio = async () => {
    if (!brickId || isLoadingAudio) return;
    setIsLoadingAudio(true);
    try {
      const audioUrl = await getBrickAudioUrl(brickId);
      if (!audioUrl) {
        toast.error("Audio is not available for this brick.");
        return;
      }
      setIsPlayingAudio(true);
      playShortAudio(audioUrl, undefined, () => setIsPlayingAudio(false));
    } catch {
      setIsPlayingAudio(false);
      toast.error("Audio is not available for this brick.");
    } finally {
      setIsLoadingAudio(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Card */}
      <div className="relative bg-surface-container-lowest border border-outline-variant/80 rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-2xl animate-in zoom-in duration-200 z-10 max-h-[90vh] overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-outline-variant/40">
          <div>
            {!isLoggedIn ? (
              <span className="text-xs font-semibold text-outline">
                Brick Detail
              </span>
            ) : detail ? (
              isOwner ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Your Brick</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-container text-on-surface-variant">
                  <User className="w-3.5 h-3.5 text-outline" />
                  <span>
                    Created by{" "}
                    <strong className="text-on-surface font-bold">
                      {detail.creator?.name || "Community"}
                    </strong>
                  </span>
                </span>
              )
            ) : (
              <span className="text-xs font-semibold text-outline">
                Brick Detail
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-outline hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unauthenticated View */}
        {!isLoggedIn ? (
          <div className="py-10 text-center space-y-3">
            <User className="w-10 h-10 text-outline mx-auto opacity-50" />
            <h3 className="text-base font-bold text-on-surface">
              Sign In Required
            </h3>
            <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
              Please sign in to view the complete details and creator
              information of this brick.
            </p>
            <button
              type="button"
              onClick={() => {
                handleClose();
                onOpenAuth?.("login");
              }}
              className="mt-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              Sign In
            </button>
          </div>
        ) : isLoadingDetail ? (
          /* Loading State */
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-on-surface-variant font-medium">
              Loading brick details...
            </span>
          </div>
        ) : isError || !detail ? (
          /* Error State */
          <div className="py-10 text-center space-y-3">
            <p className="text-sm font-semibold text-error">
              {error instanceof Error
                ? error.message
                : "Failed to load brick details."}
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-bold bg-surface-container hover:bg-surface-container-high rounded-xl text-on-surface transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          /* Loaded Detail Content */
          <div className="space-y-6 pt-5">
            {/* Target sentence with Audio button below text */}
            <div className="bg-surface-container/30 border border-outline-variant/40 rounded-2xl p-5 space-y-3">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                  Target Sentence
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-primary leading-snug">
                  {detail.targetText}
                </h2>
                {detail.targetPron && (
                  <p className="text-xs font-mono text-on-surface-variant pt-0.5">
                    /{detail.targetPron}/
                  </p>
                )}
              </div>

              <div>
                <button
                  type="button"
                  id="btn-play-detail-audio"
                  onClick={handlePlayAudio}
                  disabled={isLoadingAudio}
                  className="px-3.5 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    isLoadingAudio ? "Loading audio..." : "Play pronunciation"
                  }
                  aria-label="Play pronunciation"
                >
                  {isLoadingAudio ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Volume2
                      className={`w-4 h-4 ${isPlayingAudio ? "animate-pulse text-primary" : ""}`}
                    />
                  )}
                  <span>
                    {isLoadingAudio
                      ? "Loading audio..."
                      : isPlayingAudio
                        ? "Playing..."
                        : "Listen"}
                  </span>
                </button>
              </div>
            </div>

            {/* Native Sentence */}
            <div>
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">
                Native Sentence
              </span>
              <p className="text-base font-semibold text-on-surface">
                {detail.nativeText}
              </p>
            </div>

            {/* Context */}
            {detail.context && (
              <div className="p-3.5 bg-surface-container/40 rounded-xl border border-outline-variant/40 space-y-1">
                <div className="flex items-center gap-1.5 text-outline">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Context
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {detail.context}
                </p>
              </div>
            )}

            {/* Collection Info Box with "Add this collection" button */}
            {detail.collectionName && (
              <div className="p-4 bg-surface-container/30 border border-outline-variant/60 rounded-2xl space-y-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Folder className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-outline block">
                      Collection
                    </span>
                    <span className="text-sm font-bold text-on-surface truncate block">
                      {detail.collectionName}
                    </span>
                  </div>
                </div>

                {!isOwner && detail.collectionId && onAddCollection && (
                  <button
                    type="button"
                    id="btn-detail-add-this-collection"
                    onClick={() => {
                      onAddCollection({
                        collection_id: detail.collectionId,
                        collection_name: detail.collectionName,
                      });
                    }}
                    className="w-full py-2.5 px-3 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    title={`Add "${detail.collectionName}" to your collection`}
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>Add this Collection</span>
                  </button>
                )}
              </div>
            )}

            {/* Metadata Badges (Language, Tags) */}
            <div className="space-y-2 pt-2 border-t border-outline-variant/30">
              <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
                {detail.targetLang && (
                  <div className="flex items-center gap-1 font-medium">
                    <Languages className="w-3.5 h-3.5 text-outline" />
                    <span className="uppercase text-[11px] font-bold px-1.5 py-0.5 rounded bg-surface-container">
                      {detail.targetLang}
                    </span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {detail.tags && detail.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <Tag className="w-3 h-3 text-outline mr-0.5" />
                  {detail.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-surface-container hover:bg-surface-container-high rounded-md text-[11px] text-on-surface-variant font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons Footer */}
            <div className="pt-4 border-t border-outline-variant/40">
              {isOwner ? (
                <div className="flex items-center justify-between gap-3">
                  {onPractice && (
                    <button
                      type="button"
                      id="btn-detail-practice"
                      onClick={() => {
                        handleClose();
                        onPractice(detail.id);
                      }}
                      className="flex-1 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xs cursor-pointer"
                    >
                      <Play className="w-4 h-4 text-on-primary" />
                      <span>Practice</span>
                    </button>
                  )}
                  {onEdit && (
                    <button
                      type="button"
                      id="btn-detail-edit"
                      onClick={() => {
                        handleClose();
                        onEdit(detail);
                      }}
                      className="flex-1 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/60 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4 text-primary" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
              ) : isCheckingExists ? (
                <div className="w-full py-2.5 px-4 text-xs text-on-surface-variant font-medium flex items-center justify-center gap-2 bg-surface-container/30 rounded-xl">
                  <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Checking library...</span>
                </div>
              ) : alreadyExists ? (
                <div className="w-full py-2.5 px-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-xl flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>In your collection</span>
                </div>
              ) : (
                <button
                  type="button"
                  id="btn-detail-add-this-brick"
                  onClick={() => {
                    onAddToCollection?.({
                      brick_id: detail.id,
                      target_text: detail.targetText,
                      native_text: detail.nativeText,
                    });
                  }}
                  className="w-full py-3 px-4 bg-primary hover:bg-primary/95 text-on-primary font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add this brick</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
