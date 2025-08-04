import { redirect } from "next/navigation";
import { createSupabaseRSCClient } from "@/lib/supabase/server";
import GithubSettingsForm from "./GithubSettingsForm";
import PRList from "./PRList";
import { fetchUserPRs } from "@/lib/github";

export const dynamic = "force-dynamic";

export default async function GithubPRsPage() {
  const supabase = await createSupabaseRSCClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("github_project, github_username")
    .eq("id", user.id)
    .maybeSingle();

  const project = profile?.github_project ?? "";
  const username = profile?.github_username ?? "";

  let prs: Awaited<ReturnType<typeof fetchUserPRs>> = [];
  if (project && username) {
    try {
      prs = await fetchUserPRs(project, username, 20);
    } catch (e) {
      console.error("GitHub fetch failed:", e);
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-semibold">GitHub PRs</h1>

      {/* Two-column layout on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GithubSettingsForm project={project} username={username} />
        <PRList username={username} prs={prs} />
      </div>
    </main>
  );
}
