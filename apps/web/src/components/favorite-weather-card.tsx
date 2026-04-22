import { removeFavoriteCity } from "../app/dashboard/actions";
import type { LatestWeatherRow } from "../lib/weather";
import { formatObservedAt } from "../lib/weather";

type FavoriteWeatherCardProps = {
  city: {
    id: string;
    name: string;
    country: string;
    timezone: string;
  };
  weather: LatestWeatherRow | null;
};

function formatMetric(value: number | string | null, suffix: string) {
  if (value === null || value === undefined) {
    return "No data";
  }

  return `${value}${suffix}`;
}

export function FavoriteWeatherCard({ city, weather }: FavoriteWeatherCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{city.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{city.country}</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
          Favorite
        </span>
      </div>

      {weather ? (
        <dl className="mt-5 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <dt className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Temperature
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-slate-900">
              {formatMetric(weather.temperature, "°C")}
            </dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <dt className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Windspeed
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-slate-900">
              {formatMetric(weather.wind_speed, " km/h")}
            </dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <dt className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Weather Code
            </dt>
            <dd className="mt-2 text-lg font-semibold text-slate-900">{weather.weather_code}</dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <dt className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Observed At
            </dt>
            <dd className="mt-2 text-sm font-medium text-slate-900">
              {formatObservedAt(weather.observed_at)} UTC
            </dd>
          </div>
        </dl>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          No weather reading has been stored for this city yet.
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{city.timezone}</p>
        <form action={removeFavoriteCity}>
          <input type="hidden" name="cityId" value={city.id} />
          <button
            className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
            type="submit"
          >
            Remove
          </button>
        </form>
      </div>
    </article>
  );
}
