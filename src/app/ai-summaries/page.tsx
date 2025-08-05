import { redirect } from "next/navigation";
import { createSupabaseRSCClient } from "@/lib/supabase/server";
import AiSummaryCard from "@/components/ai-summary-card";

export const dynamic = "force-dynamic";

export default async function AiSummariesPage() {
  const supabase = await createSupabaseRSCClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <AiSummaryCard />
    </main>
  );
}
