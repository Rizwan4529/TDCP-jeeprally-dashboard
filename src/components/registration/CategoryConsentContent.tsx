import { Typography } from "@/components/common/Typography";
import { cn } from "@/lib/utils";

type CategoryConsentContentProps = {
  html: string | null | undefined;
  className?: string;
};

/** Renders category-specific consent HTML from the categories API. */
export function CategoryConsentContent({
  html,
  className,
}: CategoryConsentContentProps) {
  const trimmed = html?.trim() ?? "";

  if (!trimmed) {
    return (
      <Typography variant="body-sm" className="text-[#8B2B2B]">
        Consent text is not available for this category. Please contact support
        or try again later.
      </Typography>
    );
  }

  return (
    <div
      className={cn(
        "category-consent-html max-h-[min(420px,50vh)] overflow-y-auto pr-1 text-[14px] leading-[1.5] text-[#686868] sm:text-[15px]",
        "[&_p]:mb-3 [&_p:last-child]:mb-0",
        "[&_br]:block [&_br]:content-['']",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: trimmed }}
    />
  );
}
