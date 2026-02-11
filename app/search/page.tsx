"use client";

import { FormEvent, useState } from "react";
import { GitHubRepo } from "../types/github";

export default function SearchPage() {
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState<GitHubRepo[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;

    setError(null);
    setRepos(null);
    setLoading(true);

    try {
      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(trimmed)}/repos?sort=stars&per_page=100`
      );

      if (!res.ok) {
        if (res.status === 404) {
          setError(`User "${trimmed}" not found.`);
          return;
        }
        if (res.status === 403) {
          setError("GitHub rate limit exceeded. Please try again later.");
          return;
        }
        throw new Error(`GitHub API error: ${res.status}`);
      }

      const data = await res.json();
      setRepos(
        data.map((r: GitHubRepo) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          stargazers_count: r.stargazers_count,
          language: r.language,
          html_url: r.html_url,
        }))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch repositories."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <header className="text-center mb-10 ap-fade-up">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            GitHub Repositories
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Enter a GitHub username to list their public repos
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-12 ap-fade-up-200"
        >
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="GitHub username"
            className="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            disabled={loading}
            aria-label="GitHub username"
          />
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium transition-colors"
          >
            {loading ? "Loading…" : "Fetch repos"}
          </button>
        </form>

        {loading && (
          <div
            className="flex flex-col items-center justify-center py-16 gap-4"
            role="status"
            aria-live="polite"
          >
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-600 dark:text-slate-400">
              Fetching repositories…
            </p>
          </div>
        )}

        {error && !loading && (
          <div
            className="max-w-xl mx-auto p-4 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
            role="alert"
          >
            <p className="font-medium">Error</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {repos && repos.length > 0 && !loading && (
          <section className="mt-8 ap-fade-up" aria-label="Repositories">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {repos.length} public {repos.length === 1 ? "repo" : "repos"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {repos.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-amber-500 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-lg text-amber-600 dark:text-amber-400 truncate">
                    {repo.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2 min-h-[2.5rem]">
                    {repo.description || "No description"}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <span aria-hidden>★</span> {repo.stargazers_count}
                    </span>
                    {repo.language && (
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700">
                        {repo.language}
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {repos?.length === 0 && !loading && (
          <p className="text-center text-slate-600 dark:text-slate-400 py-8">
            No public repositories found for this user.
          </p>
        )}
      </div>
    </main>
  );
}

