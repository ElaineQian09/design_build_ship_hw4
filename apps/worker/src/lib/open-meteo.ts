const CURRENT_WEATHER_FIELDS = ["temperature_2m", "wind_speed_10m", "weather_code"] as const;
const MAX_RATE_LIMIT_RETRIES = 3;
const RATE_LIMIT_BACKOFF_MS = 1500;

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

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function buildForecastUrl(baseUrl: string, cities: CityRow[]) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  const url = new URL(`${normalizedBaseUrl}/forecast`);

  url.searchParams.set("latitude", cities.map((city) => String(city.latitude)).join(","));
  url.searchParams.set("longitude", cities.map((city) => String(city.longitude)).join(","));
  url.searchParams.set("current", CURRENT_WEATHER_FIELDS.join(","));
  url.searchParams.set("timezone", cities.map(() => "UTC").join(","));
  url.searchParams.set("timeformat", "unixtime");

  return url;
}

function normalizeBatchPayload(payload: OpenMeteoCurrentResponse | OpenMeteoCurrentResponse[]) {
  return Array.isArray(payload) ? payload : [payload];
}

function parseReadingForCity(city: CityRow, payload: OpenMeteoCurrentResponse): WeatherReadingInsert {
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

export async function fetchCurrentWeatherBatch(
  baseUrl: string,
  cities: CityRow[]
): Promise<WeatherReadingInsert[]> {
  if (cities.length === 0) {
    return [];
  }

  const url = buildForecastUrl(baseUrl, cities);

  for (let attempt = 1; attempt <= MAX_RATE_LIMIT_RETRIES; attempt += 1) {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json"
      }
    });

    if (response.status === 429) {
      if (attempt === MAX_RATE_LIMIT_RETRIES) {
        throw new Error(`Open-Meteo request failed with 429 after ${MAX_RATE_LIMIT_RETRIES} attempts`);
      }

      await sleep(RATE_LIMIT_BACKOFF_MS * attempt);
      continue;
    }

    if (!response.ok) {
      throw new Error(`Open-Meteo request failed: ${response.status}`);
    }

    const payload = normalizeBatchPayload(
      (await response.json()) as OpenMeteoCurrentResponse | OpenMeteoCurrentResponse[]
    );

    if (payload.length !== cities.length) {
      throw new Error(
        `Open-Meteo returned ${payload.length} result(s) for ${cities.length} requested cities`
      );
    }

    return cities.map((city, index) => parseReadingForCity(city, payload[index]));
  }

  throw new Error("Open-Meteo request failed unexpectedly");
}
