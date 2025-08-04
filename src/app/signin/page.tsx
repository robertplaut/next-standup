"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SignInPage() {
  const supabase = createSupabaseBrowserClient();

  const [tab, setTab] = useState<"signin" | "signup" | "magic">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";
  const redirectTo = `${baseUrl}/auth/callback`;

  async function handleSignInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Signing in...");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return setStatus(`Error: ${error.message}`);
    setStatus(null);
    window.location.href = "/"; // reload to pick up server session
  }

  async function handleSignUpWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Creating account...");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          display_name: displayName || null,
          username: username || null,
        },
      },
    });
    if (error) return setStatus(`Error: ${error.message}`);

    // If email confirmation is disabled, user may already be signed in.
    // Otherwise, they need to click the email link.
    setStatus(
      data.user?.confirmed_at
        ? "Account created. Redirecting..."
        : "Check your email to confirm your account."
    );
    if (data.user?.confirmed_at) {
      window.location.href = "/";
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Sending magic link...");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    setStatus(
      error
        ? `Error: ${error.message}`
        : "Check your email for the sign-in link."
    );
  }

  async function handleGitHub() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo },
    });
    if (error) setStatus(`Error: ${error.message}`);
  }

  return (
    <main className="p-8 max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>

      {/* Tabs */}
      <div className="flex gap-2 text-sm">
        <button
          className={`rounded border px-3 py-1 ${
            tab === "signin" ? "bg-muted" : ""
          }`}
          onClick={() => setTab("signin")}
        >
          Password Login
        </button>
        <button
          className={`rounded border px-3 py-1 ${
            tab === "signup" ? "bg-muted" : ""
          }`}
          onClick={() => setTab("signup")}
        >
          Create Account
        </button>
        <button
          className={`rounded border px-3 py-1 ${
            tab === "magic" ? "bg-muted" : ""
          }`}
          onClick={() => setTab("magic")}
        >
          Magic Link
        </button>
      </div>

      {/* Sign in with password */}
      {tab === "signin" && (
        <form
          onSubmit={handleSignInWithPassword}
          className="space-y-4 rounded border p-4"
        >
          <label className="block">
            <span className="text-sm">Email</span>
            <input
              className="mt-1 w-full rounded border p-2"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </label>
          <label className="block">
            <span className="text-sm">Password</span>
            <input
              className="mt-1 w-full rounded border p-2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </label>
          <button type="submit" className="rounded border px-4 py-2">
            Sign in
          </button>
          <div className="text-xs mt-2">
            Or{" "}
            <button type="button" onClick={handleGitHub} className="underline">
              continue with GitHub
            </button>
          </div>
        </form>
      )}

      {/* Create account */}
      {tab === "signup" && (
        <form
          onSubmit={handleSignUpWithPassword}
          className="space-y-4 rounded border p-4"
        >
          <div className="grid grid-cols-1 gap-4">
            <label className="block">
              <span className="text-sm">Email</span>
              <input
                className="mt-1 w-full rounded border p-2"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </label>
            <label className="block">
              <span className="text-sm">Password</span>
              <input
                className="mt-1 w-full rounded border p-2"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="At least 6 characters"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <label className="block">
              <span className="text-sm">Display Name</span>
              <input
                className="mt-1 w-full rounded border p-2"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Robert Plaut"
              />
            </label>
            <label className="block">
              <span className="text-sm">Username</span>
              <input
                className="mt-1 w-full rounded border p-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="robertplaut"
                pattern="[a-z0-9-]{3,32}"
                title="3–32 chars, lowercase letters, numbers, and dashes"
              />
            </label>
          </div>

          <button type="submit" className="rounded border px-4 py-2">
            Create account
          </button>
          <p className="text-xs text-muted-foreground mt-2">
            You can also{" "}
            <button type="button" onClick={handleGitHub} className="underline">
              continue with GitHub
            </button>
            .
          </p>
        </form>
      )}

      {/* Magic link */}
      {tab === "magic" && (
        <form
          onSubmit={handleMagicLink}
          className="space-y-4 rounded border p-4"
        >
          <label className="block">
            <span className="text-sm">Email</span>
            <input
              className="mt-1 w-full rounded border p-2"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </label>
          <button type="submit" className="rounded border px-4 py-2">
            Send magic link
          </button>
        </form>
      )}

      {status && <p className="text-sm opacity-80">{status}</p>}

      <div className="text-xs text-muted-foreground">
        <Link href="/">Back to Home</Link>
      </div>
    </main>
  );
}
