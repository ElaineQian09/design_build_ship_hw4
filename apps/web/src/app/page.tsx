import Link from "next/link";
import { SupabaseStatus } from "../components/supabase-status";
import { SignOutButton } from "../components/sign-out-button";
import { getSupabaseServerClient } from "../lib/supabase/server";

export default async function HomePage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const authState = user ? "Authenticated session detected." : "No active session yet.";

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-16">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">
          live-weather-board
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
          Supabase Auth scaffold
        </h1>
        <p className="mt-4 text-base text-slate-600">
          Sign up, log in, and access a protected dashboard. This frontend is now
          ready for favorites, weather queries, and Realtime updates in later steps.
        </p>
        <p className="mt-6 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700">
          {authState}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
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
        <SupabaseStatus />
      </section>
    </main>
  );
}
