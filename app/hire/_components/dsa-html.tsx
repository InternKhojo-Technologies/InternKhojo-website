"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronsUpDown, Code2 } from "lucide-react";
import {
  defaultCodeTabIndex,
  formatDsaBody,
  formatDsaOption,
  type DsaBodySegment,
  type DsaCodeTab,
} from "@/lib/dsa-format";

/**
 * Rich-HTML renderers for DSA bank text (hire DSA track + DSA practice).
 *
 * Bank text goes through `formatDsaBody` / `formatDsaOption` first: `[tex]`
 * math becomes unicode, scrape artifacts are cleaned, plain-text code
 * becomes dark blocks, and multi-language code-tab stacks become a
 * language dropdown (C++ default). Bank images are hardened (lazy,
 * no-referrer) with a Wayback retry + graceful fallback. HTML segments render natively via
 * `dangerouslySetInnerHTML`. Containment (no horizontal overflow) comes
 * from the `.dsa-html` CSS in app/globals.css.
 */

function Segments({ segments }: { segments: DsaBodySegment[] }) {
  const ref = useDsaImgFallback<HTMLDivElement>();
  return (
    <div ref={ref} className="min-w-0">
      {segments.map((seg, i) =>
        seg.kind === "code" ? (
          <DsaCodeTabs key={i} tabs={seg.tabs} />
        ) : (
          <div
            key={i}
            className="dsa-html"
            dangerouslySetInnerHTML={{ __html: seg.html }}
          />
        )
      )}
    </div>
  );
}

export function DsaQuestionBody({ html }: { html: string }) {
  const segments = useMemo(() => formatDsaBody(html), [html]);
  if (segments.length === 0) return null;
  return (
    <div className="text-[16px] sm:text-[17px] font-medium leading-[1.7] text-neutral-900">
      <Segments segments={segments} />
    </div>
  );
}

export function DsaOptionHtml({ html }: { html: string }) {
  const formatted = useMemo(() => formatDsaOption(html), [html]);
  const ref = useDsaImgFallback<HTMLSpanElement>();
  return (
    <span
      ref={ref}
      className="dsa-html block min-w-0 flex-1 text-[14.5px] font-medium leading-snug break-words"
      dangerouslySetInnerHTML={{ __html: formatted }}
    />
  );
}

export function DsaSolutionHtml({ html }: { html: string }) {
  const segments = useMemo(() => formatDsaBody(html), [html]);
  if (segments.length === 0) return null;
  return (
    <div className="dsa-html mt-1.5 space-y-2 text-sm leading-[1.7] text-neutral-700">
      <Segments segments={segments} />
    </div>
  );
}

/** Inline (non-HTML) rendering of an option/answer string for tight spots. */
export function DsaInlineHtml({ html, className }: { html: string; className?: string }) {
  const formatted = useMemo(() => formatDsaOption(html), [html]);
  const ref = useDsaImgFallback<HTMLSpanElement>();
  return (
    <span
      ref={ref}
      className={`dsa-html ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: formatted }}
    />
  );
}

/**
 * Image resilience for scraped bank diagrams. Resource errors don't bubble,
 * so this listens in the capture phase on each rendered DSA subtree.
 * - Known-dead hosts (media.InternKhojo.org — NXDOMAIN at the time of
 *   writing) are retried once through the Wayback Machine, which archives
 *   most GeeksforGeeks diagrams.
 * - Anything still failing is swapped for an honest inline note instead of
 *   a broken-image icon, so the card layout never breaks.
 */
const DEAD_IMG_HOST_RE = /^https?:\/\/media\.InternKhojo\.org/i;

function handleDsaImgError(e: Event) {
  const t = e.target;
  if (!(t instanceof HTMLImageElement)) return;
  const stage = t.dataset.dsaFb ?? "0";
  const orig = t.dataset.dsaOrig ?? t.getAttribute("src") ?? "";
  if (stage === "0" && DEAD_IMG_HOST_RE.test(orig)) {
    t.dataset.dsaOrig = orig;
    t.dataset.dsaFb = "1";
    t.src = `https://web.archive.org/web/${orig}`;
  } else {
    const note = document.createElement("div");
    note.className = "dsa-img-fallback";
    note.textContent = "(diagram unavailable)";
    t.replaceWith(note);
  }
}

/** Attach the capture-phase image fallback to a rendered DSA subtree. */
function useDsaImgFallback<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.addEventListener("error", handleDsaImgError, true);
    return () => root.removeEventListener("error", handleDsaImgError, true);
  }, []);
  return ref;
}

/**
 * Multi-language code block with a dropdown switcher.
 * Default: C++ when present, otherwise the first language.
 */
export function DsaCodeTabs({ tabs }: { tabs: DsaCodeTab[] }) {
  const [sel, setSel] = useState(() => defaultCodeTabIndex(tabs));
  const tab = tabs[Math.min(sel, tabs.length - 1)] ?? tabs[0];
  if (!tab) return null;

  return (
    // NOTE: the `dsa-html` class is required here — the dark code-block theme,
    // token colors and containment CSS all scope under it. Without it the
    // tabbed snippet renders as an unstyled browser <pre>.
    <div className="dsa-html dsa-codetabs my-3 min-w-0">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-400">
          <Code2 size={12} /> Code
        </span>
        {tabs.length > 1 ? (
          <label className="relative inline-flex items-center">
            <span className="sr-only">Choose code language</span>
            <select
              value={sel}
              onChange={(e) => setSel(Number(e.target.value))}
              aria-label="Choose code language"
              className="h-8 cursor-pointer appearance-none rounded-lg border border-neutral-700 bg-neutral-900 pl-3 pr-8 text-xs font-bold text-white outline-none transition-colors hover:border-emerald-400 focus:border-emerald-400"
            >
              {tabs.map((t, i) => (
                <option key={i} value={i}>
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronsUpDown
              size={13}
              className="pointer-events-none absolute right-2 text-neutral-400"
            />
          </label>
        ) : (
          <span className="rounded-md bg-neutral-900 px-2 py-1 text-[11px] font-bold text-white">
            {tab.label}
          </span>
        )}
      </div>
      <pre
        key={sel}
        className="dsa-code"
        dangerouslySetInnerHTML={{ __html: tab.html }}
      />
    </div>
  );
}

/** Small pill showing the snippet language (C / C++ …). Null = theory. */
export function LanguageBadge({ language }: { language?: string | null }) {
  if (!language) return null;
  return (
    <span
      title={`Code snippet in ${language}`}
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-600 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white shadow-sm"
    >
      <Code2 size={12} strokeWidth={2.5} />
      {language}
    </span>
  );
}
