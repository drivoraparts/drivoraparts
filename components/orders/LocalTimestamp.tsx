"use client";

import { useEffect, useState } from "react";

/**
 * An instant, shown in the viewer's own timezone.
 *
 * Formatting a date on the server formats it in the SERVER's zone, which on
 * Workers is UTC. The receipt list on /pay did exactly that, so a customer who
 * uploaded proof of payment at 9pm in California saw it stamped 4am the next
 * day -- on the page where the whole point is showing when they paid.
 *
 * Only the browser knows the viewer's zone, so the formatting waits for it.
 * That means nothing is rendered on the server pass and the text appears on
 * mount; `dateTime` carries the exact instant either way, so the markup is
 * still machine-readable in between. Deliberately not `suppressHydrationWarning`
 * over a server-formatted string: that silences the warning without fixing the
 * value, which would leave the wrong time on screen.
 */
export default function LocalTimestamp({
  iso,
  className,
}: {
  iso: string;
  className?: string;
}) {
  const [local, setLocal] = useState<string | null>(null);

  useEffect(() => {
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return;

    setLocal(
      parsed.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    );
  }, [iso]);

  return (
    <time dateTime={iso} className={className}>
      {local}
    </time>
  );
}
