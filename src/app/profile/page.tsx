import { redirect } from "next/navigation";
import { createSupabaseRSCClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createSupabaseRSCClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  // Load profile data
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("username, display_name, team, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("profile select error:", error);
  }

  const username = profile?.username ?? "";
  const displayName = profile?.display_name ?? user.email ?? "";
  const team = profile?.team ?? null;
  const role = profile?.role ?? null;
  const email = user.email ?? "";

  return (
    <main className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Your Profile</h1>
      <ProfileForm
        username={username}
        displayName={displayName}
        email={email}
        team={team}
        role={role}
      />
    </main>
  );
}
