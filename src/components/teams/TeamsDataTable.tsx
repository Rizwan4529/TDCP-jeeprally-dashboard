import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function TeamsDataTable({
  children,
  className,
  tableClassName,
}: {
  children: React.ReactNode;
  className?: string;
  /** Extra table classes (e.g. table-fixed for dense multi-column layouts) */
  tableClassName?: string;
}) {
  return (
    <div
      className={cn(
        "w-full max-w-full overflow-hidden rounded-md border border-[#EDEEF4]",
        "[&_[data-slot=table-container]]:overflow-x-hidden",
        className,
      )}
    >
      <Table className={cn("w-full", tableClassName)}>{children}</Table>
    </div>
  );
}

export function TeamsDataTableHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TableHeader>{children}</TableHeader>;
}

export function TeamsDataTableHeaderRow({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TableRow className="border-none bg-[#3FA565] hover:bg-[#3FA565]">
      {children}
    </TableRow>
  );
}

export function TeamsDataTableHead({
  children,
  className,
}: {
  children: React.ReactNode;
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

export function TeamsDataTableBody({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TableBody>{children}</TableBody>;
}

export { TableRow, TableCell };
