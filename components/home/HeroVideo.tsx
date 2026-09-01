"use client";

import { useEffect, useRef, useState } from "react";
import { getHeroVideo } from "@/lib/media/homepage-photo";

/**
 * The looping hero clip.
 *
 * Client-side because it has to make two decisions the server cannot: whether
 * the visitor has asked for reduced motion, and whether the browser actually
 * allowed autoplay. Both fall back to the poster frame, which is extracted
 * from the clip itself so the still and the first video frame match.
 *
 * WHY IT IS NOT JUST <video autoplay loop muted>
 *  - prefers-reduced-motion is a real accessibility setting, and a 10-second
 *    loop of a vehicle bouncing over a bank is exactly what it is meant to
 *    stop. Those visitors get the poster and no download at all.
 *  - Safari and most mobile browsers refuse autoplay unless the element is
 *    muted AND playsInline, and refuse it silently. play() returns a promise
 *    that rejects; if it does, we keep the poster rather than showing a frozen
 *    first frame.
 *  - preload="none" until we know we are allowed to play, so a phone on a
 *    metered connection is never billed for 2.3MB it will not see.
 */
export default function HeroVideo() {
  const clip = getHeroVideo();
  const ref = useRef<HTMLVideoElement>(null);
  const [play, setPlay] = useState(false);

  // Decide whether we are allowed to animate at all.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setPlay(true);
  }, []);

  // Only once `play` is true does the <source> exist. Calling play() in the
  // same tick as setPlay asked the element to start before it had anything to
  // start, so nothing ever played; load() picks the newly-rendered source up.
  useEffect(() => {
    if (!play) return;
    const el = ref.current;
    if (!el) return;
    el.load();
    const attempt = el.play();
    if (attempt && typeof attempt.catch === "function") {
      // Autoplay refusal is silent apart from this rejection.
      attempt.catch(() => setPlay(false));
    }
  }, [play]);

  if (!clip) return null;
  const { poster, file: src } = clip;

  return (
    <video
      ref={ref}
      className="h-full w-full object-cover object-[60%_center] sm:object-center"
      poster={poster}
      // Muted + playsInline are what make autoplay permissible at all.
      muted
      loop
      playsInline
      preload={play ? "auto" : "none"}
      aria-hidden="true"
      tabIndex={-1}
    >
      {play && src ? <source src={src} type="video/mp4" /> : null}
    </video>
  );
}
