/**
 * Makes the Tawk launcher draggable, like a Messenger chat head.
 *
 * Tawk gives its container and iframes randomised ids on every load, and the
 * container itself is 0x0 — each iframe is independently `position: fixed`
 * with its own bottom/right. So the widget is found structurally rather than
 * by id, and moved by transforming the individual bubbles rather than a
 * wrapper.
 *
 * Dragging the bubble directly is not possible: it is a cross-origin iframe
 * and swallows the pointer events. A transparent handle is laid over it
 * instead — a press that travels far enough becomes a drag, and one that
 * doesn't is treated as a tap and opens the chat through Tawk's own API.
 */

const STORAGE_KEY = "drivora-chat-position";

/** Past this, a press is a drag rather than a tap. */
const DRAG_THRESHOLD_PX = 6;

/** Keeps the bubble reachable — it can never be dragged fully off-screen. */
const EDGE_MARGIN_PX = 8;

/** Anything wider than this is the chat panel, not a bubble; it stays put. */
const PANEL_MIN_WIDTH_PX = 200;

type Offset = { x: number; y: number };

let cleanup: (() => void) | null = null;

/**
 * Set the moment setup begins, not when it finishes. Tawk's onLoaded is not a
 * reliable single trigger, so this is safe to call from several places — the
 * flag is what stops a second call starting a second poll.
 */
let initialised = false;

/** Kept so teardown can stop a poll that never found the widget. */
let pollTimer: number | null = null;

function readStoredOffset(): Offset {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { x: 0, y: 0 };
    const parsed = JSON.parse(raw) as Partial<Offset>;
    const x = Number(parsed.x);
    const y = Number(parsed.y);
    return {
      x: Number.isFinite(x) ? x : 0,
      y: Number.isFinite(y) ? y : 0,
    };
  } catch {
    return { x: 0, y: 0 };
  }
}

function writeStoredOffset(offset: Offset): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(offset));
  } catch {
    // Private browsing or quota — the bubble simply won't remember its spot.
  }
}

/** The widget root: a fixed, very-high-z-index div holding Tawk's iframes. */
function findWidgetRoot(): HTMLElement | null {
  const candidates = document.querySelectorAll<HTMLElement>("body > div");

  for (const node of candidates) {
    if (!node.querySelector("iframe")) continue;
    const style = window.getComputedStyle(node);
    if (style.position !== "fixed") continue;
    if (Number.parseInt(style.zIndex || "0", 10) < 1_000_000) continue;
    return node;
  }

  return null;
}

/** The launcher bubble — the visible iframe nearest to a 60px square. */
function findLauncher(root: HTMLElement): HTMLElement | null {
  let best: HTMLElement | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const frame of root.querySelectorAll<HTMLElement>("iframe")) {
    if (window.getComputedStyle(frame).display === "none") continue;
    const rect = frame.getBoundingClientRect();
    if (rect.width < 30 || rect.height < 30) continue;
    if (rect.width >= PANEL_MIN_WIDTH_PX) continue;

    const score = Math.abs(rect.width - 60) + Math.abs(rect.height - 60);
    if (score < bestScore) {
      bestScore = score;
      best = frame;
    }
  }

  return best;
}

export function makeTawkDraggable(): void {
  if (typeof window === "undefined") return;
  if (initialised) return;
  initialised = true;

  // Coarse pointers get this too — dragging a chat head is a touch idiom —
  // but a device that cannot hover still needs the tap path to work, which it
  // does, because tap and drag are distinguished by distance, not by input.
  let offset = readStoredOffset();
  let root: HTMLElement | null = null;
  let handle: HTMLDivElement | null = null;
  let dragging = false;
  let moved = false;
  let startX = 0;
  let startY = 0;
  let startOffset: Offset = { x: 0, y: 0 };
  let pointerId: number | null = null;

  /** Applies the current offset to every bubble, leaving the panel alone. */
  function paint(): void {
    if (!root) return;

    for (const child of Array.from(root.children)) {
      if (!(child instanceof HTMLElement)) continue;
      if (child === handle) continue; // positions itself, see syncHandle
      const rect = child.getBoundingClientRect();

      // The open chat panel keeps Tawk's own anchoring, so it can never be
      // dragged half off-screen — only the bubbles follow the drag.
      if (rect.width >= PANEL_MIN_WIDTH_PX) {
        child.style.transform = "";
        continue;
      }

      child.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
    }

    syncHandle();
  }

  /**
   * Keeps the invisible drag handle sitting exactly over the bubble.
   *
   * Positioned by offsetting Tawk's own bottom/right anchors rather than by
   * transform. Both would work in a browser, but bottom/right is plain layout
   * — it needs no compositing, so it behaves identically in every environment
   * the widget might be rendered in, including headless checks.
   *
   * The bubble moves up and left as the offset goes negative, so the anchors
   * grow by the same amount in the opposite direction.
   */
  function syncHandle(): void {
    if (!handle || !root) return;

    const launcher = findLauncher(root);
    if (!launcher) {
      handle.style.display = "none";
      return;
    }

    const rect = launcher.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      handle.style.display = "none";
      return;
    }

    // Tawk rebuilds its subtree on open/close and can drop foreign nodes.
    if (handle.parentElement !== root) root.appendChild(handle);

    // Computed bottom/right ignore any transform, so these stay the bubble's
    // untransformed anchors even mid-drag.
    const launcherStyle = window.getComputedStyle(launcher);
    const baseBottom = Number.parseFloat(launcherStyle.bottom) || 0;
    const baseRight = Number.parseFloat(launcherStyle.right) || 0;

    handle.style.display = "block";
    handle.style.bottom = `${baseBottom - offset.y}px`;
    handle.style.right = `${baseRight - offset.x}px`;
    handle.style.width = `${rect.width}px`;
    handle.style.height = `${rect.height}px`;
  }

  /** Stops the bubble being dragged past any edge. */
  function clamp(next: Offset): Offset {
    if (!root) return next;
    const launcher = findLauncher(root);
    if (!launcher) return next;

    // Where the bubble sits with no offset at all.
    const rect = launcher.getBoundingClientRect();
    const baseLeft = rect.left - offset.x;
    const baseTop = rect.top - offset.y;

    const minX = EDGE_MARGIN_PX - baseLeft;
    const maxX = window.innerWidth - rect.width - EDGE_MARGIN_PX - baseLeft;
    const minY = EDGE_MARGIN_PX - baseTop;
    const maxY = window.innerHeight - rect.height - EDGE_MARGIN_PX - baseTop;

    return {
      x: Math.min(Math.max(next.x, minX), maxX),
      y: Math.min(Math.max(next.y, minY), maxY),
    };
  }

  function onPointerDown(event: PointerEvent): void {
    if (event.button !== 0 && event.pointerType === "mouse") return;

    dragging = true;
    moved = false;
    startX = event.clientX;
    startY = event.clientY;
    startOffset = { ...offset };
    pointerId = event.pointerId;

    // Capture keeps the moves coming even when the pointer crosses the
    // iframe underneath, which would otherwise swallow them.
    try {
      handle?.setPointerCapture(event.pointerId);
    } catch {
      // Some pointer ids cannot be captured; the drag still works without it.
    }

    event.preventDefault();
  }

  function onPointerMove(event: PointerEvent): void {
    if (!dragging || event.pointerId !== pointerId) return;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    if (!moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;

    moved = true;
    if (handle) handle.style.cursor = "grabbing";

    offset = clamp({ x: startOffset.x + dx, y: startOffset.y + dy });
    paint();
  }

  function onPointerUp(event: PointerEvent): void {
    if (!dragging || event.pointerId !== pointerId) return;

    dragging = false;
    pointerId = null;
    if (handle) handle.style.cursor = "grab";

    try {
      if (handle?.hasPointerCapture?.(event.pointerId)) {
        handle.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Already released.
    }

    if (moved) {
      writeStoredOffset(offset);
      return;
    }

    // Didn't travel — treat as a tap and open the chat.
    window.Tawk_API?.maximize?.();
  }

  function onResize(): void {
    offset = clamp(offset);
    paint();
    writeStoredOffset(offset);
  }

  function start(widgetRoot: HTMLElement): void {
    root = widgetRoot;

    handle = document.createElement("div");
    handle.setAttribute("aria-hidden", "true");
    handle.dataset.drivoraChatHandle = "true";
    Object.assign(handle.style, {
      position: "fixed",
      display: "none",
      cursor: "grab",
      touchAction: "none",
      background: "transparent",
      // Above Tawk's own stacking context so the press lands here, not in
      // the cross-origin iframe where we could never see it.
      zIndex: "2000000001",
    } satisfies Partial<CSSStyleDeclaration>);

    // Inside Tawk's container, so paint() transforms it alongside the bubbles.
    widgetRoot.appendChild(handle);

    handle.addEventListener("pointerdown", onPointerDown);
    handle.addEventListener("pointermove", onPointerMove);
    handle.addEventListener("pointerup", onPointerUp);
    handle.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("resize", onResize);

    // Tawk rewrites inline styles when the chat opens, closes, or a message
    // arrives, which would drop the transform and leave the handle stranded.
    const observer = new MutationObserver(() => paint());
    observer.observe(widgetRoot, {
      attributes: true,
      attributeFilter: ["style"],
      childList: true,
      subtree: true,
    });

    offset = clamp(offset);
    paint();

    cleanup = () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      handle?.remove();
      handle = null;
      root = null;
    };
  }

  // Tawk is injected on idle and mounts some seconds later, so this may
  // begin polling before the script is even on the page. Thirty seconds is
  // generous enough to cover a slow connection and still give up eventually.
  let attempts = 0;
  const poll = window.setInterval(() => {
    attempts += 1;
    const found = findWidgetRoot();

    if (found) {
      window.clearInterval(poll);
      start(found);
      return;
    }

    if (attempts > 120) {
      window.clearInterval(poll);
      initialised = false;
    }
  }, 250);

  pollTimer = poll;
}

export function teardownTawkDraggable(): void {
  if (pollTimer !== null) {
    window.clearInterval(pollTimer);
    pollTimer = null;
  }
  cleanup?.();
  cleanup = null;
  initialised = false;
}
