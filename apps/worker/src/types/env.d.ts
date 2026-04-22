declare namespace NodeJS {
  interface ProcessEnv {
    SUPABASE_URL?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    OPEN_METEO_BASE_URL?: string;
    WORKER_POLL_INTERVAL_MINUTES?: string;
    PORT?: string;
  }
}
