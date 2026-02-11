"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Github, Chrome, Mail, Lock } from "lucide-react";

type LoadingProvider = "github" | "google" | "email" | null;

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<LoadingProvider>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleOAuth(provider: "github" | "google") {
    try {
      setError(null);
      setLoading(provider);
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to sign in right now."
      );
      setLoading(null);
    }
  }

  if (status === "loading") {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-10">
        <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
          <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading…</p>
        </div>
      </main>
    );
  }

  if (status === "authenticated") {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-10">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Redirecting to dashboard…</p>
        </div>
      </main>
    );
  }

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading("email");
    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        callbackUrl: "/dashboard",
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password.");
        setLoading(null);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(null);
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/80 px-6 py-8 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="absolute inset-x-12 -top-16 -z-10 h-32 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.6),transparent_60%)]" />
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-50">
            Welcome to AutoPort
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to start building your portfolio.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={() => handleOAuth("github")}
            disabled={loading !== null}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-50 ring-1 ring-white/10 hover:bg-slate-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Github className="h-4 w-4" aria-hidden />
            {loading === "github" ? "Connecting to GitHub…" : "Continue with GitHub"}
          </button>

          <button
            type="button"
            onClick={() => handleOAuth("google")}
            disabled={loading !== null}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Chrome className="h-4 w-4" aria-hidden />
            {loading === "google" ? "Connecting to Google…" : "Continue with Google"}
          </button>
        </div>

        <div className="my-6 flex items-center gap-3 text-xs text-slate-500">
          <div className="h-px flex-1 bg-slate-800" />
          <span>or</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <form onSubmit={handleCredentials} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-1">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading !== null}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 pr-9 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-transparent disabled:opacity-60"
                placeholder="you@example.com"
              />
              <Mail className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading !== null}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 pr-9 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-transparent disabled:opacity-60"
                placeholder="Password"
              />
              <Lock className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-100 hover:bg-slate-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading === "email" ? "Signing in…" : "Sign in with email"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-slate-300 hover:text-white underline">
            Sign up
          </Link>
        </p>

        {error && (
          <p className="mt-4 text-xs text-red-300" role="alert">
            {error}
          </p>
        )}

        <p className="mt-6 text-center text-xs text-slate-500">
          By continuing, you agree to AutoPort&apos;s terms.{" "}
          <Link href="/" className="text-slate-300 hover:text-white underline">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}

