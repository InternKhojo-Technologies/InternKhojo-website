export default function HireLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-28">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 pt-6 sm:pt-10 space-y-8 animate-pulse">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <div className="h-8 w-52 rounded-xl bg-neutral-200/70" />
            <div className="h-3 w-64 rounded bg-neutral-200/70" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-28 rounded-xl bg-neutral-200/70" />
            <div className="h-10 w-28 rounded-xl bg-neutral-200/70" />
          </div>
        </div>
        {[0, 1].map((s) => (
          <div key={s} className="space-y-3.5">
            <div className="h-5 w-40 rounded bg-neutral-200/70" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-3">
                  <div className="h-11 w-11 rounded-xl bg-neutral-100" />
                  <div className="h-4 w-2/3 rounded bg-neutral-100" />
                  <div className="h-3 w-full rounded bg-neutral-100" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
