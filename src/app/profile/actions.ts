"use server";

import { createSupabaseServerActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServerActionClient();

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) redirect("/signin");

  const display_name = String(formData.get("display_name") || "").trim();
  const username = String(formData.get("username") || "").trim(); // read-only passthrough
  const email = String(formData.get("email") || "").trim();
  const team = String(formData.get("team") || "").trim();
  const role = String(formData.get("role") || "").trim();

  if (!display_name || !email || !team || !role) {
    return { ok: false, error: "All required fields must be filled." };
  }

  // 1) Update profile (display_name, team, role)
  const { error: upErr } = await supabase
    .from("profiles")
    .update({ display_name, team, role })
    .eq("id", user.id);
  if (upErr) return { ok: false, error: upErr.message };

  // 2) Update auth email if changed
  let emailUpdated = false;
  let emailError: string | null = null;
  if (email && email !== user.email) {
    const { error: emailErr } = await supabase.auth.updateUser({ email });
    if (emailErr) {
      // Surface exactly what we attempted and what GoTrue returned
      emailError = `Tried to set email to "${email}". Supabase said: ${emailErr.message}`;
    } else {
      emailUpdated = true;
    }
  }

  // 3) Read back saved profile (source of truth)
  const { data: saved, error: selErr } = await supabase
    .from("profiles")
    .select("username, display_name, team, role")
    .eq("id", user.id)
    .maybeSingle();

  if (selErr || !saved) {
    return { ok: false, error: selErr?.message || "Failed to reload profile." };
  }

  return {
    ok: true,
    profile: saved,
    emailUpdated,
    emailError, // null if OK
    message: emailUpdated
      ? "Profile saved. If you changed your email, check your inbox to confirm."
      : "Profile saved.",
  };
}
