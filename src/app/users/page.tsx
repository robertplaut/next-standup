import { redirect } from "next/navigation";
import { createSupabaseRSCClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import WidgetCard from "@/components/widget-card";

export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  username: string | null;
  display_name: string | null;
  team: string | null;
  role: string | null;
};

function dicebearUrl(username: string) {
  const seed = encodeURIComponent(username);
  return `https://api.dicebear.com/7.x/bottts/png?seed=${seed}&size=96`;
}

export default async function UsersPage() {
  const supabase = await createSupabaseRSCClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, team, role")
    .order("team", { ascending: true, nullsFirst: true })
    .order("display_name", { ascending: true, nullsFirst: true });

  if (error) console.error("users page: select profiles error:", error);

  const rows = (data ?? []) as ProfileRow[];

  const groups: Record<string, ProfileRow[]> = {};
  for (const r of rows) {
    const key = (r.team ?? "Unassigned").trim() || "Unassigned";
    (groups[key] ??= []).push(r);
  }
  const teamNames = Object.keys(groups).sort((a, b) => a.localeCompare(b));

  return (
    <main className="mx-auto max-w-6xl p-0 space-y-8">
      <h1 className="text-2xl font-semibold">User List</h1>

      {teamNames.length === 0 ? (
        <WidgetCard title="User List">
          <p className="text-sm text-muted-foreground">No users found.</p>
        </WidgetCard>
      ) : (
        teamNames.map((team) => {
          const members = groups[team];
          return (
            <WidgetCard key={team} title={team}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((m) => {
                  const username = m.username ?? "";
                  const display = m.display_name ?? (username || "(no name)");
                  const role = m.role ?? "Member";
                  const href = username
                    ? `/standups/${encodeURIComponent(username)}`
                    : "#";

                  return (
                    <Link key={m.id} href={href} className="block">
                      <Card className="h-full hover:bg-muted/40 hover:shadow-lg transition-shadow duration-200">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="shrink-0 rounded overflow-hidden w-12 h-12 bg-muted">
                            {username ? (
                              <Image
                                src={dicebearUrl(username)}
                                alt={display}
                                width={48}
                                height={48}
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {display}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {role}
                            </div>
                            {username && (
                              <div className="text-xs text-muted-foreground truncate">
                                @{username}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </WidgetCard>
          );
        })
      )}
    </main>
  );
}
