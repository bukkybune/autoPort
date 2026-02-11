import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TOKEN_URL = "https://github.com/login/oauth/access_token";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/signin", process.env.NEXTAUTH_URL));
  }

  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/dashboard?error=github_oauth", process.env.NEXTAUTH_URL));
  }

  const clientId = process.env.GITHUB_REPO_CLIENT_ID!;
  const clientSecret = process.env.GITHUB_REPO_CLIENT_SECRET!;

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
  });

  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: params,
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      new URL("/dashboard?error=github_token", process.env.NEXTAUTH_URL)
    );
  }

  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    token_type?: string;
    scope?: string;
  };

  if (!tokenJson.access_token) {
    return NextResponse.redirect(
      new URL("/dashboard?error=github_token", process.env.NEXTAUTH_URL)
    );
  }

  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenJson.access_token}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!userRes.ok) {
    return NextResponse.redirect(
      new URL("/dashboard?error=github_user", process.env.NEXTAUTH_URL)
    );
  }

  const ghUser = (await userRes.json()) as { login: string };

  await prisma.connectedRepo.upsert({
    where: {
      userId_provider: {
        userId: session.user.id,
        provider: "github",
      },
    },
    create: {
      userId: session.user.id,
      provider: "github",
      username: ghUser.login,
      accessToken: tokenJson.access_token,
      scope: tokenJson.scope ?? null,
    },
    update: {
      username: ghUser.login,
      accessToken: tokenJson.access_token,
      scope: tokenJson.scope ?? null,
    },
  });

  return NextResponse.redirect(new URL("/dashboard", process.env.NEXTAUTH_URL));
}

