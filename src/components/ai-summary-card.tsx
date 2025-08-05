"use client";

import { useState } from "react";
import { Progress } from "@radix-ui/react-progress";
import { Button } from "@/components/ui/button";
import WidgetCard from "@/components/widget-card";
import { toast } from "sonner";

/* Helper: YYYY-MM-DD for the browser’s local calendar day */
function localISODate(): string {
  return new Date().toLocaleDateString("en-CA").replace(/\//g, "-");
}

export default function AiSummaryCard() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [html, setHtml] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function generate() {
    setLoading(true);
    setProgress(0);
    setHtml(null);
    setNotFound(false);

    /* 10-sec optimistic progress bar */
    const start = Date.now();
    const timer = setInterval(() => {
      const pct = Math.min(((Date.now() - start) / 10000) * 100, 97);
      setProgress(pct);
    }, 250);

    try {
      const body = {
        date: localISODate(),
        offsetMinutes: -new Date().getTimezoneOffset(), // e.g. EST = -300
      };

      const res = await fetch("/api/ai/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => r.json());

      clearInterval(timer);
      setProgress(100);
      setLoading(false);

      if (res.notFound) {
        setNotFound(true);
        return;
      }
      if (res.error) throw new Error(res.error);

      setHtml(res.summary);
    } catch (err: any) {
      clearInterval(timer);
      setLoading(false);
      toast.error(err.message || "Failed to generate summary.");
    }
  }

  function reset() {
    setHtml(null);
    setNotFound(false);
    setProgress(0);
  }

  return (
    <WidgetCard
      title="AI Daily Summary"
      description="Today's notes will be sent to AI for review based on users selected in the Summary Aggregator."
    >
      {/* Initial state */}
      {!html && !loading && !notFound && (
        <>
          <p>
            Generate an AI-powered summary of the notes from the{" "}
            <strong>Aggregated Summary</strong> view below.
          </p>
          <Button onClick={generate} className="mt-4">
            Generate Summary
          </Button>
        </>
      )}

      {/* Progress state */}
      {loading && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">AI is thinking…</p>
          <Progress
            value={progress}
            className="h-2 w-full rounded bg-muted/40 overflow-hidden"
          >
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-primary transition-all duration-200"
            />
          </Progress>
        </div>
      )}

      {/* No notes */}
      {notFound && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            No notes found for the selected user(s). Please ensure they have
            recent notes.
          </p>
          <Button variant="secondary" onClick={reset}>
            OK
          </Button>
        </div>
      )}

      {/* Render AI summary HTML */}
      {html && (
        <>
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <Button variant="secondary" className="mt-4" onClick={reset}>
            Clear
          </Button>
        </>
      )}
    </WidgetCard>
  );
}
