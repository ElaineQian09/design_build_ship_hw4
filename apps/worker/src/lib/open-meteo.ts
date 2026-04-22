const CURRENT_WEATHER_FIELDS = ["temperature_2m", "wind_speed_10m", "weather_code"] as const;

export type CityRow = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export type WeatherReadingInsert = {
  city_id: string;
  temperature: number;
  wind_speed: number;
  weather_code: number;
  observed_at: string;
};

type OpenMeteoCurrentResponse = {
  current?: {
    time?: number;
    temperature_2m?: number;
    wind_speed_10m?: number;
    weather_code?: number;
  };
};

function buildForecastUrl(baseUrl: string, city: CityRow) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  const url = new URL(`${normalizedBaseUrl}/forecast`);

  url.searchParams.set("latitude", String(city.latitude));
  url.searchParams.set("longitude", String(city.longitude));
  url.searchParams.set("current", CURRENT_WEATHER_FIELDS.join(","));
  url.searchParams.set("timezone", "UTC");
  url.searchParams.set("timeformat", "unixtime");

  return url;
}

export async function fetchCurrentWeather(
  baseUrl: string,
  city: CityRow
): Promise<WeatherReadingInsert> {
  const url = buildForecastUrl(baseUrl, city);
  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo request failed for ${city.name}: ${response.status}`);
  }

  const payload = (await response.json()) as OpenMeteoCurrentResponse;
  const current = payload.current;

  if (
    !current ||
    typeof current.time !== "number" ||
    typeof current.temperature_2m !== "number" ||
    typeof current.wind_speed_10m !== "number" ||
    typeof current.weather_code !== "number"
  ) {
    throw new Error(`Open-Meteo response was missing current weather fields for ${city.name}`);
  }

  return {
    city_id: city.id,
    temperature: current.temperature_2m,
    wind_speed: current.wind_speed_10m,
    weather_code: current.weather_code,
    observed_at: new Date(current.time * 1000).toISOString()
  };
}
