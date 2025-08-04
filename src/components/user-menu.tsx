"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function initials(nameOrEmail: string | null) {
  if (!nameOrEmail) return "U";
  const parts = nameOrEmail.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return nameOrEmail[0]?.toUpperCase() ?? "U";
}

export default function UserMenu(props: {
  email: string | null;
  displayName: string | null;
  username: string | null;
  signedIn: boolean;
}) {
  const label = props.displayName ?? props.email ?? "User";
  const fallback = initials(props.displayName ?? props.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded border px-2 py-1 text-sm hover:bg-muted">
          <Avatar className="h-6 w-6">
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">{label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {props.signedIn ? (
          <>
            <DropdownMenuLabel className="truncate">
              Signed in as {props.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/standups">Stand-up Notes</Link>
            </DropdownMenuItem>
            {props.username && (
              <DropdownMenuItem asChild>
                <Link href={`/standups/${props.username}`}>
                  Your public link (WIP)
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action="/signout" method="post" className="w-full">
                <button type="submit" className="w-full text-left">
                  Log out
                </button>
              </form>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href="/signin">Sign in</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
