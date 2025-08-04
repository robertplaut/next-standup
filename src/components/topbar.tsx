import { createSupabaseRSCClient } from "@/lib/supabase/server";
import ModeToggle from "./mode-toggle";
import UserMenu from "./user-menu";
import { Separator } from "@/components/ui/separator";
import Breadcrumbs from "./breadcrumbs";

export default async function Topbar() {
  const supabase = await createSupabaseRSCClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName: string | null = null;
  let username: string | null = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, username")
      .eq("id", user.id)
      .maybeSingle();
    displayName = data?.display_name ?? null;
    username = data?.username ?? null;
  }

  return (
    <header className="border-b">
      <div className="flex h-14 items-center justify-between px-4 gap-3">
        {/* Left: Breadcrumbs */}
        <div className="min-w-0 flex-1">
          <Breadcrumbs />
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Separator orientation="vertical" className="h-6" />
          <UserMenu
            email={user?.email ?? null}
            displayName={displayName}
            username={username}
            signedIn={Boolean(user)}
          />
        </div>
      </div>
    </header>
  );
}
