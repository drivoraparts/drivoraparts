"use client";

import { useEffect, useRef, useState } from "react";
import { getHeroVideo } from "@/lib/media/homepage-photo";

/**
 * The hero film — on desktop. Phones get the still.
 *
 * WHY THE CLIP IS DESKTOP-ONLY
 * The montage is 4.9MB, and on a 390px phone it was 95% of the page's entire
 * transfer: 4,821KB of 5,071KB, against 116KB for every image combined. That
 * is a lot of someone's data for a background. The still is ~12KB at phone
 * width, so mobile drops by about 95% and the composition is unchanged --
 * the poster is a frame from the clip, so it is the same picture, just not
 * moving.
 *
 * The decision is made client-side and the <video> is never mounted below the
 * breakpoint, so the bytes are not merely hidden -- they are never requested.
 * CSS alone could not do this: a `hidden sm:block` video still downloads.
 *
 * It re-evaluates on resize, so rotating a phone into landscape, or dragging a
 * desktop window narrow, lands on the right treatment rather than whatever
 * matched at first paint.
 *
 * Autoplay is unconditional where the clip does load. Windows reports
 * prefers-reduced-motion whenever "Animation effects" is off, which is common
 * enough that honouring it hid the film from a large share of visitors who had
 * never asked for a still.
 */
const DESKTOP = "(min-width: 640px)";

export default function HeroVideo() {
  const clip = getHeroVideo();
  const ref = useRef<HTMLVideoElement>(null);
  const [motion, setMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const sync = () => setMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!motion) return;
    const el = ref.current;
    if (!el) return;
    const attempt = el.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => {
        /* Autoplay refused; the poster stands in. Nothing to recover. */
      });
    }
  }, [motion]);

  if (!clip) return null;

  const frame = "h-full w-full object-cover object-[34%_center] sm:object-center";

  if (!motion) {
    return (
      <img
        src={clip.poster}
        srcSet={clip.posterSrcSet ?? undefined}
        sizes="100vw"
        alt=""
        // The hero is the largest contentful paint on a phone, so this one
        // loads eagerly and at high priority rather than waiting its turn.
        fetchPriority="high"
        decoding="async"
        className={frame}
      />
    );
  }

  return (
    <video
      ref={ref}
      className={frame}
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
