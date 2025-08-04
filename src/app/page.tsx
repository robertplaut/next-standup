import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Welcome to next-standup</h1>
      <p className="text-sm text-muted-foreground">
        Use the sidebar to navigate. Try{" "}
        <Link href="/standups" className="underline">
          Stand-up Notes
        </Link>{" "}
        or{" "}
        <Link href="/profile" className="underline">
          Profile
        </Link>
        .
      </p>
    </div>
  );
}
