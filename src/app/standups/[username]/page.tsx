import { createSupabaseRSCClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import LocalTime from "@/components/local-time";
import LocalDate from "@/components/local-date";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import WidgetCard from "@/components/widget-card";

export const dynamic = "force-dynamic";

type StandupRow = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  note_date: string | null;
  yesterday: string | null;
  today: string | null;
  blockers: string | null;
  learnings: string | null;
  content?: string | null;
};

export default async function StandupsByUser({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createSupabaseRSCClient();

  const {
    data: { user: viewer },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, username")
    .ilike("username", username)
    .maybeSingle();

  if (!profile) notFound();

  const { data: rows, error } = await supabase
    .from("standups")
    .select(
      "id,user_id,created_at,updated_at,note_date,yesterday,today,blockers,learnings,content"
    )
    .eq("user_id", profile.id)
    .order("note_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) console.error("select standups by username error:", error);

  const standups = (rows ?? []) as StandupRow[];
  const groups: Record<string, StandupRow[]> = {};
  for (const s of standups) {
    const key =
      s.note_date ?? new Date(s.created_at).toISOString().slice(0, 10);
    (groups[key] ??= []).push(s);
  }
  const dayKeysDesc = Object.keys(groups).sort((a, b) => b.localeCompare(a));
  const isOwner = Boolean(viewer && viewer.id === profile.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <WidgetCard
        title={`${(profile.display_name ?? profile.username) + "’s Stand-ups"}`}
        description={
          isOwner ? (
            <>
              /standups/{profile.username} —{" "}
              <Link className="underline" href="/standups">
                go to your editor
              </Link>
            </>
          ) : (
            <>/standups/{profile.username}</>
          )
        }
      >
        {/* no extra content */}
      </WidgetCard>

      {dayKeysDesc.length === 0 ? (
        <WidgetCard title="No entries" description="Nothing to show." />
      ) : (
        dayKeysDesc.map((day, idx) => {
          const dayRows = groups[day];
          const zebra = idx % 2 === 1 ? "bg-muted/30 rounded-md" : "";
          return (
            <section key={day} className={`space-y-2 p-2 ${zebra}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium">
                  <LocalDate date={day} />
                </h2>
                {isOwner && (
                  <Link
                    className="text-xs underline"
                    href={`/standups?date=${encodeURIComponent(day)}`}
                  >
                    Edit this day
                  </Link>
                )}
              </div>

              <div className="space-y-3">
                {dayRows.map((s) => {
                  const hasStructured =
                    s.yesterday || s.today || s.blockers || s.learnings;
                  const last = s.updated_at ?? s.created_at;
                  return (
                    <Card key={s.id}>
                      <CardContent className="p-4 space-y-3">
                        {hasStructured ? (
                          <>
                            {s.yesterday && (
                              <div>
                                <div className="text-xs font-medium uppercase text-muted-foreground">
                                  yesterday:
                                </div>
                                <div className="whitespace-pre-wrap">
                                  {s.yesterday}
                                </div>
                              </div>
                            )}
                            {s.today && (
                              <div>
                                <div className="text-xs font-medium uppercase text-muted-foreground">
                                  today:
                                </div>
                                <div className="whitespace-pre-wrap">
                                  {s.today}
                                </div>
                              </div>
                            )}
                            {s.blockers && (
                              <div>
                                <div className="text-xs font-medium uppercase text-muted-foreground">
                                  blockers:
                                </div>
                                <div className="whitespace-pre-wrap">
                                  {s.blockers}
                                </div>
                              </div>
                            )}
                            {s.learnings && (
                              <div>
                                <div className="text-xs font-medium uppercase text-muted-foreground">
                                  learnings / notes:
                                </div>
                                <div className="whitespace-pre-wrap">
                                  {s.learnings}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="whitespace-pre-wrap">
                            {s.content ?? ""}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Last Updated: <LocalTime iso={last} />
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
