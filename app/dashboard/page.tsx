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

  const connected = await prisma.connectedRepo.findUnique({
    where: {
      userId_provider: {
        userId,
        provider: "github",
      },
    },
  });

  let repos: GitHubRepo[] = [];
  let githubError: string | null = null;

  if (connected) {
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
    />
  );
}

