"use client";

import { useEffect, useState } from "react";

/**
 * Renders a timestamp using the user's local timezone/locale *on the client*.
 * This avoids SSR/CSR text mismatches (e.g., different locale or timezone).
 */
export default function LocalTime({ iso }: { iso: string }) {
  const [text, setText] = useState<string>(iso);

  useEffect(() => {
    try {
      const d = new Date(iso);
      setText(d.toLocaleString());
    } catch {
      setText(iso);
    }
  }, [iso]);

  return (
    <time dateTime={iso} suppressHydrationWarning>
      {text}
    </time>
  );
}
