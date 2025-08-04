export type PRItem = {
  number: number;
  html_url: string;
  title: string;
  user: { login: string; avatar_url: string };
  state: "open" | "closed";
  merged: boolean;
  created_at: string;
  updated_at: string;
  body?: string | null;
};

function ghHeaders() {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const t = process.env.GITHUB_TOKEN;
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

export async function fetchUserPRs(
  ownerRepo: string,
  username: string,
  limit = 20
): Promise<PRItem[]> {
  if (!ownerRepo || !username) return [];
  const q = new URLSearchParams({
    q: `is:pr repo:${ownerRepo} involves:${username}`,
    sort: "updated",
    order: "desc",
    per_page: String(Math.min(limit, 50)),
  });
  const base = "https://api.github.com";

  // 1) Search issues (PRs)
  const res = await fetch(`${base}/search/issues?${q}`, {
    headers: ghHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GitHub search failed: ${res.status}`);
  const search = await res.json();

  const items = (search.items ?? []) as any[];

  // 2) Enrich each with merged/body via /pulls/{number}
  const results: PRItem[] = [];
  for (const it of items) {
    const url: string = it.html_url; // https://github.com/owner/repo/pull/123
    const m = url.match(/\/pull\/(\d+)(?:$|[/?#])/);
    const number = m ? parseInt(m[1], 10) : undefined;
    if (!number) continue;

    // fetch PR
    const prRes = await fetch(`${base}/repos/${ownerRepo}/pulls/${number}`, {
      headers: ghHeaders(),
      cache: "no-store",
    });
    if (!prRes.ok) continue;
    const pr = await prRes.json();

    results.push({
      number,
      html_url: url,
      title: it.title,
      user: {
        login: it.user?.login ?? "",
        avatar_url: it.user?.avatar_url ?? "",
      },
      state: (it.state as "open" | "closed") ?? "open",
      merged: Boolean(pr.merged_at),
      created_at: it.created_at,
      updated_at: it.updated_at,
      body: pr.body ?? null,
    });
  }

  return results;
}
