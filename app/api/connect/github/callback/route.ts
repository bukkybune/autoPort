import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptToken } from "@/lib/encryption";

const TOKEN_URL = "https://github.com/login/oauth/access_token";
const STATE_COOKIE_NAME = "github_connect_state";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/signin", process.env.NEXTAUTH_URL));
  }

  const code = req.nextUrl.searchParams.get("code");
  const stateParam = req.nextUrl.searchParams.get("state");
  const stateCookie = req.cookies.get(STATE_COOKIE_NAME)?.value;

  const redirectWithError = (error: string) => {
    const url = new URL("/dashboard", process.env.NEXTAUTH_URL);
    url.searchParams.set("error", error);
    const res = NextResponse.redirect(url);
    res.cookies.set(STATE_COOKIE_NAME, "", { path: "/", maxAge: 0 });
    return res;
  };

  if (!stateCookie || stateParam !== stateCookie) {
    return redirectWithError("github_oauth");
  }
  if (!code) {
    return redirectWithError("github_oauth");
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

  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    refresh_token?: string;
    token_type?: string;
    scope?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenRes.ok) {
    return redirectWithError("github_token");
  }
  if (!tokenJson.access_token || "error" in tokenJson) {
    return redirectWithError("github_token");
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

  let encryptedAccess: string;
  let encryptedRefresh: string | null = null;
  try {
    encryptedAccess = encryptToken(tokenJson.access_token);
    if (tokenJson.refresh_token) {
      encryptedRefresh = encryptToken(tokenJson.refresh_token);
    }
  } catch (err) {
    console.error("GitHub token encryption failed:", err);
    return redirectWithError("github_token");
  }

  const response = NextResponse.redirect(new URL("/dashboard", process.env.NEXTAUTH_URL));
  response.cookies.set(STATE_COOKIE_NAME, "", { path: "/", maxAge: 0 });

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
      accessToken: encryptedAccess,
      refreshToken: encryptedRefresh,
      scope: tokenJson.scope ?? null,
    },
    update: {
      username: ghUser.login,
      accessToken: encryptedAccess,
      refreshToken: encryptedRefresh,
      scope: tokenJson.scope ?? null,
    },
  });

  return response;
}

