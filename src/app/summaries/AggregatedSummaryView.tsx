"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchAggregatedNotes,
  type Period,
  type AggregatedNote,
} from "./actions";
import { Button } from "@/components/ui/button";
import WidgetCard from "@/components/widget-card";
import LocalDate from "@/components/local-date";

function PeriodPills(props: { value: Period; onChange: (p: Period) => void }) {
  const opts: Period[] = ["today", "week", "month"];
  return (
    <div className="grid grid-cols-3 gap-2">
      {opts.map((p) => (
        <Button
          key={p}
          variant={props.value === p ? "default" : "outline"}
          onClick={() => props.onChange(p)}
          className="w-full"
        >
          {p === "today" ? "Today" : p === "week" ? "This Week" : "This Month"}
        </Button>
      ))}
    </div>
  );
}

export default function AggregatedSummaryView(props: {
  period: Period;
  onChangePeriod: (p: Period) => void;
  selectedUserIds: string[];
}) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<AggregatedNote[]>([]);
  const selected = props.selectedUserIds;

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    fetchAggregatedNotes(props.period, selected)
      .then((res) => {
        if (cancel) return;
        if (res.ok) setRows(res.rows ?? []);
        else setRows([]);
      })
      .finally(() => !cancel && setLoading(false));
    return () => {
      cancel = true;
    };
  }, [props.period, selected.join(",")]);

  const grouped = useMemo(() => {
    const byDate: Record<string, AggregatedNote[]> = {};
    for (const r of rows) (byDate[r.note_date] ??= []).push(r);
    const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

    return dates.map((date) => {
      const arr = byDate[date];
      const teams: Record<string, Record<string, AggregatedNote[]>> = {};
      for (const r of arr) {
        const t = (r.team ?? "Unassigned").trim() || "Unassigned";
        teams[t] ??= {};
        (teams[t][r.user_id] ??= []).push(r);
      }
      const teamNames = Object.keys(teams).sort((a, b) => a.localeCompare(b));
      return { date, teamNames, teams };
    });
  }, [rows]);

  return (
    <WidgetCard
      title="Aggregated Summary View"
      description="A real-time summary of notes from your selected users for the chosen period."
    >
      <div className="mb-4">
        <PeriodPills value={props.period} onChange={props.onChangePeriod} />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No notes found for the selected users in this period.
        </p>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ date, teamNames, teams }) => (
            <section key={date} className="space-y-3">
              <h3 className="text-sm font-semibold">
                <LocalDate date={date} />
              </h3>

              {teamNames.map((team) => {
                const byUser = teams[team];
                const userIds = Object.keys(byUser).sort((a, b) => {
                  const aName =
                    byUser[a][0].display_name ?? byUser[a][0].username ?? "";
                  const bName =
                    byUser[b][0].display_name ?? byUser[b][0].username ?? "";
                  return aName.localeCompare(bName);
                });

                return (
                  <div key={team} className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      {team}
                    </div>
                    <div className="space-y-2">
                      {userIds.map((uid) => {
                        const items = byUser[uid];
                        const head = items[0];
                        return (
                          <div key={uid} className="rounded border p-3">
                            <div className="font-medium">
                              {head.display_name ??
                                head.username ??
                                "(no name)"}{" "}
                              {head.username ? (
                                <span className="text-xs text-muted-foreground">
                                  @{head.username}
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-2 space-y-1 text-sm whitespace-pre-wrap">
                              {items.map((n) => {
                                const lines: string[] = [];
                                if (n.yesterday)
                                  lines.push(`Yesterday: ${n.yesterday}`);
                                if (n.today) lines.push(`Today: ${n.today}`);
                                if (n.blockers)
                                  lines.push(`Blockers: ${n.blockers}`);
                                if (n.learnings)
                                  lines.push(`Learnings: ${n.learnings}`);
                                if (lines.length === 0) return null;
                                return (
                                  <div key={`${n.user_id}-${n.note_date}`}>
                                    {lines.join("\n")}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}
