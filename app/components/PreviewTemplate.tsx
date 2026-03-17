"use client";

import type { PortfolioConfig } from "@/app/types/portfolio";
import { MinimalProTemplate } from "./templates/MinimalProTemplate";
import { CleanMinimalTemplate } from "./templates/CleanMinimalTemplate";
import { AuroraTemplate } from "./templates/AuroraTemplate";

export function PreviewTemplate({ config }: { config: PortfolioConfig }) {
  const template = config.theme?.template ?? "minimal-pro";
  switch (template) {
    case "clean-minimal":
      return <CleanMinimalTemplate config={config} />;
    case "aurora":
      return <AuroraTemplate config={config} />;
    default:
      return <MinimalProTemplate config={config} />;
  }
}
