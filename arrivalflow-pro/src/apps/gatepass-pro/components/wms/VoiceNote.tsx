import { useEffect, useState } from "react";
import { Mic, Square, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function VoiceNote({
  seconds,
  onChange,
}: {
  seconds?: number | undefined;
  onChange: (s: number | undefined) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  return (
    <div className="card-elevated flex items-center gap-3 p-4">
      <button
        type="button"
        aria-label={recording ? "Stop recording" : "Record voice note"}
        onClick={() => {
          if (recording) {
            setRecording(false);
            onChange(Math.max(elapsed, 3));
          } else {
            setElapsed(0);
            setRecording(true);
          }
        }}
        className={cn(
          "grid size-12 shrink-0 place-items-center rounded-full text-primary-foreground transition-colors",
          recording ? "animate-pulse bg-destructive" : "bg-primary",
        )}
      >
        {recording ? <Square className="size-5" /> : <Mic className="size-5" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Voice note (optional)</p>
        <p className="text-xs text-muted-foreground">
          {recording
            ? `Recording… ${elapsed}s`
            : seconds
              ? `Attached · ${seconds}s clip`
              : "Tap to dictate instead of typing"}
        </p>
      </div>
      {seconds && !recording ? (
        <button
          type="button"
          aria-label="Delete voice note"
          onClick={() => onChange(undefined)}
          className="grid size-10 place-items-center rounded-full text-muted-foreground active:bg-muted"
        >
          <Trash2 className="size-5" />
        </button>
      ) : null}
    </div>
  );
}