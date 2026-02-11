import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TemplatesClient } from "./TemplatesClient";

export default async function TemplatesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");
  return <TemplatesClient />;
}
