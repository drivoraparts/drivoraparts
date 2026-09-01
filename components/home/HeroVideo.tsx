"use client";

import { useEffect, useRef } from "react";
import { getHeroVideo } from "@/lib/media/homepage-photo";

/**
 * The looping hero clip. Plays on its own, always.
 *
 * There is deliberately no reduced-motion gate. An earlier version honoured
 * prefers-reduced-motion and showed the poster instead, which sounds correct
 * until you learn that Windows reports that preference whenever "Animation
 * effects" is switched off in Accessibility settings -- common on machines
 * tuned for performance, and enough to hide the hero film from a large share
 * of visitors who never asked for a still. The reference site this page is
 * matched to autoplays unconditionally too.
 *
 * The poster remains the fallback, but for the one case a site cannot control:
 * Safari and most mobile browsers refuse autoplay unless the element is muted
 * AND playsInline, and they refuse silently. play() returns a promise that
 * rejects; when it does, the poster is what the visitor sees.
 */
export default function HeroVideo() {
  const clip = getHeroVideo();
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // The <source> is in the markup from the first render, so there is nothing
    // to wait for -- but calling play() explicitly covers browsers that ignore
    // the autoplay attribute while still allowing a muted inline start.
    const attempt = el.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => {
        /* Autoplay refused; the poster stands in. Nothing to recover. */
      });
    }
  }, []);

  /*
   * The mobile crop is 34%, not centred. object-cover on a portrait phone
   * shows a narrow vertical slice of a 16:9 source, and object-position picks
   * which slice: below 50% the window moves left, so a centred subject lands
   * to the RIGHT of the visible frame -- clear of the text column instead of
   * behind it. Desktop shows enough of the frame to centre normally.
   */
  if (!clip) return null;

  return (
    <video
      ref={ref}
      className="h-full w-full object-cover object-[34%_center] sm:object-center"
      poster={clip.poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src={clip.file} type="video/mp4" />
    </video>
  );
}
