import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useCreateBrick, useCheckBrickExists } from "@/hooks/useBricks";
import { useCollections } from "@/hooks/useCollections";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { playShortAudio } from "@/utils/audio";
import { type TargetLang } from "@/types";
import { toast } from "sonner";
import BrickTextInputs from "@/components/collections/BrickTextInputs";
import BrickAudioSection from "@/components/collections/BrickAudioSection";
import BrickTagsSection from "@/components/collections/BrickTagsSection";
import BrickCollectionSelector from "@/components/collections/BrickCollectionSelector";

interface AddBrickPageProps {
  collectionId?: number;
  onBack: () => void;
}

export default function AddBrickPage({
  collectionId: initialCollectionId,
  onBack,
}: AddBrickPageProps) {
  const { data: collections = [] } = useCollections();
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    number | null
  >(initialCollectionId ?? null);

  const effectiveCollectionId =
    selectedCollectionId ??
    (collections.length > 0
      ? (initialCollectionId ?? collections[0].id)
      : null);

  const [nativeText, setNativeText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [targetLang, setTargetLang] = useState<TargetLang>("en");
  const [pronunciation, setPronunciation] = useState("");
  const [context, setContext] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const createBrick = useCreateBrick();
  const checkExists = useCheckBrickExists(targetText);
  const textToSpeechMutation = useTextToSpeech();

  const isTargetExists = checkExists.data === true;
  const isCheckingTargetExists = checkExists.isFetching;

  const handleAutoGenerateAudio = async () => {
    if (!targetText.trim()) {
      toast.error("Please enter a target sentence first.");
      return;
    }

    if (targetText.trim().length > 200) {
      toast.error(
        "Target text must be 200 characters or fewer for auto-generation.",
      );
      return;
    }

    try {
      const { blob } = await textToSpeechMutation.mutateAsync({
        text: targetText.trim(),
        targetLang,
      });
      setAudioBlob(blob);
      const audioUrl = URL.createObjectURL(blob);
      playShortAudio(audioUrl);
      toast.success("Audio generated successfully!");
    } catch (err: unknown) {
      console.error("Failed to generate audio:", err);
      toast.error("Failed to generate audio. Please try again.");
    }
  };

  const handleSave = () => {
    if (!effectiveCollectionId) {
      toast.error("Please choose or create a collection for this brick.");
      return;
    }

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
        target_lang: targetLang,
        target_pron: pronunciation.trim() || null,
        context: context.trim() || null,
        unit_type: "sentence",
        is_private: true,
        collection_id: effectiveCollectionId,
        tags,
      }),
    );
    formData.append("target_audio_file", audioBlob || new Blob(), "audio.wav");

    createBrick.mutate(formData, {
      onSuccess: () => {
        toast.success("Brick created successfully!");
        setNativeText("");
        setTargetText("");
        setTargetLang("en");
        setPronunciation("");
        setContext("");
        setTags([]);
        setAudioBlob(null);
      },
    });
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 pt-6 pb-32 animate-in fade-in duration-300">
      {/* Top Bar Navigation */}
      <header className="flex items-center justify-between h-16 w-full max-w-lg mx-auto mb-6">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-surface-container transition-all active:scale-95 cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-primary" />
        </button>
        <h1 className="text-xl font-bold font-display text-primary">
          Add New Brick
        </h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-lg mx-auto space-y-6">
        {/* Collection Selector: choose, create, or edit collection */}
        <BrickCollectionSelector
          selectedCollectionId={effectiveCollectionId}
          onSelectCollection={setSelectedCollectionId}
        />

        {/* Languages inputs */}
        <BrickTextInputs
          nativeText={nativeText}
          onNativeTextChange={setNativeText}
          targetText={targetText}
          onTargetTextChange={setTargetText}
          targetLang={targetLang}
          onTargetLangChange={setTargetLang}
          pronunciation={pronunciation}
          onPronunciationChange={setPronunciation}
          context={context}
          onContextChange={setContext}
          targetExists={isTargetExists}
          isCheckingTargetExists={isCheckingTargetExists}
          onGenerateAudio={handleAutoGenerateAudio}
          isGeneratingAudio={textToSpeechMutation.isPending}
        />

        {/* Pronunciation Recording / Preview section */}
        <BrickAudioSection
          audioBlob={audioBlob}
          onAudioChange={setAudioBlob}
        />

        {/* Tags Section */}
        <BrickTagsSection tags={tags} onChange={setTags} />

        <div className="h-10"></div>
      </main>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-outline-variant/30 safe-bottom z-40 p-4">
        <div className="max-w-lg mx-auto flex flex-col">
          <button
            onClick={handleSave}
            disabled={createBrick.isPending}
            className="w-full h-14 bg-primary text-on-primary rounded-xl font-bold text-sm shadow-md shadow-primary/10 hover:shadow-lg active:scale-99 transition-all flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {createBrick.isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Brick...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Brick</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
