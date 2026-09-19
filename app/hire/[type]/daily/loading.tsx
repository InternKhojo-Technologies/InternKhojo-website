export default function DailyTestLoading() {
  return (
    <div className="min-h-screen bg-[#F7F7F5] pb-28">
      <div className="mx-auto max-w-[720px] px-4 sm:px-6 pt-6 sm:pt-10 space-y-5 animate-pulse">
        <div className="h-8 w-2/3 rounded-xl bg-neutral-200/70" />
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 space-y-3">
          <div className="h-4 w-full rounded bg-neutral-100" />
          <div className="h-4 w-5/6 rounded bg-neutral-100" />
          <div className="grid gap-2.5 pt-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[60px] rounded-xl bg-neutral-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
