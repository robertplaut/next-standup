"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  StickyNote,
  Users,
  Github,
  ListChecks,
  Sparkles,
  User as UserIcon,
  Cpu,
} from "lucide-react";

type Props = { signedIn: boolean };

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AppSidebar({ signedIn }: Props) {
  const pathname = usePathname() || "/";

  const NAV = [
    { label: "Home", href: "/", icon: Home },
    { label: "Stand-up Notes", href: "/standups", icon: StickyNote },
    ...(signedIn
      ? [
          { label: "User List", href: "/users", icon: Users },
          { label: "GitHub PRs", href: "/github-prs", icon: Github },
          { label: "Summaries", href: "/summaries", icon: ListChecks },
          { label: "AI Summaries", href: "/ai-summaries", icon: Sparkles },
          { label: "Profile", href: "/profile", icon: UserIcon },
        ]
      : []),
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Brand row */}
      <div className="p-4 flex items-center gap-2">
        {/* colorful engineering icon */}
        <Cpu
          size={20}
          strokeWidth={2}
          className="text-indigo-600 dark:text-indigo-400"
        />
        <span className="text-xl font-semibold">Next Standup</span>
      </div>

      {/* Nav */}
      <nav className="p-2">
        <ul className="space-y-1">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex items-center gap-3 rounded px-3 py-2 text-sm hover:bg-muted/50",
                    active ? "bg-muted/60 font-medium" : "text-foreground/80",
                  ].join(" ")}
                >
                  <Icon size={18} strokeWidth={1.8} className="shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto p-3 text-xs text-muted-foreground">
        © {new Date().getFullYear()}
      </div>
    </div>
  );
}
