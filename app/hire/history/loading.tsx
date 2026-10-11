export default function HireHistoryLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-28">
      <div className="mx-auto max-w-[760px] px-4 sm:px-6 pt-6 sm:pt-10 space-y-5 animate-pulse">
        <div className="h-9 w-56 rounded-xl bg-neutral-200/70" />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="h-4 w-1/3 rounded bg-neutral-100" />
              <div className="mt-3 h-12 rounded-xl bg-neutral-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
