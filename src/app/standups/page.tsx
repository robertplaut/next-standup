import { redirect } from "next/navigation";
import { createSupabaseRSCClient } from "@/lib/supabase/server";
import LocalTime from "@/components/local-time";
import LocalDate from "@/components/local-date";
import StandupCreateForm from "./StandupCreateForm";
import DeleteStandupButton from "./DeleteStandupButton";
import EditStandupButton from "./EditStandupButton";
import { Card, CardContent } from "@/components/ui/card"; // for per-note item
import { ScrollArea } from "@/components/ui/scroll-area";
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

export default async function StandupsPage() {
  const supabase = await createSupabaseRSCClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  // Display name
  const { data: prof } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  const displayName = prof?.display_name ?? user.email ?? "You";

  // Only current user's notes
  const { data: rows, error } = await supabase
    .from("standups")
    .select(
      "id,user_id,created_at,updated_at,note_date,yesterday,today,blockers,learnings,content"
    )
    .eq("user_id", user.id)
    .order("note_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) console.error("select standups error:", error);

  const standups = (rows ?? []) as StandupRow[];

  // Group by day key
  const groups: Record<string, StandupRow[]> = {};
  for (const s of standups) {
    const key =
      s.note_date ?? new Date(s.created_at).toISOString().slice(0, 10);
    (groups[key] ??= []).push(s);
  }
  const dayKeysDesc = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return (
    <main className="mx-auto max-w-6xl p-0 space-y-6">
      <h1 className="text-2xl font-semibold">
        Stand-up Notes for {displayName}
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left: form */}
        <StandupCreateForm />

        {/* Right: past notes */}
        <WidgetCard
          title="Past Notes"
          description="One per day. Click Edit to load the form."
          contentClassName="p-0"
        >
          <ScrollArea className="h-[60dvh]">
            <div className="p-4 space-y-6">
              {dayKeysDesc.length === 0 ? (
                <p className="text-sm text-muted-foreground px-1">
                  No entries yet.
                </p>
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
                        <div className="flex gap-2">
                          <EditStandupButton date={day} />
                        </div>
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

                                <div className="flex items-center justify-between pt-1">
                                  <p className="text-xs text-muted-foreground">
                                    Last Updated: <LocalTime iso={last} />
                                  </p>
                                  <DeleteStandupButton id={s.id} />
                                </div>
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
          </ScrollArea>
        </WidgetCard>
      </div>
    </main>
  );
}
