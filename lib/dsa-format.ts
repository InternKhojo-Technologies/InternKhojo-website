/**
 * DSA bank text formatter (display-only — never use on the submit path).
 *
 * The `dsa_questions` bank was scraped from the open web, so its text needs
 * three kinds of repair before rendering:
 *
 * 1. `[tex]` math markers — e.g. `??[Tex]\theta??[/Tex](n)`,
 *    `[Tex]\Theta(mLogm)[/Tex]` — converted to unicode (θ, Θ(n), …) wrapped
 *    in a styled `<span class="dsa-tex">` so math is visually distinct.
 * 2. Scrape artifacts — stray `??` runs and `??????` (a corrupted "…").
 * 3. Plain-text code questions — C/C++ snippet questions arrive as raw text
 *    with newlines (no HTML). Code lines are detected and wrapped in a dark
 *    `<pre class="dsa-code">` block so code is clearly distinguished from
 *    the black question prose; prose lines become `<p>`.
 *
 * Output is an HTML string for `dangerouslySetInnerHTML`. Grading still
 * compares the raw bank strings, so these helpers must never alter answers.
 */

const TEX_MARKER_RE = /(?:\?{2,4})?\[tex\]([\s\S]*?)(?:\?{2,4})?\[\/tex\]/gi;
const PLACEHOLDER_PREFIX = "\u0001";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function containsHtml(s: string): boolean {
  // Only real markup counts — angle brackets in C code (`#include<stdio.h>`,
  // `a<b`, `->`) must NOT trigger the HTML path.
  return /<\/?(?:p|div|span|pre|code|br|hr|img|figure|figcaption|sub|sup|strong|b|em|i|u|a|ul|ol|li|table|thead|tbody|tr|td|th|font|center)\b[^>]*>/i.test(
    s
  );
}

/* ── superscript / subscript maps ─────────────────────────────────── */

const SUP: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  a: "ᵃ", b: "ᵇ", c: "ᶜ", d: "ᵈ", e: "ᵉ", f: "ᶠ", g: "ᵍ", h: "ʰ",
  i: "ⁱ", j: "ʲ", k: "ᵏ", l: "ˡ", m: "ᵐ", n: "ⁿ", o: "ᵒ", p: "ᵖ",
  q: "𐞥", r: "ʳ", s: "ˢ", t: "ᵗ", u: "ᵘ", v: "ᵛ", w: "ʷ", x: "ˣ",
  y: "ʸ", z: "ᶻ",
  A: "ᴬ", B: "ᴮ", D: "ᴰ", E: "ᴱ", G: "ᴳ", H: "ᴴ", I: "ᴵ", J: "ᴶ",
  K: "ᴷ", L: "ᴸ", M: "ᴹ", N: "ᴺ", O: "ᴼ", P: "ᴾ", R: "ᴿ", T: "ᵀ",
  U: "ᵁ", V: "ⱽ", W: "ᵂ",
  "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾",
};

const SUB: Record<string, string> = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
  "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  a: "ₐ", e: "ₑ", h: "ₕ", i: "ᵢ", k: "ₖ", l: "ₗ", m: "ₘ",
  n: "ₙ", o: "ₒ", p: "ₚ", r: "ᵣ", s: "ₛ", t: "ₜ", u: "ᵤ",
  v: "ᵥ", x: "ₓ",
  "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎",
};

function toSup(s: string): string {
  return s.split("").map((c) => SUP[c] ?? c).join("");
}

function toSub(s: string): string {
  return s.split("").map((c) => SUB[c] ?? c).join("");
}

/* ── tex inner → unicode ──────────────────────────────────────────── */

function texToUnicode(rawInner: string): string {
  let s = rawInner.trim();
  if (!s) return "";
  // Stray scrape markers sometimes leak inside the tex span itself.
  s = s.replace(/\?/g, "");

  // {n \choose 2} → ⁿC₂
  s = s.replace(
    /\{\s*([A-Za-z0-9]+)\s*\\choose\s*([A-Za-z0-9]+)\s*\}/g,
    (_m, a: string, b: string) => `${toSup(a)}C${toSub(b)}`
  );

  const commands: Array<[RegExp, string]> = [
    [/\\Theta/g, "Θ"],
    [/\\theta/g, "θ"],
    [/\\Omega/g, "Ω"],
    [/\\Phi/g, "Φ"],
    [/\\lceil/g, "⌈"],
    [/\\rceil/g, "⌉"],
    [/\\uparrow/g, "↑"],
    [/\\downarrow/g, "↓"],
    [/\\cap/g, "∩"],
    [/\\infty/g, "∞"],
    [/\\times/g, "×"],
    [/\\cdot/g, "·"],
    [/\\leq|\\le/g, "≤"],
    [/\\geq|\\ge/g, "≥"],
    [/\\neq/g, "≠"],
    [/\\sum/g, "Σ"],
    [/\\prod/g, "Π"],
    [/\\log/g, "log"],
    [/\\sqrt\s*\{([^}]*)\}/g, "√($1)"],
    [/\\sqrt/g, "√"],
    [/\\choose/g, "C"],
  ];
  for (const [re, rep] of commands) s = s.replace(re, rep);

  // 2^{n+1} → 2ⁿ⁺¹, then lone ^x → superscript.
  s = s.replace(/\^\{([^}]*)\}/g, (_m, g: string) => toSup(g));
  s = s.replace(/\^([0-9A-Za-z+\-()=])/g, (_m, g: string) => toSup(g));
  // log_2 → log₂, then lone _x → subscript.
  s = s.replace(/_\{([^}]*)\}/g, (_m, g: string) => toSub(g));
  s = s.replace(/_([0-9A-Za-z+\-()=])/g, (_m, g: string) => toSub(g));

  // Drop any leftover tex syntax.
  s = s.replace(/[\\{}]/g, "");
  return s.replace(/\s+/g, " ").trim();
}

/**
 * Replace tex markers with placeholder tokens, returning the HTML with
 * placeholders plus the span HTML per index. Placeholders use a control char
 * that never appears in bank text and survives escaping.
 */
function extractTexSpans(input: string): { text: string; spans: string[] } {
  const spans: string[] = [];
  const text = input.replace(TEX_MARKER_RE, (_m, inner: string) => {
    const uni = texToUnicode(inner);
    const idx = spans.length;
    spans.push(
      uni === ""
        ? ""
        : `<span class="dsa-tex">${escapeHtml(uni)}</span>`
    );
    return `${PLACEHOLDER_PREFIX}${idx}${PLACEHOLDER_PREFIX}`;
  });
  return { text, spans };
}

function restoreTexSpans(input: string, spans: string[]): string {
  if (spans.length === 0) return input;
  return input.replace(
    new RegExp(`${PLACEHOLDER_PREFIX}(\\d+)${PLACEHOLDER_PREFIX}`, "g"),
    (_m, n: string) => spans[Number(n)] ?? ""
  );
}

/* ── Code tabs → language switcher ─────────────────────────────────
   Multi-language questions arrive as vendor custom-element stacks:
     <gfg-tabs>… / <internkhojo-tabs>…
       <gfg-tab>C++</gfg-tab><gfg-panel data-code-lang="cpp">…
   The tag prefix has already been renamed once (gfg- → internkhojo-), so
   the parser accepts ANY `<x-tabs>/<x-tab>/<x-panel>` vendor prefix.
   Parsed blocks become selectable tabs (C++ default). Single <pre> blocks
   and plain-text snippets are NOT tabs — they render as one dark block. */

const CODE_PLACEHOLDER = "\u0002";

export interface DsaCodeTab {
  /** Tab label as scraped ("C++", "C", "Java", "Python"). */
  label: string;
  /** data-code-lang value ("cpp", "c", "java", "python"). */
  lang: string;
  /** Inner panel HTML (highlight spans kept for token colors). */
  html: string;
}

export type DsaBodySegment =
  | { kind: "html"; html: string }
  | { kind: "code"; tabs: DsaCodeTab[] };

function cleanTabHtml(html: string): string {
  let s = html;
  // Flatten Pygments wrappers — the spans carry the token colors.
  s = s.replace(/<\/?code[^>]*>/gi, "");
  s = s.replace(/<div class="highlight">/gi, "");
  // Drop a trailing orphan </div> left by the flatten above.
  s = s.replace(/(<pre[\s\S]*<\/pre>)\s*<\/div>/gi, "$1");
  // Malformed leftovers: never leak custom elements as literal text.
  s = s.replace(/<\/?[a-z][a-z0-9]*-(?:tabs|tab|panel)[^>]*>/gi, "");
  return cleanArtifacts(s, true).trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractCodeTabs(input: string): { text: string; blocks: DsaCodeTab[][] } {
  const blocks: DsaCodeTab[][] = [];
  const text = input.replace(
    /<([a-z][a-z0-9]*)-tabs\b[^>]*>([\s\S]*?)<\/\1-tabs>/gi,
    (_block, prefix: string, inner: string) => {
      const tabs: DsaCodeTab[] = [];
      const esc = escapeRegExp(prefix);
      const pairRe = new RegExp(
        `<${esc}-tab\\b[^>]*>([^<]*)<\\/${esc}-tab>\\s*` +
          `<${esc}-panel\\b[^>]*data-code-lang="([^"]*)"[^>]*>([\\s\\S]*?)<\\/${esc}-panel>`,
        "gi"
      );
      let m: RegExpExecArray | null;
      while ((m = pairRe.exec(inner)) !== null) {
        const label = (m[1] || "").trim() || (m[2] || "").trim() || "Code";
        const html = cleanTabHtml(m[3] || "");
        if (html) tabs.push({ label, lang: (m[2] || "").trim(), html });
      }
      if (tabs.length === 0) {
        // Malformed block — show the content stacked, never drop it.
        return cleanTabHtml(inner) || "";
      }
      const idx = blocks.length;
      blocks.push(tabs);
      return `${CODE_PLACEHOLDER}${idx}${CODE_PLACEHOLDER}`;
    }
  );
  // Stray tab/panel tags outside any wrapper (any vendor prefix).
  return {
    text: text.replace(/<\/?[a-z][a-z0-9]*-(?:tabs|tab|panel)\b[^>]*>/gi, ""),
    blocks,
  };
}

/** Default tab: C++ when present, otherwise the first tab. */
export function defaultCodeTabIndex(tabs: DsaCodeTab[]): number {
  const i = tabs.findIndex((t) => t.label.trim().toLowerCase() === "c++");
  return i >= 0 ? i : 0;
}

/* ── artifact cleanup (text only — never inside tags) ─────────────── */

/** Apply `fn` to text parts of an HTML string, leaving tags untouched. */
function processHtmlTextParts(html: string, fn: (text: string) => string): string {
  return html
    .split(/(<[^>]+>)/g)
    .map((part) => (part.startsWith("<") ? part : fn(part)))
    .join("");
}

/**
 * Harden bank <img> tags for embedding:
 * - drop invalid width/height="inherit" so the CSS (max-width 100%,
 *   height auto) controls sizing instead of confusing the layout;
 * - add lazy loading + no-referrer (hotlink hygiene for scraped hosts).
 */
function enhanceImgTags(html: string): string {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    let t = tag.replace(/\s+(width|height)="inherit"/gi, "");
    if (!/\sloading=/i.test(t)) t = t.replace(/<img\b/i, '<img loading="lazy"');
    if (!/\sreferrerpolicy=/i.test(t)) {
      t = t.replace(/<img\b/i, '<img referrerpolicy="no-referrer"');
    }
    return t;
  });
}

/** `??????` (corrupted ellipsis) → …, stray `??`/`???` → removed. */
function cleanArtifactsText(t: string): string {
  return t.replace(/\?{4,}/g, "…").replace(/\?{2,3}/g, "");
}

function cleanArtifacts(htmlOrText: string, isHtml: boolean): string {
  if (isHtml) return processHtmlTextParts(htmlOrText, cleanArtifactsText);
  return cleanArtifactsText(htmlOrText);
}

/* ── plain-text code detection ────────────────────────────────────── */

const CODE_PATTERNS: RegExp[] = [
  /#include\b/,
  /\b(printf|scanf|cout|cin|malloc|free|return)\b.*[;(]/,
  /\b(int|char|float|double|short|long|void|struct|static|unsigned)\s+\w+\s*[=;(]/,
  /\b(for|while|if|else|switch|case|break|continue|do)\b/,
  /^\s*[{}]\s*$/,
  /[{};]\s*$/,
  /^\s{2,}\S/,
  /^\s*(public|private|class|def|import|from|print)\b/,
];

function isCodeLine(line: string): boolean {
  const t = line.trim();
  if (t === "") return false;
  // Numbered prose ("1) Randomly picking…") is not code.
  if (/^\d+[.)]\s+[A-Z]/.test(t) && !/[;{}]/.test(t)) return false;
  return CODE_PATTERNS.some((re) => re.test(line));
}

/* ── public formatters ────────────────────────────────────────────── */

/**
 * Format a full question/solution body into renderable segments.
 * Handles both pre-formatted HTML bank text and plain-text snippet
 * questions. `<gfg-tabs>` multi-language blocks become `{ kind: "code" }`
 * segments (rendered with a language dropdown); everything else becomes
 * `{ kind: "html" }`. Code can never overflow its card (see .dsa-html CSS).
 */
export function formatDsaBody(raw: unknown): DsaBodySegment[] {
  if (typeof raw !== "string" || raw.trim() === "") return [];
  const { text: noTabs, blocks } = extractCodeTabs(raw);
  const { text: withPlaceholders, spans } = extractTexSpans(noTabs);
  const isHtml = containsHtml(withPlaceholders);

  let out: string;
  if (isHtml) {
    out = enhanceImgTags(cleanArtifacts(withPlaceholders, true));
  } else {
    const lines = cleanArtifacts(withPlaceholders, false).split("\n");
    const blocksHtml: string[] = [];
    let prose: string[] = [];
    let code: string[] = [];

    const flushProse = () => {
      const text = prose.join("\n").trim();
      if (text) {
        blocksHtml.push(
          text
            .split(/\n{2,}/)
            .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
            .join("")
        );
      }
      prose = [];
    };
    const flushCode = () => {
      if (code.length > 0) {
        blocksHtml.push(
          `<pre class="dsa-code">${escapeHtml(code.join("\n"))}</pre>`
        );
      }
      code = [];
    };

    for (const line of lines) {
      if (line.trim() === "") {
        // A blank line ends a code run but only pauses prose.
        if (code.length > 0) flushCode();
        prose.push("");
        continue;
      }
      if (isCodeLine(line)) {
        if (prose.length > 0) flushProse();
        code.push(line.replace(/\s+$/, ""));
      } else {
        if (code.length > 0) flushCode();
        prose.push(line);
      }
    }
    flushCode();
    flushProse();
    out = blocksHtml.join("");
  }

  // Split the pipeline output on code-block placeholders, restoring tex
  // spans inside the HTML parts.
  const segments: DsaBodySegment[] = [];
  const parts = out.split(
    new RegExp(`${CODE_PLACEHOLDER}(\\d+)${CODE_PLACEHOLDER}`, "g")
  );
  for (let i = 0; i < parts.length; i += 2) {
    const html = restoreTexSpans(parts[i], spans);
    if (html) segments.push({ kind: "html", html });
    const idxRaw = parts[i + 1];
    if (idxRaw !== undefined && idxRaw !== "") {
      const tabs = blocks[Number(idxRaw)];
      if (tabs && tabs.length > 0) segments.push({ kind: "code", tabs });
    }
  }
  return segments;
}

/**
 * Format a single MCQ option (inline HTML output — no block wrappers).
 * Options are short: `<p>O(nLogn)</p>`, `C1 &lt; C2??`, or plain `Stack`.
 */
export function formatDsaOption(raw: unknown): string {
  if (typeof raw !== "string" || raw.trim() === "") return "";
  const { text: withPlaceholders, spans } = extractTexSpans(raw.trim());
  let out: string;
  if (containsHtml(withPlaceholders)) {
    out = enhanceImgTags(cleanArtifacts(withPlaceholders, true).trim());
    // Unwrap a single outer <p>/<div> so options sit inline in buttons.
    const m = out.match(/^<(p|div)(?:\s[^>]*)?>([\s\S]*)<\/\1>$/i);
    if (m) out = m[2].trim();
    // Drop trailing <br/> chains left by scrape artifacts.
    out = out.replace(/(?:<br\s*\/?>\s*)+$/i, "").trim();
    if (!out) out = "—";
  } else {
    out = escapeHtml(cleanArtifacts(withPlaceholders, false).trim()) || "—";
  }
  return restoreTexSpans(out, spans);
}
