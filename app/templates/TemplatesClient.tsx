"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function TemplatesClient() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-slate-50">Choose a Template</h1>
        <p className="mt-2 text-slate-400">
          Template selection is coming soon. Your customized projects are saved.
        </p>
        <Link
          href="/customize"
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to Customize
        </Link>
      </div>
    </main>
  );
}
