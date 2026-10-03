import Link from "next/link";
import {
  formatNewsDate,
  newsArticlePath,
  type NewsArticle,
} from "@/lib/content/news";

type Props = {
  article: NewsArticle;
  /** The lead story: larger, image beside the text on wide screens. */
  featured?: boolean;
};

export default function NewsCard({ article, featured = false }: Props) {
  const href = newsArticlePath(article.slug);

  return (
    <article
      className={
        featured
          ? "grid overflow-hidden rounded-2xl border border-border bg-white md:grid-cols-2"
          : "flex flex-col overflow-hidden rounded-2xl border border-border bg-white"
      }
    >
      <Link
        href={href}
        prefetch={false}
        className={`block overflow-hidden bg-background-dark ${
          featured ? "aspect-[16/10] md:aspect-auto md:min-h-[22rem]" : "aspect-[16/10]"
        }`}
        aria-label={article.title}
      >
        <img
          src={article.cover.src}
          alt={article.cover.alt}
          width={1600}
          height={1000}
          loading={featured ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
        />
      </Link>

      <div className={`flex flex-1 flex-col ${featured ? "p-6 sm:p-8" : "p-5"}`}>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
          {featured ? "Featured · " : ""}
          {article.category}
        </p>
        <h2
          className={`mt-2 font-bold leading-snug tracking-tight text-foreground ${
            featured ? "text-2xl sm:text-3xl" : "text-lg"
          }`}
        >
          <Link href={href} prefetch={false} className="hover:text-accent-hover">
            {article.title}
          </Link>
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{article.excerpt}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <time dateTime={article.datePublished} className="text-xs text-muted">
            {formatNewsDate(article.datePublished)}
          </time>
          <Link
            href={href}
            prefetch={false}
            className="inline-flex items-center rounded-full bg-background-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            Read Article
          </Link>
        </div>
      </div>
    </article>
  );
}
