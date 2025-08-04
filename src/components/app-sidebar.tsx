"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";

type Props = { signedIn: boolean };

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AppSidebar({ signedIn }: Props) {
  const pathname = usePathname() || "/";

  const NAV = [
    { label: "Home", href: "/" },
    { label: "Stand-up Notes", href: "/standups" },

    ...(signedIn
      ? [
          { label: "User List", href: "/users" },
          { label: "GitHub PRs", href: "/github-prs" },
          { label: "Summaries", href: "/summaries" },
          { label: "AI Summaries", href: "/ai-summaries" },
          { label: "Profile", href: "/profile" },
        ]
      : []),
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Brand */}
      <div className="p-4">
        <div className="text-xs uppercase text-muted-foreground">App</div>
        <div className="text-xl font-semibold">next-standup</div>
      </div>
      <Separator />

      {/* Nav */}
      <nav className="p-2">
        <ul className="space-y-1">
          {NAV.map(({ label, href }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "block rounded px-3 py-2 text-sm hover:bg-muted",
                    active ? "bg-muted font-medium" : "text-foreground/80",
                  ].join(" ")}
                >
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
