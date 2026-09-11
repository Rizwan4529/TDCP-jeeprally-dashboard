import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type DialogCommonProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headerTitle: ReactNode;
  headerDescription?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function DialogCommon({
  open,
  onOpenChange,
  headerTitle,
  headerDescription,
  className,
  children,
}: DialogCommonProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[90vh] overflow-y-auto rounded-md sm:max-w-[480px]",
          className,
        )}
      >
        <DialogHeader className="h-fit">
          <DialogTitle>{headerTitle}</DialogTitle>
          {headerDescription ? (
            <DialogDescription>{headerDescription}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">
              {typeof headerTitle === "string" ? headerTitle : "Dialog"}
            </DialogDescription>
          )}
        </DialogHeader>
        <div>{children}</div>
      </DialogContent>
    </Dialog>
  );
}
