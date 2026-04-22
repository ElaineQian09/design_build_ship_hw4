import { redirect } from "next/navigation";
import { AuthForm } from "../../components/auth-form";
import { getSupabaseServerClient } from "../../lib/supabase/server";

type LoginPageProps = {
  searchParams?: {
    message?: string;
  };
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
      <AuthForm mode="login" initialMessage={searchParams?.message} />
    </main>
  );
}
