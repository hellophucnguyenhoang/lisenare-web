import React, { useState } from "react";
import { type Brick, type Collection } from "../types";
import {
  ArrowLeft,
  Globe,
  Mic,
  Upload,
  Plus,
  Save,
  Check,
  Sparkles,
} from "lucide-react";

interface AddBrickViewProps {
  collectionId: string;
  collections: Collection[];
  onAddBrick: (brick: Omit<Brick, "id" | "createdAt">) => void;
  onBack: () => void;
}

export default function AddBrickView({
  collectionId,
  collections,
  onAddBrick,
  onBack,
}: AddBrickViewProps) {
  const [nativeText, setNativeText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Travel"]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const activeCol = collections.find((c) => c.id === collectionId);

  const defaultTags = [
    "Travel",
    "Food",
    "Grammar",
    "Health",
    "Work",
    "Greeting",
    "Polite",
    "Survival",
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTagInput.trim() === "") return;
    if (!selectedTags.includes(customTagInput.trim())) {
      setSelectedTags((prev) => [...prev, customTagInput.trim()]);
    }
    setCustomTagInput("");
  };

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setHasAudio(true);
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setHasAudio(true);
      }, 2500);
    }
  };

  const handleSave = () => {
    if (nativeText.trim() === "" || targetText.trim() === "") {
      alert(
        "Please fill out both native English and target Spanish text fields.",
      );
      return;
    }

    setIsSaving(true);

    // Simulate phonetic pronunciation generation if not provided
    const computedPronunciation =
      pronunciation.trim() ||
      `/${targetText
        .toLowerCase()
        .replace(/[¿?¡!.,]/g, "")
        .replace(/ /g, ".")}/`;

    setTimeout(() => {
      onAddBrick({
        nativeText: nativeText.trim(),
        targetText: targetText.trim(),
        pronunciation: computedPronunciation,
        status: "new",
        tags: selectedTags,
        collectionId: collectionId,
        audioUrl: hasAudio ? "recording_01.mp3" : undefined,
      });
      setIsSaving(false);
      onBack();
    }, 1000);
  };

  return (
    <div className="max-w-max-width mx-auto px-container-padding pt-6 pb-32 animate-in fade-in duration-300">
      {/* Top Bar Navigation */}
      <header className="flex items-center justify-between h-16 w-full max-w-lg mx-auto mb-6">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-surface-container transition-all active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-primary" />
        </button>
        <h1 className="text-xl font-bold font-display text-primary">
          Add New Brick
        </h1>
        <div className="w-10"></div> {/* Spacer for symmetry */}
      </header>

      <main className="max-w-lg mx-auto space-y-6">
        {/* Languages inputs Card */}
        <section className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-sm space-y-5">
          {/* Native Language (English) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <span>Native Language (English)</span>
            </label>
            <input
              type="text"
              value={nativeText}
              onChange={(e) => setNativeText(e.target.value)}
              placeholder="Type English word or phrase..."
              className="w-full h-14 px-4 rounded-xl bg-surface border-2 border-transparent focus:border-primary focus:ring-0 transition-all font-semibold text-sm outline-none placeholder:text-on-surface-variant/40"
            />
          </div>

          {/* Target Language (Spanish) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
              <span>Target Language (Spanish)</span>
            </label>
            <input
              type="text"
              value={targetText}
              onChange={(e) => setTargetText(e.target.value)}
              placeholder="¿Cómo se dice?"
              className="w-full h-14 px-4 rounded-xl bg-surface border-2 border-transparent focus:border-primary focus:ring-0 transition-all font-semibold text-sm text-primary italic outline-none placeholder:text-on-surface-variant/40"
            />
          </div>

          {/* Pronunciation phonetics input (optional) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-on-surface-variant">
              Phonetic Pronunciation (Optional)
            </label>
            <input
              type="text"
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
              placeholder="e.g. /ko.mo es.tas/"
              className="w-full h-12 px-4 rounded-xl bg-surface border-2 border-transparent focus:border-primary focus:ring-0 transition-all text-xs font-mono outline-none"
            />
          </div>
        </section>

        {/* Pronunciation Recording section */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold font-display text-on-surface px-1">
            Pronunciation Audio
          </h2>
          <div className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-sm space-y-4">
            {/* Audio Wave Form empty state or simulated */}
            <div className="h-24 w-full bg-surface rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-2 overflow-hidden relative">
              {isRecording ? (
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-error rounded-full animate-pulse"
                      style={{
                        height: `${Math.floor(Math.random() * 32) + 8}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    ></div>
                  ))}
                </div>
              ) : hasAudio ? (
                <div className="text-center">
                  <Check className="w-6 h-6 text-primary mx-auto mb-1" />
                  <p className="text-xs font-bold text-primary">
                    recording_01.mp3 successfully recorded
                  </p>
                  <p className="text-[10px] text-outline">
                    0:04s • High Quality
                  </p>
                </div>
              ) : (
                <div className="text-center opacity-40 space-y-1">
                  <p className="text-xs italic text-on-surface-variant font-medium">
                    No recording yet
                  </p>
                  <p className="text-[10px] text-outline">
                    Optionally record Spanish audio
                  </p>
                </div>
              )}
            </div>

            {/* Rec buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleRecord}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                  isRecording
                    ? "bg-error text-on-error"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>{isRecording ? "Stop Recording" : "Record New"}</span>
              </button>

              <button
                onClick={() => setHasAudio(true)}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-surface text-on-surface-variant font-bold text-xs hover:bg-surface-container transition-all active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Upload File</span>
              </button>
            </div>
          </div>
        </section>

        {/* Tags checklist */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold font-display text-on-surface">
              Tags & Categories
            </h2>
            <span className="text-xs text-on-surface-variant">Optional</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-sm space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {defaultTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? "bg-primary border-primary text-on-primary shadow-xs"
                        : "bg-surface border-transparent text-on-surface-variant hover:border-outline"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Form */}
            <form onSubmit={handleAddCustomTag} className="relative">
              <input
                type="text"
                placeholder="Add custom tag..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                className="w-full h-11 pl-4 pr-12 rounded-xl bg-surface border border-outline-variant focus:border-primary focus:ring-0 transition-all text-xs"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-primary text-on-primary rounded-lg hover:brightness-105 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>
        </section>

        {/* Contextual image decorative banner */}
        <div className="rounded-2xl overflow-hidden h-32 relative group shadow-sm">
          <div
            className="bg-cover bg-center w-full h-full"
            style={{
              backgroundImage: "/coder_cat.png",
            }}
          ></div>
          <div className="absolute inset-0 bg-primary/20 flex flex-col items-center justify-center backdrop-blur-[1px] text-center p-4">
            <p className="text-white font-bold font-display text-sm tracking-wide">
              Visualize your journey,
              <br />
              one brick at a time.
            </p>
          </div>
        </div>

        {/* Bottom save bar spacing */}
        <div className="h-10"></div>
      </main>

      {/* Persistent Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-outline-variant/30 safe-bottom z-40 p-4">
        <div className="max-w-lg mx-auto flex flex-col">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-14 bg-primary text-on-primary rounded-xl font-bold text-sm shadow-md shadow-primary/10 hover:shadow-lg active:scale-99 transition-all flex items-center justify-center gap-2.5"
          >
            {isSaving ? (
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
