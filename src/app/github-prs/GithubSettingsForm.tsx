"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { saveGithubSettings } from "./actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import WidgetCard from "@/components/widget-card";

export default function GithubSettingsForm(props: {
  project: string;
  username: string;
}) {
  const [pending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await saveGithubSettings(formData);
      if (res?.ok) toast.success("Saved GitHub settings.");
      else toast.error(res?.error ?? "Failed to save settings.");
    });
  }

  return (
    <WidgetCard
      title="GitHub Settings"
      description="Set the repository (owner/repo) and your GitHub username."
    >
      <form action={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="github_project">GitHub Project</Label>
          <Input
            id="github_project"
            name="github_project"
            defaultValue={props.project}
            placeholder="vercel/next.js"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="github_username">GitHub Username</Label>
          <Input
            id="github_username"
            name="github_username"
            defaultValue={props.username}
            placeholder="octocat"
            required
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </WidgetCard>
  );
}
