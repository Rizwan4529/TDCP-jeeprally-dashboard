import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Typography } from "@/components/common/Typography";
import { cn } from "@/lib/utils";

export type EmptyStateVariant = "default" | "error" | "muted";
export type EmptyStateSize = "compact" | "default" | "page";

const sizeStyles: Record<
  EmptyStateSize,
  {
    shell: string;
    iconWrap: string;
    icon: string;
    title: string;
    description: string;
    gap: string;
  }
> = {
  compact: {
    shell: "min-h-[160px] px-5 py-8",
    iconWrap: "size-14 rounded-2xl",
    icon: "size-6",
    title: "text-[14px]",
    description: "text-[13px]",
    gap: "mt-3",
  },
  default: {
    shell: "min-h-[200px] px-6 py-10",
    iconWrap: "size-[4.5rem] rounded-[1.35rem]",
    icon: "size-7",
    title: "text-[15px]",
    description: "text-[13px]",
    gap: "mt-4",
  },
  page: {
    shell: "min-h-[min(72vh,640px)] px-6 py-12",
    iconWrap: "size-24 rounded-[1.75rem]",
    icon: "size-11",
    title: "text-[22px]",
    description: "text-[15px]",
    gap: "mt-5",
  },
};

const variantStyles: Record<
  EmptyStateVariant,
  {
    shell: string;
    halo: string;
    iconWrap: string;
    icon: string;
    title: string;
    description: string;
  }
> = {
  default: {
    shell: "border-[#DDE3EC] bg-[linear-gradient(180deg,#FCFDFE_0%,#F5F8FC_100%)]",
    halo: "bg-[#3FA565]/10",
    iconWrap:
      "bg-[linear-gradient(145deg,#EAF6EF_0%,#D7EFE2_100%)] text-[#2F8F57] shadow-[0_10px_24px_rgba(63,165,101,0.14)] ring-1 ring-[#3FA565]/20",
    icon: "text-[#319F60]",
    title: "text-[#1F1838]",
    description: "text-[#6B7890]",
  },
  muted: {
    shell: "border-[#E4E8EF] bg-[#FAFBFD]",
    halo: "bg-[#94A3B8]/10",
    iconWrap:
      "bg-[linear-gradient(145deg,#F3F5F9_0%,#E8ECF2_100%)] text-[#64748B] shadow-[0_8px_20px_rgba(15,23,42,0.06)] ring-1 ring-[#CBD5E1]/80",
    icon: "text-[#64748B]",
    title: "text-[#25314D]",
    description: "text-[#6B7890]",
  },
  error: {
    shell: "border-[#F2D6D6] bg-[linear-gradient(180deg,#FFF8F8_0%,#FFF1F1_100%)]",
    halo: "bg-[#EF4444]/10",
    iconWrap:
      "bg-[linear-gradient(145deg,#FEE2E2_0%,#FECACA_100%)] text-[#B91C1C] shadow-[0_10px_24px_rgba(239,68,68,0.12)] ring-1 ring-[#FCA5A5]/70",
    icon: "text-[#B91C1C]",
    title: "text-[#8B2B2B]",
    description: "text-[#B45353]",
  },
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  variant = "default",
  size = "default",
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  variant?: EmptyStateVariant;
  size?: EmptyStateSize;
  action?: ReactNode;
  className?: string;
}) {
  const sizing = sizeStyles[size];
  const tones = variantStyles[variant];

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center rounded-2xl border border-dashed text-center",
        sizing.shell,
        tones.shell,
        className,
      )}
    >
      <div className="relative flex items-center justify-center">
        <span
          aria-hidden
          className={cn(
            "absolute size-[4.5rem] rounded-full blur-[1px]",
            sizing.iconWrap.includes("size-24") && "size-[7.5rem]",
            sizing.iconWrap.includes("size-14") && "size-[3.75rem]",
            tones.halo,
          )}
        />
        <span
          className={cn(
            "relative flex items-center justify-center",
            sizing.iconWrap,
            tones.iconWrap,
          )}
        >
          <Icon
            className={cn(sizing.icon, tones.icon)}
            strokeWidth={1.75}
            aria-hidden
          />
        </span>
      </div>

      <Typography
        as="p"
        variant="label"
        className={cn(
          "font-semibold tracking-tight",
          sizing.gap,
          sizing.title,
          tones.title,
        )}
      >
        {title}
      </Typography>

      {description ? (
        <div
          className={cn(
            "mt-1.5 max-w-[34rem] leading-relaxed",
            sizing.description,
            tones.description,
          )}
        >
          {typeof description === "string" ? (
            <Typography as="p" variant="body-sm" className="text-inherit">
              {description}
            </Typography>
          ) : (
            description
          )}
        </div>
      ) : null}

      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
