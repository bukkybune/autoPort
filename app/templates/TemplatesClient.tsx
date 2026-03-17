"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Maximize2,
  X,
  Download,
  Copy,
  ChevronDown,
} from "lucide-react";
import { PORTFOLIO_CONFIG_KEY } from "@/app/types/portfolio";
import type { PortfolioConfig } from "@/app/types/portfolio";
import { MinimalProTemplate } from "@/app/components/templates/MinimalProTemplate";
import { CleanMinimalTemplate } from "@/app/components/templates/CleanMinimalTemplate";
import { AuroraTemplate } from "@/app/components/templates/AuroraTemplate";
import { getFullPageHTML, type TemplateId } from "@/lib/export-portfolio";

const TEMPLATES: {
  id: TemplateId;
  name: string;
  description: string;
  bestFor: string;
  Component: React.ComponentType<{ config: PortfolioConfig }>;
}[] = [
  {
    id: "minimal-pro",
    name: "Minimal Pro",
    description: "Brittany Chiang style. Numbered sections, fixed sidebar, alternating project blocks.",
    bestFor: "Professional dev portfolios",
    Component: MinimalProTemplate,
  },
  {
    id: "clean-minimal",
    name: "Clean & Minimal",
    description: "Light bg, serif headings, lots of whitespace. One accent color.",
    bestFor: "Designer / editorial",
    Component: CleanMinimalTemplate,
  },
  {
    id: "aurora",
    name: "Aurora",
    description: "Animated aurora gradient blobs, glassmorphism cards, gradient text. Dark and colorful.",
    bestFor: "Creative devs, standout portfolios",
    Component: AuroraTemplate,
  },
];

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function TemplatesClient() {
  const { status } = useSession();
  const router = useRouter();
  const [config, setConfig] = useState<PortfolioConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("minimal-pro");
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin");
      return;
    }
    if (status !== "authenticated") return;
    try {
      const raw = typeof window !== "undefined" ? sessionStorage.getItem(PORTFOLIO_CONFIG_KEY) : null;
      if (!raw) {
        setNoData(true);
        setLoading(false);
        return;
      }
      const parsed = JSON.parse(raw) as PortfolioConfig;
      if (!parsed?.hero) {
        setNoData(true);
        setLoading(false);
        return;
      }
      setConfig(parsed);
      const template = parsed.theme?.template ?? "minimal-pro";
      setSelectedTemplate(template);
    } catch {
      setNoData(true);
    } finally {
      setLoading(false);
    }
  }, [status, router]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, []);

  const handleDownloadHTML = useCallback(() => {
    if (!config) return;
    setExportOpen(false);
    setDownloading(true);
    const html = getFullPageHTML(selectedTemplate, config);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(config.hero.name || "portfolio").replace(/\s+/g, "-").toLowerCase()}-portfolio.html`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloading(false);
    showToast("Portfolio downloaded! 🎉");
  }, [selectedTemplate, config, showToast]);

  const handleCopyHTML = useCallback(async () => {
    if (!config) return;
    setExportOpen(false);
    setCopying(true);
    const html = getFullPageHTML(selectedTemplate, config);
    try {
      await navigator.clipboard.writeText(html);
      showToast("HTML copied to clipboard!");
    } catch {
      showToast("Failed to copy. Try Download instead.");
    }
    setCopying(false);
  }, [selectedTemplate, config, showToast]);

  if (status === "loading" || loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4" role="status">
          <div className="h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading…</p>
        </div>
      </main>
    );
  }

  if (noData || !config) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-center">
          <p className="text-slate-200">Please configure your portfolio sections first.</p>
          <Link
            href="/customize"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-600"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Customize
          </Link>
        </div>
      </main>
    );
  }

  const SelectedComponent = TEMPLATES.find((t) => t.id === selectedTemplate)!.Component;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 pb-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href="/customize"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Customize
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-50">Choose a Template</h1>
          <div className="w-[100px]" aria-hidden />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => setSelectedTemplate(template.id)}
              className={cn(
                "p-6 rounded-xl border-2 transition-all duration-200 text-left hover:scale-[1.02]",
                selectedTemplate === template.id
                  ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                  : "border-slate-700 bg-slate-900/60 hover:border-slate-600"
              )}
            >
              <div
                className={cn(
                  "aspect-video rounded-lg mb-4 overflow-hidden border flex items-center justify-center text-sm font-medium",
                  template.id === "minimal-pro" && "border-[#233554] text-[#64ffda]",
                  template.id === "clean-minimal" && "border-[#e5e0d8] text-[#b45309]",
                  template.id === "aurora" && "border-[#1a1a3e] text-[#2dd4bf]"
                )}
                style={{
                  background:
                    template.id === "minimal-pro" ? "#0a192f" :
                    template.id === "clean-minimal" ? "#faf9f6" :
                    template.id === "aurora" ? "#06080f" : "#0f172a",
                }}
              >
                {template.name}
              </div>
              <h3 className="text-xl font-bold text-slate-50 mb-2">{template.name}</h3>
              <p className="text-sm text-slate-400 mb-3">{template.description}</p>
              <p className="text-xs text-slate-500 mb-3">Best for: {template.bestFor}</p>
              {selectedTemplate === template.id && (
                <div className="inline-flex items-center gap-2 text-amber-400 font-semibold">
                  <Check className="h-4 w-4" aria-hidden />
                  Selected
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900/40 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800/60">
            <span className="text-sm font-medium text-slate-300">Live Preview</span>
            <button
              type="button"
              onClick={() => setFullscreenOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <Maximize2 className="h-4 w-4" aria-hidden />
              Fullscreen Preview
            </button>
          </div>
          <div className="p-4 overflow-auto max-h-[70vh] flex justify-center bg-slate-800/30">
            <div
              className="origin-top transition-transform duration-200 rounded-lg overflow-hidden border border-slate-700 shadow-2xl"
              style={{ transform: "scale(0.8)", transformOrigin: "top center" }}
            >
              <div className="w-full max-w-4xl">
                <SelectedComponent config={config} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {fullscreenOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900 shrink-0">
            <span className="text-sm font-medium text-slate-300">Fullscreen Preview</span>
            <button
              type="button"
              onClick={() => setFullscreenOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 flex justify-center">
            <div className="max-w-4xl w-full">
              <SelectedComponent config={config} />
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href="/customize"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Customize
          </Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportOpen((o) => !o)}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-600"
            >
              Export Portfolio
              <ChevronDown className="h-4 w-4" aria-hidden />
            </button>
            {exportOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  aria-hidden
                  onClick={() => setExportOpen(false)}
                />
                <div className="absolute right-0 bottom-full mb-2 z-50 w-56 rounded-xl border border-slate-700 bg-slate-900 shadow-xl py-1">
                  <button
                    type="button"
                    onClick={handleDownloadHTML}
                    disabled={downloading}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-60"
                  >
                    <Download className="h-4 w-4" aria-hidden />
                    Download as HTML
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyHTML}
                    disabled={copying}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-60"
                  >
                    <Copy className="h-4 w-4" aria-hidden />
                    Copy HTML
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-slate-800 border border-slate-600 px-4 py-2.5 text-sm text-slate-100 shadow-lg animate-[apFadeUp_0.3s_ease-out]"
          role="status"
        >
          {toast}
        </div>
      )}
    </main>
  );
}
