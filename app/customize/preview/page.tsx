"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PORTFOLIO_CONFIG_KEY } from "@/app/types/portfolio";
import type { PortfolioConfig } from "@/app/types/portfolio";
import { PreviewTemplate } from "@/app/components/PreviewTemplate";

export default function CustomizePreviewPage() {
  const [config, setConfig] = useState<PortfolioConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PORTFOLIO_CONFIG_KEY);
      if (!raw) {
        setLoading(false);
        return;
      }
      const parsed = JSON.parse(raw) as PortfolioConfig;
      if (parsed?.hero) setConfig(parsed);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!config) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-center">No portfolio data. Customize your portfolio first.</p>
        <Link href="/customize" className="text-amber-400 hover:text-amber-300">
          ← Back to Customize
        </Link>
      </main>
    );
  }

  return (
    <>
      <div className="fixed top-3 right-3 z-50">
        <Link
          href="/customize"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-800/90 border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
        >
          ← Back to Customize
        </Link>
      </div>
      <div className="min-h-screen w-full">
        <PreviewTemplate config={config} />
      </div>
    </>
  );
}
