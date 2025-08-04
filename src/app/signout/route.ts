// src/app/signout/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerActionClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerActionClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", "http://localhost:3000"));
}
