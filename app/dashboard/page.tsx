import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptToken } from "@/lib/encryption";
import type { GitHubRepo } from "../types/github";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const userId = session.user.id;

  let connected: Awaited<ReturnType<typeof prisma.connectedRepo.findUnique>> = null;
  let portfolioMeta: { isPublished: boolean; slug: string | null } | null = null;
  let databaseError: string | null = null;

  try {
    [connected, portfolioMeta] = await Promise.all([
      prisma.connectedRepo.findUnique({
        where: { userId_provider: { userId, provider: "github" } },
      }),
      prisma.portfolio.findUnique({
        where: { userId },
        select: { isPublished: true, slug: true },
      }),
    ]);
  } catch (e) {
    console.error("Database connection failed:", e);
    databaseError =
      "Can't reach the database. If you use Supabase, check the project is not paused and DATABASE_URL in .env.local is correct.";
  }

  let repos: GitHubRepo[] = [];
  let githubError: string | null = databaseError;

  if (connected && !databaseError) {
    try {
      const accessToken = decryptToken(connected.accessToken);
      const res = await fetch(
        "https://api.github.com/user/repos?sort=updated&per_page=100",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github+json",
          },
          cache: "no-store",
        }
      );

      if (res.ok) {
        const data = await res.json();
        repos = data.map((r: { id: number; name: string; description: string | null; stargazers_count: number; language: string | null; html_url: string }) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          stargazers_count: r.stargazers_count,
          language: r.language,
          html_url: r.html_url,
        }));
      } else {
        if (res.status === 401) {
          githubError = "GitHub connection expired or was revoked. Please disconnect and connect again.";
        } else {
          githubError = "Could not load repositories from GitHub. Try again later.";
        }
      }
    } catch {
      githubError = "Could not load repositories from GitHub. Try again later.";
    }
  }

  return (
    <DashboardClient
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? null,
      }}
      connectedRepo={
        connected
          ? {
              provider: connected.provider,
              username: connected.username,
            }
          : null
      }
      initialRepos={repos}
      githubError={githubError}
      portfolio={portfolioMeta}
    />
  );
}

