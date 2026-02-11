import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/signin", process.env.NEXTAUTH_URL));
  }

  const clientId = process.env.GITHUB_REPO_CLIENT_ID;
  const redirectUri = new URL(
    "/api/connect/github/callback",
    process.env.NEXTAUTH_URL
  ).toString();

  const params = new URLSearchParams({
    client_id: clientId ?? "",
    redirect_uri: redirectUri,
    scope: "repo read:user",
  });

  return NextResponse.redirect(`${GITHUB_AUTH_URL}?${params.toString()}`);
}

export async function DELETE() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.connectedRepo.deleteMany({
    where: {
      userId: session.user.id,
      provider: "github",
    },
  });

  return NextResponse.json({ ok: true });
}

