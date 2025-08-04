// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerActionClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerActionClient();
    // Exchanges the auth code for a session and sets cookies
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL("/", request.url));
}
