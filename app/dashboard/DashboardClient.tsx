"use client";

import type { GitHubRepo } from "../types/github";
import {
  DASHBOARD_SELECTION_KEY,
  SELECTED_REPOS_KEY,
  CUSTOMIZED_PROJECTS_KEY,
} from "../types/customize";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Github, Star } from "lucide-react";

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
}: DashboardClientProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<number>>(() => new Set<number>());
  const [disconnectError, setDisconnectError] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [restoredCount, setRestoredCount] = useState<number | null>(null);

  const sortedRepos = useMemo(
    () => [...initialRepos].sort((a, b) => b.stargazers_count - a.stargazers_count),
    [initialRepos]
  );

  useEffect(() => {
    if (sortedRepos.length === 0) return;
    try {
      const stored = sessionStorage.getItem(DASHBOARD_SELECTION_KEY);
      if (!stored) return;
      const parsed: number[] = JSON.parse(stored);
      if (!Array.isArray(parsed)) return;
      const validIds = new Set(sortedRepos.map((r) => r.id));
      const restored = new Set(parsed.filter((id) => validIds.has(id)));
      if (restored.size > 0) {
        setSelected(restored);
        setRestoredCount(restored.size);
        const t = setTimeout(() => setRestoredCount(null), 4000);
        return () => clearTimeout(t);
      }
    } catch {
      sessionStorage.removeItem(DASHBOARD_SELECTION_KEY);
    }
  }, [sortedRepos.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (selected.size === 0) {
      sessionStorage.removeItem(DASHBOARD_SELECTION_KEY);
      return;
    }
    try {
      sessionStorage.setItem(DASHBOARD_SELECTION_KEY, JSON.stringify(Array.from(selected)));
    } catch (e) {
      console.error("Failed to persist selection:", e);
    }
  }, [selected]);

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
  const handleClearAll = () => {
    setSelected(new Set());
    sessionStorage.removeItem(DASHBOARD_SELECTION_KEY);
  };

  const handleToggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const firstName = user.name ? user.name.split(" ")[0] : null;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100">
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
        <section className="space-y-4">
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
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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

        {/* Repository grid */}
        {connectedRepo && (
          <section className="space-y-4">
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

            {restoredCount != null && (
              <p className="text-sm text-amber-200/90" role="status">
                Restored {restoredCount} previously selected project{restoredCount === 1 ? "" : "s"}.
              </p>
            )}

            {sortedRepos.length === 0 && !githubError ? (
              <p className="text-sm text-slate-400">No repositories were found for this account.</p>
            ) : (
              <>
                {sortedRepos.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3">
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
