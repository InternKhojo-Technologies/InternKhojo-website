"use client";

import { useEffect, useState } from "react";
import { formatMsClock } from "@/lib/hire-types";

interface ElapsedTimerProps {
  /** Anchor timestamp the readout counts up from. */
  startedAt: number;
  className?: string;
}

/**
 * Self-ticking elapsed-time readout. Owns its interval + tick state so the
 * parent test runner does NOT re-render twice per second — only this pill
 * updates. The parent keeps the authoritative anchor in a ref (read
 * synchronously at submit time) and mirrors it here as plain state.
 */
export default function ElapsedTimer({ startedAt, className }: ElapsedTimerProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [startedAt]);

  return (
    <span className={className} suppressHydrationWarning>
      {formatMsClock(Math.max(0, now - startedAt))}
    </span>
  );
}
