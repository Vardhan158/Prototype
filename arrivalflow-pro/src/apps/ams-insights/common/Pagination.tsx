import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  pageCount,
  total,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-5 py-3 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        Page {page} of {pageCount} · {total} purchase orders
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
          Prev
        </Button>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
          <Button
            key={p}
            variant={p === page ? "default" : "ghost"}
            size="sm"
            className="size-8 rounded-lg p-0"
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg"
          disabled={page === pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
