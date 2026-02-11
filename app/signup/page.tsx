"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, User } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, name: name.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Sign up failed");
        setLoading(false);
        return;
      }
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        callbackUrl: "/dashboard",
        redirect: false,
      });
      if (result?.error) {
        setError("Account created but sign-in failed. Please sign in.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/80 px-6 py-8 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="absolute inset-x-12 -top-16 -z-10 h-32 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.6),transparent_60%)]" />
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-50">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign up to start building your portfolio.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-1">
              Name (optional)
            </label>
            <div className="relative">
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 pl-9 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-transparent"
                placeholder="Your name"
              />
              <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            </div>
          </div>
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
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 pl-9 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-transparent"
                placeholder="you@example.com"
              />
              <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 pl-9 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-transparent"
                placeholder="At least 8 characters"
              />
              <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-300" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/signin" className="text-slate-300 hover:text-white underline">
            Sign in
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-slate-500">
          <Link href="/" className="text-slate-400 hover:text-slate-300 underline">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
