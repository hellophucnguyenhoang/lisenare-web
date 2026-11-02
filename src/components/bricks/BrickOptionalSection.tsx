import { useState, useRef, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import PlainTextInput from "@/components/common/PlainTextInput";
import BrickImageSection from "@/components/bricks/BrickImageSection";

interface BrickOptionalSectionProps {
  pronunciation: string;
  onPronunciationChange: (value: string) => void;
  context: string;
  onContextChange: (value: string) => void;
  imageFile: File | null;
  onImageFileChange: (file: File | null) => void;
  existingImageUrl?: string | null;
  existingImagePath?: string | null;
  onRemoveExistingImage?: () => void;
  disabled?: boolean;
}

function InfoTooltip({ text }: { text: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="p-0.5 rounded-full text-outline hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer select-none"
        aria-label="Information"
        title={text}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-60 sm:w-68 p-2.5 bg-on-surface text-surface text-[11px] leading-relaxed font-normal rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 pointer-events-none"
        >
          {text}
        </div>
      )}
    </div>
  );
}

export default function BrickOptionalSection({
  pronunciation,
  onPronunciationChange,
  context,
  onContextChange,
  imageFile,
  onImageFileChange,
  existingImageUrl,
  existingImagePath,
  onRemoveExistingImage,
  disabled = false,
}: BrickOptionalSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-bold font-display text-on-surface">
          Optional details
        </h2>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-xs space-y-5">
        {/* Target pronunciation */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-on-surface-variant flex items-center gap-1.5">
            <span>Target pronunciation</span>
            <InfoTooltip text="Pronunciation guide." />
          </label>
          <PlainTextInput
            value={pronunciation}
            onChange={onPronunciationChange}
            placeholder="Phonetic transcription e.g. /wɛər ɪz ðə ˈlaɪbrɛri/"
            className="w-full h-12 px-4 rounded-xl bg-surface border-2 border-transparent focus-within:border-primary text-xs font-mono outline-none"
            disabled={disabled}
          />
        </div>

        {/* Context */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-on-surface-variant flex items-center gap-1.5">
            <span>Context</span>
            <InfoTooltip text="Usage situation or notes of how or when your brick is used." />
          </label>
          <PlainTextInput
            value={context}
            onChange={onContextChange}
            placeholder="Usage situation, clip source, or notes e.g. At the airport check-in..."
            className="w-full h-12 px-4 rounded-xl bg-surface border-2 border-transparent focus-within:border-primary text-xs outline-none"
            disabled={disabled}
          />
        </div>

        {/* Image */}
        <BrickImageSection
          imageFile={imageFile}
          onImageFileChange={onImageFileChange}
          existingImageUrl={existingImageUrl}
          existingImagePath={existingImagePath}
          onRemoveExistingImage={onRemoveExistingImage}
          disabled={disabled}
          embedded
        />
      </div>
    </section>
  );
}
