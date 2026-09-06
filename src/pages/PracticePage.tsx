import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { toast } from "sonner";

export default function PracticePage() {
  const [finishedCount, setFinishedCount] = useState(0);

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

  // Fetch the active brick via React Query (deduplicated across renders/StrictMode mounts)
  const {
    data: activeBrick,
    isLoading: isLoadingBrick,
    refetch,
  } = useQuery({
    queryKey: ["bricks", "practice-next"],
    queryFn: () => getNextBrick(),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const isAnswerRevealed = isRevealed || hasListenedTargetAudio;

  // Reset turn state whenever active brick changes
  useEffect(() => {
    if (activeBrick) {
      setIsRevealed(false);
      setHasListenedTargetAudio(false);
      setHasSubmittedThisTurn(false);
      setTypedAnswer("");
      setEvaluationResult(null);
      setLearnerAudioUrl(null);
    }
  }, [activeBrick?.id]);

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

    const result = await refetch();
    if (!result.data) {
      toast.success("Session completed! Great job!");
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
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-24 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-2xl border border-primary/20 flex items-center justify-center mx-auto mb-4 shadow-xs overflow-hidden">
          <img
            src="/favicon.svg"
            alt="Lisenare Logo"
            className="w-full h-full object-contain rounded-xl"
          />
        </div>
        <h2 className="text-2xl font-bold font-display text-on-surface">
          No Bricks Ready to Practice
        </h2>
        <p className="text-sm text-on-surface-variant max-w-sm mx-auto mt-2">
          Add some language bricks from the "Collections" tab or the "Discover"
          feed to start practicing!
        </p>
      </div>
    );
  }

  return (
    <div className="grow flex flex-col items-center justify-center px-4 sm:px-6 py-8 max-w-lg mx-auto w-full animate-in fade-in duration-300 min-h-[calc(100vh-6rem)]">
      {/* Main Flashcard & Interactive Input section */}
      <div className="w-full space-y-4">
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
