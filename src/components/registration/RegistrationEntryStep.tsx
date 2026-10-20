import {
  Building2Icon,
  CheckIcon,
  GaugeIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";

import { Typography } from "../common/Typography";
import { cn } from "../../lib/utils";
import type {
  RallyPricingRecord,
  RallyType,
  RegistrationEntryMode,
} from "../../api/types/rally";
import { toPublicFileUrl } from "../../utils/helpers";
import {
  formatRallyAmount,
  getPricingAmounts,
} from "../../utils/rally-pricing";
import { refId } from "../../utils/rally-team-options";

export type EntryCategoryOption = {
  key: string;
  value: string;
  categoryId: string;
  title: string;
  hint: string;
  imageUrl?: string | null;
  rosterHint?: string;
  ccRange?: string;
  typeId: string;
  individualAmount: number;
  sponsorAmount: number;
  alreadyRegistered: boolean;
};

type RegistrationEntryStepProps = {
  types: RallyType[];
  categories: EntryCategoryOption[];
  selectedTypeId: string | null;
  selectedCategoryKey: string | null;
  entryMode: RegistrationEntryMode | null;
  onSelectType: (typeId: string) => void;
  onSelectCategory: (categoryKey: string) => void;
  onSelectEntryMode: (mode: RegistrationEntryMode) => void;
  selectedPricing?: RallyPricingRecord;
};

const TYPE_FALLBACK_COPY: Record<string, string> = {
  prepared:
    "Modified and competition-prepared vehicles built for desert stages.",
  stock: "Near-factory vehicles with limited modifications allowed.",
  bike: "Two-wheel entries for the bike classes.",
  veteran: "Experienced crews and classic rally machines.",
  women: "Women’s class for competing drivers and navigators.",
};

function typeAccent(key: string | undefined): string {
  switch (key) {
    case "prepared":
      return "from-[#B44423]/15 to-[#F4E8E2]";
    case "stock":
      return "from-[#1F4B7A]/12 to-[#E8EEF5]";
    case "bike":
      return "from-[#2F6B4F]/12 to-[#E7F2EC]";
    case "veteran":
      return "from-[#6B5A2E]/12 to-[#F3EFE4]";
    case "women":
      return "from-[#8B3A5C]/12 to-[#F6E9EF]";
    default:
      return "from-[#B44423]/10 to-[#F5F0EC]";
  }
}

function formatCcRange(
  minCC?: number | null,
  maxCC?: number | null,
): string | undefined {
  if (minCC == null && maxCC == null) return undefined;
  if (minCC != null && maxCC == null) return `${minCC.toLocaleString()}+ CC`;
  if (minCC == null && maxCC != null) return `Up to ${maxCC.toLocaleString()} CC`;
  return `${minCC!.toLocaleString()}–${maxCC!.toLocaleString()} CC`;
}

export function buildEntryCategoryOptions(
  pricingRows: RallyPricingRecord[] | undefined,
  myRegistrationsCheck: (args: {
    categoryKey: string;
    categoryId: string;
  }) => boolean,
  rosterHintFor: (row: RallyPricingRecord) => string | undefined,
): EntryCategoryOption[] {
  if (!pricingRows?.length) return [];
  return pricingRows
    .filter((row) => {
      const c = row.category_id;
      if (!c?.key || !c._id) return false;
      if (c.status && c.status !== "active") return false;
      return true;
    })
    .map((row) => {
      const c = row.category_id;
      const amounts = getPricingAmounts(row);
      const typeId = refId(c.typeId ?? null);
      return {
        key: c.key,
        value: c.key,
        categoryId: c._id,
        title: c.title,
        hint: c.description?.trim() || "",
        imageUrl: toPublicFileUrl(c.image ?? null),
        rosterHint: rosterHintFor(row),
        ccRange: formatCcRange(c.minCC, c.maxCC),
        typeId,
        individualAmount: amounts.individual,
        sponsorAmount: amounts.sponsor,
        alreadyRegistered: myRegistrationsCheck({
          categoryKey: c.key,
          categoryId: c._id,
        }),
      };
    });
}

export function RegistrationEntryStep({
  types,
  categories,
  selectedTypeId,
  selectedCategoryKey,
  entryMode,
  onSelectType,
  onSelectCategory,
  onSelectEntryMode,
  selectedPricing,
}: RegistrationEntryStepProps) {
  const filteredCategories = selectedTypeId
    ? categories.filter((c) => c.typeId === selectedTypeId)
    : [];
  const selectedCategory = filteredCategories.find(
    (c) => c.value === selectedCategoryKey,
  );
  const amounts = getPricingAmounts(selectedPricing);
  const payable =
    entryMode === "sponsor"
      ? amounts.sponsor
      : entryMode === "individual"
        ? amounts.individual
        : null;

  return (
    <div className="space-y-8">
      {/* Type */}
      <section className="space-y-3">
        <div className="space-y-1">
          <Typography
            as="h3"
            variant="body-lg"
            className="text-[17px] font-semibold text-[#25314D]"
          >
            1. Vehicle type
          </Typography>
          <Typography variant="body-sm" className="text-[#8B96AD]">
            Pick the class of vehicle you will compete with.
          </Typography>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((type) => {
            const active = type._id === selectedTypeId;
            const imageUrl = toPublicFileUrl(type.image ?? null);
            const description =
              type.description?.trim() ||
              TYPE_FALLBACK_COPY[type.key] ||
              "Rally vehicle type for this event.";
            return (
              <button
                key={type._id}
                type="button"
                onClick={() => onSelectType(type._id)}
                className={cn(
                  "group relative overflow-hidden rounded-md border text-left transition-all duration-200",
                  active
                    ? "border-primary shadow-[0_8px_24px_rgba(180,68,35,0.12)] ring-1 ring-primary/30"
                    : "border-[#E4E7EE] bg-white hover:border-[#C9CFDA] hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)]",
                )}
              >
                <div
                  className={cn(
                    "relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br",
                    typeAccent(type.key),
                  )}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt=""
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex size-full flex-col justify-between p-4">
                      <span className="text-[11px] font-semibold tracking-[0.14em] text-[#6B7890]">
                        TYPE
                      </span>
                      <span className="text-[42px] font-semibold leading-none tracking-tight text-[#25314D]/80">
                        {type.name.slice(0, 1)}
                      </span>
                    </div>
                  )}
                  {active ? (
                    <span className="absolute top-3 right-3 grid size-6 place-items-center rounded-full bg-primary text-white shadow">
                      <CheckIcon className="size-3.5" strokeWidth={3} />
                    </span>
                  ) : null}
                </div>
                <div className="space-y-1.5 p-4">
                  <Typography
                    as="div"
                    variant="body-lg"
                    className={cn(
                      "text-[16px] font-semibold leading-none",
                      active ? "text-primary" : "text-[#25314D]",
                    )}
                  >
                    {type.name}
                  </Typography>
                  <Typography
                    variant="body-sm"
                    className="line-clamp-2 text-[13px] leading-snug text-[#6B7890]"
                  >
                    {description}
                  </Typography>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Category */}
      <section
        className={cn(
          "space-y-3 transition-opacity",
          selectedTypeId ? "opacity-100" : "pointer-events-none opacity-45",
        )}
      >
        <div className="space-y-1">
          <Typography
            as="h3"
            variant="body-lg"
            className="text-[17px] font-semibold text-[#25314D]"
          >
            2. Category
          </Typography>
          <Typography variant="body-sm" className="text-[#8B96AD]">
            {selectedTypeId
              ? "Categories available for your selected type."
              : "Select a vehicle type to see categories."}
          </Typography>
        </div>

        {selectedTypeId && filteredCategories.length === 0 ? (
          <div className="rounded-md border border-dashed border-[#D7DAE1] bg-[#F9FAFD] px-4 py-6 text-center">
            <Typography variant="body-sm" className="text-[#6B7890]">
              No active priced categories for this type right now.
            </Typography>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((c) => {
              const active = c.value === selectedCategoryKey;
              const blocked = c.alreadyRegistered;
              return (
                <button
                  key={c.categoryId}
                  type="button"
                  aria-disabled={blocked}
                  onClick={() => {
                    if (!blocked) onSelectCategory(c.value);
                  }}
                  className={cn(
                    "overflow-hidden rounded-md border text-left transition-all duration-200",
                    blocked
                      ? "cursor-not-allowed border-[#E8E8E8] bg-[#F4F5F8] opacity-60"
                      : active
                        ? "border-primary bg-primary/[0.06] shadow-[0_8px_22px_rgba(180,68,35,0.1)] ring-1 ring-primary/25"
                        : "border-[#E4E7EE] bg-white hover:border-[#C9CFDA]",
                  )}
                >
                  {c.imageUrl ? (
                    <div className="aspect-[16/10] w-full overflow-hidden border-b border-[#E8E8E8] bg-[#F3F4F8]">
                      <img
                        src={c.imageUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0 space-y-2">
                      <Typography
                        as="div"
                        variant="body-lg"
                        className={cn(
                          "text-[16px] font-semibold leading-none",
                          blocked
                            ? "text-[#6B7890]"
                            : active
                              ? "text-primary"
                              : "text-[#25314D]",
                        )}
                      >
                        {c.title}
                      </Typography>
                      <div className="flex flex-wrap gap-1.5">
                        {c.ccRange ? (
                          <span className="inline-flex items-center gap-1 rounded border border-[#E4E7EE] bg-[#F9FAFD] px-2 py-0.5 text-[11px] font-medium text-[#5B6785]">
                            <GaugeIcon className="size-3" />
                            {c.ccRange}
                          </span>
                        ) : null}
                        {c.rosterHint ? (
                          <span className="inline-flex items-center gap-1 rounded border border-[#E4E7EE] bg-[#F9FAFD] px-2 py-0.5 text-[11px] font-medium text-[#5B6785]">
                            <UsersIcon className="size-3" />
                            {c.rosterHint}
                          </span>
                        ) : null}
                      </div>
                      {blocked ? (
                        <Typography
                          variant="body-sm"
                          className="text-[12px] font-medium text-[#9A6B00]"
                        >
                          Already registered for this event
                        </Typography>
                      ) : null}
                      {c.hint ? (
                        <Typography
                          variant="body-sm"
                          className="line-clamp-2 text-[13px] text-[#8B96AD]"
                        >
                          {c.hint}
                        </Typography>
                      ) : null}
                    </div>
                    <span
                      className={cn(
                        "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border",
                        blocked
                          ? "border-[#D7DAE1] bg-[#E8E8E8]"
                          : active
                            ? "border-primary bg-primary text-white"
                            : "border-[#D7DAE1] bg-white",
                      )}
                    >
                      <CheckIcon className="size-3" strokeWidth={3} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Entry mode + fee */}
      <section
        className={cn(
          "space-y-3 transition-opacity",
          selectedCategory
            ? "opacity-100"
            : "pointer-events-none opacity-45",
        )}
      >
        <div className="space-y-1">
          <Typography
            as="h3"
            variant="body-lg"
            className="text-[17px] font-semibold text-[#25314D]"
          >
            3. Entry as
          </Typography>
          <Typography variant="body-sm" className="text-[#8B96AD]">
            Choose how you are entering — the fee updates below.
          </Typography>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(
            [
              {
                mode: "individual" as const,
                label: "Individual",
                description: "Self-funded competitor entry.",
                icon: UserIcon,
                amount: selectedCategory?.individualAmount ?? amounts.individual,
              },
              {
                mode: "sponsor" as const,
                label: "Sponsor",
                description: "Sponsored / supported entry rate.",
                icon: Building2Icon,
                amount: selectedCategory?.sponsorAmount ?? amounts.sponsor,
              },
            ] as const
          ).map((option) => {
            const active = entryMode === option.mode;
            const Icon = option.icon;
            const disabled = !selectedCategory;
            return (
              <button
                key={option.mode}
                type="button"
                disabled={disabled}
                onClick={() => onSelectEntryMode(option.mode)}
                className={cn(
                  "flex items-start gap-3 rounded-md border p-4 text-left transition-all duration-200",
                  active
                    ? "border-primary bg-primary/[0.06] ring-1 ring-primary/25"
                    : "border-[#E4E7EE] bg-white hover:border-[#C9CFDA]",
                )}
              >
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-md",
                    active
                      ? "bg-primary text-white"
                      : "bg-[#F4F5F8] text-[#5B6785]",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <Typography
                      as="div"
                      variant="body-lg"
                      className={cn(
                        "text-[15px] font-semibold",
                        active ? "text-primary" : "text-[#25314D]",
                      )}
                    >
                      {option.label}
                    </Typography>
                    <Typography
                      as="div"
                      variant="body-lg"
                      className={cn(
                        "text-[15px] font-semibold tabular-nums",
                        active ? "text-primary" : "text-[#25314D]",
                      )}
                    >
                      {formatRallyAmount(option.amount)}
                    </Typography>
                  </div>
                  <Typography
                    variant="body-sm"
                    className="text-[13px] text-[#6B7890]"
                  >
                    {option.description}
                  </Typography>
                </div>
              </button>
            );
          })}
        </div>

        {selectedCategory && entryMode && payable != null ? (
          <div className="flex flex-col gap-2 rounded-md border border-[#E4E7EE] bg-[linear-gradient(135deg,#FFF8F4_0%,#FFFFFF_55%)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <Typography
                variant="body-sm"
                className="text-[12px] font-medium tracking-wide text-[#8B96AD]"
              >
                Amount to pay
              </Typography>
              <Typography
                as="div"
                variant="body-lg"
                className="text-[15px] text-[#5B6785]"
              >
                {selectedCategory.title} ·{" "}
                {entryMode === "sponsor" ? "Sponsor" : "Individual"}
              </Typography>
            </div>
            <Typography
              as="div"
              variant="h5"
              className="text-[28px] font-semibold tabular-nums text-primary"
            >
              {formatRallyAmount(payable)}
            </Typography>
          </div>
        ) : null}
      </section>
    </div>
  );
}
