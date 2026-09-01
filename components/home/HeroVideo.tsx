"use client";

import { useEffect, useRef, useState } from "react";
import { getHeroVideo } from "@/lib/media/homepage-photo";

/**
 * The hero film — on desktop. Phones and tablets get the still.
 *
 * WHY THE CLIP IS DESKTOP-ONLY
 * The montage is 4.9MB, and on a 390px phone it was 95% of the page's entire
 * transfer: 4,821KB of 5,071KB, against 116KB for every image combined. That
 * is a lot of someone's data for a background. The still is ~12KB at phone
 * width, so mobile drops by about 95% and the composition is unchanged --
 * the poster is a frame from the clip, so it is the same picture, just not
 * moving.
 *
 * The decision is made client-side and the <video> is never mounted for a
 * touch device, so the bytes are not merely hidden -- they are never
 * requested. CSS alone could not do this: a `hidden sm:block` video still
 * downloads.
 *
 * WHY THE TEST IS THE POINTER, NOT THE WIDTH
 * This was `(min-width: 640px)` alone, and an iPhone 8 walked straight through
 * it: 375px in portrait, but 667px in landscape. Rotating the phone cleared
 * the gate and pulled all 4.9MB -- precisely the cost the breakpoint existed
 * to avoid.
 *
 * No width fixes that, because phone landscape sizes now sit on top of tablet
 * sizes: an iPhone 8 is 667 landscape, an 8 Plus 736, an XR 896, a 15 Pro Max
 * 932 -- against an iPad's 768-834 portrait. There is no number between them.
 * Safari's "Request Desktop Website" reports ~980 and clears all of them.
 *
 * `hover: hover` with `pointer: fine` describes a mouse or a trackpad, which
 * is the thing actually being asked about, and it answers the same way at
 * every size and in both orientations. The width test is kept alongside so a
 * narrow desktop window still drops to the still.
 *
 * It re-evaluates on change, so dragging a desktop window narrow lands on the
 * right treatment rather than whatever matched at first paint.
 *
 * Autoplay is unconditional where the clip does load. Windows reports
 * prefers-reduced-motion whenever "Animation effects" is off, which is common
 * enough that honouring it hid the film from a large share of visitors who had
 * never asked for a still.
 *
 * WHY THE SHUFFLE IS PLAYBACK, NOT FILES
 * hero.mp4 is one baked concatenation of three eight-second shots, so a plain
 * `loop` replayed desert → ridge → snow in that order forever: every visitor
 * saw the same opening frame and every lap of the loop was identical. Shipping
 * the shots as three separate files would shuffle them the obvious way and
 * cost three requests and three sets of headers for footage we already have in
 * one. Instead the player treats the single file as a reel and seeks between
 * its cut points, so the order is fresh on every load and on every lap, at no
 * extra bytes. The eight-second holds are untouched -- what varies is the
 * order of the shots, not how long any of them stays on screen.
 */
const DESKTOP = "(min-width: 640px) and (hover: hover) and (pointer: fine)";

/** Fisher-Yates, avoiding `avoid` in the lead so no shot repeats across a lap. */
function shuffled(count: number, avoid: number): number[] {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (order.length > 1 && order[0] === avoid) {
    [order[0], order[order.length - 1]] = [order[order.length - 1], order[0]];
  }
  return order;
}

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

  /*
   * Drive the shot order.
   *
   * The watcher runs on rAF rather than `timeupdate`. `timeupdate` fires about
   * four times a second, which is up to a quarter-second of the next shot
   * already on screen before the cut is noticed -- a visible slice of the
   * wrong location. A frame-rate check cuts within ~16ms, so the seek reads as
   * an edit. rAF also idles with the tab in the background, which is where we
   * want it: a hidden hero should not be seeking.
   */
  const segments = clip?.segments ?? [];
  const cuts = segments.length;

  useEffect(() => {
    // One shot is a plain loop -- there is no order to vary.
    if (!motion || cuts < 2) return;
    const el = ref.current;
    if (!el) return;

    const shots = segments;
    let order = shuffled(cuts, -1);
    let at = 0;
    let frame = 0;

    const cut = (index: number) => {
      at = index;
      try {
        el.currentTime = shots[order[at]].start;
      } catch {
        /* Not seekable yet. The next frame retries. */
      }
    };

    const tick = () => {
      frame = requestAnimationFrame(tick);
      // A seek in flight still reports the old currentTime, which would read
      // as an overrun and fire a second cut.
      if (el.seeking) return;
      const seg = shots[order[at]];
      if (!seg) return;
      // Second clause catches the native `loop` wrapping to zero underneath
      // us, which happens if a seek is refused and playback runs to the end.
      const overran = el.currentTime >= seg.end - 0.03;
      const wrapped = el.currentTime < seg.start - 0.5;
      if (!overran && !wrapped) return;
      if (at + 1 < order.length) {
        cut(at + 1);
      } else {
        order = shuffled(cuts, order[at]);
        cut(0);
      }
    };

    const begin = () => {
      cut(0);
      frame = requestAnimationFrame(tick);
    };

    // currentTime is not settable until the browser knows the duration.
    if (el.readyState >= 1) begin();
    else el.addEventListener("loadedmetadata", begin, { once: true });

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("loadedmetadata", begin);
    };
    // `segments` is derived fresh each render from a static manifest; `cuts`
    // is the value that actually changes when the montage does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motion, cuts]);

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
      // Kept as a backstop: if a seek is ever refused, the film still loops
      // instead of freezing on the last frame, and the watcher recovers.
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
