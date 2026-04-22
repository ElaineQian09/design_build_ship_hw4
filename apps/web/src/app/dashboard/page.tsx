import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "../../components/sign-out-button";
import { getSupabaseServerClient } from "../../lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Please log in to view the dashboard.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">
            Protected Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            Welcome to Live Weather Board
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            This page is protected by Supabase Auth. Weather data, favorites, and
            Realtime subscriptions will plug into this dashboard next.
          </p>
        </div>
        <SignOutButton />
      </header>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Session</h2>
          <dl className="mt-4 space-y-3 text-sm text-slate-600">
            <div>
              <dt className="font-medium text-slate-700">User ID</dt>
              <dd className="mt-1 break-all">{user.id}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Email</dt>
              <dd className="mt-1">{user.email ?? "No email on record"}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Profile Row</h2>
          <p className="mt-4 text-sm text-slate-600">
            {profile
              ? `Profile row found for ${profile.email ?? user.email ?? "this user"}.`
              : "No profile row was found yet. The optional database trigger or later app logic can create it."}
          </p>
          {profile?.created_at ? (
            <p className="mt-3 text-sm text-slate-500">Created at: {profile.created_at}</p>
          ) : null}
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-100 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Next Integration Steps</h2>
        <p className="mt-3 text-sm text-slate-600">
          Use this protected page as the base for favorite cities, latest weather
          queries, and Supabase Realtime subscriptions on <code>weather_readings</code>.
        </p>
        <Link className="mt-4 inline-flex text-sm font-medium text-sky-700 hover:text-sky-800" href="/">
          Back to home
        </Link>
      </section>
    </main>
  );
}
