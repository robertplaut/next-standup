// src/app/github-prs/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseRSCClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import PrsSkeleton from "./PrsSkeleton";
import PrsSection from "./PrsSection";
import GithubSettingsForm from "./GithubSettingsForm";

export const dynamic = "force-dynamic";

export default async function GithubPrsPage() {
  const supabase = await createSupabaseRSCClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  // Load the user’s settings (github_project & github_username)
  const { data: prof } = await supabase
    .from("profiles")
    .select("github_project, github_username")
    .eq("id", user.id)
    .maybeSingle();

  const project = prof?.github_project ?? ""; // e.g. "vercel/next.js"
  const author = prof?.github_username ?? ""; // e.g. "octocat"

  let owner = "";
  let repo = "";
  if (project.includes("/")) {
    [owner, repo] = project.split("/");
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6">
      {/* 1) Settings widget (Card via WidgetCard inside the component) */}
      <GithubSettingsForm project={project} username={author} />

      {/* 2) PRs widget (Card is rendered inside PrsSection) */}
      {owner && repo && author ? (
        <Suspense fallback={<PrsSkeleton />}>
          <PrsSection owner={owner} repo={repo} author={author} />
        </Suspense>
      ) : (
        // Lightweight hint if settings are missing
        <div className="rounded border p-4 text-sm text-muted-foreground">
          Set <strong>GitHub Project</strong> (owner/repo) and{" "}
          <strong>GitHub Username</strong> above to see your recent PRs.
        </div>
      )}
    </main>
  );
}
