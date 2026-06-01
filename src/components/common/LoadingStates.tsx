import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Loader2Icon } from "lucide-react";

import {
  EmptyState,
  type EmptyStateSize,
  type EmptyStateVariant,
} from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DashboardPanelEmptyState({
  icon,
  title,
  description,
  variant = "default",
  className,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  variant?: EmptyStateVariant;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      variant={variant}
      size="default"
      action={action}
      className={className}
    />
  );
}

export type { EmptyStateSize, EmptyStateVariant };
export { EmptyState };

export function ButtonSpinner({ className }: { className?: string }) {
  return (
    <Loader2Icon
      className={cn("size-5 animate-spin", className)}
      aria-hidden
    />
  );
}

export function EventHeroSkeleton() {
  return (
    <section className="relative overflow-visible pt-3 pb-1">
      <div className="min-h-[200px] space-y-3 rounded-[10px] border border-[#EDEEF4] bg-[#F9FAFD] px-7 py-6 sm:px-9 sm:py-7">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-[85%] max-w-md" />
        <Skeleton className="h-4 w-24" />
        <div className="flex flex-wrap gap-3 pt-1">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-44" />
        </div>
        <div className="flex gap-6 pt-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-12" />
          ))}
        </div>
      </div>
      <Skeleton className="pointer-events-none absolute top-1/2 right-4 z-20 hidden h-[180px] w-[38%] min-w-[280px] -translate-y-1/2 rounded-lg md:block xl:right-10" />
    </section>
  );
}

export function EventScheduleRowSkeleton() {
  return (
    <div className="flex min-h-[62px] items-center gap-4 rounded-lg border border-[#DCDDE2] bg-gradient-to-r from-white to-[#FAFBFF] px-3">
      <Skeleton className="size-[50px] shrink-0 rounded-[4px]" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-[55%] max-w-[220px]" />
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
    </div>
  );
}

export function EventScheduleListSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-busy aria-label="Loading events">
      {Array.from({ length: count }, (_, i) => (
        <EventScheduleRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[#E0E0E0] bg-white">
      <div className="flex gap-4 p-4">
        <Skeleton className="size-[52px] shrink-0 rounded-[4px]" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-[70%]" />
          <Skeleton className="h-3 w-[85%]" />
          <div className="flex gap-3 pt-1">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
      <Skeleton className="h-28 w-full rounded-none" />
    </div>
  );
}

export function EventGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      aria-busy
      aria-label="Loading events"
    >
      {Array.from({ length: count }, (_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TeamsTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      className="overflow-hidden rounded-[12px] border border-[#EDEEF4]"
      aria-busy
      aria-label="Loading table"
    >
      <div className="flex gap-4 bg-[#3FA565]/20 px-4 py-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton
            key={i}
            className={cn(
              "h-3",
              i === 5 ? "ml-auto w-16" : "w-20",
            )}
          />
        ))}
      </div>
      <div className="divide-y divide-[#EEF0F7] bg-white">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="size-4 shrink-0 rounded-sm" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="hidden h-4 w-36 sm:block" />
            <Skeleton className="hidden h-4 w-24 md:block" />
            <Skeleton className="ml-auto h-8 w-24 rounded-[10px]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function VehicleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[#E0E0E0] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div className="flex gap-4 border-b border-[#E8E8E8] p-4">
        <Skeleton className="size-20 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="flex justify-end gap-2 p-4">
        <Skeleton className="h-9 w-20 rounded-[10px]" />
        <Skeleton className="h-9 w-20 rounded-[10px]" />
      </div>
    </div>
  );
}

export function VehicleGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      aria-busy
      aria-label="Loading vehicles"
    >
      {Array.from({ length: count }, (_, i) => (
        <VehicleCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Registration step 1 — category picker card */
export function RegistrationCategoryCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-md border border-[#E8E8E8] bg-white"
      aria-hidden
    >
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-[85%] max-w-[200px]" />
          <Skeleton className="h-3 w-36" />
        </div>
        <Skeleton className="size-5 shrink-0 rounded-full" />
      </div>
    </div>
  );
}

export function RegistrationCategoryGridSkeleton({
  count = 6,
}: {
  count?: number;
}) {
  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy
      aria-label="Loading categories"
    >
      {Array.from({ length: count }, (_, i) => (
        <RegistrationCategoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PanelBlockSkeleton({ lines = 2 }: { lines?: number }) {
  return (
    <div
      className="space-y-3 rounded-md border border-[#E8E8E8] bg-[#F9FAFD] p-4"
      aria-busy
    >
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === 0 ? "w-full" : "w-[80%]")}
        />
      ))}
    </div>
  );
}

export function SelectFieldSkeleton() {
  return (
    <div className="space-y-2" aria-busy>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-11 w-full rounded-[10px]" />
    </div>
  );
}

export function TextLineSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-4 w-40", className)} />;
}

export function StatsGridSkeleton() {
  return (
    <section
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-busy
      aria-label="Loading stats"
    >
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="flex h-[82px] items-center justify-between gap-4 rounded-lg border border-[#E0E0E0] bg-white px-5"
        >
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <Skeleton className="size-14 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          {i >= 2 ? <Skeleton className="size-12 shrink-0 rounded-lg" /> : null}
        </div>
      ))}
    </section>
  );
}

export function RankingTableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto" aria-busy aria-label="Loading rankings">
      <div className="flex gap-3 bg-[#F0F1F4]/80 px-3 py-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-3 w-14" />
        ))}
      </div>
      <div className="divide-y divide-[#E6E6E9]">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex gap-4 px-3 py-3">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="ml-auto h-4 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DriverSummarySkeleton() {
  return (
    <div
      className="grid items-center gap-5 sm:grid-cols-[1fr_auto]"
      aria-busy
      aria-label="Loading summary"
    >
      <div className="space-y-5">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <Skeleton className="size-2 rounded-full" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
      <Skeleton className="mx-auto size-[154px] rounded-full" />
    </div>
  );
}

export function ProgressChartSkeleton() {
  return (
    <div className="flex h-[190px] items-end gap-3 px-2 pb-6" aria-busy>
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton
          key={i}
          className="w-full max-w-[48px] flex-1 rounded-t-md"
          style={{ height: `${40 + (i % 3) * 28}%` }}
        />
      ))}
    </div>
  );
}
