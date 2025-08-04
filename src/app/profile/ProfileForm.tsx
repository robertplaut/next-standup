"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import WidgetCard from "@/components/widget-card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfile } from "./actions";

type Props = {
  username: string;
  displayName: string;
  email: string;
  team: string | null;
  role: string | null;
};

const TEAMS = [
  "Engineering",
  "Product Design",
  "Product Management",
  "Program Management",
] as const;

const ROLES = [
  "Designer",
  "Engineer",
  "Product Manager",
  "Program Manager",
  "VP of Design",
  "VP of Engineering",
  "VP of Product",
  "VP of PMO",
] as const;

function RequiredLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <Label htmlFor={htmlFor}>
      {children} <span className="text-destructive">*</span>
    </Label>
  );
}

export default function ProfileForm({
  username,
  displayName,
  email,
  team,
  role,
}: Props) {
  // Controlled local state so values don't revert on any refresh/re-render
  const [name, setName] = useState(displayName);
  const [mail, setMail] = useState(email);
  const [teamVal, setTeamVal] = useState(team ?? "");
  const [roleVal, setRoleVal] = useState(role ?? "");

  const [pending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // prevent default Server Action auto-refresh
    const formData = new FormData(e.currentTarget);
    // Ensure controlled values are sent
    formData.set("username", username);
    formData.set("display_name", name);
    formData.set("email", mail);
    formData.set("team", teamVal);
    formData.set("role", roleVal);

    startTransition(async () => {
      const res = await updateProfile(formData);
      if (!res?.ok) {
        toast.error(res?.error ?? "Failed to update profile.");
        return;
      }
      if (res.profile) {
        setName(res.profile.display_name ?? name);
        setTeamVal(res.profile.team ?? teamVal);
        setRoleVal(res.profile.role ?? roleVal);
      }
      if (res.emailError) {
        // Team/Role saved; email failed -> keep what the user typed, and show why.
        toast.error(res.emailError);
      } else if (res.emailUpdated) {
        toast.success(
          "Profile saved. Check your inbox to confirm the new email."
        );
      } else {
        toast.success(res.message ?? "Profile saved.");
      }
    });
  }

  return (
    <WidgetCard
      title="Profile"
      description="Update your account details. Fields marked with * are required."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username (read-only) */}
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input id="username" name="username" value={username} readOnly />
          <p className="text-xs text-muted-foreground">
            Username is used for your public standups URL and cannot be edited.
          </p>
        </div>

        {/* Display Name * */}
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="display_name">Display Name</RequiredLabel>
          <Input
            id="display_name"
            name="display_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* E-mail * */}
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="email">E-mail</RequiredLabel>
          <Input
            id="email"
            name="email"
            type="email"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Changing your email may require confirmation depending on your
            Supabase project settings.
          </p>
        </div>

        {/* Team * */}
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="team">Team</RequiredLabel>
          <select
            id="team"
            name="team"
            value={teamVal}
            onChange={(e) => setTeamVal(e.target.value)}
            required
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <option value="" disabled>
              Select a team…
            </option>
            {TEAMS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Role * */}
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="role">Role</RequiredLabel>
          <select
            id="role"
            name="role"
            value={roleVal}
            onChange={(e) => setRoleVal(e.target.value)}
            required
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <option value="" disabled>
              Select a role…
            </option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </WidgetCard>
  );
}
