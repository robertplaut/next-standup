"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { upsertStandupForDate, getStandupForDate } from "./actions";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import WidgetCard from "@/components/widget-card";

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function StandupCreateForm() {
  const router = useRouter();
  const search = useSearchParams();

  const initial = search.get("date") || todayISO();
  const [noteDate, setNoteDate] = useState<string>(initial);
  const [yesterday, setYesterday] = useState("");
  const [today, setToday] = useState("");
  const [blockers, setBlockers] = useState("");
  const [learnings, setLearnings] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const urlDate = search.get("date");
    const target = urlDate || todayISO();
    if (target !== noteDate) setNoteDate(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    getStandupForDate(noteDate)
      .then((res) => {
        if (cancel) return;
        if (res.ok && res.data) {
          setYesterday(res.data.yesterday ?? "");
          setToday(res.data.today ?? "");
          setBlockers(res.data.blockers ?? "");
          setLearnings(res.data.learnings ?? "");
        } else {
          setYesterday("");
          setToday("");
          setBlockers("");
          setLearnings("");
        }
      })
      .finally(() => !cancel && setLoading(false));
    return () => {
      cancel = true;
    };
  }, [noteDate]);

  function onChangeDate(v: string) {
    setNoteDate(v);
    const params = new URLSearchParams(Array.from(search.entries()));
    params.set("date", v);
    router.push(`/standups?${params.toString()}`);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await upsertStandupForDate({
        note_date: noteDate,
        yesterday,
        today,
        blockers,
        learnings,
      });
      if (res?.ok) {
        router.refresh();
        toast.success(
          res.mode === "updated" ? "Stand-up updated." : "Stand-up created."
        );
      } else {
        toast.error(res?.error ?? "Failed to save.");
      }
    });
  }

  return (
    <WidgetCard title="Add / Edit Stand-up Note" contentClassName="space-y-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="note_date">Date</Label>
          <Input
            id="note_date"
            type="date"
            value={noteDate}
            onChange={(e) => onChangeDate(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="yesterday">What did you accomplish yesterday?</Label>
          <Textarea
            id="yesterday"
            value={yesterday}
            onChange={(e) => setYesterday(e.target.value)}
            rows={3}
            placeholder="- Finished API integration\n- Closed #42"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="today">What are you working on today?</Label>
          <Textarea
            id="today"
            value={today}
            onChange={(e) => setToday(e.target.value)}
            rows={3}
            placeholder="- Build auth UI\n- Write tests"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="blockers">Do you have any blockers?</Label>
          <Textarea
            id="blockers"
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
            rows={2}
            placeholder="- Waiting on design review"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="learnings">Learnings / Other Notes</Label>
          <Textarea
            id="learnings"
            value={learnings}
            onChange={(e) => setLearnings(e.target.value)}
            rows={3}
            placeholder="- Learned about RLS policies\n- Notes on performance"
          />
        </div>

        <div className="flex items-center justify-end">
          <Button type="submit" disabled={pending || loading}>
            {pending ? "Saving..." : "Save Note"}
          </Button>
        </div>
      </form>
    </WidgetCard>
  );
}
