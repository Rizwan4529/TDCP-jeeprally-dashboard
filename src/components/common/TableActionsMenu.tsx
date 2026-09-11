import type { ReactNode } from "react";
import { MoreVerticalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type TableActionsMenuProps = {
  children: ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
};

export function TableActionsMenu({
  children,
  className,
  align = "end",
}: TableActionsMenuProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Open row actions"
          className={cn("text-muted-foreground", className)}
        >
          <MoreVerticalIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-44 rounded-md p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col gap-0.5">{children}</div>
      </PopoverContent>
    </Popover>
  );
}

type TableActionItemProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  destructive?: boolean;
  disabled?: boolean;
};

export function TableActionMenuItem({
  children,
  onClick,
  className,
  destructive,
  disabled,
}: TableActionItemProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors disabled:opacity-50",
        destructive
          ? "text-destructive hover:bg-destructive/10"
          : "text-foreground hover:bg-muted",
        className,
      )}
    >
      {children}
    </button>
  );
}
