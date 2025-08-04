"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerActionClient } from "@/lib/supabase/server";

function normProject(v: string) {
  const s = (v || "").trim().replace(/^https?:\/\/github\.com\//i, "");
  // Expect "owner/repo"
  const m = s.match(/^([a-z0-9_.-]+)\/([a-z0-9_.-]+)$/i);
  return m ? `${m[1]}/${m[2]}` : "";
}

function normUsername(v: string) {
  return (v || "").trim().replace(/^@/, "");
}

export async function saveGithubSettings(formData: FormData) {
  const supabase = await createSupabaseServerActionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const github_project = normProject(formData.get("github_project") as string);
  const github_username = normUsername(
    formData.get("github_username") as string
  );

  if (!github_project || !github_username) {
    return {
      ok: false,
      error: "Both project and username are required (owner/repo + handle).",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ github_project, github_username })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/github-prs");
  return { ok: true };
}
