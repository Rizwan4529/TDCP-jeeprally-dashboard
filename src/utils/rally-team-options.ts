import type { RallyEvent, RallyTeamCategory, RallyType } from "@/api/types/rally";

function isActive(status: string | undefined): boolean {
  return !status || status === "active";
}

/** Id of a value that may be an id string or a populated `{ _id }` object. */
export function refId(value: string | { _id: string } | null | undefined): string {
  if (!value) return "";
  return typeof value === "string" ? value : value._id;
}

export function getCategoryTypeId(category: RallyTeamCategory): string {
  return refId(category.typeId ?? null);
}

function getRallyCategories(event: RallyEvent | null | undefined): RallyTeamCategory[] {
  return Array.isArray(event?.categories)
    ? event.categories.filter((c) => isActive(c.status))
    : [];
}

/** Active rally types; falls back to the types embedded in its categories. */
export function getRallyTypes(event: RallyEvent | null | undefined): RallyType[] {
  const listed = Array.isArray(event?.types)
    ? event.types.filter((t) => isActive(t.status))
    : [];
  if (listed.length > 0) return listed;

  const byId = new Map<string, RallyType>();
  for (const category of getRallyCategories(event)) {
    const type = category.typeId;
    if (type && typeof type === "object" && isActive(type.status)) {
      byId.set(type._id, type);
    }
  }
  return [...byId.values()];
}

/** Finds a rally type by id or key (my-teams returns the key). */
export function findRallyType(
  event: RallyEvent | null | undefined,
  value: string | undefined,
): RallyType | undefined {
  if (!value) return undefined;
  return getRallyTypes(event).find((t) => t._id === value || t.key === value);
}

export function getRallyCategoriesForType(
  event: RallyEvent | null | undefined,
  typeId: string,
): RallyTeamCategory[] {
  if (!typeId) return [];
  return getRallyCategories(event).filter((c) => getCategoryTypeId(c) === typeId);
}

/** Type id of the rally category matching this id or key ("" when unknown). */
export function getTypeIdForCategory(
  event: RallyEvent | null | undefined,
  categoryValue: string | undefined,
): string {
  const category = findRallyCategory(event, categoryValue);
  return category ? getCategoryTypeId(category) : "";
}

/** Finds a rally category by id or key (teams may store either). */
export function findRallyCategory(
  event: RallyEvent | null | undefined,
  value: string | undefined,
): RallyTeamCategory | undefined {
  if (!value) return undefined;
  return getRallyCategories(event).find((c) => c._id === value || c.key === value);
}
