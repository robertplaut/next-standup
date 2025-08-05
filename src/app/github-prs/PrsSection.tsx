// src/app/github-prs/PrsSection.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchLatestPRs,
  fetchMergedStatus,
  truncate,
  type SearchItem,
} from "@/lib/github";

export default async function PrsSection({
  owner,
  repo,
  author,
}: {
  owner: string;
  repo: string;
  author: string; // GitHub username
}) {
  // 1) Fetch 5 most recent involved PRs
  const items: SearchItem[] = await fetchLatestPRs({
    owner,
    repo,
    username: author,
  });

  // Build "See all" URL (filtered to author involvement)
  const seeAll = `https://github.com/${owner}/${repo}/pulls?q=is%3Apr+involves%3A${encodeURIComponent(
    author
  )}`;

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>GitHub Pull Requests – {author}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recent PRs found.{" "}
            <a
              className="underline"
              href={seeAll}
              target="_blank"
              rel="noreferrer"
            >
              View all on GitHub
            </a>
            .
          </p>
        </CardContent>
      </Card>
    );
  }

  // 2) Optionally fetch merged status in parallel with a 3s cap so we never block render
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  const mergedFlags = await Promise.allSettled(
    items.map((it) =>
      fetchMergedStatus(owner, repo, it.number, controller.signal)
    )
  );

  clearTimeout(timeout);

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle>GitHub Pull Requests – {author}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((it, idx) => {
            const created = new Date(it.created_at);
            const merged =
              mergedFlags[idx].status === "fulfilled"
                ? mergedFlags[idx].value
                : false;

            return (
              <div key={it.id} className="rounded border p-3">
                <div className="flex items-center gap-2">
                  {/* Use <img> to avoid Next Image domain config setup */}
                  <img
                    src={it.user?.avatar_url}
                    alt={it.user?.login}
                    className="h-6 w-6 rounded-full"
                    loading="lazy"
                  />
                  <div className="font-medium">
                    <a
                      className="hover:underline"
                      href={it.html_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {it.title}
                    </a>
                  </div>
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  by {it.user?.login} on {created.toLocaleDateString("en-US")}
                  {" · "}
                  status: {it.state} {" · "}
                  Merged: {merged ? "✅" : "—"}
                </div>

                {/* Lazy details to avoid initial heavy render */}
                {it.body ? (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm underline">
                      Show Details
                    </summary>
                    <div className="mt-2 text-sm whitespace-pre-wrap">
                      {truncate(it.body, 2000)}
                    </div>
                  </details>
                ) : null}
              </div>
            );
          })}

          <div className="pt-2">
            <a
              className="text-sm underline"
              href={seeAll}
              target="_blank"
              rel="noreferrer"
            >
              See all PRs on GitHub →
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
