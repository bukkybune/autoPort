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
    () =>
      [...initialRepos].sort(
        (a, b) => b.stargazers_count - a.stargazers_count
      ),
    [initialRepos]
  );

  // Restore selection from sessionStorage on mount (only ids that exist in current repos)
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

  // Persist selection whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (selected.size === 0) {
      sessionStorage.removeItem(DASHBOARD_SELECTION_KEY);
      return;
    }
    try {
      sessionStorage.setItem(
        DASHBOARD_SELECTION_KEY,
        JSON.stringify([...selected])
      );
    } catch (e) {
      console.error("Failed to persist selection:", e);
    }
  }, [selected]);

  const selectionCount = selected.size;
  const hasCustomizedBefore =
    typeof window !== "undefined" &&
    !!sessionStorage.getItem(CUSTOMIZED_PROJECTS_KEY);

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

  const handleSelectAll = () => {
    setSelected(new Set(sortedRepos.map((r) => r.id)));
  };

  const handleClearAll = () => {
    setSelected(new Set());
    sessionStorage.removeItem(DASHBOARD_SELECTION_KEY);
  };

  const handleToggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Top section */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">Dashboard</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-50">
              Welcome back{user.name ? `, ${user.name}` : ""}!
            </h1>
            {user.email && (
              <p className="mt-1 text-sm text-slate-400">{user.email}</p>
            )}
          </div>
        </section>

        {/* Connected repositories section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-100">
            Connected repositories
          </h2>
          {!connectedRepo ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-6 sm:p-8">
              <h3 className="text-base font-semibold text-slate-50">
                Connect your GitHub to import repositories
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                We&apos;ll only access your repository data to help you build
                your portfolio.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/api/connect/github"
                  className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-white transition-colors"
                >
                  Connect GitHub
                </Link>
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-500 cursor-not-allowed"
                  title="Coming soon"
                >
                  Connect GitLab (coming soon)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-emerald-200">
                    GitHub connected
                  </p>
                  <p className="text-sm text-emerald-100/80">
                    Signed in as{" "}
                    <span className="font-semibold">
                      @{connectedRepo.username}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg border border-emerald-500/50 px-4 py-1.5 text-xs font-medium text-emerald-100 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                  disabled={disconnecting}
                  onClick={async () => {
                    setDisconnectError(null);
                    setDisconnecting(true);
                    try {
                      const res = await fetch("/api/connect/github", {
                        method: "DELETE",
                      });
                      if (!res.ok) {
                        const data = await res.json().catch(() => ({}));
                        setDisconnectError(
                          (data as { error?: string }).error ??
                            "Failed to disconnect. Try again."
                        );
                        return;
                      }
                      window.location.reload();
                    } catch {
                      setDisconnectError(
                        "Failed to disconnect. Check your connection and try again."
                      );
                    } finally {
                      setDisconnecting(false);
                    }
                  }}
                >
                  {disconnecting ? "Disconnecting…" : "Disconnect"}
                </button>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-100">
                    Repository sources
                  </h3>
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-500 cursor-not-allowed"
                  >
                    GitLab coming soon
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {githubError && (
          <div
            className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
            role="alert"
          >
            {githubError}
          </div>
        )}

        {/* Repository grid */}
        {connectedRepo && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-100">
                Your GitHub repositories
              </h2>
              <p className="text-xs text-slate-400">
                Showing {sortedRepos.length} repositories
              </p>
            </div>

            {disconnectError && (
              <div
                className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                role="alert"
              >
                {disconnectError}
              </div>
            )}

            {restoredCount != null && (
              <p className="text-sm text-amber-200/90" role="status">
                Restored {restoredCount} previously selected project
                {restoredCount === 1 ? "" : "s"}.
              </p>
            )}

            {sortedRepos.length === 0 && !githubError ? (
              <p className="text-sm text-slate-400">
                No repositories were found for this account.
              </p>
            ) : (
              <>
                {sortedRepos.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <p className="text-sm text-slate-400">
                      {selectionCount} of {sortedRepos.length} selected
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        disabled={selectionCount === sortedRepos.length}
                        className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAll}
                        disabled={selectionCount === 0}
                        className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedRepos.map((repo) => {
                  const isSelected = selected.has(repo.id);
                  return (
                    <label
                      key={repo.id}
                      className={`relative block cursor-pointer rounded-xl border p-4 transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-500/10 shadow-[0_0_0_1px_rgba(59,130,246,0.4)]"
                          : "border-slate-800 bg-slate-900/60 hover:border-slate-600"
                      }`}
                    >
                      <div className="absolute right-3 top-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-blue-500 accent-blue-500 focus:ring-blue-500"
                          checked={isSelected}
                          onChange={() => handleToggle(repo.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="pr-6">
                        <h3 className="truncate text-sm font-semibold text-slate-50">
                          {repo.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs text-slate-400">
                          {repo.description || "No description"}
                        </p>
                        <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <span aria-hidden>★</span> {repo.stargazers_count}
                          </span>
                          {repo.language && (
                            <span className="rounded bg-slate-800 px-2 py-0.5">
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

        {/* Bottom bar */}
        {connectedRepo && selectionCount > 0 && (
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4 sm:px-0 sm:pb-6">
            <div className="pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/95 px-4 py-3 shadow-2xl shadow-black/50 backdrop-blur">
              <p className="text-sm text-slate-200">
                {selectionCount} project
                {selectionCount === 1 ? "" : "s"} selected
              </p>
              <button
                type="button"
                onClick={handleCreatePortfolio}
                disabled={isNavigating}
                className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-70 disabled:cursor-wait"
              >
                {isNavigating
                  ? "Loading…"
                  : hasCustomizedBefore
                    ? `Update Portfolio (${selectionCount})`
                    : `Create Portfolio (${selectionCount})`}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

