import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import type { PortfolioConfig } from "@/app/types/portfolio";
import { AuroraTemplate } from "@/app/components/templates/AuroraTemplate";
import { CleanMinimalTemplate } from "@/app/components/templates/CleanMinimalTemplate";
import { MinimalProTemplate } from "@/app/components/templates/MinimalProTemplate";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug: params.slug },
    select: { config: true, isPublished: true },
  });
  if (!portfolio?.isPublished) return {};
  const config = portfolio.config as unknown as PortfolioConfig;
  const name = config?.hero?.name || "Portfolio";
  return {
    title: `${name} — Portfolio`,
    description: config?.hero?.bio || `${name}'s developer portfolio`,
    openGraph: {
      title: `${name} — Portfolio`,
      description: config?.hero?.bio || `${name}'s developer portfolio`,
      type: "website",
    },
  };
}

export default async function PublicPortfolioPage({ params }: Props) {
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug: params.slug },
    select: { config: true, isPublished: true },
  });

  if (!portfolio || !portfolio.isPublished) {
    notFound();
  }

  const config = portfolio.config as unknown as PortfolioConfig;
  const template = config?.theme?.template ?? "minimal-pro";

  return (
    <>
      {template === "aurora" && <AuroraTemplate config={config} />}
      {template === "clean-minimal" && <CleanMinimalTemplate config={config} />}
      {template === "minimal-pro" && <MinimalProTemplate config={config} />}
    </>
  );
}
