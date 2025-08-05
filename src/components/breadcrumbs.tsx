"use client";

import React, { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

/* prettier-ignore */
function labelFor(seg: string) {
  switch (seg) {
    case "standups":       return "Stand-up Notes";
    case "users":          return "User List";
    case "github-prs":     return "GitHub PRs";
    case "summaries":      return "Summaries";
    case "ai-summaries":   return "AI Summaries";
    case "profile":        return "Profile";
    default:
      /* Title-case kebab segments as a graceful fallback, e.g. "foo-bar" → "Foo Bar" */
      return seg
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
  }
}

export default function Breadcrumbs() {
  const pathname = usePathname() || "/";
  const segments = pathname.split("/").filter(Boolean);

  // Build breadcrumb items: Home + each cumulative segment
  const items = [{ href: "/", label: "Home" }].concat(
    segments.map((seg, idx) => ({
      href: "/" + segments.slice(0, idx + 1).join("/"),
      label: labelFor(seg),
    }))
  );

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <Fragment key={item.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
