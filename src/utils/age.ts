/**
 * Age in completed years from a date of birth ("YYYY-MM-DD" or an ISO timestamp).
 * The backend still stores `age`, so forms collect only the date of birth and send this.
 * Returns "" for a missing / invalid / future date.
 */
export function calculateAge(
  dateOfBirth: string | null | undefined,
  today: Date = new Date(),
): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dateOfBirth ?? "").trim());
  if (!match) return "";
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  let age = today.getFullYear() - year;
  const month0 = today.getMonth() + 1;
  if (month0 < month || (month0 === month && today.getDate() < day)) age -= 1;

  return age >= 0 && age < 150 ? String(age) : "";
}
