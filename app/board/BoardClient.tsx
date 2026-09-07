"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Briefcase,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  applyHostLabel,
  getPostContact,
  payLabel,
  stripHtml,
} from "@/lib/board";
import {
  adaptExternalPost,
  type ExternalPost,
} from "@/lib/external-post";

export interface BoardQueryState {
  q: string;
  type: "job" | "internship" | "all";
  pay: "paid" | "unpaid" | "all";
  loc: string;
  skill: string;
  field: string;
}

export interface BulletinFieldOption {
  value: string;
  count: number;
}

interface BoardClientProps {
  items: ExternalPost[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
  initialQuery: BoardQueryState;
  counts: { total: number; jobs: number; internships: number };
  locations: string[];
  fields: BulletinFieldOption[];
  configured: boolean;
}

/** News-style dateline: "7:00 am on Sunday, 6 September 2026". */
function postDateLine(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const time = d
    .toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
  const day = d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${time} on ${day}`;
}

function shortDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(iso?: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / 86400000);
}

/** Small removable chip for one active filter. */
function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 py-1 pl-3 pr-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white shadow-sm">
      <span className="max-w-[140px] truncate">{label}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClear();
        }}
        aria-label={`Remove filter ${label}`}
        className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white/15 p-1 transition-colors hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
      >
        <X size={10} />
      </button>
    </span>
  );
}

// Remount-surviving focus target: set before a filter navigation, consumed by
// the freshly mounted feed so typing/selecting never loses focus.
let pendingFocusId: string | null = null;

export default function BoardClient({
  items,
  total,
  page,
  pageCount,
  initialQuery,
  counts,
  locations,
  fields,
  configured,
}: BoardClientProps) {
  const router = useRouter();
  // Text inputs are local (applied on submit); the server remounts this
  // component per navigation (key), so state always matches the URL.
  const [query, setQuery] = useState(initialQuery.q);
  const [payFilter, setPayFilter] = useState(initialQuery.pay);
  const [locationFilter, setLocationFilter] = useState(initialQuery.loc);
  const [skillFilter, setSkillFilter] = useState(initialQuery.skill);
  const [fieldFilter, setFieldFilter] = useState(initialQuery.field);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [navigating, setNavigating] = useState(false);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const feedRef = useRef<HTMLDivElement>(null);
  const lastPushed = useRef<string | null>(null);

  const typeParam = initialQuery.type;

  function hrefFor(
    patch: Partial<BoardQueryState>,
    targetPage?: number,
  ): string {
    const next = {
      q: query,
      type: typeParam,
      pay: payFilter,
      loc: locationFilter,
      skill: skillFilter,
      field: fieldFilter,
      ...patch,
    };
    const params = new URLSearchParams();
    if (next.type !== "all") params.set("type", next.type);
    if (next.pay !== "all") params.set("pay", next.pay);
    if (next.q.trim()) params.set("q", next.q.trim());
    if (next.loc.trim()) params.set("loc", next.loc.trim());
    if (next.skill.trim()) params.set("skill", next.skill.trim());
    if (next.field.trim()) params.set("f", next.field.trim());
    if (targetPage && targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/board?${qs}` : "/board";
  }

  // Stable across unrelated re-renders (e.g. shorts-nav position updates) so
  // the debounce timer below isn't reset by scrolling.
  const hrefForCb = useCallback(
    (patch: Partial<BoardQueryState>, targetPage?: number): string => {
      const next = {
        q: query,
        type: typeParam,
        pay: payFilter,
        loc: locationFilter,
        skill: skillFilter,
        field: fieldFilter,
        ...patch,
      };
      const params = new URLSearchParams();
      if (next.type !== "all") params.set("type", next.type);
      if (next.pay !== "all") params.set("pay", next.pay);
      if (next.q.trim()) params.set("q", next.q.trim());
      if (next.loc.trim()) params.set("loc", next.loc.trim());
      if (next.skill.trim()) params.set("skill", next.skill.trim());
      if (next.field.trim()) params.set("f", next.field.trim());
      if (targetPage && targetPage > 1) params.set("page", String(targetPage));
      const qs = params.toString();
      return qs ? `/board?${qs}` : "/board";
    },
    [query, typeParam, payFilter, locationFilter, skillFilter, fieldFilter],
  );

  const pushFilters = useCallback(
    (patch: Partial<BoardQueryState>) => {
      const url = hrefForCb(patch);
      if (lastPushed.current === url) return;
      lastPushed.current = url;
      // Remember where the user was so the remounted feed restores focus —
      // typing/selecting continues uninterrupted, and scroll never jumps.
      if (typeof document !== "undefined") {
        const ae = document.activeElement as HTMLElement | null;
        if (
          ae &&
          ae.id &&
          (ae.tagName === "INPUT" || ae.tagName === "SELECT")
        ) {
          pendingFocusId = ae.id;
        }
      }
      setNavigating(true);
      router.push(url, { scroll: false });
    },
    [hrefForCb, router],
  );

  // Live search: typing in any text filter navigates (debounced) so results
  // update side-by-side while typing. Skipped when values match the URL.
  useEffect(() => {
    const changed =
      query.trim() !== initialQuery.q.trim() ||
      locationFilter.trim() !== initialQuery.loc.trim() ||
      skillFilter.trim() !== initialQuery.skill.trim();
    if (!changed) return;
    const t = setTimeout(() => pushFilters({}), 450);
    return () => clearTimeout(t);
  }, [query, locationFilter, skillFilter, initialQuery, pushFilters]);

  // After a filter navigation remounts the feed, restore focus (caret to end
  // for text inputs) so the interaction continues where it left off.
  useEffect(() => {
    if (!pendingFocusId) return;
    const id = pendingFocusId;
    pendingFocusId = null;
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (!el) return;
    el.focus({ preventScroll: true });
    try {
      const len = el.value?.length ?? 0;
      el.setSelectionRange?.(len, len);
    } catch {
      /* selects have no caret — focus is enough */
    }
  }, []);

  // Contact + official-apply details are parsed from each brief once per
  // page (not on every render), so face cards stay cheap.
  const enriched = useMemo(
    () =>
      items.map((post) => {
        const job = adaptExternalPost(post);
        const mined = getPostContact(job);
        return {
          post,
          job,
          contact: post.applyUrl
            ? { ...mined, officialApplyUrl: post.applyUrl }
            : mined,
        };
      }),
    [items],
  );

  const scrollToCard = (index: number) => {
    const el = cardRefs.current[index];
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    setActiveIndex(index);
  };

  // Clamped position — never points past the current page.
  const safeActive =
    enriched.length === 0 ? 0 : Math.min(activeIndex, enriched.length - 1);

  // Track which short is in view (progress dots + counter)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      { threshold: 0.35 },
    );
    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  // Keyboard shorts navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        scrollToCard(Math.min(safeActive + 1, enriched.length - 1));
      }
      if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        scrollToCard(Math.max(safeActive - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const hasActiveFilters =
    query.trim() !== "" ||
    typeParam !== "all" ||
    payFilter !== "all" ||
    locationFilter.trim() !== "" ||
    skillFilter.trim() !== "" ||
    fieldFilter.trim() !== "";

  const clearAll = () => {
    setNavigating(true);
    router.push("/board", { scroll: false });
  };

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  // Page turns keep the user's place: no scroll jump, then ease the feed top
  // into view so the fresh page starts where the eyes already are.
  const onPageTurn = () => {
    setNavigating(true);
    pendingFocusId = null;
    requestAnimationFrame(() => {
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      feedRef.current?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    });
  };

  const pillShift =
    typeParam === "all"
      ? "translate-x-0"
      : typeParam === "job"
        ? "translate-x-[calc(100%+4px)]"
        : "translate-x-[calc(200%+8px)]";

  // Page-number window (max 5) around the current page.
  const pageWindow = useMemo(() => {
    if (pageCount <= 1) return [];
    const start = Math.max(1, Math.min(page - 2, pageCount - 4));
    const end = Math.min(pageCount, start + 4);
    const out: number[] = [];
    for (let p = start; p <= end; p++) out.push(p);
    return out;
  }, [page, pageCount]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <p aria-live="polite" className="sr-only">
        {total.toLocaleString("en-IN")} posts found
      </p>
      {/* Filter bar — command-bar surface */}
      <section
        aria-label="Filter opportunities"
        className="sticky top-16 z-30 -mx-4 border-y border-slate-200/70 bg-white/80 px-4 py-3 shadow-[0_12px_32px_-20px_rgba(0,0,0,0.25)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 sm:top-20 sm:mx-0 sm:rounded-[20px] sm:border sm:px-4 sm:shadow-[0_16px_48px_-20px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.9)]"
      >
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            pushFilters({});
          }}
        >
          <div className="group flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 py-1.5 pl-2 pr-3 ring-1 ring-transparent transition-[border-color,box-shadow,background-color] duration-200 focus-within:border-slate-900 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(15,23,42,0.08),0_12px_28px_-12px_rgba(0,0,0,0.3)] hover:border-slate-300">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200/80 transition-colors group-focus-within:text-slate-900">
              <Search size={14} />
            </span>
            <input
              id="board-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search role, skill or keyword…"
              aria-label="Search opportunities"
              autoComplete="off"
              className="h-8 w-full bg-transparent text-[14px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  pushFilters({ q: "" });
                }}
                aria-label="Clear search"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200/70 text-slate-500 transition-[transform,background-color] duration-150 hover:bg-slate-900 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                <X size={13} />
              </button>
            ) : navigating ? (
              <span className="hidden shrink-0 items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:flex" aria-live="polite">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Updating…
              </span>
            ) : (
              <span className="hidden shrink-0 items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:flex">
                <span className="tabular-nums text-slate-500">{total.toLocaleString("en-IN")}</span>
                posts
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            className={`flex shrink-0 items-center gap-1.5 rounded-2xl border px-3.5 py-3 text-[11px] font-extrabold uppercase tracking-[0.1em] transition-[transform,box-shadow,background-color,border-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
              filtersOpen || hasActiveFilters
                ? "border-slate-950 bg-slate-950 text-white shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)]"
                : "border-slate-200 bg-white text-slate-600 shadow-sm hover:-translate-y-px hover:border-slate-900 hover:text-slate-950 hover:shadow-md motion-reduce:transform-none"
            }`}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && !filtersOpen && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
            )}
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 motion-reduce:transition-none ${filtersOpen ? "rotate-180" : ""}`}
            />
          </button>
        </form>

        {/* Segregated type tabs: Jobs vs Internships — sliding pill, CSS only */}
        <div
          role="tablist"
          aria-label="Opportunity type"
          className="relative mt-2.5 grid grid-cols-3 gap-1 rounded-2xl border border-slate-200/70 bg-slate-100/80 p-1 shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]"
        >
          <span
            aria-hidden
            className={`pointer-events-none absolute bottom-1 left-1 top-1 w-[calc((100%-1rem)/3)] rounded-xl bg-slate-950 shadow-[0_6px_16px_-6px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${pillShift}`}
          />
          {(
            [
              { key: "all", label: "All", count: counts.total, icon: null },
              { key: "job", label: "Jobs", count: counts.jobs, icon: Briefcase },
              {
                key: "internship",
                label: "Internships",
                count: counts.internships,
                icon: GraduationCap,
              },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = typeParam === tab.key;
            return (
              <Link
                key={tab.key}
                id={`board-tab-${tab.key}`}
                href={hrefFor({ type: tab.key })}
                scroll={false}
                role="tab"
                aria-selected={active}
                onClick={(e) => {
                  pendingFocusId = e.currentTarget.id;
                  setNavigating(true);
                }}
                className={`relative z-10 flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.08em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                  active ? "text-white" : "text-slate-500 hover:text-slate-950"
                }`}
              >
                {Icon && <Icon size={13} className={active ? "text-white" : "text-slate-400"} />}
                <span className="truncate">{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums leading-none ${
                    active ? "bg-white/15 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200"
                  }`}
                >
                  {tab.count.toLocaleString("en-IN")}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Active filters — one-tap remove, no scroll jump */}
        {hasActiveFilters && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5" aria-label="Active filters">
            {typeParam !== "all" && (
              <FilterChip
                label={typeParam === "job" ? "Jobs" : "Internships"}
                onClear={() => pushFilters({ type: "all" })}
              />
            )}
            {fieldFilter.trim() !== "" && (
              <FilterChip
                label={fieldFilter.trim().charAt(0).toUpperCase() + fieldFilter.trim().slice(1)}
                onClear={() => {
                  setFieldFilter("");
                  pushFilters({ field: "" });
                }}
              />
            )}
            {payFilter !== "all" && (
              <FilterChip
                label={payFilter === "paid" ? "Paid" : "Unpaid"}
                onClear={() => pushFilters({ pay: "all" })}
              />
            )}
            {query.trim() !== "" && (
              <FilterChip
                label={`“${query.trim().slice(0, 24)}${query.trim().length > 24 ? "…" : ""}”`}
                onClear={() => {
                  setQuery("");
                  pushFilters({ q: "" });
                }}
              />
            )}
            {locationFilter.trim() !== "" && (
              <FilterChip
                label={locationFilter.trim().slice(0, 24)}
                onClear={() => {
                  setLocationFilter("");
                  pushFilters({ loc: "" });
                }}
              />
            )}
            {skillFilter.trim() !== "" && (
              <FilterChip
                label={skillFilter.trim().slice(0, 24)}
                onClear={() => {
                  setSkillFilter("");
                  pushFilters({ skill: "" });
                }}
              />
            )}
          </div>
        )}

        {filtersOpen && (
          <div className="mt-2.5 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-3 shadow-[0_20px_48px_-24px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:grid-cols-2 sm:p-4 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Field
              </span>
              <span className="relative block">
                <select
                  id="board-field"
                  value={fieldFilter}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFieldFilter(v);
                    pushFilters({ field: v });
                  }}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-9 text-xs font-bold text-slate-800 shadow-sm outline-none transition-[border-color,box-shadow] duration-150 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/[0.08]"
                >
                  <option value="">All fields</option>
                  {fields.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.value.charAt(0).toUpperCase() + f.value.slice(1)} ({f.count.toLocaleString("en-IN")})
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </span>
            </label>
            <label className="block">
              <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Pay
              </span>
              <span className="relative block">
                <select
                  id="board-pay"
                  value={payFilter}
                  onChange={(e) => {
                    const v = e.target.value as BoardQueryState["pay"];
                    setPayFilter(v);
                    pushFilters({ pay: v });
                  }}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-9 text-xs font-bold text-slate-800 shadow-sm outline-none transition-[border-color,box-shadow] duration-150 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/[0.08]"
                >
                  <option value="all">All pay types</option>
                  <option value="paid">Paid only</option>
                  <option value="unpaid">Unpaid only</option>
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </span>
            </label>
            <label className="block">
              <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Location
              </span>
              <input
                id="board-loc"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    pushFilters({});
                  }
                }}
                placeholder="e.g. Remote, Mumbai"
                list="board-locations"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-800 shadow-sm outline-none transition-[border-color,box-shadow] duration-150 placeholder:font-medium placeholder:text-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/[0.08]"
              />
              <datalist id="board-locations">
                {locations.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
            </label>
            <label className="block">
              <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Skill
              </span>
              <input
                id="board-skill"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    pushFilters({});
                  }
                }}
                placeholder="e.g. React, Figma"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-800 shadow-sm outline-none transition-[border-color,box-shadow] duration-150 placeholder:font-medium placeholder:text-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/[0.08]"
              />
            </label>
            {hasActiveFilters && (
              <div className="flex items-center justify-between gap-3 sm:col-span-2 lg:col-span-4">
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-sm font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 underline-offset-4 transition-colors hover:text-slate-950 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                >
                  Clear all filters ({total.toLocaleString("en-IN")} shown)
                </button>
                <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-slate-300 sm:block">
                  Link stays shareable
                </span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* News-style feed */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_230px]">
        <div>
          <div
            ref={feedRef}
            aria-label="Opportunities feed"
            className="max-h-none space-y-4 overflow-visible lg:max-h-[78vh] lg:space-y-3 lg:overflow-y-auto lg:snap-y lg:snap-mandatory lg:scroll-smooth lg:rounded-[24px] lg:border lg:border-slate-200/70 lg:bg-slate-100/50 lg:p-3 lg:shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
          >
            {!configured && (
              <div className="rounded-[24px] border-2 border-dashed border-slate-200 bg-white/90 p-12 text-center shadow-sm backdrop-blur">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 text-slate-400 shadow-sm">
                  <Search size={18} />
                </span>
                <p className="mt-4 text-sm font-extrabold uppercase tracking-[0.06em] text-slate-900">
                  Bulletin is syncing
                </p>
                <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
                  Fresh postings are on their way. Meanwhile, browse verified
                  roles on the Find page.
                </p>
                <Link
                  href="/find"
                  className="mt-5 inline-block rounded-xl bg-slate-950 px-6 py-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white shadow-[0_12px_28px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-px hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 motion-reduce:transform-none"
                >
                  Go to Find
                </Link>
              </div>
            )}

            {configured && enriched.length === 0 && (
              <div className="rounded-[24px] border-2 border-dashed border-slate-200 bg-white/90 p-12 text-center shadow-sm backdrop-blur">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 text-slate-400 shadow-sm">
                  <Search size={18} />
                </span>
                <p className="mt-4 text-sm font-extrabold uppercase tracking-[0.06em] text-slate-900">
                  No posts match these filters
                </p>
                <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
                  Try removing a filter, or check the other tab — jobs and
                  internships are listed separately.
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-5 rounded-xl bg-slate-950 px-6 py-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white shadow-[0_12px_28px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-px hover:bg-black hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.6)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 motion-reduce:transform-none"
                >
                  Reset feed
                </button>
              </div>
            )}

            {enriched.map(({ post, job, contact }, idx) => {
              const isIntern = post.kind === "internship";
              const paid = post.paid;
              const snippet =
                stripHtml(job.description, 240) ||
                "Full brief available on the detail page.";
              const dateline = postDateLine(job.created_at);
              const deadline = shortDate(job.deadline);
              const left = daysUntil(job.deadline);
              const urgent = left !== null && left >= 0 && left <= 7;
              const orgName = job.companies?.name ?? "Open opportunity";
              const openDetail = () => router.push(`/board/${job.id}`);
              return (
                <article
                  key={job.id}
                  data-index={idx}
                  ref={(el) => {
                    cardRefs.current[idx] = el;
                  }}
                  role="link"
                  tabIndex={0}
                  aria-labelledby={`board-title-${job.id}`}
                  onClick={openDetail}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") openDetail();
                  }}
                  className={`group relative snap-start cursor-pointer scroll-mt-32 overflow-hidden rounded-[20px] border bg-white/90 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_12px_32px_-16px_rgba(0,0,0,0.18)] backdrop-blur transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-[3px] hover:shadow-[0_2px_4px_rgba(0,0,0,0.05),0_28px_56px_-20px_rgba(0,0,0,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 focus-visible:ring-4 focus-visible:ring-slate-900/10 motion-reduce:transition-none motion-reduce:transform-none ${
                    isIntern
                      ? "border-slate-200/80 border-l-4 border-l-amber-400 hover:border-slate-300 hover:border-l-amber-500"
                      : "border-slate-200/80 border-l-4 border-l-blue-600 hover:border-slate-300 hover:border-l-blue-700"
                  }`}
                >
                  {/* Hover glow edge — opacity only */}
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none ${
                      isIntern
                        ? "bg-gradient-to-br from-amber-400/[0.09] via-transparent to-orange-500/[0.07]"
                        : "bg-gradient-to-br from-blue-600/[0.08] via-transparent to-indigo-500/[0.06]"
                    }`}
                  />
                <div className="relative">
                  {/* Body */}
                  <div className="relative min-w-0 flex-1 p-4">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                      {/* Type ribbon — internship vs job at a glance */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] ${
                          isIntern
                            ? "bg-amber-400 text-black"
                            : "bg-slate-950 text-white"
                        }`}
                      >
                        {isIntern ? (
                          <GraduationCap size={11} />
                        ) : (
                          <Briefcase size={11} />
                        )}
                        {isIntern ? "Internship" : "Job"}
                      </span>
                      <p
                        className={`flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${
                          isIntern ? "text-amber-700" : "text-blue-700"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${isIntern ? "bg-amber-500" : "bg-blue-600"}`}
                          />
                          {isIntern ? "Internship" : "Full-time job"}
                        </span>
                        <span aria-hidden className="font-normal text-slate-300">
                          /
                        </span>
                      <span className="font-medium normal-case tracking-normal text-slate-400">
                        {post.mode ?? (isIntern ? "Training role" : "Full-time")}
                      </span>
                    </p>
                    </div>
                    <h2
                      id={`board-title-${job.id}`}
                      className="mt-1 text-balance text-[17px] font-extrabold leading-[1.2] tracking-[-0.02em] text-slate-950 sm:text-lg"
                    >
                      {job.title}
                    </h2>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-slate-400">
                        <span>
                          post by{" "}
                          <span className="font-bold text-slate-700">
                            {orgName}
                          </span>
                        </span>
                        {dateline ? (
                          <>
                            <span aria-hidden className="text-slate-300">·</span>
                            <span className="normal-case tracking-normal">{dateline}</span>
                          </>
                        ) : null}
                      </p>

                    <p className="mt-1.5 line-clamp-2 text-pretty text-[13px] leading-relaxed text-slate-600">
                      {snippet}
                    </p>

                    {/* Compact fact strip — every key field on the face */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.06em] ${
                            paid
                              ? "border-emerald-200/80 bg-emerald-50 text-emerald-800"
                              : "border-slate-200 bg-slate-50 text-slate-500"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${paid ? "bg-emerald-500" : "bg-slate-300"}`}
                          />
                          {paid ? payLabel(job) : "Unpaid"}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-slate-600 shadow-sm">
                          <MapPin size={11} className="text-slate-400" />
                          <span className="max-w-[140px] truncate">{job.location || "Remote"}</span>
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] shadow-sm ${
                            isIntern
                              ? "border-amber-200/80 bg-amber-50/70 text-amber-800"
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          {isIntern ? (
                            <GraduationCap size={11} className="text-amber-600" />
                          ) : (
                            <Briefcase size={11} className="text-slate-400" />
                          )}
                          {isIntern ? `Tenure: ${job.duration || "—"}` : (post.mode ?? "Full-time")}
                        </span>
                        {deadline && (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.06em] shadow-sm ${
                              urgent
                                ? "border-red-200 bg-red-50 text-red-700"
                                : "border-slate-200 bg-white text-slate-600"
                            }`}
                          >
                            <span className="relative flex h-1.5 w-1.5">
                              {urgent && (
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60 motion-reduce:animate-none" />
                              )}
                              <span
                                className={`relative inline-flex h-1.5 w-1.5 rounded-full ${urgent ? "bg-red-500" : "bg-slate-300"}`}
                              />
                            </span>
                            <CalendarClock size={11} />
                            Apply by {deadline}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 truncate font-mono text-[10.5px] uppercase tracking-[0.06em] text-slate-400">
                        {post.mode ? `${post.mode} • ` : ""}
                        {post.field ? `Field: ${post.field} • ` : ""}
                        {post.source ? `Via ${post.source}` : "Open web post"}
                      </p>

                      {/* Direct contact — visible before applying */}
                      {(contact.emails.length > 0 ||
                        contact.phones.length > 0) && (
                      <div
                        className="mt-2.5 rounded-2xl border border-emerald-200/70 bg-gradient-to-b from-emerald-50/90 to-white p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-emerald-100/40"
                        onClick={stop}
                      >
                          <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-50 motion-reduce:animate-none" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            </span>
                            Apply directly
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {contact.emails.map((email) => (
                              <a
                                key={email}
                                href={`mailto:${email}`}
                                onClick={stop}
                                className="inline-flex max-w-full items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-white px-2.5 py-1.5 text-[11px] font-bold text-emerald-900 shadow-sm transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-px hover:border-emerald-400 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 motion-reduce:transform-none"
                              >
                                <Mail
                                  size={12}
                                  className="shrink-0 text-emerald-600"
                                />
                                <span className="truncate">{email}</span>
                              </a>
                            ))}
                            {contact.phones.map((p) => (
                              <a
                                key={p.tel}
                                href={`tel:${p.tel}`}
                                onClick={stop}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-white px-2.5 py-1.5 text-[11px] font-bold text-emerald-900 shadow-sm transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-px hover:border-emerald-400 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 motion-reduce:transform-none"
                              >
                                <Phone
                                  size={12}
                                  className="shrink-0 text-emerald-600"
                                />
                                {p.display}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Footer — official apply from the face card */}
                    <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                        {contact.officialApplyUrl ? (
                          <a
                            href={contact.officialApplyUrl}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            onClick={stop}
                            className="inline-flex min-w-0 items-center gap-1.5 rounded-sm text-xs font-bold text-slate-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                          >
                            <span className="truncate">
                              Apply at{" "}
                              {applyHostLabel(contact.officialApplyUrl)}
                            </span>
                            <ExternalLink size={12} className="shrink-0 text-slate-400" />
                          </a>
                        ) : (
                          <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-slate-400">
                            Tap card for full post
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail();
                          }}
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-slate-950 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-px hover:bg-black hover:shadow-[0_14px_28px_-10px_rgba(0,0,0,0.6)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 active:translate-y-0 motion-reduce:transform-none"
                        >
                          Details <ArrowUpRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination — server URLs, crawlable, no client state */}
          {pageCount > 1 && (
            <nav
              aria-label="Bulletin pages"
              className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[20px] border border-slate-200/70 bg-white/80 p-3 shadow-sm backdrop-blur"
            >
              <div className="flex items-center gap-1.5">
                {page > 1 ? (
                  <Link
                    href={hrefFor({}, page - 1)}
                    scroll={false}
                    aria-label="Previous page"
                    onClick={onPageTurn}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-slate-900 hover:text-slate-950"
                  >
                    <ChevronLeft size={15} />
                  </Link>
                ) : (
                  <span
                    aria-hidden
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-300"
                  >
                    <ChevronLeft size={15} />
                  </span>
                )}
                {pageWindow.map((p) => (
                  <Link
                    key={p}
                    href={hrefFor({}, p)}
                    scroll={false}
                    aria-label={`Page ${p}`}
                    aria-current={p === page ? "page" : undefined}
                    onClick={onPageTurn}
                    className={`h-9 min-w-9 rounded-xl px-2 text-xs font-extrabold tabular-nums transition-colors ${
                      p === page
                        ? "bg-slate-950 text-white shadow-md"
                        : "border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-slate-900 hover:text-slate-950"
                    } flex items-center justify-center`}
                  >
                    {p}
                  </Link>
                ))}
                {page < pageCount ? (
                  <Link
                    href={hrefFor({}, page + 1)}
                    scroll={false}
                    aria-label="Next page"
                    onClick={onPageTurn}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-slate-900 hover:text-slate-950"
                  >
                    <ChevronRight size={15} />
                  </Link>
                ) : (
                  <span
                    aria-hidden
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-300"
                  >
                    <ChevronRight size={15} />
                  </span>
                )}
              </div>
              <p className="px-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Page <span className="text-slate-900">{page}</span> of{" "}
                {pageCount} · {total.toLocaleString("en-IN")} posts
              </p>
            </nav>
          )}
        </div>

        {/* Side rail: shorts nav + verified roles */}
        <aside className="space-y-3 lg:sticky lg:top-40 lg:self-start">
          <div className="hidden rounded-[20px] border border-slate-200/70 bg-white/80 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-24px_rgba(0,0,0,0.25)] backdrop-blur-xl lg:block">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Feed position
            </p>
            <p className="mt-1 font-mono text-2xl font-extrabold tabular-nums tracking-tight text-slate-950">
              {enriched.length === 0 ? "0 / 0" : `${safeActive + 1} / ${enriched.length}`}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => scrollToCard(Math.max(safeActive - 1, 0))}
                disabled={safeActive <= 0}
                aria-label="Previous post"
                className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-2.5 text-slate-600 shadow-sm transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-px hover:border-slate-900 hover:text-slate-950 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:shadow-sm motion-reduce:transform-none"
              >
                <ArrowUp size={15} />
              </button>
              <button
                type="button"
                onClick={() =>
                  scrollToCard(Math.min(safeActive + 1, enriched.length - 1))
                }
                disabled={safeActive >= enriched.length - 1}
                aria-label="Next post"
                className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-2.5 text-slate-600 shadow-sm transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-px hover:border-slate-900 hover:text-slate-950 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:shadow-sm motion-reduce:transform-none"
              >
                <ArrowDown size={15} />
              </button>
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
              Tip: use <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono font-bold text-slate-500">↑</kbd>{" "}
              <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono font-bold text-slate-500">↓</kbd> or swipe to move like shorts.
            </p>
            {enriched.length > 0 && (
              <div
                className="mt-3 flex max-h-40 flex-wrap gap-1 overflow-hidden"
                aria-hidden
              >
                {enriched.slice(0, 30).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-opacity duration-300 ${i === safeActive ? "bg-slate-950" : "bg-slate-200"}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="relative overflow-hidden rounded-[20px] border border-emerald-200/70 bg-gradient-to-b from-emerald-50/90 to-white p-5 shadow-[0_16px_40px_-24px_rgba(16,185,129,0.4)]">
            <p className="relative flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-800">
              <ShieldCheck size={13} /> Want verified roles?
            </p>
            <p className="relative mt-2 text-xs leading-relaxed text-slate-600">
              Bulletin listings come from across the web. For
              platform-verified opportunities, browse the Find page.
            </p>
            <Link
              href="/find"
              className="relative mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-4 py-3 text-[11px] font-extrabold uppercase tracking-[0.1em] text-white shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-px hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 motion-reduce:transform-none"
            >
              Browse Find <ArrowUpRight size={13} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
