import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";
const STATE_COOKIE_NAME = "github_connect_state";
const STATE_COOKIE_MAX_AGE = 600; // 10 minutes

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/signin", process.env.NEXTAUTH_URL));
  }

  const state = randomBytes(32).toString("hex");
  const redirectUri = new URL(
    "/api/connect/github/callback",
    process.env.NEXTAUTH_URL
  ).toString();

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_REPO_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    scope: "repo read:user",
    state,
  });

  const response = NextResponse.redirect(
    `${GITHUB_AUTH_URL}?${params.toString()}`
  );
  response.cookies.set(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: STATE_COOKIE_MAX_AGE,
  });
  return response;
}

function getGitHubRevokeUrl(): string {
  const id = process.env.GITHUB_REPO_CLIENT_ID;
  return `https://api.github.com/applications/${id ?? ""}/token`;
}

export async function DELETE() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.GITHUB_REPO_CLIENT_ID;
  const clientSecret = process.env.GITHUB_REPO_CLIENT_SECRET;

  const row = await prisma.connectedRepo.findUnique({
    where: {
      userId_provider: {
        userId: session.user.id,
        provider: "github",
      },
    },
  });

  if (row?.accessToken && clientId && clientSecret) {
    try {
      const { decryptToken } = await import("@/lib/encryption");
      const token = decryptToken(row.accessToken);
      await fetch(getGitHubRevokeUrl(),
        {
          method: "DELETE",
          headers: {
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
          },
          body: JSON.stringify({ access_token: token }),
        }
      );
    } catch {
      // Proceed to delete record even if revoke fails (e.g. token already revoked)
    }
  }

  await prisma.connectedRepo.deleteMany({
    where: {
      userId: session.user.id,
      provider: "github",
    },
  });

  return NextResponse.json({ ok: true });
}

