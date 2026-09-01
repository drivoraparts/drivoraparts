import type { Metadata } from "next";

import { attributions } from "@/lib/media/homepage-photo";
import { buildPageMetadata } from "@/lib/seo";

/**
 * Photography and image credits.
 *
 * This was a full-width band at the bottom of the homepage. The obligation it
 * satisfies is real, but a wall of licence text is not how a homepage should
 * end, so the credits moved here and the footer links to them from every page.
 *
 * WHAT THE LICENCES ACTUALLY REQUIRE
 * Several of the vehicle photographs are CC BY-SA 4.0, which is not a courtesy
 * licence: it requires the creator's name, a link to the licence, a link back
 * to the source, and an indication that the work was modified. Every image is
 * resized and re-encoded to WebP, so it is modified, and that is stated below.
 * A page linked from the footer of every page is a reasonable place for that
 * -- the requirement is that attribution is accessible, not that it sits under
 * the picture.
 *
 * The Pexels, CC0 and public-domain images are deliberately absent. Naming
 * their photographers would imply those licences demand credit when they do
 * not, and overstating an obligation is its own kind of inaccuracy.
 *
 * The list is rendered from the same manifest the images themselves come from,
 * so acquiring a differently-licensed photograph updates this page without
 * anyone remembering to. Nothing here is a second copy of the metadata.
 */
export const metadata: Metadata = buildPageMetadata({
  title: "Photography & Image Credits",
  description:
    "Creator and licence credits for the vehicle photography used across DrivoraParts.",
  path: "/photography-credits",
});

export default function PhotographyCreditsPage() {
  const credits = attributions();

  return (
    <main className="min-h-screen bg-background px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
          Credits
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Photography &amp; image credits
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Vehicle photography across this site is used under Creative Commons
          licences. Each image has been resized and converted to WebP for the
          web, and is therefore a modified version of the original.
        </p>

        {credits.length === 0 ? (
          <p className="mt-8 text-sm text-muted">
            No photography currently in use requires attribution.
          </p>
        ) : (
          <ul className="mt-8 space-y-4 border-t border-border pt-8">
            {credits.map((c) => (
              <li
                key={c.slot}
                className="text-sm leading-relaxed text-muted"
              >
                {c.landingPage ? (
                  <a
                    href={c.landingPage}
                    rel="noopener noreferrer nofollow"
                    target="_blank"
                    className="font-semibold text-foreground underline decoration-border-strong underline-offset-2 transition-colors hover:text-accent"
                  >
                    {c.vehicle || c.title}
                  </a>
                ) : (
                  <span className="font-semibold text-foreground">
                    {c.vehicle || c.title}
                  </span>
                )}
                <span> — {c.creator || "Unknown"}, </span>
                {c.licenseUrl ? (
                  <a
                    href={c.licenseUrl}
                    rel="noopener noreferrer nofollow license"
                    target="_blank"
                    className="underline decoration-border-strong underline-offset-2 transition-colors hover:text-accent"
                  >
                    {c.licenseRaw || c.license}
                  </a>
                ) : (
                  <span>{c.licenseRaw || c.license}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
