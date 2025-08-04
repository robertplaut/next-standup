// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

import ThemeProvider from "@/components/theme-provider";
import { Toaster } from "sonner";
import AppSidebar from "@/components/app-sidebar";
import Topbar from "@/components/topbar";
import { createSupabaseRSCClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "next-standup",
  description: "Stand-up notes with Supabase + shadcn",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch auth on the server (RSC-safe client)
  const supabase = await createSupabaseRSCClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="min-h-dvh grid grid-cols-[16rem_1fr]">
            {/* Sidebar */}
            <aside className="border-r bg-background">
              {/* Pass signedIn so 'User List' appears only when logged in */}
              <AppSidebar signedIn={Boolean(user)} />
            </aside>

            {/* Main column */}
            <div className="flex min-h-dvh flex-col">
              {/* Topbar */}
              <Topbar />

              {/* Page content */}
              <main className="p-6">{children}</main>
            </div>
          </div>

          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
