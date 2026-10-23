import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  DownloadIcon,
  Loader2Icon,
} from "lucide-react";

import {
  EmptyState,
  PanelBlockSkeleton,
} from "@/components/common/LoadingStates";
import { PageHeader } from "@/components/common/NavigationCommon";
import { Typography } from "@/components/common/Typography";
import {
  SCROLL_PAGE,
  SIDEBAR_PAGE_PADDING,
} from "@/components/layout/pageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRegistrationByIdQuery } from "@/hooks/api/use-registrations";
import { useRegistrationReceiptDownload } from "@/hooks/use-registration-receipt";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/utils/constants";
import {
  buildRegistrationReceipt,
  type ReceiptPaymentTone,
  // type ReceiptRow,
} from "@/utils/registration-receipt";

const surface = "bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]";

const PAYMENT_BADGE: Record<ReceiptPaymentTone, string> = {
  paid: "border-[#BFE3CF] bg-[#E7F5EE] text-[#1F7A4D]",
  free: "border-[#F0DFA8] bg-[#FFF8E8] text-[#9A6B00]",
  unknown: "border-[#E8E8E8] bg-[#F9FAFD] text-[#6B7890]",
};

export default function RegistrationSuccessPage() {
  const { id = "" } = useParams<{ id: string }>();
  const query = useRegistrationByIdQuery(id);
  const registration = query.data?.data ?? null;
  const receipt = useMemo(
    () => (registration ? buildRegistrationReceipt(registration) : null),
    [registration],
  );
  const { download, pendingId } = useRegistrationReceiptDownload();
  const downloading = pendingId === id;

  return (
    <div className={cn(SCROLL_PAGE, SIDEBAR_PAGE_PADDING)}>
      <div className="space-y-6 pb-6">
        <PageHeader title="Registration" />

        {query.isLoading ? (
          <Card className={cn(surface, "rounded-md p-6")}>
            <PanelBlockSkeleton lines={6} />
          </Card>
        ) : query.isError || !registration || !receipt ? (
          <EmptyState
            icon={AlertCircleIcon}
            title="Could not load this registration"
            description={
              query.error?.message ??
              "Your entry may still have been saved. Check My entries."
            }
            variant="error"
            action={
              <Button asChild>
                <Link to={ROUTES.MY_REGISTRATIONS}>Go to My entries</Link>
              </Button>
            }
          />
        ) : (
          <>
            <Card className={cn(surface, "overflow-hidden rounded-md")}>
              <div className="flex flex-col items-center gap-4 px-6 py-8 text-center sm:px-10">
                <div className="flex size-16 items-center justify-center rounded-full bg-[#E7F5EE]">
                  <CheckCircle2Icon className="size-9 text-[#1F7A4D]" />
                </div>
                <div className="space-y-2">
                  <Typography
                    as="h2"
                    variant="h4"
                    className="text-[24px] font-semibold text-[#1F1838] sm:text-[28px]"
                  >
                    Registration successful
                  </Typography>
                  <Typography
                    variant="body-sm"
                    className="mx-auto max-w-xl text-[#6B7890]"
                  >
                    Your entry for{" "}
                    <span className="font-semibold text-[#25314D]">
                      {receipt.rallyName}
                    </span>{" "}
                    has been submitted. You&apos;ll be notified once the
                    organisers review it.
                  </Typography>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold uppercase tracking-wide",
                      PAYMENT_BADGE[receipt.payment.tone],
                    )}
                  >
                    {receipt.payment.statusLabel}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-primary">
                    Registration: {receipt.registrationStatus}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#E8E8E8] bg-[#F9FAFD] px-6 py-5 sm:px-10">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <SummaryItem
                    label="Amount"
                    value={receipt.payment.amountLabel}
                    emphasis
                  />
                  <SummaryItem
                    label="Registered as"
                    value={receipt.entryModeLabel ?? "—"}
                  />
                  {receipt.payment.rows
                    .filter((row) =>
                      ["Order ID", "Transaction ID", "Paid on"].includes(
                        row.label,
                      ),
                    )
                    .map((row) => (
                      <SummaryItem
                        key={row.label}
                        label={row.label}
                        value={row.value}
                      />
                    ))}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#E8E8E8] px-6 py-5 sm:flex-row sm:justify-end sm:px-10">
                <Button asChild variant="outline">
                  <Link to={ROUTES.DASHBOARD}>Go to dashboard</Link>
                </Button>
                <Button asChild variant="primary-outline">
                  <Link to={ROUTES.MY_REGISTRATIONS}>
                    <ClipboardListIcon className="size-4" />
                    View my entries
                  </Link>
                </Button>
                <Button
                  type="button"
                  disabled={downloading}
                  onClick={() => void download(id, registration)}
                >
                  {downloading ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <DownloadIcon className="size-4" />
                  )}
                  {downloading ? "Preparing PDF…" : "Download receipt (PDF)"}
                </Button>
              </div>
            </Card>

            {/* Detail cards hidden; the full details are in the receipt PDF.
            <div className="grid gap-6 lg:grid-cols-2">
              {receipt.sections.map((section) => (
                <DetailCard
                  key={section.title}
                  title={section.title}
                  rows={section.rows}
                />
              ))}
            </div>

            {receipt.people.length > 0 ? (
              <div className="space-y-3">
                <Typography
                  as="h3"
                  variant="label"
                  className="text-[14px] font-bold tracking-wide text-[#1F1838] uppercase"
                >
                  Team
                </Typography>
                <div className="grid gap-6 lg:grid-cols-2">
                  {receipt.people.map((person) => (
                    <DetailCard
                      key={person.role}
                      title={person.role}
                      subtitle={person.name}
                      rows={person.rows}
                    />
                  ))}
                </div>
              </div>
            ) : null} */}
          </>
        )}
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="min-w-0">
      <Typography
        as="p"
        variant="caption"
        className="text-[11px] tracking-wide text-[#8A95B5] uppercase"
      >
        {label}
      </Typography>
      <p
        className={cn(
          "truncate text-[#1F1838]",
          emphasis ? "text-[20px] font-semibold" : "text-[14px] font-medium",
        )}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

// function DetailCard({
//   title,
//   subtitle,
//   rows,
// }: {
//   title: string;
//   subtitle?: string;
//   rows: ReceiptRow[];
// }) {
//   return (
//     <Card className={cn(surface, "rounded-md")}>
//       <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#E8E8E8] px-5 py-4">
//         <Typography
//           as="h3"
//           variant="label"
//           className="text-[13px] font-bold tracking-wide text-primary uppercase"
//         >
//           {title}
//         </Typography>
//         {subtitle ? (
//           <span className="text-[14px] font-semibold text-[#1F1838]">
//             {subtitle}
//           </span>
//         ) : null}
//       </div>
//       <dl className="grid gap-x-6 gap-y-4 px-5 py-4 sm:grid-cols-2">
//         {rows.map((row) => (
//           <div key={row.label} className="min-w-0">
//             <dt className="text-[11px] tracking-wide text-[#8A95B5] uppercase">
//               {row.label}
//             </dt>
//             <dd className="mt-0.5 text-[14px] break-words text-[#1F1838]">
//               {row.value}
//             </dd>
//           </div>
//         ))}
//       </dl>
//     </Card>
//   );
// }
