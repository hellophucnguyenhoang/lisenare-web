interface AudioWaveformProps {
  isRecording: boolean;
  audioLevels?: number[];
}

export default function AudioWaveform({
  isRecording,
  audioLevels = [40, 65, 85, 45, 90, 70, 50, 80, 60, 30],
}: AudioWaveformProps) {
  return (
    <div className="flex items-center justify-center gap-1 h-6 my-2">
      {audioLevels.map((level, idx) => {
        const heightPercent = isRecording
          ? Math.max(15, level + Math.sin(Date.now() / 200 + idx) * 20)
          : 20;

        return (
          <div
            key={idx}
            className={`w-1 rounded-full transition-all duration-150 ${
              isRecording ? "bg-primary shadow-xs" : "bg-outline-variant/40"
            }`}
            style={{
              height: `${heightPercent}%`,
            }}
          />
        );
      })}
    </div>
  );
}
