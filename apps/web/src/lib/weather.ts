export type LatestWeatherRow = {
  city_id: string;
  temperature: number | string | null;
  wind_speed: number | string | null;
  weather_code: number | null;
  observed_at: string;
  created_at: string;
};

export function getLatestWeatherByCity(readings: LatestWeatherRow[]) {
  const latestByCity = new Map<string, LatestWeatherRow>();

  for (const reading of readings) {
    if (!latestByCity.has(reading.city_id)) {
      latestByCity.set(reading.city_id, reading);
    }
  }

  return latestByCity;
}

export function formatWeatherTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC"
  }).format(new Date(value));
}
