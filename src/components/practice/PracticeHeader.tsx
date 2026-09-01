import { Keyboard } from 'lucide-react';

interface PracticeHeaderProps {
  learnedCount: number;
  newCount: number;
  currentIndex: number;
  totalCount: number;
  showTypeInput: boolean;
  onToggleTypeInput: () => void;
}

export default function PracticeHeader({
  learnedCount,
  newCount,
  currentIndex,
  totalCount,
  showTypeInput,
  onToggleTypeInput
}: PracticeHeaderProps) {
  return (
    <header className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl px-6 py-4 mb-6 shadow-xs flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Learned</span>
          <span className="text-xl text-secondary font-bold font-display">{learnedCount}</span>
        </div>
        <div className="h-8 w-[1.5px] bg-outline-variant/30"></div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider">New</span>
          <span className="text-xl text-primary font-bold font-display">{newCount}</span>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-outline">
          {currentIndex + 1} / {totalCount}
        </span>
        <button 
          type="button"
          id="btn-toggle-keyboard-mode"
          onClick={onToggleTypeInput}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            showTypeInput 
              ? 'bg-primary/10 border-primary text-primary' 
              : 'border-outline-variant text-on-surface-variant hover:bg-surface'
          }`}
          title="Toggle Keyboard Typing"
          aria-label="Toggle Keyboard Typing"
        >
          <Keyboard className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
