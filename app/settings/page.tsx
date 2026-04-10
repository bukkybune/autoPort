import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsClient } from "./SettingsClient";

export const metadata = { title: "Settings — AutoPort" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, password: true },
  });

  if (!user) redirect("/signin");

  return (
    <SettingsClient
      initialName={user.name ?? ""}
      initialEmail={user.email ?? ""}
      hasPassword={!!user.password}
    />
  );
}
