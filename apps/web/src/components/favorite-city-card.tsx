import { addFavoriteCity, removeFavoriteCity } from "../app/dashboard/actions";

type FavoriteCityCardProps = {
  city: {
    id: string;
    name: string;
    country: string;
    latitude: number | string;
    longitude: number | string;
    timezone: string;
  };
  isFavorite: boolean;
  compact?: boolean;
};

export function FavoriteCityCard({
  city,
  isFavorite,
  compact = false
}: FavoriteCityCardProps) {
  const action = isFavorite ? removeFavoriteCity : addFavoriteCity;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{city.name}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {city.country} · {city.timezone}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isFavorite ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          {isFavorite ? "Favorite" : "Available"}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            Latitude
          </dt>
          <dd className="mt-1 font-medium text-slate-800">{city.latitude}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            Longitude
          </dt>
          <dd className="mt-1 font-medium text-slate-800">{city.longitude}</dd>
        </div>
      </dl>

      <form action={action} className="mt-5">
        <input type="hidden" name="cityId" value={city.id} />
        <button
          className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            isFavorite
              ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
              : "bg-sky-700 text-white hover:bg-sky-800"
          } ${compact ? "w-full" : ""}`}
          type="submit"
        >
          {isFavorite ? "Remove from favorites" : "Add to favorites"}
        </button>
      </form>
    </article>
  );
}
