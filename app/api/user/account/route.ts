import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 5 deletion attempts per user per hour
  const { success, retryAfter } = rateLimit(`delete:${session.user.id}`, 5, 60 * 60 * 1000);
  if (!success) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  try {
    const body = await req.json().catch(() => ({})) as { password?: string };

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    // Credentials accounts must confirm their password before deletion.
    // OAuth-only accounts have no password, so we skip the check.
    if (user?.password) {
      if (!body.password) {
        return NextResponse.json(
          { error: "Please enter your current password to confirm deletion." },
          { status: 400 }
        );
      }
      const valid = await compare(String(body.password), user.password);
      if (!valid) {
        return NextResponse.json(
          { error: "Incorrect password." },
          { status: 403 }
        );
      }
    }

    await prisma.user.delete({ where: { id: session.user.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Account deletion error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
