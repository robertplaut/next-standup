// src/lib/github.ts

/** Minimal PR shape we render (search/issues result) */
export type SearchItem = {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: "open" | "closed";
  user: { login: string; avatar_url: string; html_url: string };
  created_at: string;
  body?: string | null;
  pull_request?: {
    url: string;
    html_url: string;
    diff_url: string;
    patch_url: string;
  };
};

const GH_ACCEPT = "application/vnd.github+json";
const GH_API_VER = "2022-11-28";

export function truncate(s: string | null | undefined, n = 220) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

/**
 * Fetch top 5 PRs where the user is involved (author/reviewer/assignee).
 * Uses GitHub Search API (fast, cached by Next for 5 minutes).
 */
export async function fetchLatestPRs(opts: {
  owner: string;
  repo: string;
  username: string;
}): Promise<SearchItem[]> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not set in environment.");

  const query = `repo:${opts.owner}/${opts.repo} is:pr involves:${opts.username}`;
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(
    query
  )}&sort=updated&order=desc&per_page=5`;

  const res = await fetch(url, {
    next: { revalidate: 300 }, // cache HTML for 5 minutes
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: GH_ACCEPT,
      "X-GitHub-Api-Version": GH_API_VER,
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub search failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return (json.items || []) as SearchItem[];
}

/**
 * Tiny, fast check for merged status:
 *  - 204 = merged
 *  - 404 = not merged
 * Any other status ⇒ false (don’t block UI).
 */
export async function fetchMergedStatus(
  owner: string,
  repo: string,
  number: number,
  signal?: AbortSignal
): Promise<boolean> {
  const token = process.env.GITHUB_TOKEN!;
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${number}/merge`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: GH_ACCEPT,
      "X-GitHub-Api-Version": GH_API_VER,
    },
    signal,
    // Don’t cache this—status changes are important and this endpoint is cheap
    cache: "no-store",
  });

  if (res.status === 204) return true;
  if (res.status === 404) return false;
  return false;
}
