"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerActionClient } from "@/lib/supabase/server";

function normalizeDateInput(v: string | null): string {
  try {
    if (!v) throw new Error();
    const d = new Date(v); // "YYYY-MM-DD" is parsed as UTC
    if (Number.isNaN(+d)) throw new Error();
    return d.toISOString().slice(0, 10);
  } catch {
    const t = new Date();
    return new Date(
      Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate())
    )
      .toISOString()
      .slice(0, 10);
  }
}

/** Fetch the user's standup for a specific date ("YYYY-MM-DD"), or null */
export async function getStandupForDate(noteDate: string | null) {
  const supabase = await createSupabaseServerActionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const nd = normalizeDateInput(noteDate);

  const { data, error } = await supabase
    .from("standups")
    .select("id, note_date, yesterday, today, blockers, learnings, created_at")
    .eq("user_id", user.id)
    .eq("note_date", nd)
    .maybeSingle();

  if (error) {
    console.error("getStandupForDate error:", error);
    return { ok: false, error: error.message, data: null as any };
  }
  return { ok: true, data: data ?? null };
}

/** Insert or update the user's note for a date (one per day) */
export async function upsertStandupForDate(input: {
  note_date: string | null;
  yesterday: string;
  today: string;
  blockers: string;
  learnings: string;
}) {
  const supabase = await createSupabaseServerActionClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) redirect("/signin");

  const nd = normalizeDateInput(input.note_date);
  const y = (input.yesterday ?? "").trim();
  const t = (input.today ?? "").trim();
  const b = (input.blockers ?? "").trim();
  const l = (input.learnings ?? "").trim();

  if (!y && !t && !b && !l) {
    return { ok: false, error: "Please fill at least one field." };
  }

  // Check if row exists to report created vs updated
  const { data: existing } = await supabase
    .from("standups")
    .select("id")
    .eq("user_id", user.id)
    .eq("note_date", nd)
    .maybeSingle();

  const { error } = await supabase.from("standups").upsert(
    {
      user_id: user.id,
      note_date: nd,
      yesterday: y || null,
      today: t || null,
      blockers: b || null,
      learnings: l || null,
      // If you kept content NOT NULL, uncomment and build a combined summary:
      // content: combined || "(empty)",
    },
    { onConflict: "user_id,note_date" }
  );

  if (error) {
    console.error("upsertStandupForDate error:", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/standups");
  return { ok: true, mode: existing ? "updated" : ("created" as const) };
}

export async function deleteStandup(formData: FormData) {
  const supabase = await createSupabaseServerActionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const id = (formData.get("id") as string | null) ?? "";
  if (!id) return { ok: false, error: "Missing id." };

  const { error } = await supabase.from("standups").delete().eq("id", id);
  if (error) {
    console.error("deleteStandup error:", error);
    return { ok: false, error: error.message };
  }
  revalidatePath("/standups");
  return { ok: true };
}

// Client helper for delete button
export async function deleteStandupById(id: string) {
  const fd = new FormData();
  fd.append("id", id);
  return deleteStandup(fd);
}
