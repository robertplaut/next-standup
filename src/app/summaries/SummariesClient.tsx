"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SummaryAggregator from "./SummaryAggregator";
import AggregatedSummaryView from "./AggregatedSummaryView";
import type { Period } from "./actions";
import { saveSummarySelections } from "./actions";

export type UserCard = {
  id: string;
  display_name: string | null;
  username: string | null;
  team: string | null;
};

export default function SummariesClient(props: {
  allUsers: UserCard[];
  currentUserId: string;
  initialSelectedUserIds: string[];
}) {
  const [selected, setSelected] = useState<string[]>(
    props.initialSelectedUserIds ?? []
  );
  const [period, setPeriod] = useState<Period>("today");

  // Debounced autosave (on selection change)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await saveSummarySelections(selected);
      timer.current = null;
    }, 500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [selected]);

  // Group users by team for aggregator
  const groups = useMemo(() => {
    const byTeam: Record<string, UserCard[]> = {};
    for (const u of props.allUsers) {
      const key = (u.team ?? "Unassigned").trim() || "Unassigned";
      (byTeam[key] ??= []).push(u);
    }
    const teamNames = Object.keys(byTeam).sort((a, b) => a.localeCompare(b));
    for (const t of teamNames) {
      byTeam[t].sort((a, b) =>
        (a.display_name ?? "").localeCompare(b.display_name ?? "")
      );
    }
    return { byTeam, teamNames };
  }, [props.allUsers]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SummaryAggregator
        groups={groups}
        selected={selected}
        onChangeSelected={setSelected}
      />
      <AggregatedSummaryView
        period={period}
        onChangePeriod={setPeriod}
        selectedUserIds={selected}
      />
    </div>
  );
}
