type WorkerEnv = {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  openMeteoBaseUrl: string;
  workerPollIntervalMinutes: number;
  port: string;
};

function requireEnv(name: "SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY" | "OPEN_METEO_BASE_URL") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function parsePollIntervalMinutes(value: string | undefined) {
  const parsedValue = Number(value ?? "5");

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    throw new Error("WORKER_POLL_INTERVAL_MINUTES must be a positive number");
  }

  return parsedValue;
}

export function getWorkerEnv(): WorkerEnv {
  return {
    supabaseUrl: requireEnv("SUPABASE_URL"),
    supabaseServiceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    openMeteoBaseUrl: requireEnv("OPEN_METEO_BASE_URL"),
    workerPollIntervalMinutes: parsePollIntervalMinutes(process.env.WORKER_POLL_INTERVAL_MINUTES),
    port: process.env.PORT ?? "4000"
  };
}
