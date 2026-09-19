export default function HireLeaderboardLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-28">
      <div className="mx-auto max-w-[880px] px-4 sm:px-6 pt-6 sm:pt-10 space-y-5 animate-pulse">
        <div className="h-9 w-56 rounded-xl bg-neutral-200/70" />
        <div className="rounded-2xl border border-neutral-200 bg-white p-3">
          <div className="h-11 rounded-xl bg-neutral-100" />
          <div className="mt-3 flex gap-2">
            <div className="h-9 w-24 rounded-lg bg-neutral-100" />
            <div className="h-9 w-24 rounded-lg bg-neutral-100" />
            <div className="h-9 w-24 rounded-lg bg-neutral-100" />
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="grid grid-cols-3 gap-3 items-end">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2.5">
                <div className="h-14 w-14 rounded-full bg-neutral-100" />
                <div className="h-3 w-20 rounded bg-neutral-100" />
                <div className={`w-full rounded-t-lg bg-neutral-100 ${i === 1 ? "h-28" : "h-20"}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
