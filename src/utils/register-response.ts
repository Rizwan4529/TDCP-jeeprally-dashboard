/** Best-effort parse of newly registered user id from `/auth/register` envelope. */
export function extractRegisteredUserId(res: unknown): string | null {
  if (!res || typeof res !== "object") return null;
  const envelope = res as { data?: unknown };
  const data = envelope.data;
  if (!data || typeof data !== "object") return null;
  const d = data as { user?: { _id?: string }; _id?: string };
  if (d.user && typeof d.user === "object" && typeof d.user._id === "string") {
    return d.user._id;
  }
  if (typeof d._id === "string") return d._id;
  return null;
}
