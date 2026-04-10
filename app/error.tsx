"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-slate-50">Something went wrong</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          An unexpected error occurred. If this keeps happening, please{" "}
          <a
            href="https://github.com/anthropics/claude-code/issues"
            className="text-amber-400 hover:text-amber-300 underline"
          >
            report it
          </a>
          .
        </p>
        {error.digest && (
          <p className="text-xs text-slate-600 font-mono">Error ID: {error.digest}</p>
        )}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
