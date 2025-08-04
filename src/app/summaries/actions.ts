"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerActionClient } from "@/lib/supabase/server";

export type Period = "today" | "week" | "month";

/** Save the caller's selected user IDs (uuid[]) */
export async function saveSummarySelections(userIds: string[]) {
  const supabase = await createSupabaseServerActionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  // Deduplicate + validate UUIDs (basic format check)
  const unique = Array.from(new Set(userIds)).filter((id) =>
    /^[0-9a-f-]{36}$/i.test(id)
  );

  const { error } = await supabase
    .from("profiles")
    .update({ summary_selected_user_ids: unique })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Compute [startDate, endDate] for 'today'|'week'|'month' in yyyy-mm-dd (UTC date strings) */
function periodRange(period: Period): { from: string; to: string } {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();

  const to = new Date(Date.UTC(y, m, d)); // inclusive end
  let from = new Date(to);

  if (period === "today") {
    // from = today
  } else if (period === "week") {
    // ISO-like week (Mon..Sun) in UTC
    const day = to.getUTCDay(); // 0=Sun..6=Sat
    const diff = (day + 6) % 7; // days since Monday
    from = new Date(Date.UTC(y, m, d - diff));
  } else {
    // month
    from = new Date(Date.UTC(y, m, 1));
  }

  const fmt = (x: Date) => x.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

export type AggregatedNote = {
  user_id: string;
  username: string | null;
  display_name: string | null;
  team: string | null;
  note_date: string; // yyyy-mm-dd
  updated_at: string; // iso
  yesterday: string | null;
  today: string | null;
  blockers: string | null;
  learnings: string | null;
};

/**
 * Fetch aggregated notes for a set of user IDs and period.
 * If userIds is empty, returns [].
 */
export async function fetchAggregatedNotes(period: Period, userIds: string[]) {
  const supabase = await createSupabaseServerActionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  if (!userIds || userIds.length === 0)
    return { ok: true, rows: [] as AggregatedNote[] };

  const { from, to } = periodRange(period);

  // 1) Get standups for selected users in range
  const { data: notes, error: nerr } = await supabase
    .from("standups")
    .select(
      "user_id, note_date, updated_at, yesterday, today, blockers, learnings"
    )
    .in("user_id", userIds)
    .gte("note_date", from)
    .lte("note_date", to)
    .order("note_date", { ascending: false })
    .order("updated_at", { ascending: false });

  if (nerr) return { ok: false, error: nerr.message };

  if (!notes || notes.length === 0)
    return { ok: true, rows: [] as AggregatedNote[] };

  const ids = Array.from(new Set(notes.map((n) => n.user_id)));
  // 2) Fetch profile info for selected users
  const { data: profs, error: perr } = await supabase
    .from("profiles")
    .select("id, username, display_name, team")
    .in("id", ids);

  if (perr) return { ok: false, error: perr.message };

  const byId = new Map(profs?.map((p) => [p.id, p]) ?? []);
  const rows: AggregatedNote[] = (notes as any[]).map((n) => {
    const p = byId.get(n.user_id) ?? {};
    return {
      user_id: n.user_id,
      username: p.username ?? null,
      display_name: p.display_name ?? null,
      team: p.team ?? null,
      note_date: n.note_date,
      updated_at: n.updated_at,
      yesterday: n.yesterday ?? null,
      today: n.today ?? null,
      blockers: n.blockers ?? null,
      learnings: n.learnings ?? null,
    };
  });

  return { ok: true, rows };
}
