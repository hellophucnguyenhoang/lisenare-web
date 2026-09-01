import { useState } from "react";
import { type Brick } from "@/types";
import {
  ArrowLeft,
  Trash2,
  Volume2,
  VolumeX,
  Mic,
  Upload,
  Plus,
  X,
  Check,
} from "lucide-react";
import { useUpdateBrick, useDeleteBrick } from "@/hooks/useBricks";

interface EditBrickPageProps {
  brick: Brick;
  onBack: () => void;
}

export default function EditBrickPage({ brick, onBack }: EditBrickPageProps) {
  const [nativeText, setNativeText] = useState(brick.nativeText);
  const [targetText, setTargetText] = useState(brick.targetText);
  const [pronunciation, setPronunciation] = useState(brick.targetPron || "");
  const [tags, setTags] = useState<string[]>(brick.tags);
  const [customTagInput, setCustomTagInput] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const updateBrick = useUpdateBrick();
  const deleteBrick = useDeleteBrick();

  const handlePlayTTS = () => {
    if ("speechSynthesis" in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }

      setIsPlayingAudio(true);
      const utterance = new SpeechSynthesisUtterance(targetText);
      utterance.lang = "en-US";
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("TTS not supported in this browser.");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleAddCustomTag = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (customTagInput.trim() === "") return;
    if (!tags.includes(customTagInput.trim())) {
      setTags((prev) => [...prev, customTagInput.trim()]);
    }
    setCustomTagInput("");
  };

  const handleSave = () => {
    if (!nativeText.trim() || !targetText.trim()) return;

    const formData = new FormData();
    formData.append(
      "json_data",
      JSON.stringify({
        native_text: nativeText.trim(),
        target_text: targetText.trim(),
        target_pron: pronunciation.trim() || null,
        unit_type: brick.unitType,
        collection_id: brick.collectionId,
        tags,
      }),
    );

    updateBrick.mutate(
      { brickId: brick.id, formData },
      { onSuccess: () => onBack() },
    );
  };

  const handleDelete = () => {
    if (confirm("Are you sure?")) {
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
            className="p-2 -ml-2 rounded-full hover:bg-surface-container transition-all active:scale-95"
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
          className="px-6 py-2 bg-primary hover:bg-primary/95 text-on-primary rounded-full text-xs font-bold active:scale-95 transition-all shadow-md flex items-center gap-1.5"
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
        {/* Core inputs section */}
        <section className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-on-surface-variant ml-1">
              Native Language (Vietnamese)
            </span>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-xs focus-within:ring-2 focus-within:ring-primary transition-all">
              <input
                type="text"
                value={nativeText}
                onChange={(e) => setNativeText(e.target.value)}
                placeholder="Type Vietnamese word or phrase..."
                className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-semibold text-on-surface outline-none"
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-on-surface-variant ml-1">
              Target Language (English)
            </span>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-xs focus-within:ring-2 focus-within:ring-primary transition-all">
              <input
                type="text"
                value={targetText}
                onChange={(e) => setTargetText(e.target.value)}
                placeholder="Where is the library?"
                className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-semibold text-primary italic outline-none"
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-on-surface-variant ml-1">
              Phonetic Spelling
            </span>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-xs focus-within:ring-2 focus-within:ring-primary transition-all">
              <input
                type="text"
                value={pronunciation}
                onChange={(e) => setPronunciation(e.target.value)}
                placeholder="Phonetic translation e.g. /don-de/"
                className="w-full bg-transparent border-none focus:ring-0 p-0 text-xs font-mono text-outline outline-none"
              />
            </div>
          </label>
        </section>

        {/* Pronunciation audio row card */}
        <section className="pt-2">
          <span className="text-xs font-bold text-on-surface-variant ml-1 mb-2 block">
            Pronunciation Audio
          </span>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center justify-between w-full bg-surface-container-low rounded-xl p-3 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayTTS}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isPlayingAudio
                      ? "bg-error text-on-error animate-pulse"
                      : "bg-primary text-on-primary active:scale-90 hover:brightness-105"
                  }`}
                  title="Play pronunciation"
                >
                  {isPlayingAudio ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <div>
                  <div className="text-xs font-bold">recording_01.mp3</div>
                  <div className="text-[10px] text-on-surface-variant">
                    0:04s • High Quality
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-0.5 h-6">
                {[1, 2, 3, 4, 5].map((bar) => (
                  <div
                    key={bar}
                    className={`w-0.5 bg-primary rounded-full transition-all duration-300 ${
                      isPlayingAudio ? "animate-pulse" : "opacity-40"
                    }`}
                    style={{
                      height: isPlayingAudio
                        ? `${Math.floor(Math.random() * 18) + 4}px`
                        : "4px",
                      animationDelay: `${bar * 0.15}s`,
                    }}
                  ></div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-primary/20 bg-primary/5 text-primary rounded-xl font-bold text-xs hover:bg-primary/10 transition-colors active:scale-98">
                <Mic className="w-4 h-4" />
                <span>Record New</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-outline-variant bg-surface text-on-surface-variant rounded-xl font-bold text-xs hover:bg-surface-container transition-colors active:scale-98">
                <Upload className="w-4 h-4" />
                <span>Upload File</span>
              </button>
            </div>
          </div>
        </section>

        {/* Tags Section */}
        <section className="pt-2">
          <span className="text-xs font-bold text-on-surface-variant ml-1 mb-2 block">
            Tags & Categories
          </span>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-lg text-xs font-bold"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-error transition-colors p-0.5 rounded-full hover:bg-surface-container-highest"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleAddCustomTag}
              className="flex items-center border-t border-outline-variant/40 pt-3 mt-2"
            >
              <Plus className="w-4 h-4 text-outline mr-2" />
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                placeholder="Add custom tag..."
                className="bg-transparent border-none focus:ring-0 p-0 text-xs font-bold w-full outline-none"
              />
            </form>
          </div>
        </section>

        {/* Delete Action button block */}
        <section className="pt-6 pb-12 text-center space-y-3">
          <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 py-4 text-error font-bold text-sm border border-error/20 bg-error/5 hover:bg-error/10 rounded-2xl transition-all active:scale-99 shadow-xs"
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
