import type { CategoryRecord } from "../api/types/categories";
import type {
  RallyPricingRecord,
  RegistrationEntryMode,
} from "../api/types/rally";

/** Flatten pricing rows into CategoryRecord[] for roster / consent helpers. */
export function pricingToCategoryRecords(
  pricing: RallyPricingRecord[] | undefined | null,
): CategoryRecord[] {
  if (!pricing?.length) return [];

  const records: CategoryRecord[] = [];
  for (const item of pricing) {
    const cat = item.category_id;
    if (!cat || typeof cat !== "object" || !cat._id || !cat.key) continue;
    records.push({
      _id: cat._id,
      title: cat.title,
      key: cat.key,
      image: cat.image ?? null,
      description: cat.description ?? null,
      max_members: cat.max_members ?? 0,
      navigator_allowed: Boolean(cat.navigator_allowed),
      consent: cat.consent ?? null,
      created_at: cat.created_at,
      updated_at: cat.updated_at,
    });
  }
  return records;
}

export function findPricingByCategoryKey(
  pricing: RallyPricingRecord[] | undefined | null,
  categoryKey: string | null | undefined,
): RallyPricingRecord | undefined {
  if (!pricing?.length || !categoryKey) return undefined;
  return pricing.find((item) => item.category_id?.key === categoryKey);
}

/** Prefer new dual amounts; fall back to legacy single `amount`. */
export function getPricingAmounts(row: RallyPricingRecord | undefined | null): {
  individual: number;
  sponsor: number;
} {
  if (!row) return { individual: 0, sponsor: 0 };
  const legacy =
    typeof row.amount === "number" && !Number.isNaN(row.amount) ? row.amount : 0;
  const individual =
    typeof row.individual_amount === "number" &&
    !Number.isNaN(row.individual_amount)
      ? row.individual_amount
      : legacy;
  const sponsor =
    typeof row.sponsor_amount === "number" && !Number.isNaN(row.sponsor_amount)
      ? row.sponsor_amount
      : 0;
  return { individual, sponsor };
}

export function getAmountForEntryMode(
  row: RallyPricingRecord | undefined | null,
  mode: RegistrationEntryMode | null | undefined,
): number {
  const { individual, sponsor } = getPricingAmounts(row);
  if (mode === "sponsor") return sponsor;
  if (mode === "individual") return individual;
  return 0;
}

export function formatRallyAmount(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return `Rs ${amount.toLocaleString("en-PK")}`;
}
