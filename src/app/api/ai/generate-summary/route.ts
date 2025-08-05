import { NextResponse } from "next/server";
import { createSupabaseServerActionClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(req: Request) {
  const supabase = await createSupabaseServerActionClient();

  /* Auth ------------------------------------------------------- */
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  /* Body ------------------------------------------------------- */
  const { date } = (await req.json().catch(() => ({}))) as { date?: string };
  if (!date)
    return NextResponse.json({ error: "date required" }, { status: 400 });

  const localDay = date; // already yyyy-mm-dd in caller’s TZ
  console.log("AI-route » localDay =", localDay);

  /* Caller’s selections --------------------------------------- */
  const { data: profile } = await supabase
    .from("profiles")
    .select("summary_selected_user_ids, display_name")
    .eq("id", user.id)
    .maybeSingle();

  const selected: string[] = profile?.summary_selected_user_ids ?? [];
  const requestingUserDisplayName =
    profile?.display_name ?? user.email ?? "teammate";

  if (selected.length === 0) return NextResponse.json({ notFound: true });
  console.log("AI-route » selectedUserIds =", selected);

  /* 1) Fetch standups rows ------------------------------------ */
  const { data: notes, error: nerr } = await supabase
    .from("standups")
    .select(
      "user_id, yesterday, today, blockers, learnings, note_date, created_at"
    )
    .in("user_id", selected)
    .gte("note_date", localDay)
    .lte("note_date", localDay);

  if (nerr) console.error("AI-route » standups error:", nerr);
  console.log("AI-route » notes rows =", notes?.length || 0);

  if (!notes || notes.length === 0)
    return NextResponse.json({ notFound: true });

  /* 2) Fetch profile info ------------------------------------- */
  const ids = Array.from(new Set(notes.map((n) => n.user_id)));
  const { data: profs, error: perr } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", ids);

  if (perr) console.error("AI-route » profile error:", perr);

  const byId = new Map(
    (profs ?? []).map((p) => [
      p.id,
      { username: p.username, display_name: p.display_name },
    ])
  );

  /* Collect users list for prompt */
  const users = Array.from(
    new Set(
      ids.map(
        (id) =>
          byId.get(id)?.display_name || byId.get(id)?.username || "Unknown"
      )
    )
  );

  /* Build plain-text blob ------------------------------------- */
  const formatted = notes
    .map((n) => {
      const p = byId.get(n.user_id) ?? {};
      const who = p.display_name || p.username || "Unknown";
      const parts = [];
      if (n.yesterday) parts.push(`YESTERDAY: ${n.yesterday}`);
      if (n.today) parts.push(`TODAY: ${n.today}`);
      if (n.blockers) parts.push(`BLOCKERS: ${n.blockers}`);
      if (n.learnings) parts.push(`LEARNINGS: ${n.learnings}`);
      return `${who} — ${parts.join(" • ")}`;
    })
    .join("\n");

  /* Display date ---------------------------------------------- */
  const displayDate = new Date(localDay + "T00:00:00").toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }
  );

  /* Prompt ----------------------------------------------------- */
  const systemPrompt = `
You are an expert assistant for a software development team. Your task is to create a concise, professional summary of the team's daily stand-up notes for ${displayDate}.

The following users contributed today: ${users.join(", ")}.

Your output MUST be a single block of clean, elegant HTML. Do NOT include any markdown-style backticks. The entire response must be valid HTML.

Construct the HTML exactly like this:

<div class="ai-summary-container">
  <h2>Daily Summary for ${displayDate}</h2>
  <p>Updates from: ${users.join(", ")}</p>

  <h3>Key Takeaways:</h3>
  <ul>
    <!-- AI: Generate a bulleted list of key accomplishments, plans, and blockers from the notes. -->
  </ul>

  <hr style="margin: 2rem 0; border: 0; border-top: 1px solid var(--color-border);" />

  <h3>Personalized Email Update:</h3>
  <p>Dear ${requestingUserDisplayName},</p>
  <p>Here's a quick update on today's stand-up notes:</p>
  <p>
    <!-- AI: Write a conversational, personal email here. -->
  </p>
  <p>Love,</p>
  <p>Echostatus</p>
</div>
  `.trim();

  /* OpenAI ------------------------------------------------------ */
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.6,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: formatted },
    ],
  });

  let html = completion.choices[0].message.content ?? "";
  html = html.replace(/^```html\s*|```$/gi, "").trim();

  return NextResponse.json({ summary: html });
}
