import type { ReactNode } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/common/Typography";
import { cn } from "@/lib/utils";

type DataTableCommonProps = {
  children: ReactNode;
  className?: string;
  tableClassName?: string;
};

export function DataTableCommon({
  children,
  className,
  tableClassName,
}: DataTableCommonProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-[#E8E8E8] bg-white",
        className,
      )}
    >
      <div className="min-h-0 flex-1 overflow-auto">
        <Table className={cn("w-full min-w-[640px]", tableClassName)}>
          {children}
        </Table>
      </div>
    </div>
  );
}

export function DataTableHeader({ children }: { children: ReactNode }) {
  return (
    <TableHeader className="sticky top-0 z-10 bg-[#3FA565]">
      {children}
    </TableHeader>
  );
}

export function DataTableHeaderRow({ children }: { children: ReactNode }) {
  return (
    <TableRow className="border-none bg-[#3FA565] hover:bg-[#3FA565]">
      {children}
    </TableRow>
  );
}

export function DataTableHead({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <TableHead
      className={cn(
        "h-11 px-4 text-xs font-semibold tracking-wide text-white uppercase",
        className,
      )}
    >
      {children}
    </TableHead>
  );
}

export function DataTableBody({ children }: { children: ReactNode }) {
  return <TableBody>{children}</TableBody>;
}

export function DataTableRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <TableRow className={cn("border-[#EDEEF4]", className)}>{children}</TableRow>
  );
}

export function DataTableCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <TableCell className={cn("px-4 py-3 text-sm text-[#25314D]", className)}>
      {children}
    </TableCell>
  );
}

export function DataTableEmpty({
  colSpan,
  message = "No results.",
}: {
  colSpan: number;
  message?: string;
}) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-32 text-center">
        <Typography variant="body-sm" className="text-muted-foreground">
          {message}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

export function DataTableLoading({
  colSpan,
  rows = 5,
}: {
  colSpan: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: colSpan }).map((__, j) => (
            <TableCell key={j} className="px-4 py-3">
              <Skeleton className="h-4 w-full rounded-md" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
