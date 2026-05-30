import type { ReactNode } from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const tableActionIconClass =
  "size-8 shrink-0 rounded-[10px] shadow-none [&_svg]:size-4";

export function TableRowIconButton({
  label,
  variant,
  onClick,
  disabled,
  className,
  children,
}: {
  label: string;
  variant: "primary-outline" | "destructive-outline";
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={variant}
      size="icon-sm"
      className={cn(tableActionIconClass, className)}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={() => void onClick()}
    >
      {children}
    </Button>
  );
}

type EditDeleteIconActionsProps = {
  editLabel?: string;
  deleteLabel?: string;
  onEdit: () => void;
  onDelete: () => void | Promise<void>;
  deleteDisabled?: boolean;
  editDisabled?: boolean;
  className?: string;
};

/** Consistent icon-only edit + delete controls for tables and cards. */
export function EditDeleteIconActions({
  editLabel = "Edit",
  deleteLabel = "Delete",
  onEdit,
  onDelete,
  deleteDisabled,
  editDisabled,
  className,
}: EditDeleteIconActionsProps) {
  return (
    <div className={cn("inline-flex flex-nowrap items-center gap-2", className)}>
      <TableRowIconButton
        label={editLabel}
        variant="primary-outline"
        onClick={onEdit}
        disabled={editDisabled}
      >
        <PencilIcon aria-hidden />
      </TableRowIconButton>
      <TableRowIconButton
        label={deleteLabel}
        variant="destructive-outline"
        onClick={onDelete}
        disabled={deleteDisabled}
      >
        <Trash2Icon aria-hidden />
      </TableRowIconButton>
    </div>
  );
}
