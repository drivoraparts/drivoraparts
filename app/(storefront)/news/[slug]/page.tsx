import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import NewsCard from "@/components/news/NewsCard";
import JsonLdScript from "@/components/seo/JsonLdScript";
import {
  NEWS_ARTICLES,
  NEWS_AUTHOR,
  NEWS_LABEL,
  NEWS_PATH,
  formatNewsDate,
  getNewsArticle,
  getRelatedNewsArticles,
  newsArticlePath,
} from "@/lib/content/news";
import { articleJsonLd, breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

// Articles are a fixed list in lib/content/news.ts; an unknown slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return NEWS_ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getNewsArticle(slug);
  if (!article) return {};

  return buildPageMetadata({
    title: article.title,
    description: article.excerpt,
    path: newsArticlePath(article.slug),
    image: article.cover.src,
    article: {
      publishedTime: article.datePublished,
      authors: [NEWS_AUTHOR],
    },
  });
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getNewsArticle(slug);
  if (!article) notFound();

  const path = newsArticlePath(article.slug);
  const related = getRelatedNewsArticles(article.slug, 3);

  return (
    <main className="bg-background text-foreground">
      <JsonLdScript
        data={[
          articleJsonLd({
            title: article.title,
            description: article.excerpt,
            path,
            image: article.cover.src,
            datePublished: article.datePublished,
            author: NEWS_AUTHOR,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "News", path: NEWS_PATH },
            { name: article.title, path },
          ]),
        ]}
      />

      <header className="bg-background-dark">
        <div className="mx-auto max-w-3xl px-5 pb-10 pt-12 sm:px-8 sm:pb-14 sm:pt-16">
          <nav aria-label="Breadcrumb" className="text-xs text-neutral-400">
            <Link href={NEWS_PATH} className="hover:text-white">
              News
            </Link>
            <span aria-hidden="true"> / </span>
            <span>{article.category}</span>
          </nav>
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-accent-on-dark">
            {article.category}
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-neutral-300">
            {article.excerpt}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-300">
            <span className="font-semibold text-white">{NEWS_AUTHOR}</span>
            <span aria-hidden="true">·</span>
            <span>{NEWS_LABEL}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.datePublished}>
              {formatNewsDate(article.datePublished)}
            </time>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <img
          src={article.cover.src}
          alt={article.cover.alt}
          width={1600}
          height={1000}
          className="-mt-6 aspect-[16/9] w-full rounded-2xl border border-border object-cover shadow-sm sm:-mt-8"
        />

        <article className="space-y-5 py-10 leading-relaxed text-neutral-700 sm:py-14">
          {article.body.map((block, index) => {
            switch (block.type) {
              case "h2":
                return (
                  <h2
                    key={index}
                    className="pt-4 text-2xl font-bold tracking-tight text-foreground"
                  >
                    {block.text}
                  </h2>
                );
              case "ul":
                return (
                  <ul key={index} className="list-disc space-y-2 pl-5 marker:text-accent">
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                );
              case "note":
                return (
                  <p
                    key={index}
                    className="rounded-xl border border-border bg-white p-4 text-sm text-muted"
                  >
                    {block.text}
                  </p>
                );
              default:
                return <p key={index}>{block.text}</p>;
            }
          })}

          {article.sources?.length ? (
            <section aria-labelledby="sources" className="border-t border-border pt-8">
              <h2 id="sources" className="text-lg font-bold text-foreground">
                Sources
              </h2>
              <ul className="mt-3 space-y-3 text-sm">
                {article.sources.map((source) => (
                  <li key={source.url}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-accent hover:text-accent-hover"
                    >
                      {source.label}
                    </a>
                    <span className="block text-muted">{source.note}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <p className="border-t border-border pt-6 text-xs text-muted">
            Questions about a part?{" "}
            <Link href="/contact" className="text-accent hover:text-accent-hover">
              Contact DrivoraParts
            </Link>{" "}
            with your VIN or part number before ordering.
          </p>
        </article>
      </div>

      {related.length > 0 ? (
        <section className="border-t border-border bg-white">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              More from DrivoraParts News
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <NewsCard key={item.slug} article={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
