type PublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

const publicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function requireEnv(
  value: string | undefined,
  name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
) {

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getPublicEnv(): PublicEnv {
  return {
    supabaseUrl: requireEnv(publicSupabaseUrl, "NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: requireEnv(publicSupabaseAnonKey, "NEXT_PUBLIC_SUPABASE_ANON_KEY")
  };
}
