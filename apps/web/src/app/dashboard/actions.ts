"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "../../lib/supabase/server";

async function requireAuthenticatedUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Please log in to manage favorites.");
  }

  return { supabase, user };
}

export async function addFavoriteCity(formData: FormData) {
  const cityId = formData.get("cityId");

  if (typeof cityId !== "string" || cityId.length === 0) {
    return;
  }

  const { supabase, user } = await requireAuthenticatedUser();

  const { error } = await supabase.from("user_favorites").upsert(
    {
      user_id: user.id,
      city_id: cityId
    },
    {
      onConflict: "user_id,city_id",
      ignoreDuplicates: true
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}

export async function removeFavoriteCity(formData: FormData) {
  const cityId = formData.get("cityId");

  if (typeof cityId !== "string" || cityId.length === 0) {
    return;
  }

  const { supabase, user } = await requireAuthenticatedUser();

  const { error } = await supabase
    .from("user_favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("city_id", cityId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}
