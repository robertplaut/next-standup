// src/app/page.tsx
import Link from "next/link";
import { createSupabaseRSCClient } from "@/lib/supabase/server";
import WidgetCard from "@/components/widget-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  NotebookPen,
  Users,
  GitPullRequest,
  Sigma,
  Bot,
  UserRound,
  Settings2,
  ChevronRight,
  CheckCircle2,
  Circle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createSupabaseRSCClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signedIn = Boolean(user);

  // Pull minimal profile bits for personalization + quick start checks
  let displayName: string | null = null;
  let username: string | null = null;
  let githubProject: string | null = null;
  let githubUsername: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, username, github_project, github_username")
      .eq("id", user.id)
      .maybeSingle();

    displayName = profile?.display_name ?? null;
    username = profile?.username ?? null;
    githubProject = profile?.github_project ?? null;
    githubUsername = profile?.github_username ?? null;
  }

  // Quick-start completion flags
  const hasDisplay = !!displayName;
  const hasUsername = !!username;
  const hasGithubSettings = !!githubProject && !!githubUsername;

  const greeter = signedIn
    ? `Welcome back, ${displayName ?? user?.email ?? "there"}`
    : "Welcome to Next Standup";

  const subgreeter = signedIn
    ? "Use the sidebar to navigate. Try Stand-up Notes or Profile."
    : "Use the sidebar to navigate. Try Stand-up Notes or Profile.";

  return (
    <main className="mx-auto max-w-6xl space-y-6">
      {/* Hero / Intro */}
      <WidgetCard title={greeter} description={subgreeter}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            Capture daily updates, see teammates’ progress, summarize across
            teams, and keep PRs in view — all in one place.
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/standups">
                Get started <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/profile">Set up profile</Link>
            </Button>
          </div>
        </div>
      </WidgetCard>

      {/* Quick Start checklist (shows even if signed out, but CTA = sign in) */}
      <WidgetCard
        title="Quick Start"
        description="Knock these out to make the most of Next Standup."
      >
        <ul className="space-y-3">
          <QuickItem
            done={!!signedIn}
            label={signedIn ? "Signed in" : "Sign in to continue"}
            href={signedIn ? undefined : "/signin"}
            cta={signedIn ? undefined : "Sign in"}
          />

          <QuickItem
            done={hasDisplay}
            label={
              hasDisplay
                ? `Set display name (${displayName})`
                : "Set display name"
            }
            href="/profile"
            cta="Edit Profile"
          />

          <QuickItem
            done={hasUsername}
            label={
              hasUsername
                ? `Public route reserved (/standups/${username})`
                : "Pick a public username route"
            }
            href="/profile"
            cta="Edit Profile"
          />

          <QuickItem
            done={hasGithubSettings}
            label={
              hasGithubSettings
                ? `GitHub linked (${githubProject} · @${githubUsername})`
                : "Link your GitHub project & username"
            }
            href="/github-prs"
            cta="Open GitHub PRs"
          />

          <QuickItem
            done={false}
            label="Write today’s stand-up note"
            href="/standups"
            cta="Open Stand-ups"
          />
        </ul>
      </WidgetCard>

      {/* Features Overview */}
      <WidgetCard
        title="What you can do"
        description="A quick tour of the main sections."
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Stand-up Notes */}
          <FeatureCard
            icon={<NotebookPen className="h-5 w-5" />}
            title="Stand-up Notes"
            blurb="Add a daily note with Yesterday, Today, Blockers, and Learnings. One note per day — editable anytime."
            badges={["Daily", "Two-pane UI", "Edit in-place"]}
            href="/standups"
            cta="Open Stand-ups"
          />
          {/* User List */}
          <FeatureCard
            icon={<Users className="h-5 w-5" />}
            title="User List"
            blurb="Browse teammates by Team. Cards show avatar, display name, and role. Jump to anyone’s past notes."
            badges={["Grouped by Team", "DiceBear avatars"]}
            href="/users"
            cta="View Users"
            requireAuth
            signedIn={signedIn}
          />
          {/* GitHub PRs */}
          <FeatureCard
            icon={<GitPullRequest className="h-5 w-5" />}
            title="GitHub PRs"
            blurb="See your 5 most recent PRs for a repo you choose. Fast, cached, and expandable details."
            badges={["Top 5", "ETag-cached", "Merged status"]}
            href="/github-prs"
            cta="Open PRs"
            requireAuth
            signedIn={signedIn}
          />
          {/* Summaries */}
          <FeatureCard
            icon={<Sigma className="h-5 w-5" />}
            title="Summaries"
            blurb="Select users to include, then view a real-time aggregated feed for Today, This Week, or This Month."
            badges={["Team filters", "Period pills", "Autosave selections"]}
            href="/summaries"
            cta="Open Summaries"
            requireAuth
            signedIn={signedIn}
          />
          {/* AI Summaries */}
          <FeatureCard
            icon={<Bot className="h-5 w-5" />}
            title="AI Summaries"
            blurb="Send today’s notes for selected users to AI to generate Key Takeaways and a personalized email draft."
            badges={["10s progress", "HTML output", "OpenAI-powered"]}
            href="/ai-summaries"
            cta="Generate Summary"
            requireAuth
            signedIn={signedIn}
          />
          {/* Profile */}
          <FeatureCard
            icon={<UserRound className="h-5 w-5" />}
            title="Profile"
            blurb="Set your Display Name, Team, Role, public Username route, and GitHub settings for PRs."
            badges={["Required fields *", "Select lists", "Live toasts"]}
            href="/profile"
            cta="Edit Profile"
            requireAuth
            signedIn={signedIn}
          />
        </div>
      </WidgetCard>

      {/* Tech Stack */}
      <WidgetCard title="Tech stack" description="Modern, fast, and type-safe.">
        <ul className="grid gap-2 md:grid-cols-2">
          <TechItem
            label="Next.js 15 + React 19"
            detail="App Router, server actions, RSC & Suspense"
          />
          <TechItem
            label="Tailwind CSS v4 + shadcn"
            detail="Design tokens, Card/Dropdown/Breadcrumb patterns"
          />
          <TechItem
            label="Supabase"
            detail="Auth, Postgres, RLS; server & client helpers"
          />
          <TechItem
            label="Sonner"
            detail="Toasts for success / error feedback"
          />
          <TechItem
            label="DiceBear Avatars"
            detail="Seeded by username; SVG avatars"
          />
          <TechItem
            label="GitHub REST API"
            detail="Search PRs with caching; merged status checks"
          />
          <TechItem
            label="OpenAI"
            detail="Key Takeaways + personalized email summaries"
          />
          <TechItem
            label="TypeScript + ESLint"
            detail="Strict types, linted; clean DX"
          />
        </ul>
      </WidgetCard>
    </main>
  );
}

/* ---------- Small helpers (local to page) ---------- */

function FeatureCard(props: {
  icon: React.ReactNode;
  title: string;
  blurb: string;
  badges?: string[];
  href: string;
  cta: string;
  requireAuth?: boolean;
  signedIn?: boolean;
}) {
  const gated = props.requireAuth && !props.signedIn;
  return (
    <div className="rounded border p-4">
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-muted p-2">{props.icon}</div>
        <h3 className="font-semibold">{props.title}</h3>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{props.blurb}</p>
      {props.badges && props.badges.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {props.badges.map((b) => (
            <Badge key={b} variant="secondary">
              {b}
            </Badge>
          ))}
        </div>
      ) : null}
      <div className="mt-3">
        {gated ? (
          <Button asChild variant="outline" size="sm">
            <Link href="/signin">
              Sign in to continue <Settings2 className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button asChild size="sm">
            <Link href={props.href}>
              {props.cta} <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function TechItem({ label, detail }: { label: string; detail: string }) {
  return (
    <li className="flex items-start gap-3 rounded border p-3">
      <div className="mt-0.5">
        <Badge variant="outline">{label}</Badge>
      </div>
      <div className="text-sm text-muted-foreground">{detail}</div>
    </li>
  );
}

function QuickItem({
  done,
  label,
  href,
  cta,
}: {
  done: boolean;
  label: string;
  href?: string;
  cta?: string;
}) {
  const Icon = done ? CheckCircle2 : Circle;
  return (
    <li className="flex items-center justify-between rounded border p-3">
      <div className="flex items-center gap-2">
        <Icon
          className={`h-4 w-4 ${
            done ? "text-green-600" : "text-muted-foreground"
          }`}
        />
        <span className={done ? "line-through text-muted-foreground" : ""}>
          {label}
        </span>
      </div>
      {href ? (
        <Button asChild size="sm" variant={done ? "secondary" : "default"}>
          <Link href={href}>{cta ?? "Open"}</Link>
        </Button>
      ) : null}
    </li>
  );
}
