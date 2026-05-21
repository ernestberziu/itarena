import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ArrowLeft, ArrowRight, Tag, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

import { BLOG_ARTICLES as articles } from "@/lib/blog/articles";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { blogPostExcerpt } from "@/lib/seo/page-registry";
import type { SeoLocale } from "@/lib/seo/config";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/lib/seo/json-ld";
import { breadcrumbsFor } from "@/lib/seo/breadcrumbs";


export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const loc = (locale === "en" ? "en" : "sq") as SeoLocale;
  const art = articles.find((a) => a.slug === slug);
  if (!art) return {};
  const title = locale === "sq" ? art.titleSq : art.titleEn;
  const body = locale === "sq" ? art.bodySq : art.bodyEn;
  return buildPageMetadata({
    locale: loc,
    path: `/blog/${slug}`,
    alternatePath: `/blog/${slug}`,
    title: `${title} — IT Arena Blog`,
    description: blogPostExcerpt(body),
    ogType: "article",
    ogImageUrl: art.coverImg,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const art = articles.find((a) => a.slug === slug);
  if (!art) notFound();

  const lp = locale === "sq" ? "" : `/${locale}`;
  const title = locale === "sq" ? art.titleSq : art.titleEn;
  const body = locale === "sq" ? art.bodySq : art.bodyEn;
  const tag = locale === "sq" ? art.tagSq : art.tagEn;
  const author = locale === "sq" ? art.authorSq : art.authorEn;
  const date = locale === "sq" ? art.dateSq : art.dateEn;

  const related = articles.filter((a) => a.slug !== slug).slice(0, 3);

  const loc = (locale === "en" ? "en" : "sq") as SeoLocale;

  return (
    <>
      <BreadcrumbJsonLd
        locale={loc}
        items={breadcrumbsFor(loc, [
          { key: "blog", path: "/blog" },
          { name: title, path: `/blog/${slug}` },
        ])}
      />
      <ArticleJsonLd
        locale={loc}
        title={title}
        description={blogPostExcerpt(body)}
        slug={slug}
        image={art.coverImg}
        authorName={author}
      />
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-[hsl(222,47%,9%)] text-white py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link
            href={`${lp}/blog`}
            className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            {locale === "sq" ? "Kthehu tek Blog" : "Back to Blog"}
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${art.tagColor}`}>
              <Tag className="h-3 w-3" />
              {tag}
            </span>
            <span className="flex items-center gap-1 text-xs text-white/40">
              <Clock className="h-3 w-3" />
              {art.readMin} min
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-5">{title}</h1>
          <div className="flex items-center gap-3 text-sm text-white/50">
            <CalendarDays className="h-4 w-4" />
            <span>{date}</span>
            <span>·</span>
            <span>{author}</span>
          </div>
        </div>
      </section>

      {/* Cover image */}
      <div className="border-b">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={art.coverImg}
            alt={title}
            className="w-full rounded-b-2xl shadow-lg"
          />
        </div>
      </div>

      {/* Article body */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-5xl mx-auto">
            <div className="lg:col-span-2">
              <div className="prose prose-slate max-w-none">
                {body.split("\n\n").map((para, i) => {
                  if (para.startsWith("**") && para.endsWith("**") && !para.slice(2).includes("**")) {
                    return <h3 key={i} className="text-xl font-extrabold mt-8 mb-3">{para.replace(/\*\*/g, "")}</h3>;
                  }
                  if (para.startsWith("- ")) {
                    return (
                      <ul key={i} className="space-y-2 my-4">
                        {para.split("\n").map((line, j) => (
                          <li key={j} className="flex items-start gap-2 text-muted-foreground">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            <span dangerouslySetInnerHTML={{ __html: line.replace("- ", "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={i} className="text-muted-foreground leading-relaxed mb-4"
                      dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div className="rounded-2xl bg-gradient-to-br from-primary to-blue-700 p-6 text-white sticky top-24">
                <h3 className="font-extrabold text-lg mb-3">
                  {locale === "sq" ? "Keni Pyetje?" : "Have Questions?"}
                </h3>
                <p className="text-white/75 text-sm mb-5">
                  {locale === "sq"
                    ? "Ekspertët tanë janë gati t'ju ndihmojnë. Konsultim falas."
                    : "Our experts are ready to help you. Free consultation."}
                </p>
                <Button asChild variant="accent" className="w-full">
                  <Link href={`${lp}/kerko-oferte`}>
                    {locale === "sq" ? "Konsulto Falas" : "Free Consultation"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="py-16 bg-slate-50 border-t">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-extrabold mb-8">
            {locale === "sq" ? "Artikuj të Tjerë" : "More Articles"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {related.map((rel) => (
              <Link key={rel.slug} href={`${lp}/blog/${rel.slug}`} className="group block">
                <div className="rounded-2xl bg-white border border-border/60 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={rel.coverImg} alt={locale === "sq" ? rel.titleSq : rel.titleEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {locale === "sq" ? rel.titleSq : rel.titleEn}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">{locale === "sq" ? rel.dateSq : rel.dateEn}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
