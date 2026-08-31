import { attributions } from "@/lib/media/homepage-photo";

/**
 * Photography credits.
 *
 * Seven of the vehicle photographs are CC BY-SA 4.0, which is not a courtesy
 * licence: it requires the creator's name, a link to the licence, a link back
 * to the source, and an indication that the work was modified. We resize and
 * re-encode every image to WebP, so it is modified, and that is stated here.
 *
 * The Pexels, CC0 and public-domain images are deliberately absent. Naming
 * their photographers would imply those licences demand credit when they do
 * not, and overstating an obligation is its own kind of inaccuracy.
 *
 * Rendered from the manifest, so acquiring a differently-licensed photograph
 * updates this list without anyone remembering to.
 */
export default function PhotoCredits() {
  const credits = attributions();
  if (!credits.length) return null;

  return (
    <section
      className="border-t border-border-on-dark bg-background-dark px-5 py-10 sm:px-8"
      aria-labelledby="photo-credits-heading"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="photo-credits-heading"
          className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-on-dark"
        >
          Photography credits
        </h2>
        <p className="mt-3 max-w-3xl text-xs leading-relaxed text-muted-on-dark">
          Vehicle photography below is used under Creative Commons licences.
          Each image has been resized and converted to WebP for the web.
        </p>

        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
          {credits.map((c) => (
            <li key={c.slot} className="text-xs leading-relaxed text-muted-on-dark">
              {c.landingPage ? (
                <a
                  href={c.landingPage}
                  rel="noopener noreferrer nofollow"
                  target="_blank"
                  className="underline decoration-border-on-dark underline-offset-2 transition-colors hover:text-foreground-on-dark"
                >
                  {c.vehicle || c.title}
                </a>
              ) : (
                <span>{c.vehicle || c.title}</span>
              )}
              <span> — {c.creator || "Unknown"}, </span>
              {c.licenseUrl ? (
                <a
                  href={c.licenseUrl}
                  rel="noopener noreferrer nofollow license"
                  target="_blank"
                  className="underline decoration-border-on-dark underline-offset-2 transition-colors hover:text-foreground-on-dark"
                >
                  {c.licenseRaw || c.license}
                </a>
              ) : (
                <span>{c.licenseRaw || c.license}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
