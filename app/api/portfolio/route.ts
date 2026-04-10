import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import type { PortfolioConfig } from "@/app/types/portfolio";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const row = await prisma.portfolio.findUnique({
      where: { userId: session.user.id },
    });
    if (!row) return NextResponse.json({ config: null });
    return NextResponse.json({ config: row.config });
  } catch (e) {
    console.error("Portfolio load error:", e);
    return NextResponse.json({ error: "Failed to load portfolio" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 60 saves per user per hour — generous for autosave
  const { success, retryAfter } = rateLimit(`portfolio:${session.user.id}`, 60, 60 * 60 * 1000);
  if (!success) {
    return NextResponse.json(
      { error: "Too many saves. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  try {
    const body = await req.json() as { config: PortfolioConfig };
    if (!body.config || typeof body.config !== "object") {
      return NextResponse.json({ error: "Invalid config" }, { status: 400 });
    }

    await prisma.portfolio.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, config: body.config },
      update: { config: body.config },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Portfolio save error:", e);
    return NextResponse.json({ error: "Failed to save portfolio" }, { status: 500 });
  }
}
