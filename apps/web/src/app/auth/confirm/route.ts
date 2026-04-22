import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "../../../lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (!tokenHash || !type) {
    const loginUrl = new URL("/login?message=The confirmation link is invalid or has expired.", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash
  });

  if (error) {
    const loginUrl = new URL(
      `/login?message=${encodeURIComponent("Email confirmation failed. Please try signing in again.")}`,
      request.url
    );
    return NextResponse.redirect(loginUrl);
  }

  const redirectUrl = new URL(next.startsWith("/") ? next : "/dashboard", request.url);
  return NextResponse.redirect(redirectUrl);
}
