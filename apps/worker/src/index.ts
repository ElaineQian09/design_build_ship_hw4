import { getWorkerEnv } from "./env";
import { getSupabaseAdminClient } from "./lib/supabase";

function main() {
  const env = getWorkerEnv();
  const supabase = getSupabaseAdminClient();

  console.log(`worker scaffold running on port ${env.port}`);
  console.log(`Open-Meteo base URL: ${env.openMeteoBaseUrl}`);
  console.log(`Poll interval: ${env.workerPollIntervalMinutes} minute(s)`);
  console.log(
    `Supabase admin client ready: ${typeof supabase.from === "function" ? "yes" : "no"}`
  );
  console.log("No weather polling logic has been implemented yet.");
}

main();
