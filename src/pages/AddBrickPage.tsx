import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Save, HelpCircle } from "lucide-react";
import { useCreateBrick, useCheckBrickExists } from "@/hooks/useBricks";
import { useIslands } from "@/hooks/useIslands";
import { useLearnerMe } from "@/hooks/useLearner";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { playShortAudio, resolveAudioUrl } from "@/utils/audio";
import { type TargetLang, type BrickInitialData } from "@/types";
import { toast } from "sonner";
import BrickTextInputs from "@/components/bricks/BrickTextInputs";
import BrickAudioSection from "@/components/bricks/BrickAudioSection";
import BrickUnitTypeSelector, {
  type UnitType,
} from "@/components/bricks/BrickUnitTypeSelector";
import BrickTagsSection from "@/components/bricks/BrickTagsSection";
import BrickIslandSelector from "@/components/bricks/BrickIslandSelector";
import BrickPrivacyToggle from "@/components/bricks/BrickPrivacyToggle";
import RetrievalInstructionsPage from "@/components/retrieval/RetrievalInstructionsPage";

interface AddBrickPageProps {
  islandId?: number;
  initialData?: BrickInitialData | null;
  onBack: () => void;
  onSuccess?: () => void;
}

export default function AddBrickPage({
  islandId: initialIslandId,
  initialData,
  onBack,
  onSuccess,
}: AddBrickPageProps) {
  const { data: learner } = useLearnerMe();
  const learnerLang = (learner?.retrieval_lang || learner?.retrievalLang) as
    | string
    | undefined;
  const preferredLang: TargetLang =
    learnerLang === "ja" || learnerLang === "vi" || learnerLang === "en"
      ? learnerLang
      : "en";

  const { data: islands = [] } = useIslands();
  const [selectedIslandId, setSelectedIslandId] = useState<number | null>(
    initialData?.islandId ?? initialIslandId ?? null,
  );

  const effectiveIslandId =
    selectedIslandId ??
    (islands.length > 0
      ? (initialData?.islandId ?? initialIslandId ?? islands[0].id)
      : null);

  const [showInstructions, setShowInstructions] = useState(false);
  const [nativeText, setNativeText] = useState(initialData?.nativeText ?? "");
  const [targetText, setTargetText] = useState(initialData?.targetText ?? "");
  const [targetLang, setTargetLang] = useState<TargetLang>(() => {
    if (
      initialData?.targetLang === "en" ||
      initialData?.targetLang === "ja" ||
      initialData?.targetLang === "vi"
    ) {
      return initialData.targetLang as TargetLang;
    }
    return preferredLang;
  });
  const userChangedLangRef = useRef(Boolean(initialData?.targetLang));

  useEffect(() => {
    if (learnerLang && !userChangedLangRef.current) {
      if (
        learnerLang === "ja" ||
        learnerLang === "vi" ||
        learnerLang === "en"
      ) {
        setTargetLang(learnerLang);
      }
    }
  }, [learnerLang]);

  const handleTargetLangChange = (newLang: TargetLang) => {
    userChangedLangRef.current = true;
    setTargetLang(newLang);
  };

  const [pronunciation, setPronunciation] = useState(
    initialData?.pronunciation ?? "",
  );
  const [context, setContext] = useState(initialData?.context ?? "");
  const [kind, setUnitType] = useState<UnitType>(
    initialData?.kind === "word" ? "word" : "sentence",
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [isPrivate, setIsPrivate] = useState(true);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(
    initialData?.audioBlob ?? null,
  );

  // Preload audio from existing brick if audioUrl is provided
  useEffect(() => {
    if (!initialData) return;
    if (initialData.audioBlob) {
      setAudioBlob(initialData.audioBlob);
    } else if (initialData.audioUrl) {
      const url = resolveAudioUrl(initialData.audioUrl);
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch initial audio");
          return res.blob();
        })
        .then((blob) => {
          setAudioBlob(blob);
        })
        .catch((err) => {
          console.warn("Could not preload audio blob from brick:", err);
        });
    }
  }, [initialData]);

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

  const isFormValid = Boolean(
    nativeText.trim() && targetText.trim() && effectiveIslandId && audioBlob,
  );

  const handleSave = () => {
    if (!effectiveIslandId) {
      toast.error("Please choose or create an island for this brick.");
      return;
    }

    if (!nativeText.trim() || !targetText.trim()) {
      toast.error("Please fill out both native and target text fields.");
      return;
    }

    if (!audioBlob) {
      toast.error("Please record, generate, or upload audio for this brick.");
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
        kind: kind,
        is_private: isPrivate,
        island_id: effectiveIslandId,
        tags,
      }),
    );
    formData.append("target_audio_file", audioBlob, "audio.wav");

    createBrick.mutate(formData, {
      onSuccess: () => {
        toast.success(
          initialData
            ? "Brick added to your island!"
            : "Brick created successfully!",
        );
        onSuccess?.();
        if (initialData) {
          onBack();
        } else {
          setNativeText("");
          setTargetText("");
          setPronunciation("");
          setContext("");
          setUnitType("sentence");
          setTags([]);
          setIsPrivate(true);
          setAudioBlob(null);
        }
      },
    });
  };

  if (showInstructions) {
    return (
      <RetrievalInstructionsPage
        onBack={() => setShowInstructions(false)}
        backButtonLabel="Back to add brick"
      />
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 pt-6 pb-32 animate-in fade-in duration-300">
      {/* Top bar navigation */}
      <header className="flex items-center justify-between h-16 w-full max-w-lg mx-auto mb-6">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-surface-container transition-all active:scale-95 cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-primary" />
        </button>
        <h1 className="text-xl font-bold font-display text-primary">
          {initialData ? "Add brick to your island" : "Add new brick"}
        </h1>
        <button
          type="button"
          onClick={() => setShowInstructions(true)}
          className="p-2 -mr-2 rounded-full hover:bg-surface-container text-outline hover:text-primary transition-all active:scale-95 cursor-pointer"
          aria-label="5 steps to retrieval"
          title="5 steps to retrieval"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      </header>

      <main className="max-w-lg mx-auto space-y-6">
        {/* Island selector: choose, create, or edit island */}
        <BrickIslandSelector
          selectedIslandId={effectiveIslandId}
          onSelectIsland={setSelectedIslandId}
        />

        {/* Languages inputs */}
        <BrickTextInputs
          nativeText={nativeText}
          onNativeTextChange={setNativeText}
          targetText={targetText}
          onTargetTextChange={setTargetText}
          targetLang={targetLang}
          onTargetLangChange={handleTargetLangChange}
          pronunciation={pronunciation}
          onPronunciationChange={setPronunciation}
          context={context}
          onContextChange={setContext}
          targetExists={isTargetExists}
          isCheckingTargetExists={isCheckingTargetExists}
          onGenerateAudio={handleAutoGenerateAudio}
          isGeneratingAudio={textToSpeechMutation.isPending}
        />

        {/* Pronunciation recording / Preview section */}
        <BrickAudioSection
          audioBlob={audioBlob}
          onAudioChange={setAudioBlob}
          existingAudioPath={initialData?.audioUrl}
        />

        {/* Kind section: Word or Sentence */}
        <BrickUnitTypeSelector kind={kind} onChange={setUnitType} />

        {/* Privacy section */}
        <BrickPrivacyToggle isPrivate={isPrivate} onChange={setIsPrivate} />

        {/* Tags section */}
        <BrickTagsSection tags={tags} onChange={setTags} />

        <div className="h-10"></div>
      </main>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-outline-variant/30 safe-bottom z-40 p-4">
        <div className="max-w-lg mx-auto flex flex-col">
          <button
            onClick={handleSave}
            disabled={!isFormValid || createBrick.isPending}
            className="w-full h-14 bg-primary text-on-primary rounded-xl font-bold text-sm shadow-md shadow-primary/10 hover:shadow-lg active:scale-99 transition-all flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none cursor-pointer"
          >
            {createBrick.isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving brick...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>
                  {initialData ? "Save to your island" : "Save brick"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
