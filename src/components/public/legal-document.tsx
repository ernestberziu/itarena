import type { ReactNode } from "react";
import Link from "next/link";

type Section = {
  title: string;
  content: ReactNode;
};

type LegalDocumentProps = {
  locale: string;
  title: string;
  updated: string;
  sections: Section[];
  relatedLinks?: { href: string; label: string }[];
};

export function LegalDocument({
  locale,
  title,
  updated,
  sections,
  relatedLinks,
}: LegalDocumentProps) {
  const lp = locale === "sq" ? "" : `/${locale}`;

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-[hsl(222,47%,9%)] py-14 text-white md:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(20,0,212,0.35),transparent)]" />
        <div className="container relative mx-auto max-w-3xl px-4">
          <h1 className="text-3xl font-extrabold md:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-white/50">{updated}</p>
          {relatedLinks && relatedLinks.length > 0 && (
            <nav className="mt-6 flex flex-wrap gap-3 text-sm">
              {relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={`${lp}${link.href}`}
                  className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="space-y-10">
            {sections.map((section) => (
              <article key={section.title}>
                <h2 className="mb-3 text-xl font-extrabold text-foreground">{section.title}</h2>
                <div className="space-y-3 text-muted-foreground leading-relaxed">{section.content}</div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
