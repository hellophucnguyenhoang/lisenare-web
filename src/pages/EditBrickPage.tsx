import { useState } from "react";
import { type Brick } from "@/types";
import { ArrowLeft, Trash2, Check } from "lucide-react";
import { useUpdateBrick, useDeleteBrick } from "@/hooks/useBricks";
import { toast } from "sonner";
import BrickTextInputs from "@/components/collections/BrickTextInputs";
import BrickAudioSection from "@/components/collections/BrickAudioSection";
import BrickTagsSection from "@/components/collections/BrickTagsSection";

interface EditBrickPageProps {
  brick: Brick;
  onBack: () => void;
}

export default function EditBrickPage({ brick, onBack }: EditBrickPageProps) {
  const [nativeText, setNativeText] = useState(brick.nativeText);
  const [targetText, setTargetText] = useState(brick.targetText);
  const [pronunciation, setPronunciation] = useState(brick.targetPron || "");
  const [tags, setTags] = useState<string[]>(brick.tags || []);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const updateBrick = useUpdateBrick();
  const deleteBrick = useDeleteBrick();

  const handleSave = () => {
    if (!nativeText.trim() || !targetText.trim()) {
      alert("Please fill out both native and target text fields.");
      return;
    }

    const formData = new FormData();
    formData.append(
      "json_data",
      JSON.stringify({
        native_text: nativeText.trim(),
        target_text: targetText.trim(),
        target_pron: pronunciation.trim() || null,
        unit_type: brick.unitType || "sentence",
        collection_id: brick.collectionId,
        is_private: brick.isPrivate ?? true,
        tags,
      }),
    );

    if (audioBlob) {
      formData.append("target_audio_file", audioBlob);
    }

    updateBrick.mutate(
      { brickId: brick.id, formData },
      {
        onSuccess: () => {
          toast.success("Brick updated successfully!");
          setAudioBlob(null);
        },
      },
    );
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this brick?")) {
      deleteBrick.mutate(brick.id, { onSuccess: () => onBack() });
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 pt-6 pb-32 animate-in fade-in duration-300">
      {/* Top Header App Bar */}
      <header className="sticky top-0 z-10 bg-surface/90 backdrop-blur-xs flex justify-between items-center w-full max-w-lg mx-auto h-16 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-surface-container transition-all active:scale-95 cursor-pointer"
            aria-label="Back to brick detail"
          >
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="text-xl font-bold font-display text-primary">
            Edit Brick
          </h1>
        </div>

        <button
          onClick={handleSave}
          disabled={updateBrick.isPending}
          className="px-6 py-2 bg-primary hover:bg-primary/95 text-on-primary rounded-full text-xs font-bold active:scale-95 transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {updateBrick.isPending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Check className="w-4 h-4" />
          )}
          <span>Save</span>
        </button>
      </header>

      <main className="max-w-lg mx-auto space-y-6">
        {/* Core text inputs */}
        <BrickTextInputs
          nativeText={nativeText}
          onNativeTextChange={setNativeText}
          targetText={targetText}
          onTargetTextChange={setTargetText}
          pronunciation={pronunciation}
          onPronunciationChange={setPronunciation}
        />

        {/* Pronunciation audio section */}
        <BrickAudioSection
          audioBlob={audioBlob}
          onAudioChange={setAudioBlob}
          existingAudioPath={brick.targetAudioPath}
        />

        {/* Tags Section */}
        <BrickTagsSection tags={tags} onChange={setTags} />

        {/* Delete Action button block */}
        <section className="pt-6 pb-12 text-center space-y-3">
          <button
            type="button"
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 py-4 text-error font-bold text-sm border border-error/20 bg-error/5 hover:bg-error/10 rounded-2xl transition-all active:scale-99 shadow-xs cursor-pointer"
          >
            <Trash2 className="w-5 h-5" />
            <span>Delete Brick</span>
          </button>
          <p className="text-center text-[10px] text-outline font-medium">
            This action cannot be undone. All progress for this brick will be
            lost.
          </p>
        </section>
      </main>
    </div>
  );
}
