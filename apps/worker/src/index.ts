import { getWorkerEnv } from "./env";
import { getSupabaseAdminClient } from "./lib/supabase";
import { fetchCurrentWeather, type CityRow } from "./lib/open-meteo";

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function loadCities() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("cities")
    .select("id, name, latitude, longitude, timezone")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load cities from Supabase: ${error.message}`);
  }

  return (data ?? []) as CityRow[];
}

async function insertWeatherReadings(readings: {
  city_id: string;
  temperature: number;
  wind_speed: number;
  weather_code: number;
  observed_at: string;
}[]) {
  if (readings.length === 0) {
    return;
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("weather_readings").insert(readings);

  if (error) {
    throw new Error(`Failed to insert weather readings: ${error.message}`);
  }
}

async function runWeatherSync() {
  const env = getWorkerEnv();
  const startedAt = new Date();

  console.log(`[${startedAt.toISOString()}] Starting weather sync job`);

  const cities = await loadCities();
  console.log(`[${startedAt.toISOString()}] Loaded ${cities.length} cities from Supabase`);

  const readings = [];

  for (const city of cities) {
    try {
      console.log(`[${new Date().toISOString()}] Fetching weather for ${city.name}`);
      const reading = await fetchCurrentWeather(env.openMeteoBaseUrl, city);

      readings.push(reading);

      console.log(
        `[${new Date().toISOString()}] Parsed ${city.name}: temp=${reading.temperature}, wind=${reading.wind_speed}, code=${reading.weather_code}, observed_at=${reading.observed_at}`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown city fetch error";
      console.error(`[${new Date().toISOString()}] Failed to fetch ${city.name}: ${message}`);
    }
  }

  await insertWeatherReadings(readings);

  console.log(
    `[${new Date().toISOString()}] Inserted ${readings.length} weather reading(s) into Supabase`
  );
}

async function main() {
  const env = getWorkerEnv();
  const supabase = getSupabaseAdminClient();
  const pollIntervalMs = env.workerPollIntervalMinutes * 60 * 1000;

  console.log("Starting live-weather-board worker");
  console.log(`Railway port env value: ${env.port}`);
  console.log(`Open-Meteo base URL: ${env.openMeteoBaseUrl}`);
  console.log(`Poll interval: ${env.workerPollIntervalMinutes} minute(s)`);
  console.log(
    `Supabase admin client ready: ${typeof supabase.from === "function" ? "yes" : "no"}`
  );

  process.on("SIGTERM", () => {
    console.log(`[${new Date().toISOString()}] Received SIGTERM, shutting down worker`);
    process.exit(0);
  });

  process.on("SIGINT", () => {
    console.log(`[${new Date().toISOString()}] Received SIGINT, shutting down worker`);
    process.exit(0);
  });

  while (true) {
    try {
      await runWeatherSync();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown worker error";
      console.error(`[${new Date().toISOString()}] Worker cycle failed: ${message}`);
    }

    console.log(
      `[${new Date().toISOString()}] Sleeping for ${env.workerPollIntervalMinutes} minute(s)`
    );
    await sleep(pollIntervalMs);
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : "Unknown fatal error";
  console.error(`[${new Date().toISOString()}] Worker failed to start: ${message}`);
  process.exit(1);
});
