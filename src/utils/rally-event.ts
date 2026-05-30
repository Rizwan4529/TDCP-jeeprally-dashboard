import type { RallyEvent, RallyEventCategory } from "@/api/types/rally";

export function getRallyEventId(event: RallyEvent | null | undefined): string {
  if (!event) return "";
  return event._id || event.id || "";
}

export function getRallyEventCategory(
  event: RallyEvent | null | undefined,
): RallyEventCategory | null {
  const c = event?.category;
  if (c && typeof c === "object" && "_id" in c) return c;
  return null;
}

export function getRallyEventCategoryTitle(
  event: RallyEvent | null | undefined,
): string | null {
  const cat = getRallyEventCategory(event);
  if (cat?.title) return cat.title;
  if (typeof event?.category === "string") return event.category;
  return null;
}
