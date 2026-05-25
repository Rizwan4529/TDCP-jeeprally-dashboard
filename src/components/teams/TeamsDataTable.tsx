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
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-[12px] border border-[#EDEEF4]",
        className,
      )}
    >
      <Table className="min-w-[720px]">{children}</Table>
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
