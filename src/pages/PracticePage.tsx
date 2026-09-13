import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getNextBrick } from "@/api/bricks";
import {
  playShortAudio,
  getAudioMediaStream,
  createMediaRecorder,
  getSupportedAudioMimeType,
} from "@/utils/audio";
import { transcribeAudio, compareSentences } from "@/api/evaluation";
import PracticeHeader from "@/components/practice/PracticeHeader";
import PracticeFlashcard from "@/components/practice/PracticeFlashcard";
import PracticeInputSection from "@/components/practice/PracticeInputSection";
import PracticeEvaluationModal from "@/components/practice/PracticeEvaluationModal";
import PracticeInstructionsPage from "@/components/practice/PracticeInstructionsPage";
import { Plus, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { type Brick, type AuthMode } from "@/types";
import { useLearnerMe } from "@/hooks/useLearner";
import { useHeader } from "@/context/HeaderContext";

interface PracticePageProps {
  onTypingModeChange?: (isTyping: boolean) => void;
  onNavigateToAddBrick?: () => void;
  onNavigateToEditBrick?: (brick: Brick) => void;
  targetBrickId?: number | null;
  onClearTargetBrickId?: () => void;
  finishedCount?: number;
  onIncrementFinishedCount?: () => void;
  elapsedSeconds?: number;
  onTickTimer?: () => void;
  onOpenAuth?: (mode: AuthMode) => void;
}

export default function PracticePage({
  onTypingModeChange,
  onNavigateToAddBrick,
  onNavigateToEditBrick,
  targetBrickId,
  onClearTargetBrickId,
  finishedCount: propFinishedCount,
  onIncrementFinishedCount,
  elapsedSeconds: propElapsedSeconds,
  onTickTimer,
  onOpenAuth,
}: PracticePageProps) {
  const [localFinishedCount, setLocalFinishedCount] = useState(0);
  const [localElapsedSeconds, setLocalElapsedSeconds] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);

  const finishedCount = propFinishedCount ?? localFinishedCount;
  const elapsedSeconds = propElapsedSeconds ?? localElapsedSeconds;

  // Session timer ticks every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (onTickTimer) {
        onTickTimer();
      } else {
        setLocalElapsedSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [onTickTimer]);

  const [currentBrickId, setCurrentBrickId] = useState<number | null>(
    targetBrickId ?? null,
  );
  const [lastBrickId, setLastBrickId] = useState<number | null>(null);

  const qc = useQueryClient();

  const [prevTargetId, setPrevTargetId] = useState(targetBrickId);
  if (targetBrickId !== prevTargetId) {
    setPrevTargetId(targetBrickId);
    setCurrentBrickId(targetBrickId ?? null);
  }

  // Turn state
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasRevealedAnswer, setHasRevealedAnswer] = useState(false);
  const [hasListenedTargetAudio, setHasListenedTargetAudio] = useState(false);
  const [hasSubmittedThisTurn, setHasSubmittedThisTurn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [showTypeInput, setShowTypeInput] = useState(false);
  const [learnerAudioUrl, setLearnerAudioUrl] = useState<string | null>(null);

  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    passed: boolean;
    targetText: string;
    learnerText: string;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const { data: learner } = useLearnerMe();
  const isLoggedIn = Boolean(learner);

  // Fetch the active brick via React Query (uses currentBrickId when learner selected a specific brick)
  const {
    data: activeBrick,
    isLoading: isLoadingBrick,
    refetch,
  } = useQuery({
    queryKey: ["bricks", "practice-next", currentBrickId],
    queryFn: () => getNextBrick({ brickId: currentBrickId }),
    enabled: isLoggedIn,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const isAnswerRevealed =
    hasRevealedAnswer || isRevealed || hasListenedTargetAudio;

  const handleToggleReveal = () => {
    setIsRevealed((prev) => {
      const next = !prev;
      if (next) {
        setHasRevealedAnswer(true);
      }
      return next;
    });
  };

  // Reset turn state whenever active brick changes
  if (activeBrick && activeBrick.id !== lastBrickId) {
    setLastBrickId(activeBrick.id);
    setIsRevealed(false);
    setHasRevealedAnswer(false);
    setHasListenedTargetAudio(false);
    setHasSubmittedThisTurn(false);
    setTypedAnswer("");
    setEvaluationResult(null);
    setLearnerAudioUrl(null);
  }

  const { setHeaderContent } = useHeader();

  // Dynamically update the fixed sticky header with real-time practice stats
  useEffect(() => {
    if (!isLoggedIn || !activeBrick) {
      setHeaderContent(null);
      return;
    }
    setHeaderContent(
      <PracticeHeader
        finishedCount={finishedCount}
        elapsedSeconds={elapsedSeconds}
        isAnswerRevealed={isAnswerRevealed}
        hasSubmittedThisTurn={hasSubmittedThisTurn}
      />,
    );
    return () => setHeaderContent(null);
  }, [
    isLoggedIn,
    activeBrick,
    finishedCount,
    elapsedSeconds,
    isAnswerRevealed,
    hasSubmittedThisTurn,
    setHeaderContent,
  ]);

  // Notify parent of typing mode change if needed
  useEffect(() => {
    onTypingModeChange?.(showTypeInput);
    return () => {
      onTypingModeChange?.(false);
    };
  }, [showTypeInput, onTypingModeChange]);

  const handleStartRecording = async () => {
    setLearnerAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await getAudioMediaStream();
      streamRef.current = stream;
      const recorder = createMediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err: unknown) {
      console.warn("Microphone access error:", err);
      const error = err as { name?: string; message?: string };
      const msg =
        error?.name === "NotAllowedError" ||
        error?.name === "PermissionDeniedError"
          ? "Microphone permission was denied. Please allow microphone access in your browser settings."
          : error?.message || "Could not access microphone.";
      toast.error(msg);
    }
  };

  const handleCancelRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    audioChunksRef.current = [];
    setIsRecording(false);
  };

  const handleSubmitRecording = async () => {
    if (!activeBrick) return;

    if (
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state === "inactive"
    ) {
      setIsRecording(false);
      return;
    }

    const recorder = mediaRecorderRef.current;

    // Collect audio blob on stop
    const audioBlobPromise = new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const mimeType =
          recorder.mimeType || getSupportedAudioMimeType() || "audio/webm";
        const blob = new Blob(audioChunksRef.current, {
          type: mimeType,
        });
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        resolve(blob);
      };
    });

    recorder.stop();
    setIsRecording(false);
    setIsEvaluating(true);

    try {
      const blob = await audioBlobPromise;
      if (blob.size > 0) {
        const url = URL.createObjectURL(blob);
        setLearnerAudioUrl(url);

        // 1. Transcribe audio via /audio/transcripts
        const transcript = await transcribeAudio(blob);

        // 2. Determine whether review_base should be included (only on the first submit of this turn)
        const reviewBase = !hasSubmittedThisTurn
          ? {
              brick_id: activeBrick.id,
              is_answer_revealed: isAnswerRevealed,
              learner_target_text: transcript || null,
            }
          : null;

        setHasSubmittedThisTurn(true);

        // 3. Compare transcript with target text via /text/sentence-comparison
        const res = await compareSentences({
          sentence1: transcript || "",
          sentence2: activeBrick.targetText,
          review_base: reviewBase,
        });

        setIsRevealed(true);
        setHasRevealedAnswer(true);
        const passed = res.score >= (res.threshold ?? 0.7);
        setEvaluationResult({
          score: res.score,
          passed,
          targetText: activeBrick.targetText,
          learnerText: transcript || "",
        });
      } else {
        toast.error("No audio recorded. Please try again.");
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      toast.error("Evaluation failed. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleTypedSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!activeBrick || typedAnswer.trim() === "") return;

    setIsEvaluating(true);
    try {
      // Determine whether review_base should be included (only on the first submit of this turn)
      const reviewBase = !hasSubmittedThisTurn
        ? {
            brick_id: activeBrick.id,
            is_answer_revealed: isAnswerRevealed,
            learner_target_text: typedAnswer.trim(),
          }
        : null;

      setHasSubmittedThisTurn(true);

      const res = await compareSentences({
        sentence1: typedAnswer.trim(),
        sentence2: activeBrick.targetText,
        review_base: reviewBase,
      });

      setIsRevealed(true);
      setHasRevealedAnswer(true);
      const passed = res.score >= (res.threshold ?? 0.7);
      setEvaluationResult({
        score: res.score,
        passed,
        targetText: activeBrick.targetText,
        learnerText: typedAnswer.trim(),
      });
    } catch (err) {
      console.error("Typed evaluation error:", err);
      toast.error("Evaluation failed. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = async () => {
    setEvaluationResult(null);
    if (onIncrementFinishedCount) {
      onIncrementFinishedCount();
    } else {
      setLocalFinishedCount((prev) => prev + 1);
    }
    setIsRevealed(false);
    setHasRevealedAnswer(false);
    setHasListenedTargetAudio(false);
    setHasSubmittedThisTurn(false);
    setTypedAnswer("");
    setShowTypeInput(false);
    setLearnerAudioUrl(null);

    if (currentBrickId != null) {
      setCurrentBrickId(null);
      onClearTargetBrickId?.();
      qc.invalidateQueries({ queryKey: ["bricks", "practice-next"] });
    } else {
      const result = await refetch();
      if (!result.data) {
        toast.success("Session completed! Great job!");
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center animate-in fade-in duration-300 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-white border border-primary/20 shadow-xs flex items-center justify-center mb-5 overflow-hidden p-3">
          <img
            src="/favicon.svg"
            alt="Lisenare Logo"
            className="w-full h-full object-contain rounded-xl"
          />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-on-surface mb-2">
          Start Practicing Bricks
        </h2>
        <p className="text-xs text-on-surface-variant max-w-xs mb-6 leading-relaxed">
          Sign in to your account to review vocabulary, practice pronunciation with speech evaluation, and build your memory stability.
        </p>
        {onOpenAuth && (
          <button
            type="button"
            onClick={() => onOpenAuth("login")}
            className="py-3 px-6 bg-primary hover:bg-primary/95 text-on-primary font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            Log In to Practice
          </button>
        )}
      </div>
    );
  }

  if (isLoadingBrick) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-24 text-center animate-in fade-in duration-300">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (showInstructions) {
    return (
      <PracticeInstructionsPage
        onBack={() => setShowInstructions(false)}
        onNavigateToAddBrick={onNavigateToAddBrick}
      />
    );
  }

  if (!activeBrick) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center animate-in fade-in duration-300 flex flex-col items-center">
        {/* App Logo */}
        <div className="w-20 h-20 rounded-2xl bg-white border border-primary/20 shadow-xs flex items-center justify-center mb-6 overflow-hidden p-3.5">
          <img
            src="/favicon.svg"
            alt="Lisenare Logo"
            className="w-full h-full object-contain rounded-xl"
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-on-surface tracking-tight mb-2">
          Ready for your next brick?
        </h2>

        {/* Subtitle */}
        <p className="text-sm text-on-surface-variant max-w-xs mx-auto mb-8 leading-relaxed">
          Add a new language brick to expand your collection and start practicing.
        </p>

        {/* Add Brick Button */}
        {onNavigateToAddBrick && (
          <button
            type="button"
            id="btn-empty-add-brick"
            onClick={onNavigateToAddBrick}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-md shadow-primary/20 hover:bg-primary/95 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Add Brick</span>
          </button>
        )}

        {/* Small Question leading to Text Instruction Page */}
        <button
          type="button"
          id="btn-how-practice-works"
          onClick={() => setShowInstructions(true)}
          className="mt-8 inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer group"
        >
          <HelpCircle className="w-4 h-4 text-outline group-hover:text-primary transition-colors" />
          <span className="underline underline-offset-4 font-medium">
            How does practice work?
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="grow flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 max-w-lg mx-auto w-full min-h-[calc(100dvh-10rem)] animate-in fade-in duration-300">
      {/* Main Flashcard & Interactive Input section */}
      <div className="w-full max-w-full space-y-4 min-w-0">
        <PracticeFlashcard
          activeBrick={activeBrick}
          isRevealed={isRevealed}
          onToggleReveal={handleToggleReveal}
          onPlayAudio={(startTimeSec?: number) => {
            setHasListenedTargetAudio(true);
            playShortAudio(activeBrick.targetAudioPath, startTimeSec);
          }}
          onEditBrick={
            onNavigateToEditBrick
              ? () => onNavigateToEditBrick(activeBrick)
              : undefined
          }
        />

        <PracticeInputSection
          showTypeInput={showTypeInput}
          onToggleTypeInput={() => setShowTypeInput(!showTypeInput)}
          typedAnswer={typedAnswer}
          onChangeTypedAnswer={setTypedAnswer}
          onSubmitTypedAnswer={handleTypedSubmit}
          onCancelTypeInput={() => setShowTypeInput(false)}
          isRecording={isRecording}
          isEvaluating={isEvaluating}
          onStartRecording={handleStartRecording}
          onSubmitRecording={handleSubmitRecording}
          onCancelRecording={handleCancelRecording}
          showNextButton={Boolean(evaluationResult?.passed)}
          onNext={handleNext}
          onOpenInstructions={() => setShowInstructions(true)}
        />
      </div>

      {/* Minimal Scoreboard & Evaluation Dialog */}
      {evaluationResult && (
        <PracticeEvaluationModal
          score={evaluationResult.score}
          passed={evaluationResult.passed}
          targetText={evaluationResult.targetText}
          learnerText={evaluationResult.learnerText}
          onClose={() => setEvaluationResult(null)}
          onNext={handleNext}
          onPlayTargetAudio={() => {
            setHasListenedTargetAudio(true);
            playShortAudio(activeBrick.targetAudioPath);
          }}
          onPlayLearnerAudio={() => playShortAudio(learnerAudioUrl)}
          hasLearnerAudio={Boolean(learnerAudioUrl)}
        />
      )}
    </div>
  );
}
