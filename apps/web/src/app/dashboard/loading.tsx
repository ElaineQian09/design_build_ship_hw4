export default function DashboardLoading() {
  return (
    <main className="min-h-screen">
      <div className="border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-24 animate-pulse rounded-xl bg-slate-200" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-10 w-96 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-5 w-full animate-pulse rounded bg-slate-100" />
          <div className="mt-6 flex gap-3">
            <div className="h-16 w-28 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-16 w-28 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-8 w-56 animate-pulse rounded bg-slate-100" />
            <div className="mt-6 space-y-4">
              <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-8 w-64 animate-pulse rounded bg-slate-100" />
            <div className="mt-6 space-y-4">
              <div className="h-60 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-60 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
