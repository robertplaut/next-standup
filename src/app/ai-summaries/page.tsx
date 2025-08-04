import { redirect } from "next/navigation";
import { createSupabaseRSCClient } from "@/lib/supabase/server";
import WidgetCard from "@/components/widget-card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AiSummariesPage() {
  const supabase = await createSupabaseRSCClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <WidgetCard
        title="AI Daily Summary"
        description="Today's notes will be sent to AI for review based on users selected in the Summary Aggregator."
      >
        <p>
          Generate an AI-powered summary of the notes from the{" "}
          <strong>Aggregated Summary</strong> view below.
        </p>
        <Button type="button" className="mt-4">
          Generate Summary
        </Button>
      </WidgetCard>
    </main>
  );
}
