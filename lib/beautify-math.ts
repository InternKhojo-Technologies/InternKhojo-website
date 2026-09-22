/**
 * Beautifier for scraped question-bank math text.
 *
 * The aptitude bank was scraped from a vertically-typeset source, so inline
 * maths arrived as newline-separated tokens:
 *   - options like "1\n2" (fraction 1/2), "2\n1\n2" (mixed 2½),
 *     "(2\n16\n+ 1)" (power 2¹⁶), "12\ncm\n3" (12 cm³)
 *   - solutions with one token per line ("P(E) =\nn\n(E)\n=\n9\n.\n…")
 *     plus stray "`" characters and missing fraction bars.
 *
 * Rendering that raw breaks alignment (single characters stacked per line),
 * so the daily test page passes question / option / solution text through
 * here before display. This is DISPLAY-ONLY: grading still compares the raw
 * bank strings, so these helpers must never be used on the submit path.
 */

const SUP_DIGITS: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

const SUB_DIGITS: Record<string, string> = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
};

const VULGAR_FRACTIONS: Record<string, string> = {
  "1/2": "½",
  "1/3": "⅓",
  "2/3": "⅔",
  "1/4": "¼",
  "3/4": "¾",
  "1/5": "⅕",
  "2/5": "⅖",
  "3/5": "⅗",
  "4/5": "⅘",
  "1/6": "⅙",
  "5/6": "⅚",
  "1/8": "⅛",
  "3/8": "⅜",
  "5/8": "⅝",
  "7/8": "⅞",
};

function toSup(num: string): string {
  return num
    .split("")
    .map((d) => SUP_DIGITS[d] ?? d)
    .join("");
}

function toSub(num: string): string {
  return num
    .split("")
    .map((d) => SUB_DIGITS[d] ?? d)
    .join("");
}

function isNum(t: string): boolean {
  return /^\d+(\.\d+)?$/.test(t);
}

/** "2 1/2" → "2½" when the fraction has a single-glyph form. */
function vulgarOrSlash(num: string, den: string): string {
  return VULGAR_FRACTIONS[`${num}/${den}`] ?? `${num}/${den}`;
}

/** Split raw bank text into clean tokens (drops empties + stray backticks). */
function tokenize(raw: string): string[] {
  return raw
    .split("\n")
    .map((t) => t.trim())
    .filter((t) => t !== "" && t !== "`");
}

/**
 * Shared inline-math polish applied AFTER tokens are joined:
 * combinations (7 C 2 → ⁷C₂), powers ((2 16 + → (2¹⁶ +), trailing cubes
 * (12 cm 3 → 12 cm³), implicit multiplication (3 x = → 3x =) and spacing.
 */
function polishInlineMath(text: string): string {
  let s = text;
  // "= (" — a paren opened right after equals keeps its space.
  s = s.replace(/=\(/g, "= (");
  // "n (E)" → "n(E)" — but ONLY for a standalone symbol letter, never for
  // words ("out of (2 + 3)" keeps its space).
  s = s.replace(/(?<![A-Za-z])([A-Za-z]) \(([A-Za-z0-9][^()]*?)\)/g, "$1($2)");
  // "( x" → "(x", "x )" → "x)" — paren spacing.
  s = s.replace(/\(\s+/g, "(").replace(/\s+\)/g, ")");
  // "3 ," → "3," and friends — punctuation attaches left.
  s = s.replace(/\s+([,;:%°!?'’)\]])/g, "$1");
  // "(7 x 6) (2 x 1)" — two bare parenthesised groups side by side are a
  // stacked fraction whose bar the scraper dropped.
  s = s.replace(/\) \(/g, ")/(");
  // "⁷C₂" combinations: "7 C 2" → "⁷C₂".
  s = s.replace(/(\d+)\s+C\s+(\d+)/g, (_m: string, a: string, b: string) => `${toSup(a)}C${toSub(b)}`);
  // Powers inside parens: "(2 16 +" → "(2¹⁶ +", "(7 x 2 23)" → "(7 x 2²³)".
  s = s.replace(/\((\d+) (\d+) ([+-])/g, (_m: string, b: string, e: string, sign: string) => `(${b}${toSup(e)} ${sign}`);
  s = s.replace(/x (\d+) (\d+)\)/g, (_m: string, b: string, e: string) => `x ${b}${toSup(e)})`);
  // Trailing cubes: "12 cm 3" → "12 cm³".
  s = s.replace(/(\d+)\s+(cm|m|km|mm)\s+(\d+)(?=\W|$)/g, (_m: string, n: string, u: string, e: string) => `${n} ${u}${toSup(e)}`);
  // Implicit multiplication: "3 x = 24" → "3x = 24", "4 x years" → "4x years"
  // (but never inside "7 x 6", where x is a real operator between numbers).
  s = s.replace(/(\d) x(?=\s*[^0-9\s]|\s*$)/g, "$1x");
  return s.replace(/\s{2,}/g, " ").trim();
}

/**
 * Clean single-line display text (questions, answers). Collapses stray
 * newlines to spaces; identity for text without newlines.
 */
export function beautifyText(raw: unknown): string {
  if (typeof raw !== "string") return "";
  if (!raw.includes("\n")) return raw.trim();
  return polishInlineMath(tokenize(raw).join(" "));
}

/**
 * Clean one answer option: fractions ("1\n2" → "1/2"), mixed numbers
 * ("66\n2\n3" → "66⅔", "59\n7\nmin. past 3\n12" → "59 7/12 min. past 3"),
 * powers ("(2\n16\n+ 1)" → "(2¹⁶ + 1)") and cubes ("12\ncm\n3" → "12 cm³").
 * Identity for options without newlines.
 */
export function beautifyOption(raw: unknown): string {
  if (typeof raw !== "string") return "";
  if (!raw.includes("\n")) return raw.trim();
  const tokens = tokenize(raw);
  if (tokens.length === 0) return "";
  if (tokens.length === 1) return tokens[0];

  // Pure stacked fraction: "1\n2" → "1/2".
  if (tokens.length === 2 && tokens.every(isNum)) {
    return `${tokens[0]}/${tokens[1]}`;
  }
  // Pure mixed number: "2\n1\n2" → "2½", "66\n2\n3" → "66⅔".
  if (tokens.length === 3 && tokens.every(isNum)) {
    return `${tokens[0]}${vulgarOrSlash(tokens[1], tokens[2])}`;
  }
  // Mixed number with a unit/label tail:
  // "2\n1\ntimes\n2" → "2 ½ times", "192\n1\n°\n2" → "192½°".
  const last = tokens[tokens.length - 1];
  if (
    tokens.length >= 4 &&
    isNum(tokens[0]) &&
    isNum(tokens[1]) &&
    isNum(last)
  ) {
    const middle = tokens.slice(2, -1).join(" ");
    const frac = vulgarOrSlash(tokens[1], last);
    if (middle.length <= 2) return `${tokens[0]}${frac}${middle}`;
    return `${tokens[0]} ${frac} ${middle}`;
  }
  return polishInlineMath(tokens.join(" "));
}

/**
 * Clean a full solution into aligned step paragraphs. Rejoins the
 * one-token-per-line explosion into flowing steps, repairs stacked
 * fractions ("n(E) = 9/n(S)/20" → "n(E)/n(S) = 9/20") and splits on
 * sentence boundaries so each step sits on its own line.
 */
export function beautifySolutionSteps(raw: unknown): string[] {
  if (typeof raw !== "string") return [];
  const tokens = tokenize(raw);
  if (tokens.length === 0) return [];

  // Rejoin tokens: a lone "." between two math tokens is a scraped fraction
  // bar; a "(" reattaches to a preceding symbol ("n" / "5" / lone "(");
  // ")" + "(" (or ")" + number) is a stacked fraction whose bar vanished.
  const parts: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const prev = parts.length > 0 ? parts[parts.length - 1] : "";
    const next = i + 1 < tokens.length ? tokens[i + 1] : "";
    if (t === "." && /[0-9)]$/.test(prev) && /^[0-9A-Za-z(]/.test(next)) {
      parts[parts.length - 1] = `${prev}/`;
      continue;
    }
    if (prev !== "" && (prev.endsWith("/") || prev === "(")) {
      parts[parts.length - 1] = `${prev}${t}`;
      continue;
    }
    if (prev !== "" && t.startsWith("(") && /(?:^|\s)[A-Za-z0-9]$/.test(prev)) {
      // Symbol/digit directly applied to a paren: "n" + "(E)" → "n(E)",
      // "5" + "(x + 8)" → "5(x + 8)". Words keep their space, so
      // "out of" + "(2 + 3)" is untouched.
      const lastChar = prev.charAt(prev.length - 1);
      parts[parts.length - 1] = lastChar === ")" ? `${prev}/${t}` : `${prev}${t}`;
      continue;
    }
    if (prev.endsWith(")") && isNum(t)) {
      parts[parts.length - 1] = `${prev}/${t}`;
      continue;
    }
    if (/^[),.;:%°!?'’\]]/.test(t) && prev !== "") {
      parts[parts.length - 1] = `${prev}${t}`;
      continue;
    }
    parts.push(t);
  }

  let text = polishInlineMath(parts.join(" "));

  // Repair interleaved stacked fractions from probability/ratio solutions.
  // "… = (4x + 16) = 48 = 2. (x + 16)/24" → "… = (4x+16)/(x+16) = 48/24 = 2".
  text = text.replace(
    /= (\(.*?\)) = (\d+) = (\d+)\. \((.*?)\)\/(\d+)/,
    "= $1/($4) = $2/$5 = $3"
  );
  // "n(E) = 7 = 1/n(S)/21 3" → "n(E)/n(S) = 7/21 = 1/3".
  text = text.replace(
    /([A-Za-z]\(.*?\)) = (\d+) = (\d+)\s*\/\s*([A-Za-z]\(.*?\))\/?\s*(\d+)\s+(\d+)/,
    "$1/$4 = $2/$5 = $3/$6"
  );
  // "n(E) = 9/n(S)/20" → "n(E)/n(S) = 9/20".
  text = text.replace(
    /([A-Za-z]\(.*?\)) = (\d+)\s*\/\s*([A-Za-z]\(.*?\))\/?\s*(\d+)/,
    "$1/$3 = $2/$4"
  );
  // Chain commas the scraper ate: "= 50 5x = 20" → "= 50, 5x = 20",
  // "+ 40 3x = 24" → "+ 40, 3x = 24",
  // "(x + 8)/2 8x + 16" → "(x + 8)/2, 8x + 16",
  // "3x = 24x = 8." → "3x = 24, x = 8."
  text = text.replace(/([=+-]) (\d+) (\d+x)(?= =)/, "$1 $2, $3");
  text = text.replace(/(\/\d+) (\d+x)(?= [+=])/, "$1, $2");
  text = text.replace(/= (\d+)x = (\d+)\./, "= $1, x = $2.");
  // A step that ended just before a continuing "=" rejoins it:
  // "…balls. = ⁵C₂…" → "…balls = ⁵C₂…".
  text = text.replace(/\. =(?=\s)/g, " =");

  // Split into steps at sentence ends (period + capital). Digits after the
  // period are excluded so "Rs. 500" and "4.75 million" never split.
  const steps = text
    .split(/(?<=\.)\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter((s) => s !== "");
  return steps.length > 0 ? steps : [text];
}
