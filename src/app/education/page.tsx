export const metadata = {
  title: "Education | Next Standup",
  description: "Curated resources for continuous learning.",
};

export default function EducationPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4">
      <h1 className="text-2xl font-semibold">Education</h1>
      <p className="text-muted-foreground">
        A curated list of external resources to sharpen your skills. We’ll keep
        adding more links over time.
      </p>

      <section className="space-y-3">
        <Resource
          href="https://nextjs.org/learn"
          label="Next.js Official Tutorial"
        />
        <Resource
          href="https://tailwindcss.com/docs"
          label="Tailwind CSS Documentation"
        />
        <Resource href="https://supabase.com/docs" label="Supabase Docs" />
        <Resource
          href="https://www.typescriptlang.org/docs/"
          label="TypeScript Handbook"
        />
      </section>
    </main>
  );
}

function Resource({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded border p-3 hover:bg-muted/50"
    >
      {label}
    </a>
  );
}
