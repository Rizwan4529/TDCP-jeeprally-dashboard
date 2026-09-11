import type { CategoryRecord } from "@/api/types/categories";
import type { RallyPricingRecord } from "@/api/types/rally";

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

export function formatRallyAmount(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return `Rs ${amount.toLocaleString("en-PK")}`;
}
