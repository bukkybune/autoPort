"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function CustomizeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Customize error:", error);
  }, [error]);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl font-bold text-slate-50">Editor failed to load</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Something went wrong in the portfolio editor. Your saved progress is intact — try again or return to the dashboard.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
