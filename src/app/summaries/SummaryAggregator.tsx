"use client";

import WidgetCard from "@/components/widget-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

type UserCard = {
  id: string;
  display_name: string | null;
  username: string | null;
  team: string | null;
};

export default function SummaryAggregator(props: {
  groups: { byTeam: Record<string, UserCard[]>; teamNames: string[] };
  selected: string[];
  onChangeSelected: (ids: string[]) => void;
}) {
  const selectedSet = new Set(props.selected);

  function toggle(id: string, next: boolean) {
    const set = new Set(props.selected);
    if (next) set.add(id);
    else set.delete(id);
    props.onChangeSelected(Array.from(set));
  }

  return (
    <WidgetCard
      title="Summary Aggregator"
      description="Select users to include in the real-time aggregated summary view. Your selections are saved automatically."
      contentClassName="p-0"
    >
      <ScrollArea className="h-[60dvh]">
        <div className="p-4 space-y-4">
          {props.groups.teamNames.map((team, idx) => (
            <section key={team} className="space-y-2">
              <div className="text-sm font-medium">{team}</div>
              <div className="space-y-2">
                {props.groups.byTeam[team].map((u) => {
                  const checked = selectedSet.has(u.id);
                  const label = u.display_name ?? u.username ?? "(no name)";
                  return (
                    <label
                      key={u.id}
                      className="flex items-center gap-3 text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => toggle(u.id, Boolean(v))}
                      />
                      <span className="truncate">{label}</span>
                      {u.username ? (
                        <span className="text-xs text-muted-foreground truncate">
                          @{u.username}
                        </span>
                      ) : null}
                    </label>
                  );
                })}
              </div>
              {idx < props.groups.teamNames.length - 1 ? (
                <Separator className="my-2" />
              ) : null}
            </section>
          ))}
        </div>
      </ScrollArea>
    </WidgetCard>
  );
}
