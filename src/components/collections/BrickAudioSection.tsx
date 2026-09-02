import { useState, useRef, useMemo, type ChangeEvent } from "react";
import { Mic, Upload, Volume2 } from "lucide-react";
import { playShortAudio } from "@/utils/audio";

interface BrickAudioSectionProps {
  audioBlob: Blob | null;
  onAudioChange: (blob: Blob | null) => void;
  existingAudioPath?: string | null;
}

export default function BrickAudioSection({
  audioBlob,
  onAudioChange,
  existingAudioPath,
}: BrickAudioSectionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const previewAudioUrl = useMemo(() => {
    return audioBlob ? URL.createObjectURL(audioBlob) : null;
  }, [audioBlob]);

  const handleRecord = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          onAudioChange(blob);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      });
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAudioChange(file);
    }
  };

  const handlePlayAudio = () => {
    const audioToPlay = previewAudioUrl || existingAudioPath;
    if (audioToPlay) {
      playShortAudio(audioToPlay);
    }
  };

  const hasPlayableAudio = Boolean(previewAudioUrl || existingAudioPath);

  const statusTitle = audioBlob
    ? "Audio attached"
    : existingAudioPath
      ? "Audio available"
      : "No audio";

  const statusSubtitle = hasPlayableAudio
    ? "Click play icon to listen"
    : "Record or upload audio below";

  return (
    <section className="space-y-3">
      {/* Hidden Audio File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <h2 className="text-lg font-bold font-display text-on-surface px-1">
        Target Sentence Audio
      </h2>
      <div className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between w-full bg-surface-container-low rounded-xl p-3 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePlayAudio}
              disabled={!hasPlayableAudio}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer bg-primary text-on-primary active:scale-90 hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Play pronunciation"
              aria-label="Play pronunciation"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <div>
              <div className="text-xs font-bold">{statusTitle}</div>
              <div className="text-[10px] text-on-surface-variant">
                {statusSubtitle}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleRecord}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer ${
              isRecording
                ? "bg-error text-on-error"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>{isRecording ? "Stop Recording" : "Record New"}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-surface text-on-surface-variant font-bold text-xs hover:bg-surface-container transition-all active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
          </button>
        </div>
      </div>
    </section>
  );
}
