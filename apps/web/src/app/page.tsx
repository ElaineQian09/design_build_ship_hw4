import Link from "next/link";
import { SignOutButton } from "../components/sign-out-button";
import { getSupabaseServerClient } from "../lib/supabase/server";

export default async function HomePage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
      <section className="w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="h-2 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400" />
        <div className="grid gap-10 p-10 lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-700">
              Live Weather Board
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Follow your cities and watch fresh weather updates arrive live
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              Save the cities you care about, then let the background worker fetch current
              conditions and stream the latest readings into your dashboard through Supabase
              Realtime.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                Next.js + Tailwind frontend
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                Railway worker polling Open-Meteo
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                Supabase Auth, Database, and Realtime
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center justify-center rounded-xl bg-sky-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-800"
            href={user ? "/dashboard" : "/sign-up"}
          >
            {user ? "Go to dashboard" : "Create account"}
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            href={user ? "/dashboard" : "/login"}
          >
            {user ? "Open protected page" : "Log in"}
          </Link>
          {user ? <SignOutButton /> : null}
            </div>
          </div>

          <div className="grid gap-4 self-start">
            <div className="rounded-3xl bg-slate-100 p-6">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Account
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {user ? "Signed in" : "Guest mode"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {user
                  ? "Your dashboard is ready. Open it to manage favorite cities and view live weather cards."
                  : "Create an account or log in to build a personalized dashboard for your cities."}
              </p>
            </div>

            <div className="rounded-3xl bg-emerald-50 p-6">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700">
                How It Works
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <li>1. Choose favorite cities on the dashboard.</li>
                <li>2. The Railway worker polls Open-Meteo every few minutes.</li>
                <li>3. Supabase stores readings and pushes live updates to the frontend.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
