"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import WidgetCard from "@/components/widget-card";
import type { PRItem } from "@/lib/github";

function fmtDate(iso: string) {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export default function PRList(props: { username: string; prs: PRItem[] }) {
  return (
    <WidgetCard
      title={`GitHub Pull Requests – ${props.username || "—"}`}
      description="Newest first (involves you as author/reviewer/assignee)"
    >
      {props.prs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pull requests found.</p>
      ) : (
        <div className="space-y-3">
          {props.prs.map((pr) => {
            return (
              <Card key={pr.number}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <Image
                      src={
                        pr.user.avatar_url ||
                        "https://avatars.githubusercontent.com/u/0?v=4"
                      }
                      alt={pr.user.login}
                      width={40}
                      height={40}
                      className="rounded"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={pr.html_url}
                        className="font-medium underline"
                        target="_blank"
                      >
                        {pr.title}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        by {pr.user.login} on {fmtDate(pr.created_at)} — status:{" "}
                        {pr.state}
                        {" | "}Merged: {pr.merged ? "✅" : "✗"}
                      </div>
                    </div>
                    <details className="text-xs">
                      <summary className="cursor-pointer underline">
                        Show Details
                      </summary>
                      {pr.body ? (
                        <div className="mt-2 whitespace-pre-wrap text-sm">
                          {pr.body}
                        </div>
                      ) : (
                        <div className="mt-2 text-muted-foreground">
                          No description.
                        </div>
                      )}
                    </details>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}
