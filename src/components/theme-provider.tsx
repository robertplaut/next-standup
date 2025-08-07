"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Wraps the app with next-themes.
 * Adds a custom “blue” theme on top of light / dark.
 */
export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      /** Limit to the themes we explicitly style */
      themes={["light", "dark", "blue"]}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
