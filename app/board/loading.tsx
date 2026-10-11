/** Instant skeleton for /board navigation: Next.js renders this immediately
 *  while the server fetches the feed, so tapping Board in the navbar feels
 *  as fast as every other page instead of hanging on the old screen. */
export default function BoardLoading() {
  return (
    <div className="relative isolate min-h-screen overflow-clip bg-white pb-20 text-slate-900">
      <p aria-live="polite" className="sr-only">
        Loading opportunities…
      </p>
      <div aria-hidden className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {/* Header shimmer */}
        <div className="pt-6 sm:pt-10">
          <div className="h-7 w-28 animate-pulse rounded-full bg-slate-100" />
          <div className="mt-6 h-5 w-52 animate-pulse rounded-full bg-slate-100" />
          <div className="mt-4 h-12 w-3/4 max-w-xl animate-pulse rounded-2xl bg-slate-100 sm:h-16" />
          <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded-full bg-slate-100" />
          <div className="mt-2 h-4 w-2/3 max-w-xl animate-pulse rounded-full bg-slate-100" />
        </div>

        {/* Filter bar shimmer */}
        <div className="mt-6 rounded-[20px] border border-slate-200/70 bg-white/80 p-4">
          <div className="flex items-center gap-2">
            <div className="h-11 flex-1 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-11 w-24 animate-pulse rounded-2xl bg-slate-100" />
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-1 rounded-2xl bg-slate-100/80 p-1">
            <div className="h-10 animate-pulse rounded-xl bg-slate-200/70" />
            <div className="h-10 animate-pulse rounded-xl bg-slate-200/70" />
            <div className="h-10 animate-pulse rounded-xl bg-slate-200/70" />
          </div>
        </div>

        {/* Cards shimmer */}
        <div className="mt-4 grid items-start gap-4 lg:grid-cols-[1fr_230px]">
          <div className="min-w-0 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
              >
                <div className="flex items-center gap-2">
                  <div className="h-5 w-20 animate-pulse rounded-md bg-slate-100" />
                  <div className="h-4 w-24 animate-pulse rounded-full bg-slate-100" />
                  <div className="ml-auto h-4 w-28 animate-pulse rounded-full bg-slate-100" />
                </div>
                <div className="mt-3 h-6 w-4/5 animate-pulse rounded-lg bg-slate-100" />
                <div className="mt-2 h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
                <div className="mt-2 h-4 w-full animate-pulse rounded-full bg-slate-100" />
                <div className="mt-1.5 h-4 w-5/6 animate-pulse rounded-full bg-slate-100" />
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="h-4 w-32 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
          <aside className="hidden space-y-3 lg:block">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="h-4 w-24 animate-pulse rounded-full bg-slate-100" />
              <div className="mt-2 h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
