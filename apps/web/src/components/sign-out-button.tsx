"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "../lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignOut() {
    setIsSubmitting(true);

    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
      onClick={handleSignOut}
      disabled={isSubmitting}
      type="button"
    >
      {isSubmitting ? "Signing out..." : "Sign out"}
    </button>
  );
}
