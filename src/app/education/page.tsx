import Hero1 from "@/components/blocks/hero1";

export const metadata = {
  title: "Education | Next Standup",
  description: "Curated tutorials, docs, and videos to level-up your workflow.",
};

export default function EducationPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 p-4">
      {/* ─── Hero with very tight spacing ───────────────────────── */}
      <Hero1
        className="py-6 md:py-8" /* 👈 now truly compact */
        badge="📚 Education"
        heading="Master new skills"
        description="Explore hand-picked articles, docs, and videos. Check back regularly for fresh material."
        buttons={{
          primary: { text: "Start learning", url: "#resources" },
          secondary: {
            text: "Suggest a link",
            url: "https://github.com/robertplaut/next-standup/issues",
          },
        }}
        image={{
          src: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Stack of books illustrating learning",
        }}
      />

      {/* ─── Resource list ─────────────────────────────────────── */}
      <section id="resources" className="space-y-6">
        <h2 className="text-2xl font-semibold">Featured Resources</h2>
        <ul className="space-y-3">
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
        </ul>
      </section>
    </main>
  );
}

function Resource({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded border p-3 hover:bg-muted/50"
      >
        {label}
      </a>
    </li>
  );
}
