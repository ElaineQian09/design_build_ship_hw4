"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "../lib/supabase/client";

type AuthFormProps = {
  mode: "login" | "signup";
  initialMessage?: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function AuthForm({ mode, initialMessage }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState(initialMessage ?? null);

  const isLogin = mode === "login";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setNotice(null);

    try {
      const supabase = getSupabaseBrowserClient();

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          throw error;
        }

        router.push("/dashboard");
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`
        }
      });

      if (error) {
        throw error;
      }

      if (data.user && data.session) {
        await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            email: data.user.email ?? email
          },
          {
            onConflict: "id"
          }
        );

        router.push("/dashboard");
        router.refresh();
        return;
      }

      const message =
        "Account created. Check your email to confirm the account, then continue to your dashboard.";

      setNotice(message);
      router.push(`/login?message=${encodeURIComponent(message)}`);
      router.refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">
        Live Weather Board
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
        {isLogin ? "Log in" : "Create your account"}
      </h1>
      <p className="mt-3 text-sm text-slate-600">
        {isLogin
          ? "Use Supabase Auth to access your personalized dashboard."
          : "Sign up with email and password. You will be able to reach the dashboard after authentication."}
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
          <input
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
          <input
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            required
          />
        </label>

        {errorMessage ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </p>
        ) : null}

        {notice ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {notice}
          </p>
        ) : null}

        <button
          className="inline-flex w-full items-center justify-center rounded-xl bg-sky-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : isLogin ? "Log in" : "Sign up"}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
        <Link className="font-medium text-sky-700 hover:text-sky-800" href="/">
          Back home
        </Link>
        <Link
          className="font-medium text-sky-700 hover:text-sky-800"
          href={isLogin ? "/sign-up" : "/login"}
        >
          {isLogin ? "Need an account?" : "Already have an account?"}
        </Link>
      </div>
    </div>
  );
}
