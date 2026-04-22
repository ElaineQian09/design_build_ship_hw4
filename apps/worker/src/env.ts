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

export function getWorkerEnv(): WorkerEnv {
  return {
    supabaseUrl: requireEnv("SUPABASE_URL"),
    supabaseServiceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    openMeteoBaseUrl: requireEnv("OPEN_METEO_BASE_URL"),
    workerPollIntervalMinutes: Number(process.env.WORKER_POLL_INTERVAL_MINUTES ?? "5"),
    port: process.env.PORT ?? "4000"
  };
}
