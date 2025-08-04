import { redirect } from "next/navigation";
import { createSupabaseRSCClient } from "@/lib/supabase/server";
import SummariesClient, { type UserCard } from "./SummariesClient";

export const dynamic = "force-dynamic";

export default async function SummariesPage() {
  const supabase = await createSupabaseRSCClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  // Load everyone for the aggregator list
  const { data: all } = await supabase
    .from("profiles")
    .select("id, display_name, username, team")
    .order("team", { ascending: true, nullsFirst: true })
    .order("display_name", { ascending: true, nullsFirst: true });

  // Load this user's saved selections
  const { data: me } = await supabase
    .from("profiles")
    .select("summary_selected_user_ids")
    .eq("id", user.id)
    .maybeSingle();

  const users = (all ?? []) as UserCard[];
  const selected = (me?.summary_selected_user_ids ?? []) as string[];

  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-semibold">Summaries</h1>
      <SummariesClient
        allUsers={users}
        currentUserId={user.id}
        initialSelectedUserIds={selected}
      />
    </main>
  );
}
