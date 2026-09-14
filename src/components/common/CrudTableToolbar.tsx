import type { ReactNode } from "react";
import { MoreVerticalIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type CrudTableToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Optional controls between search and primary actions (e.g. event filter). */
  filters?: ReactNode;
  addAction?: ReactNode;
  /** Bulk menu content (Add to team, Delete selected, …). Shown when provided. */
  bulkMenu?: ReactNode;
  selectionCount?: number;
  className?: string;
};

/**
 * Standard CRUD list toolbar: search (left) + optional bulk ⋮ + primary Add (right).
 */
export function CrudTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  filters,
  addAction,
  bulkMenu,
  selectionCount = 0,
  className,
}: CrudTableToolbarProps) {
  const hasSelection = selectionCount > 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-[#E8E8E8] px-6 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#8A95B5]" />
          <Input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-11 rounded-md border-[#E8E8E8] bg-white pl-9 text-[15px] placeholder:text-[#8A95B5]"
          />
        </div>
        {filters ? (
          <div className="flex shrink-0 items-center gap-2">{filters}</div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2">
        {bulkMenu != null ? (
          <BulkActionsMenu enabled={hasSelection}>{bulkMenu}</BulkActionsMenu>
        ) : null}
        {addAction}
      </div>
    </div>
  );
}

type BulkActionsMenuProps = {
  enabled: boolean;
  children: ReactNode;
  disabledTooltip?: string;
  /** Extra classes for the trigger button (e.g. header contrast). */
  triggerClassName?: string;
};

export function BulkActionsMenu({
  enabled,
  children,
  disabledTooltip = "Select a row first",
  triggerClassName,
}: BulkActionsMenuProps) {
  const trigger = (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={!enabled}
      aria-label="Bulk actions"
      className={cn("shrink-0 text-muted-foreground", triggerClassName)}
    >
      <MoreVerticalIcon className="size-4" />
    </Button>
  );

  if (!enabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">{trigger}</span>
          </TooltipTrigger>
          <TooltipContent side="bottom">{disabledTooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-48 rounded-md p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col gap-0.5">{children}</div>
      </PopoverContent>
    </Popover>
  );
}
