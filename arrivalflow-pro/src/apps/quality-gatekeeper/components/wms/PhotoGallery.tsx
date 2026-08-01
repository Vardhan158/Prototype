import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, Pencil, MessageSquare, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Photo {
  src: string;
  label: string;
  meta: string;
  comment?: string;
}

export function PhotoGallery({ photos, className }: { photos: Photo[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [markup, setMarkup] = useState(false);
  const cur = open !== null ? photos[open] : undefined;

  return (
    <>
      <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4", className)}>
        {photos.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpen(i)}
            className="group relative overflow-hidden rounded-xl border border-border bg-muted text-left"
          >
            <img src={p.src} alt={p.label} loading="lazy" width={960} height={640} className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent px-2.5 py-2">
              <span className="block truncate text-[11px] font-semibold text-background">{p.label}</span>
              <span className="block truncate text-[10px] text-background/80">{p.meta}</span>
            </span>
            <span className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-lg bg-card/85 opacity-0 transition-opacity group-hover:opacity-100">
              <ZoomIn className="h-3.5 w-3.5" />
            </span>
          </button>
        ))}
      </div>

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0">
          {open !== null && photos[open] && (
            <>
              <div className="relative bg-foreground/95">
                <img src={cur!.src} alt={cur!.label} width={960} height={640} className="max-h-[60vh] w-full object-contain" />
                {markup && (
                  <>
                    <span className="pointer-events-none absolute top-[28%] left-[32%] h-24 w-32 rounded-lg border-2 border-destructive shadow-[0_0_0_9999px_rgba(0,0,0,0.15)]" />
                    <span className="pointer-events-none absolute top-[22%] left-[32%] rounded bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
                      DEFECT A — crushed corner
                    </span>
                  </>
                )}
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border bg-card px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{cur!.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{cur!.meta}</p>
                  {cur!.comment && (
                    <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                      <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {cur!.comment}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant={markup ? "default" : "outline"} size="sm" onClick={() => setMarkup((m) => !m)}>
                    <Pencil className="h-4 w-4" /> Markup
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" /> Export
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
