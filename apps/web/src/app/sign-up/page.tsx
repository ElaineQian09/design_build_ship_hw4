import { redirect } from "next/navigation";
import { AuthForm } from "../../components/auth-form";
import { getSupabaseServerClient } from "../../lib/supabase/server";

export default async function SignUpPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
      <AuthForm mode="signup" />
    </main>
  );
}
