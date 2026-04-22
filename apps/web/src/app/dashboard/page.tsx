import Link from "next/link";
import { redirect } from "next/navigation";
import { FavoriteCityCard } from "../../components/favorite-city-card";
import { FavoriteWeatherCard } from "../../components/favorite-weather-card";
import { SignOutButton } from "../../components/sign-out-button";
import { WeatherRealtimeListener } from "../../components/weather-realtime-listener";
import { getSupabaseServerClient } from "../../lib/supabase/server";
import { getLatestWeatherByCity, type LatestWeatherRow } from "../../lib/weather";

type CityRow = {
  id: string;
  name: string;
  country: string;
  latitude: number | string;
  longitude: number | string;
  timezone: string;
};

type FavoriteRow = {
  city_id: string;
};

type ProfileRow = {
  email: string | null;
  created_at: string;
};

function isMissingRelationError(message: string) {
  return (
    message.includes("Could not find the table") ||
    message.includes("schema cache") ||
    message.includes("does not exist")
  );
}

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

  const { data: cities, error: citiesError } = await supabase
    .from("cities")
    .select("id, name, country, latitude, longitude, timezone")
    .order("name", { ascending: true });

  const { data: favoriteRows, error: favoritesError } = await supabase
    .from("user_favorites")
    .select("city_id")
    .order("created_at", { ascending: false });

  const typedFavoriteRows = favoritesError ? [] : ((favoriteRows ?? []) as FavoriteRow[]);
  const favoriteCityIds = new Set(typedFavoriteRows.map((favorite) => favorite.city_id));

  let favoriteCities: CityRow[] = [];
  let favoriteCitiesErrorMessage: string | undefined;

  if (favoriteCityIds.size > 0) {
    const { data: favoriteCityRows, error: favoriteCitiesError } = await supabase
      .from("cities")
      .select("id, name, country, latitude, longitude, timezone")
      .in("id", Array.from(favoriteCityIds))
      .order("name", { ascending: true });

    favoriteCities = favoriteCitiesError ? [] : ((favoriteCityRows ?? []) as CityRow[]);
    favoriteCitiesErrorMessage = favoriteCitiesError?.message;
  }

  let weatherReadings: LatestWeatherRow[] = [];
  let weatherErrorMessage: string | undefined;

  if (favoriteCities.length > 0) {
    const { data: readings, error: weatherError } = await supabase
      .from("weather_readings")
      .select("city_id, temperature, wind_speed, weather_code, observed_at")
      .in(
        "city_id",
        favoriteCities.map((city) => city.id)
      )
      .order("observed_at", { ascending: false });

    weatherReadings = weatherError ? [] : ((readings ?? []) as LatestWeatherRow[]);
    weatherErrorMessage = weatherError?.message;
  }

  const setupErrors = [
    citiesError?.message,
    favoritesError?.message,
    favoriteCitiesErrorMessage,
    weatherErrorMessage
  ].filter(
    (message): message is string => Boolean(message)
  );

  const hasMissingTableError = setupErrors.some(isMissingRelationError);
  const typedCities = citiesError ? [] : ((cities ?? []) as CityRow[]);
  const latestWeatherByCity = getLatestWeatherByCity(weatherReadings);
  const typedProfile = profile as ProfileRow | null;
  const weatherReadyCount = favoriteCities.filter((city) => latestWeatherByCity.has(city.id)).length;

  return (
    <main className="min-h-screen">
      {!hasMissingTableError ? (
        <WeatherRealtimeListener
          favoriteCityIds={favoriteCities.map((city) => city.id)}
        />
      ) : null}

      <div className="border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <Link className="text-2xl font-semibold tracking-tight text-slate-900" href="/">
              Live Weather Board
            </Link>
            <p className="mt-1 text-sm text-slate-600">Assignment 4 dashboard · signed in</p>
          </div>
          <SignOutButton />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">
                Weather Dashboard
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                Track weather updates for your saved cities
              </h1>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Add cities to your favorites, then watch the latest readings update as the
                Railway worker writes new rows into Supabase.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl bg-slate-100 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  Favorites
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{favoriteCities.length}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700">
                  Live Cards
                </p>
                <p className="mt-1 text-2xl font-semibold text-emerald-800">
                  {weatherReadyCount}
                </p>
              </div>
            </div>
          </div>
        </section>

        {hasMissingTableError ? (
          <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">
              Database Setup Needed
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
              Your Supabase tables are not ready yet
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              You are logged in successfully, but the dashboard cannot load city data until
              the Assignment 4 schema has been created in Supabase.
            </p>
            <div className="mt-4 rounded-2xl border border-amber-200 bg-white p-4 text-sm text-slate-700">
              <p className="font-medium text-slate-900">Run these SQL files in Supabase SQL Editor:</p>
              <p className="mt-2">
                1. <code>supabase/migrations/202604220001_initial_schema.sql</code>
              </p>
              <p className="mt-1">2. <code>supabase/seed.sql</code></p>
            </div>
            <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900">Current error</p>
              <p className="mt-2 break-words">{setupErrors[0]}</p>
            </div>
          </section>
        ) : null}

        {!hasMissingTableError && weatherErrorMessage ? (
          <section className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-rose-700">
              Weather Load Error
            </p>
            <p className="mt-3 text-sm text-rose-800">{weatherErrorMessage}</p>
          </section>
        ) : null}

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="max-w-xl">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">
                  All Cities
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                  Browse supported cities
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Add cities to your favorites. Each favorite is stored in <code>user_favorites</code>
                  and stays scoped to your account through RLS.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-100 px-4 py-3 text-right">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  Available
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{typedCities.length}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {typedCities.length > 0 ? (
                typedCities.map((city) => (
                  <FavoriteCityCard
                    key={city.id}
                    city={city}
                    isFavorite={favoriteCityIds.has(city.id)}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
                  {hasMissingTableError
                    ? "City data will appear here after the Supabase schema and seed data are created."
                    : "No cities have been seeded yet."}
                </div>
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="max-w-md">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">
                  Favorite Weather
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                  Latest readings for your cities
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  These cards combine your favorite cities with the newest row stored in
                  <code> weather_readings</code> for each city.
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700">
                  Showing
                </p>
                <p className="mt-1 text-2xl font-semibold text-emerald-800">
                  {favoriteCities.length}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {favoriteCities.length > 0 ? (
                favoriteCities.map((city) => (
                  <FavoriteWeatherCard
                    key={city.id}
                    city={city}
                    weather={latestWeatherByCity.get(city.id) ?? null}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
                  {hasMissingTableError
                    ? "Favorites will appear here after the database tables are ready."
                    : "You have not added any favorite cities yet. Add a city on the left to start building your dashboard."}
                </div>
              )}
            </div>

            <Link
              className="mt-6 inline-flex text-sm font-medium text-sky-700 hover:text-sky-800"
              href="/"
            >
              Back to home
            </Link>
          </article>
        </section>
      </div>
    </main>
  );
}
