"use client";

import { useEffect, useRef } from "react";
import { getHeroVideo } from "@/lib/media/homepage-photo";

/**
 * The hero film, on every device, shuffled.
 *
 * WHY THE CLIP IS NO LONGER DESKTOP-ONLY
 * This was gated to mouse-and-trackpad devices to keep a 4.9MB background off a
 * phone's data plan. The gate worked -- too well: it is the film that carries
 * the montage, so a phone got one frozen frame of the desert shot and none of
 * the three locations the hero was cut to show. The shot list is the hero; a
 * still is not a cheaper version of it, it is a different thing. So the film
 * ships everywhere. The cost is deliberate: ~4.9MB per uncached load against
 * ~12KB for the still it replaces. The poster paints first, so the composition
 * is up immediately and the film takes over when it arrives.
 *
 * WHY THE SHUFFLE IS PLAYBACK, NOT FILES
 * hero.mp4 is one baked concatenation of three eight-second shots, so a plain
 * loop replays desert -> ridge -> snow in that order forever: every visitor
 * sees the same opening frame and every lap is identical. Shipping the shots as
 * three files would shuffle them the obvious way and cost three requests for
 * footage we already have in one. Instead the player treats the single file as
 * a reel and seeks between its cut points, so the order is fresh on every load
 * and every lap, at no extra bytes. The eight-second holds are untouched --
 * what varies is the order of the shots, not how long each is on screen.
 *
 * WHY A TIMER AND NOT requestAnimationFrame
 * This watcher used to poll on rAF, on the reasoning that timeupdate fires only
 * ~4x a second and would leave a visible slice of the wrong shot on screen
 * before the cut was noticed. The reasoning was right; the mechanism was not.
 * rAF only runs while the page is compositing, and a page can report itself
 * visible with rAF entirely stopped -- measured here at zero callbacks over
 * three seconds on a visible tab. iOS Safari also throttles it hard during
 * scroll and in Low Power Mode. When rAF stalls, the opening seek lands and
 * then nothing cuts again: the native loop takes over and the montage plays in
 * baked order, which is exactly the bug this replaces.
 *
 * A timer armed to the current shot's remaining runtime has neither problem. It
 * does not need the compositor, and it is more precise than polling was,
 * because it is scheduled to the cut instead of checking whether the cut has
 * already gone past. timeupdate stays on as a safety net for the two cases a
 * timer cannot cover: background-tab clamping, and a seek the network refused.
 *
 * WHY THE PLAYHEAD WINS OVER OUR BOOKKEEPING
 * A seek into a not-yet-downloaded part of the reel is simply refused, which on
 * a phone is routine for the first few seconds. The old watcher read "we are
 * not where I asked to be" as a wrap and advanced, walking the whole order in a
 * few frames and landing somewhere arbitrary. This one re-reads the playhead
 * and continues from whichever shot is genuinely on screen, so a slow start
 * costs the chosen opening shot, never the shuffle itself.
 *
 * AUTOPLAY
 * Muted autoplay is permitted on every current browser, but iOS Safari only
 * grants it to a video that is muted at the moment play() is called, and React
 * does not serialise the muted attribute into server-rendered HTML -- so
 * between paint and hydration the element is briefly unmuted, and an attempt in
 * that window is refused for good. Setting the property directly before play()
 * closes it. The attempt repeats as the file becomes playable, and falls back
 * to the first interaction for the one case nothing overrides: iOS Low Power
 * Mode, which refuses muted autoplay outright.
 *
 * prefers-reduced-motion is deliberately not honoured: Windows reports it
 * whenever "Animation effects" is off, which hid the film from a large share of
 * visitors who had never asked for a still.
 */

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

  /* Keep it playing. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const start = () => {
      if (!el.paused) return;
      el.muted = true; // the property, not the JSX attribute alone -- see above
      const attempt = el.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(() => {
          /* Refused for now; a later event or the first gesture retries. */
        });
      }
    };

    const onGesture = () => start();
    const stopWaitingForGesture = () => {
      document.removeEventListener("touchstart", onGesture);
      document.removeEventListener("click", onGesture);
    };

    start();
    el.addEventListener("loadeddata", start);
    el.addEventListener("canplay", start);
    el.addEventListener("playing", stopWaitingForGesture);
    document.addEventListener("touchstart", onGesture, { passive: true });
    document.addEventListener("click", onGesture);

    return () => {
      el.removeEventListener("loadeddata", start);
      el.removeEventListener("canplay", start);
      el.removeEventListener("playing", stopWaitingForGesture);
      stopWaitingForGesture();
    };
  }, []);

  /* Drive the shot order. */
  const segments = clip?.segments ?? [];
  const cuts = segments.length;

  useEffect(() => {
    // One shot is a plain loop -- there is no order to vary.
    if (cuts < 2) return;
    const el = ref.current;
    if (!el) return;

    const shots = segments;
    let order = shuffled(cuts, -1);
    let at = 0;
    let timer = 0;

    const current = () => shots[order[at]];
    const holds = (shot: { start: number; end: number }, t: number) =>
      t >= shot.start - 0.05 && t < shot.end;

    const clear = () => {
      if (timer) {
        window.clearTimeout(timer);
        timer = 0;
      }
    };

    /** Believe the playhead over `at`, and settle on the shot really on screen. */
    const reconcile = () => {
      const t = el.currentTime;
      if (holds(current(), t)) return true;
      const shot = shots.findIndex((s) => holds(s, t));
      if (shot < 0) return false; // mid-seek or past the end; the net retries
      const pos = order.indexOf(shot);
      if (pos < 0) return false;
      at = pos;
      return true;
    };

    /** Schedule the next cut for the moment this shot runs out. */
    const arm = () => {
      clear();
      if (el.paused || el.ended) return; // the play handler re-arms
      if (!reconcile()) return;
      const remaining = (current().end - el.currentTime) / (el.playbackRate || 1);
      timer = window.setTimeout(advance, Math.max(remaining * 1000, 0));
    };

    const advance = () => {
      if (at + 1 < order.length) {
        at += 1;
      } else {
        order = shuffled(cuts, order[at]);
        at = 0;
      }
      clear();
      try {
        el.currentTime = current().start;
      } catch {
        /* Not seekable yet; the net re-arms once it is. */
      }
      arm();
    };

    // The net: a clamped background timer, or a seek the network refused.
    const onTime = () => {
      if (!timer) arm();
      else if (el.currentTime >= current().end) advance();
    };

    const begin = () => {
      // Open on a random shot, not always the one the file starts with.
      try {
        el.currentTime = shots[order[0]].start;
      } catch {
        /* As above. */
      }
      arm();
    };

    if (el.readyState >= 1) begin();
    else el.addEventListener("loadedmetadata", begin, { once: true });

    el.addEventListener("seeked", arm);
    el.addEventListener("play", arm);
    el.addEventListener("playing", arm);
    el.addEventListener("ratechange", arm);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("pause", clear);

    return () => {
      clear();
      el.removeEventListener("loadedmetadata", begin);
      el.removeEventListener("seeked", arm);
      el.removeEventListener("play", arm);
      el.removeEventListener("playing", arm);
      el.removeEventListener("ratechange", arm);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("pause", clear);
    };
    // `segments` is derived fresh each render from a static manifest; `cuts` is
    // the value that actually changes when the montage does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuts]);

  if (!clip) return null;

  return (
    <video
      ref={ref}
      className="h-full w-full object-cover object-[34%_center] sm:object-center"
      poster={clip.poster}
      autoPlay
      muted
      // Backstop: if a seek is ever refused, the film keeps running instead of
      // freezing on the last frame, and the watcher reconciles from there.
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
