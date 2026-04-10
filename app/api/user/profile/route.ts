import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 20 profile-update attempts per user per hour
  const { success, retryAfter } = rateLimit(`profile:${session.user.id}`, 20, 60 * 60 * 1000);
  if (!success) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  try {
    const body = await req.json() as { name?: string; email?: string };
    const updates: { name?: string | null; email?: string } = {};

    if ("name" in body) {
      updates.name = body.name ? String(body.name).trim().slice(0, 100) || null : null;
    }

    if ("email" in body) {
      const email = String(body.email ?? "").toLowerCase().trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
      }
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== session.user.id) {
        return NextResponse.json({ error: "Email is already in use" }, { status: 400 });
      }
      updates.email = email;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updates,
      select: { name: true, email: true },
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (e) {
    console.error("Profile update error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
