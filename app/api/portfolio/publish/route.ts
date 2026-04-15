import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { PortfolioConfig } from "@/app/types/portfolio";

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "portfolio";
}

async function findUniqueSlug(base: string, userId: string): Promise<string> {
  let candidate = base;
  for (let i = 0; i < 10; i++) {
    const existing = await prisma.portfolio.findUnique({ where: { slug: candidate } });
    if (!existing || existing.userId === userId) return candidate;
    candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await req.json().catch(() => ({}));
  const publish = Boolean((body as { publish?: boolean }).publish);

  const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
  if (!portfolio) {
    return NextResponse.json(
      { error: "No portfolio found. Create one first by going to Customize." },
      { status: 404 }
    );
  }

  let slug = portfolio.slug;
  if (publish && !slug) {
    const config = portfolio.config as unknown as PortfolioConfig;
    const heroName =
      config?.hero?.name ||
      session.user.name ||
      session.user.email?.split("@")[0] ||
      "portfolio";
    const base = toSlug(heroName);
    slug = await findUniqueSlug(base, userId);
  }

  const updated = await prisma.portfolio.update({
    where: { userId },
    data: { isPublished: publish, ...(publish && slug ? { slug } : {}) },
  });

  const host = req.headers.get("host") ?? "";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const baseUrl = `${proto}://${host}`;

  return NextResponse.json({
    isPublished: updated.isPublished,
    slug: updated.slug,
    url: updated.slug ? `${baseUrl}/p/${updated.slug}` : null,
  });
}
