import { Lock } from "lucide-react";

interface BrickPrivacyToggleProps {
  isPrivate: boolean;
  onChange: (isPrivate: boolean) => void;
}

export default function BrickPrivacyToggle({
  isPrivate,
  onChange,
}: BrickPrivacyToggleProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-bold font-display text-on-surface">
          Privacy
        </h2>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => onChange(!isPrivate)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChange(!isPrivate);
          }
        }}
        className="bg-white p-5 sm:p-6 rounded-2xl border border-outline-variant/60 shadow-xs flex items-center justify-between gap-4 cursor-pointer hover:border-primary/40 transition-all active:scale-[0.99] select-none"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              isPrivate
                ? "bg-primary/10 text-primary"
                : "bg-surface-container text-outline"
            }`}
          >
            <Lock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-on-surface block">
              Private Brick
            </span>
            <p className="text-xs text-on-surface-variant leading-relaxed mt-0.5">
              {isPrivate
                ? "Only you can see and practice this brick in your collections."
                : "Visible to all learners. Others can discover and practice it."}
            </p>
          </div>
        </div>

        {/* Toggle switch button */}
        <button
          type="button"
          role="switch"
          id="btn-toggle-brick-privacy"
          aria-checked={isPrivate}
          onClick={(e) => {
            e.stopPropagation();
            onChange(!isPrivate);
          }}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            isPrivate ? "bg-primary" : "bg-outline-variant/60"
          }`}
          aria-label="Toggle brick privacy"
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
              isPrivate ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </section>
  );
}
