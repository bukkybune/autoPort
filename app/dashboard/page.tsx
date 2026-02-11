import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  if (connected) {
    try {
      const res = await fetch(
        "https://api.github.com/user/repos?sort=updated&per_page=100",
        {
          headers: {
            Authorization: `Bearer ${connected.accessToken}`,
            Accept: "application/vnd.github+json",
          },
          cache: "no-store",
        }
      );

      if (res.ok) {
        const data = await res.json();
        repos = data.map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          stargazers_count: r.stargazers_count,
          language: r.language,
          html_url: r.html_url,
        }));
      }
    } catch {
      // ignore, DashboardClient will show an error if needed in future
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
    />
  );
}

