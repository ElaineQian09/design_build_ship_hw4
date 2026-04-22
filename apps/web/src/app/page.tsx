export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-16">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">
          live-weather-board
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
          Next.js frontend scaffold
        </h1>
        <p className="mt-4 text-base text-slate-600">
          This app is intentionally minimal. Supabase Auth, Realtime, and weather
          features will be added in later steps.
        </p>
      </section>
    </main>
  );
}
