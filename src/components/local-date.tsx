"use client";

/**
 * Format a YYYY-MM-DD string as a local date *without* timezone shifts.
 * We construct a local Date(year, monthIndex, day) to avoid UTC offsets.
 */
export default function LocalDate({ date }: { date: string }) {
  // Expect "YYYY-MM-DD"
  let display = date;
  try {
    const [y, m, d] = date.split("-").map((n) => parseInt(n, 10));
    const dt = new Date(y, (m ?? 1) - 1, d ?? 1); // local time
    display = dt.toLocaleDateString();
  } catch {}
  return <time dateTime={date}>{display}</time>;
}
