import { useEffect, useRef, useState } from "react";
import {
  CalendarDaysIcon,
  FlagIcon,
  MapPinIcon,
} from "lucide-react";

import { DashboardPanelEmptyState } from "@/components/common/LoadingStates";
import { Typography } from "@/components/common/Typography";
import type { RallyEvent } from "@/api/types/rally";
import {
  formatEventDateRangeHero,
} from "@/utils/dashboard-events";
import { cn } from "@/lib/utils";

type ActiveRallySummaryProps = {
  event: RallyEvent | null | undefined;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  variant?: "card" | "inline";
  className?: string;
};

export function ActiveRallySummary({
  event,
  isLoading,
  isError,
  errorMessage,
  variant = "card",
  className,
}: ActiveRallySummaryProps) {
  if (isLoading) {
    return variant === "inline" ? (
      <ActiveRallyInlineSkeleton />
    ) : (
      <ActiveRallyCardSkeleton className={className} />
    );
  }

  if (isError) {
    return (
      <DashboardPanelEmptyState
        icon={FlagIcon}
        title="Could not load active rally"
        description={
          errorMessage ??
          "The active rally event could not be loaded. Refresh the page or try again later."
        }
        variant="error"
        className={className}
      />
    );
  }

  if (!event) {
    return (
      <DashboardPanelEmptyState
        icon={FlagIcon}
        title="No active rally"
        description="There is no active rally open for registration right now. Please check back later."
        className={className}
      />
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "rounded-md border border-[#C8E6D4] bg-[#EAF6EF] px-4 py-3",
          className,
        )}
      >
        <Typography variant="label" className="text-[#6B7890]">
          Rally event
        </Typography>
        <Typography
          variant="body-lg"
          className="mt-1 font-semibold text-[#1F6B43]"
        >
          {event.name}
        </Typography>
        {event.edition_number > 0 ? (
          <Typography variant="body-sm" className="mt-0.5 text-[#1F6B43]/80">
            Edition {event.edition_number}
          </Typography>
        ) : null}
        <Typography variant="body-sm" className="mt-1 text-[#3d5c4a]">
          {event.location}
        </Typography>
      </div>
    );
  }

  const dateRange = formatEventDateRangeHero(event.date, event.end_date);
  const description = event.description?.trim() ?? "";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-[#C8E6D4] bg-gradient-to-br from-[#EAF6EF] to-white",
        className,
      )}
    >
      <div className="border-b border-[#C8E6D4]/80 bg-[#3FA565] px-3 py-2 sm:px-4">
        <Typography
          variant="caption"
          className="font-semibold uppercase tracking-wide text-white/90"
        >
          Active rally · open for registration
        </Typography>
      </div>
      <div className="space-y-2 p-3 sm:p-4">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <Typography
            as="h4"
            variant="body-lg"
            className="text-[16px] font-bold leading-tight text-[#1F1838] sm:text-[17px]"
          >
            {event.name}
          </Typography>
          {event.edition_number > 0 ? (
            <Typography
              variant="caption"
              className="font-semibold text-[#1F6B43]"
            >
              Edition {event.edition_number}
            </Typography>
          ) : null}
        </div>

        <div className="grid gap-1.5 text-[13px] text-[#4A5568] sm:grid-cols-2 sm:gap-3">
          <span className="inline-flex items-center gap-1.5 min-w-0">
            <CalendarDaysIcon
              className="size-3.5 shrink-0 text-[#3FA565]"
              aria-hidden
            />
            <span className="truncate font-medium text-[#25314D]">
              {dateRange}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 min-w-0">
            <MapPinIcon
              className="size-3.5 shrink-0 text-[#3FA565]"
              aria-hidden
            />
            <span className="truncate font-medium text-[#25314D]">
              {event.location}
            </span>
          </span>
        </div>

        {event.organiser ? (
          <Typography variant="caption" className="text-[#6B7890]">
            Organiser:{" "}
            <span className="font-medium text-[#25314D]">{event.organiser}</span>
          </Typography>
        ) : null}

        {description ? (
          <RallyDescription text={description} />
        ) : null}
      </div>
    </div>
  );
}

function RallyDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el || expanded) {
      return;
    }

    setCanExpand(el.scrollHeight > el.clientHeight + 1);
  }, [text, expanded]);

  const showToggle = canExpand || expanded;

  return (
    <div className="pt-0.5">
      <p
        ref={textRef}
        className={cn(
          "text-[13px] leading-snug text-[#6B7890]",
          !expanded && "line-clamp-2",
        )}
      >
        {text}
      </p>
      {showToggle ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-1 text-[12px] font-semibold text-[#1F6B43] hover:text-[#165A34] hover:underline"
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}

function ActiveRallyCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse overflow-hidden rounded-md border border-[#E8E8E8] bg-[#F9FAFD]",
        className,
      )}
      aria-busy
      aria-label="Loading active rally"
    >
      <div className="h-9 bg-[#E8E8E8]" />
      <div className="space-y-2 p-3 sm:p-4">
        <div className="h-5 w-3/4 max-w-sm rounded bg-[#E8E8E8]" />
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="h-4 w-full max-w-[180px] rounded bg-[#E8E8E8]" />
          <div className="h-4 w-full max-w-[180px] rounded bg-[#E8E8E8]" />
        </div>
        <div className="h-3 w-32 rounded bg-[#E8E8E8]" />
        <div className="h-8 w-full rounded bg-[#E8E8E8]" />
      </div>
    </div>
  );
}

function ActiveRallyInlineSkeleton() {
  return (
    <div
      className="animate-pulse rounded-md border border-[#E8E8E8] bg-[#F9FAFD] px-4 py-3"
      aria-busy
    >
      <div className="h-3 w-20 rounded bg-[#E8E8E8]" />
      <div className="mt-2 h-5 w-64 max-w-full rounded bg-[#E8E8E8]" />
      <div className="mt-2 h-4 w-40 rounded bg-[#E8E8E8]" />
    </div>
  );
}
