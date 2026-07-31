import { Inbox, SearchX } from "lucide-react";

export function EmptyState({
  title = "No records found",
  description = "Try adjusting your search or filter criteria.",
  filtered = true,
}: {
  title?: string;
  description?: string;
  filtered?: boolean;
}) {
  const Icon = filtered ? SearchX : Inbox;
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-6" />
      </span>
      <p className="mt-4 text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
