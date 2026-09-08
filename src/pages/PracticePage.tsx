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

interface PracticePageProps {
  onTypingModeChange?: (isTyping: boolean) => void;
  onNavigateToAddBrick?: () => void;
  targetBrickId?: number | null;
  onClearTargetBrickId?: () => void;
}

export default function PracticePage({
  onTypingModeChange,
  onNavigateToAddBrick,
  targetBrickId,
  onClearTargetBrickId,
}: PracticePageProps) {
  const [finishedCount, setFinishedCount] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
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

  // Fetch the active brick via React Query (uses currentBrickId when learner selected a specific brick)
  const {
    data: activeBrick,
    isLoading: isLoadingBrick,
    refetch,
  } = useQuery({
    queryKey: ["bricks", "practice-next", currentBrickId],
    queryFn: () => getNextBrick({ brickId: currentBrickId }),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const isAnswerRevealed = isRevealed || hasListenedTargetAudio;

  // Reset turn state whenever active brick changes
  if (activeBrick && activeBrick.id !== lastBrickId) {
    setLastBrickId(activeBrick.id);
    setIsRevealed(false);
    setHasListenedTargetAudio(false);
    setHasSubmittedThisTurn(false);
    setTypedAnswer("");
    setEvaluationResult(null);
    setLearnerAudioUrl(null);
  }

  // Ensure view stays pinned to top when keyboard/typing mode opens on mobile
  useEffect(() => {
    if (showTypeInput) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
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
    setFinishedCount((prev) => prev + 1);
    setIsRevealed(false);
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

  if (isLoadingBrick) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-24 text-center animate-in fade-in duration-300">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!activeBrick) {
    if (showInstructions) {
      return (
        <PracticeInstructionsPage
          onBack={() => setShowInstructions(false)}
          onNavigateToAddBrick={onNavigateToAddBrick}
        />
      );
    }

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
    <div
      className={`grow flex flex-col items-center px-4 sm:px-6 max-w-lg mx-auto w-full animate-in fade-in duration-300 ${
        showTypeInput
          ? "justify-start pt-2 sm:pt-4 pb-2 sm:pb-4 min-h-0"
          : "justify-center py-6 sm:py-8 min-h-[calc(100dvh-10rem)]"
      }`}
    >
      {/* Main Flashcard & Interactive Input section */}
      <div className="w-full max-w-full space-y-4 min-w-0">
        {/* Minimal header with finished count and monkey status icons */}
        <PracticeHeader
          finishedCount={finishedCount}
          isAnswerRevealed={isAnswerRevealed}
          hasSubmittedThisTurn={hasSubmittedThisTurn}
        />

        <PracticeFlashcard
          activeBrick={activeBrick}
          isRevealed={isRevealed}
          onToggleReveal={() => setIsRevealed(!isRevealed)}
          onPlayAudio={(startTimeSec?: number) => {
            setHasListenedTargetAudio(true);
            playShortAudio(activeBrick.targetAudioPath, startTimeSec);
          }}
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
