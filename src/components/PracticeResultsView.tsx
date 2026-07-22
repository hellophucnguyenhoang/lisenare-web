import { Trophy, Mic, CheckCircle, ArrowRight, X } from 'lucide-react';

interface PracticeResultsViewProps {
  overallScore: number;
  pronunciationScore: number;
  accuracyScore: number;
  onNext: () => void;
  onClose: () => void;
}

export default function PracticeResultsView({
  overallScore,
  pronunciationScore,
  accuracyScore,
  onNext,
  onClose
}: PracticeResultsViewProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-on-surface/30 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* Score Modal */}
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/60 p-8 flex flex-col items-center animate-in zoom-in-95 duration-300">
        
        {/* Floating Trophy */}
        <div className="relative w-full h-24 flex justify-center items-center mb-4">
          <div className="p-4 bg-primary/5 rounded-full animate-bounce">
            <Trophy className="w-12 h-12 text-primary" />
          </div>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative flex items-center justify-center mb-6">
          <svg className="w-36 h-36 transform -rotate-90">
            <circle 
              className="text-surface-container-high" 
              cx="72" 
              cy="72" 
              fill="transparent" 
              r="60" 
              stroke="currentColor" 
              strokeWidth="10"
            ></circle>
            <circle 
              className="text-primary transition-all duration-1000 ease-out" 
              cx="72" 
              cy="72" 
              fill="transparent" 
              r="60" 
              stroke="currentColor" 
              strokeWidth="10"
              strokeDasharray={377}
              strokeDashoffset={377 - (377 * overallScore) / 100}
              strokeLinecap="round"
            ></circle>
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="font-display text-4xl font-bold text-primary leading-none">{overallScore}%</span>
            <span className="text-[10px] font-bold text-on-surface-variant mt-1">Overall Score</span>
          </div>
        </div>

        {/* Success title */}
        <h2 className="font-headline-lg font-bold font-display text-primary mb-2 text-center text-2xl">
          {overallScore >= 90 ? "Spectacular!" : "Great Job!"}
        </h2>
        <p className="text-xs text-on-surface-variant text-center max-w-xs mb-8">
          You laid down beautiful vocabulary blocks! Keep up the daily practice to lock in your long-term memory.
        </p>

        {/* Breakdown grid */}
        <div className="w-full grid grid-cols-2 gap-3 mb-8">
          {/* Pronunciation score card */}
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-4 flex flex-col items-center gap-1 shadow-xs">
            <Mic className="w-5 h-5 text-secondary" />
            <span className="text-sm font-bold text-on-surface">{pronunciationScore}%</span>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Pronunciation</span>
          </div>
          
          {/* Accuracy score card */}
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-4 flex flex-col items-center gap-1 shadow-xs">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-on-surface">{accuracyScore}%</span>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Accuracy</span>
          </div>
        </div>

        {/* Action Panel */}
        <div className="w-full flex flex-col gap-3">
          <button 
            onClick={onNext}
            className="w-full bg-primary text-on-primary font-semibold py-4 rounded-xl shadow-md hover:bg-primary/95 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Practice Another set</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button 
            onClick={onClose}
            className="w-full bg-primary/10 text-primary font-semibold py-3 rounded-xl hover:bg-primary/20 active:scale-95 transition-all"
          >
            Go to Collections
          </button>
        </div>

      </div>
    </div>
  );
}
