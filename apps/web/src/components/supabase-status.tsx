"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../lib/supabase/client";

export function SupabaseStatus() {
  const [status, setStatus] = useState("Configuring browser client...");

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    const hasRealtime = typeof client.channel === "function";

    setStatus(
      hasRealtime
        ? "Supabase browser client is ready for Auth and Realtime."
        : "Supabase browser client is missing Realtime support."
    );
  }, []);

  return <p className="mt-4 text-sm text-slate-500">{status}</p>;
}
