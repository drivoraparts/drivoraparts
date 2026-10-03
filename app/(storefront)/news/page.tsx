import type { Metadata } from "next";
import NewsCard from "@/components/news/NewsCard";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { NEWS_AUTHOR, NEWS_LABEL, NEWS_PATH, getAllNewsArticles } from "@/lib/content/news";
import { breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "News",
  description:
    "Company editorial from DrivoraParts: sourcing hard-to-find engines, transmissions and truck parts, fitment identification, and cross-border buying.",
  path: NEWS_PATH,
  image: "/homepage/hero/1600.webp",
});

export default function NewsPage() {
  const [featured, ...rest] = getAllNewsArticles();

  return (
    <main className="bg-background text-foreground">
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "News", path: NEWS_PATH },
        ])}
      />

      <header className="bg-background-dark">
        <div className="mx-auto max-w-6xl px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent-on-dark">
            DrivoraParts News
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Sourcing, fitment and the parts behind the build
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-neutral-300 sm:text-base">
            Articles from the {NEWS_AUTHOR} on finding hard-to-source automotive
            components, identifying the right part, and buying across borders.
          </p>
          <p className="mt-6 inline-flex rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-300">
            {NEWS_AUTHOR} · {NEWS_LABEL}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        {featured ? <NewsCard article={featured} featured /> : null}

        {rest.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((article) => (
              <NewsCard key={article.slug} article={article} />
            ))}
          </div>
        ) : null}

        <p className="mt-12 max-w-2xl border-t border-border pt-6 text-xs leading-relaxed text-muted">
          Articles in this section are written and published by DrivoraParts about
          its own marketplace and about buying parts online. They are company
          editorial content, not independent news coverage.
        </p>
      </div>
    </main>
  );
}
