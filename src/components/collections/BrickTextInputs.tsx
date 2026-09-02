interface BrickTextInputsProps {
  nativeText: string;
  onNativeTextChange: (value: string) => void;
  targetText: string;
  onTargetTextChange: (value: string) => void;
  pronunciation: string;
  onPronunciationChange: (value: string) => void;
}

export default function BrickTextInputs({
  nativeText,
  onNativeTextChange,
  targetText,
  onTargetTextChange,
  pronunciation,
  onPronunciationChange,
}: BrickTextInputsProps) {
  return (
    <section className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-xs space-y-5">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
          <span>Native Language Sentence (Vietnamese)</span>
        </label>
        <input
          type="text"
          value={nativeText}
          onChange={(e) => onNativeTextChange(e.target.value)}
          placeholder="Thư viện ở đâu?"
          className="w-full h-14 px-4 rounded-xl bg-surface border-2 border-transparent focus:border-primary focus:ring-0 transition-all font-semibold text-sm outline-none placeholder:text-on-surface-variant/40"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
          <span>Target Language Sentence (English)</span>
        </label>
        <input
          type="text"
          value={targetText}
          onChange={(e) => onTargetTextChange(e.target.value)}
          placeholder="Where is the library?"
          className="w-full h-14 px-4 rounded-xl bg-surface border-2 border-transparent focus:border-primary focus:ring-0 transition-all font-semibold text-sm text-primary outline-none placeholder:text-on-surface-variant/40"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-on-surface-variant">
          Target Pronunciation (Optional)
        </label>
        <input
          type="text"
          value={pronunciation}
          onChange={(e) => onPronunciationChange(e.target.value)}
          placeholder="e.g. /wɛər ɪz ðə ˈlaɪbrɛri/"
          className="w-full h-12 px-4 rounded-xl bg-surface border-2 border-transparent focus:border-primary focus:ring-0 transition-all text-xs font-mono outline-none"
        />
      </div>
    </section>
  );
}
