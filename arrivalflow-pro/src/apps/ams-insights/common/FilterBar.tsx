import { format } from "date-fns";
import { CalendarIcon, Plus, Search } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const statuses = [
  "All Statuses",
  "Open",
  "Approved",
  "Sent",
  "Partially Received",
  "Received",
  "Cancelled",
];

export function FilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  range,
  onRangeChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  range: DateRange | undefined;
  onRangeChange: (r: DateRange | undefined) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search PO or supplier"
          className="h-9 w-full rounded-lg pl-9 sm:w-56"
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-9 justify-start rounded-lg font-normal",
              !range?.from && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="size-4" />
            {range?.from ? (
              range.to ? (
                `${format(range.from, "dd MMM")} – ${format(range.to, "dd MMM yyyy")}`
              ) : (
                format(range.from, "dd MMM yyyy")
              )
            ) : (
              <span>Date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={range}
            onSelect={onRangeChange}
            numberOfMonths={2}
            className={cn("pointer-events-auto p-3")}
          />
        </PopoverContent>
      </Popover>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="h-9 w-[170px] rounded-lg">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button className="h-9 rounded-lg">
        <Plus className="size-4" />
        Create PO
      </Button>
    </div>
  );
}
