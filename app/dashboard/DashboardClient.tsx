"use client";

import type { GitHubRepo } from "../types/github";
import {
  SELECTED_REPOS_KEY,
  CUSTOMIZED_PROJECTS_KEY,
} from "../types/customize";
import { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Github, Star, HelpCircle, Globe, Copy, Check, ExternalLink } from "lucide-react";
import { Tour, type TourStep } from "../components/Tour";

const TOUR_KEY = "autoport_tour_dashboard_v1";

type DashboardClientProps = {
  user: {
    name: string | null;
    email: string | null;
  };
  connectedRepo: {
    provider: string;
    username: string;
  } | null;
  initialRepos: GitHubRepo[];
  githubError?: string | null;
  portfolio?: { isPublished: boolean; slug: string | null } | null;
};

const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  "C++": "#f34b7d",
  C: "#555555",
  Java: "#b07219",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Shell: "#89e051",
  Dart: "#00B4AB",
  "C#": "#178600",
  Scala: "#c22d40",
  Vue: "#4FC08D",
  Svelte: "#ff3e00",
  "Jupyter Notebook": "#DA5B0B",
};

function getLangColor(lang: string): string {
  return LANG_COLORS[lang] ?? "#64748b";
}

export function DashboardClient({
  user,
  connectedRepo,
  initialRepos,
  githubError = null,
  portfolio = null,
}: DashboardClientProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<number>>(() => new Set<number>());
  const [disconnectError, setDisconnectError] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Portfolio sharing state
  const [isPublished, setIsPublished] = useState(portfolio?.isPublished ?? false);
  const [portfolioSlug, setPortfolioSlug] = useState(portfolio?.slug ?? null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const portfolioUrl = portfolioSlug ? `/p/${portfolioSlug}` : null;

  const handlePublishToggle = useCallback(async () => {
    setPublishing(true);
    setPublishError(null);
    try {
      const res = await fetch("/api/portfolio/publish", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish: !isPublished }),
      });
      const data = await res.json() as { isPublished?: boolean; slug?: string | null; url?: string | null; error?: string };
      if (!res.ok) {
        setPublishError(data.error ?? "Failed to update portfolio visibility.");
        return;
      }
      setIsPublished(data.isPublished ?? false);
      setPortfolioSlug(data.slug ?? null);
    } catch {
      setPublishError("Network error. Check your connection and try again.");
    } finally {
      setPublishing(false);
    }
  }, [isPublished]);

  const handleCopyLink = useCallback(async () => {
    if (!portfolioSlug) return;
    const url = `${window.location.origin}/p/${portfolioSlug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [portfolioSlug]);

  const sortedRepos = useMemo(
    () => [...initialRepos].sort((a, b) => b.stargazers_count - a.stargazers_count),
    [initialRepos]
  );


  const selectionCount = selected.size;
  const hasCustomizedBefore =
    typeof window !== "undefined" && !!sessionStorage.getItem(CUSTOMIZED_PROJECTS_KEY);

  const handleCreatePortfolio = () => {
    const selectedRepos = sortedRepos.filter((r) => selected.has(r.id));
    if (selectedRepos.length === 0) return;
    try {
      sessionStorage.setItem(SELECTED_REPOS_KEY, JSON.stringify(selectedRepos));
      setIsNavigating(true);
      router.push("/customize");
    } catch (e) {
      console.error("Failed to save selection:", e);
    }
  };

  const handleSelectAll = () => setSelected(new Set(sortedRepos.map((r) => r.id)));
  const handleClearAll = () => setSelected(new Set());

  const handleToggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(TOUR_KEY)) setShowTour(true);
  }, []);

  function completeTour() {
    localStorage.setItem(TOUR_KEY, "1");
    setShowTour(false);
  }

  const tourSteps: TourStep[] = connectedRepo
    ? [
        {
          title: "Welcome to AutoPort!",
          body: "Let me give you a quick tour of your dashboard. It only takes 30 seconds.",
        },
        {
          target: "github-connection",
          title: "GitHub Connected",
          body: "Your GitHub account is linked. AutoPort only reads public repo data — nothing else. Disconnect anytime from here.",
        },
        {
          target: "repos-section",
          title: "Your Repositories",
          body: "All your public repos appear here, sorted by stars. Click any card to select it for your portfolio.",
        },
        {
          target: "repos-actions",
          title: "Select & Build",
          body: "Use Select All to grab everything, or pick individually. Once you've selected repos, a 'Create Portfolio' button appears at the bottom.",
        },
      ]
    : [
        {
          title: "Welcome to AutoPort!",
          body: "Build a beautiful developer portfolio in minutes, straight from your GitHub repos. Let me show you how.",
        },
        {
          target: "github-section",
          title: "Step 1 — Connect GitHub",
          body: "Click 'Connect GitHub' to import your public repositories. We only read names, descriptions, stars, and languages. Disconnect anytime.",
        },
        {
          title: "You're all set!",
          body: "Once connected, select the repos you want to showcase and hit 'Create Portfolio' to start customizing. Takes about 2 minutes.",
        },
      ];

  const firstName = user.name ? user.name.split(" ")[0] : null;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100">
      {showTour && <Tour steps={tourSteps} onDone={completeTour} />}

      {/* Take tour button */}
      {!showTour && (
        <button
          type="button"
          onClick={() => setShowTour(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-400 shadow-lg backdrop-blur hover:border-amber-500/50 hover:text-amber-400 transition-colors"
          aria-label="Take tour"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Tour
        </button>
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Greeting */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Dashboard</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-50">
            Welcome back{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            {connectedRepo
              ? "Select repositories to include in your portfolio."
              : "Connect GitHub to start building your portfolio."}
          </p>
        </section>

        {/* GitHub connection */}
        <section className="space-y-4" data-tour="github-section">
          <h2 className="text-base font-semibold text-slate-100">GitHub Connection</h2>

          {!connectedRepo ? (
            /* ── Empty state ── */
            <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/40 p-10 sm:p-14 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-800/80">
                <Github className="h-7 w-7 text-slate-300" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold text-slate-50 mb-2">Connect your GitHub account</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto mb-7 leading-relaxed">
                We only read repository data — names, descriptions, stars, languages. Nothing else. Disconnect anytime.
              </p>
              <Link
                href="/api/connect/github"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-white"
              >
                <Github className="h-4 w-4" aria-hidden />
                Connect GitHub
              </Link>
            </div>
          ) : (
            /* ── Connected state ── */
            <div data-tour="github-connection" className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-emerald-300">GitHub connected</p>
                <p className="text-sm text-emerald-100/70 mt-0.5">
                  Signed in as <span className="font-semibold">@{connectedRepo.username}</span>
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-emerald-500/40 px-4 py-1.5 text-xs font-medium text-emerald-200 transition-colors hover:bg-emerald-500/10 disabled:opacity-50"
                disabled={disconnecting}
                onClick={async () => {
                  setDisconnectError(null);
                  setDisconnecting(true);
                  try {
                    const res = await fetch("/api/connect/github", { method: "DELETE" });
                    if (!res.ok) {
                      const data = await res.json().catch(() => ({}));
                      setDisconnectError((data as { error?: string }).error ?? "Failed to disconnect. Try again.");
                      return;
                    }
                    window.location.reload();
                  } catch {
                    setDisconnectError("Failed to disconnect. Check your connection and try again.");
                  } finally {
                    setDisconnecting(false);
                  }
                }}
              >
                {disconnecting ? "Disconnecting…" : "Disconnect"}
              </button>
            </div>
          )}
        </section>

        {githubError && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200" role="alert">
            {githubError}
          </div>
        )}

        {/* Portfolio sharing */}
        {portfolio !== null && (
          <section className="space-y-4">
            <h2 className="text-base font-semibold text-slate-100">Your Portfolio</h2>

            <div className={`rounded-2xl border px-5 py-4 ${
              isPublished
                ? "border-blue-500/30 bg-blue-500/5"
                : "border-slate-700/60 bg-slate-900/40"
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border ${
                    isPublished
                      ? "border-blue-500/40 bg-blue-500/10"
                      : "border-slate-700/60 bg-slate-800/80"
                  }`}>
                    <Globe className={`h-4 w-4 ${isPublished ? "text-blue-400" : "text-slate-500"}`} aria-hidden />
                  </div>
                  <div>
                    {isPublished && portfolioUrl ? (
                      <>
                        <p className="text-sm font-medium text-blue-300">Published</p>
                        <a
                          href={portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 flex items-center gap-1 text-xs text-blue-200/70 hover:text-blue-200 transition-colors"
                        >
                          {`${typeof window !== "undefined" ? window.location.origin : ""}/p/${portfolioSlug}`}
                          <ExternalLink className="h-3 w-3" aria-hidden />
                        </a>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-slate-300">Not published</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {portfolio
                            ? "Publish to get a shareable public link."
                            : "Create and save a portfolio first, then publish it here."}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isPublished && portfolioSlug && (
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700"
                      aria-label="Copy portfolio link"
                    >
                      {copied ? (
                        <><Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden />Copied!</>
                      ) : (
                        <><Copy className="h-3.5 w-3.5" aria-hidden />Copy link</>
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handlePublishToggle}
                    disabled={publishing || !portfolio}
                    className={`inline-flex items-center justify-center rounded-lg px-4 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      isPublished
                        ? "border border-red-500/40 text-red-300 hover:bg-red-500/10"
                        : "bg-blue-600 text-white hover:bg-blue-500"
                    }`}
                  >
                    {publishing ? "Saving…" : isPublished ? "Unpublish" : "Publish"}
                  </button>
                </div>
              </div>

              {publishError && (
                <p className="mt-3 text-xs text-red-400" role="alert">{publishError}</p>
              )}
            </div>
          </section>
        )}

        {/* Repository grid */}
        {connectedRepo && (
          <section className="space-y-4" data-tour="repos-section">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-100">
                Your repositories
                <span className="ml-2 text-xs font-normal text-slate-500">({sortedRepos.length})</span>
              </h2>
            </div>

            {disconnectError && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
                {disconnectError}
              </div>
            )}

{sortedRepos.length === 0 && !githubError ? (
              <p className="text-sm text-slate-400">No repositories were found for this account.</p>
            ) : (
              <>
                {sortedRepos.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3" data-tour="repos-actions">
                    <p className="text-sm text-slate-500">
                      <span className="text-slate-200 font-medium">{selectionCount}</span> of {sortedRepos.length} selected
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        disabled={selectionCount === sortedRepos.length}
                        className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAll}
                        disabled={selectionCount === 0}
                        className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sortedRepos.map((repo) => {
                    const isSelected = selected.has(repo.id);
                    return (
                      <label
                        key={repo.id}
                        className={`relative block cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 ${
                          isSelected
                            ? "border-amber-500/50 bg-amber-500/10 shadow-[0_0_0_1px_rgba(245,158,11,0.2)]"
                            : "border-slate-800/80 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-black/20"
                        }`}
                      >
                        <div className="absolute right-3 top-3">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-amber-500 focus:ring-amber-500"
                            checked={isSelected}
                            onChange={() => handleToggle(repo.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="pr-7">
                          <h3 className="truncate text-sm font-semibold text-slate-50">{repo.name}</h3>
                          <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs text-slate-400 leading-relaxed">
                            {repo.description || "No description"}
                          </p>
                          <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" aria-hidden />
                              {repo.stargazers_count}
                            </span>
                            {repo.language && (
                              <span className="flex items-center gap-1.5">
                                <span
                                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                  style={{ background: getLangColor(repo.language) }}
                                />
                                {repo.language}
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        )}

        {/* Bottom action bar */}
        {connectedRepo && selectionCount > 0 && (
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4 sm:px-0 sm:pb-6">
            <div className="pointer-events-auto flex w-full max-w-md items-center justify-between gap-4 rounded-2xl border border-slate-700/80 bg-slate-900/95 px-5 py-3.5 shadow-2xl shadow-black/50 backdrop-blur">
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-slate-50">{selectionCount}</span> project{selectionCount === 1 ? "" : "s"} selected
              </p>
              <button
                type="button"
                onClick={handleCreatePortfolio}
                disabled={isNavigating}
                className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-sm shadow-amber-500/20 transition-colors hover:bg-amber-400 disabled:cursor-wait disabled:opacity-70"
              >
                {isNavigating
                  ? "Loading…"
                  : hasCustomizedBefore
                    ? "Update Portfolio"
                    : "Create Portfolio"}
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
