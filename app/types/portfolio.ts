import type { CustomizedProject } from "./customize";

export interface HeroStat {
  label: string;
  value: string;
}

export interface HeroSection {
  enabled: boolean;
  name: string;
  title: string;
  bio: string;
  photoUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  resumeUrl?: string;
  availableForWork?: boolean;
  stats?: HeroStat[];
}

export interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
  company?: string;
  avatarUrl?: string;
}

export interface TestimonialsSection {
  enabled: boolean;
  items: TestimonialItem[];
}

export interface ServiceItem {
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
}

export interface ServicesSection {
  enabled: boolean;
  items: ServiceItem[];
}

export interface AboutSection {
  enabled: boolean;
  description: string;
  funFacts?: string;
}

export interface SkillItem {
  name: string;
  level: string;
}

export interface SkillCategory {
  name: string;
  skills: SkillItem[];
}

export interface SkillsSection {
  enabled: boolean;
  categories: SkillCategory[];
}

export interface ProjectsSection {
  enabled: boolean;
  items: CustomizedProject[];
}

export interface ExperienceEntry {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface ExperienceSection {
  enabled: boolean;
  items: ExperienceEntry[];
}

export interface ContactSection {
  enabled: boolean;
  email: string;
  /** Editable headline (e.g. "Get in touch", "Let's work together", "Hire me") */
  headline?: string;
  /** Editable subtext / call-to-action line (e.g. "Open to opportunities", "Available for freelance") */
  subtext?: string;
  /** Editable button/link label (e.g. "Email me", "Say hello", "Contact") */
  ctaLabel?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  medium?: string;
  devto?: string;
  youtube?: string;
}

export type TemplateId =
  | "minimal-pro"
  | "clean-minimal"
  | "aurora";
export type ColorSchemeId =
  | "navy"
  | "purple"
  | "teal"
  | "green"
  | "warm-earth"
  | "ocean-glass"
  | "sunset-warm"
  | "gradient-purple"
  | "custom";

export interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface ThemeConfig {
  template: TemplateId;
  colorScheme: ColorSchemeId;
  customColors?: CustomColors;
  darkMode?: boolean;
}

export interface PortfolioConfig {
  hero: HeroSection;
  about: AboutSection;
  skills: SkillsSection;
  services: ServicesSection;
  projects: ProjectsSection;
  experience: ExperienceSection;
  testimonials: TestimonialsSection;
  contact: ContactSection;
  theme: ThemeConfig;
}

export const PORTFOLIO_CONFIG_KEY = "portfolioConfig";

export const SKILL_LEVELS = ["Beginner", "Intermediate", "Expert"] as const;

export function createDefaultHero(name?: string | null): HeroSection {
  return {
    enabled: true,
    name: name || "",
    title: "Developer",
    bio: "",
    photoUrl: undefined,
    ctaText: "",
    ctaLink: "",
  };
}

export function createDefaultAbout(): AboutSection {
  return {
    enabled: true,
    description: "",
    funFacts: "",
  };
}

export function createDefaultSkills(): SkillsSection {
  return {
    enabled: true,
    categories: [
      { name: "Frontend", skills: [] },
      { name: "Backend", skills: [] },
      { name: "Tools", skills: [] },
    ],
  };
}

export function createDefaultProjects(items: CustomizedProject[] = []): ProjectsSection {
  return {
    enabled: true,
    items: items.map((p, i) => ({ ...p, order: i })),
  };
}

export function createDefaultExperience(): ExperienceSection {
  return {
    enabled: false,
    items: [],
  };
}

export function createDefaultContact(email?: string | null): ContactSection {
  return {
    enabled: true,
    email: email || "",
    github: "",
    linkedin: "",
    twitter: "",
  };
}

export function createDefaultTheme(): ThemeConfig {
  return {
    template: "minimal-pro",
    colorScheme: "navy",
    customColors: undefined,
  };
}

export function createDefaultPortfolioConfig(
  overrides: {
    name?: string | null;
    email?: string | null;
    projects?: CustomizedProject[];
  } = {}
): PortfolioConfig {
  return {
    hero: createDefaultHero(overrides.name),
    about: createDefaultAbout(),
    skills: createDefaultSkills(),
    services: { enabled: false, items: [] },
    projects: createDefaultProjects(overrides.projects ?? []),
    experience: createDefaultExperience(),
    testimonials: { enabled: false, items: [] },
    contact: createDefaultContact(overrides.email),
    theme: createDefaultTheme(),
  };
}

/** Resolved theme colors for a color scheme (used by templates and export). */
export interface ResolvedThemeColors {
  bg: string;
  bgLight: string;
  text: string;
  textMuted: string;
  accent: string;
  border?: string;
}

/* High-contrast palettes: dark themes use near-white text; light themes use near-black. Accents chosen for harmony and readability. */
const BUILTIN_THEMES: Record<Exclude<ColorSchemeId, "custom">, ResolvedThemeColors> = {
  navy: {
    bg: "#0f172a",
    bgLight: "#1e293b",
    text: "#f8fafc",
    textMuted: "#94a3b8",
    accent: "#38bdf8",
  },
  purple: {
    bg: "#1e1b4b",
    bgLight: "#312e81",
    text: "#faf5ff",
    textMuted: "#c4b5fd",
    accent: "#e879f9",
  },
  teal: {
    bg: "#134e4a",
    bgLight: "#115e59",
    text: "#f0fdfa",
    textMuted: "#99f6e4",
    accent: "#2dd4bf",
  },
  green: {
    bg: "#14532d",
    bgLight: "#166534",
    text: "#f0fdf4",
    textMuted: "#bbf7d0",
    accent: "#4ade80",
  },
  "warm-earth": {
    bg: "#fafaf9",
    bgLight: "#f5f5f4",
    text: "#1c1917",
    textMuted: "#57534e",
    accent: "#b45309",
  },
  "ocean-glass": {
    bg: "#0c4a6e",
    bgLight: "#075985",
    text: "#f0f9ff",
    textMuted: "#bae6fd",
    accent: "#22d3ee",
  },
  "sunset-warm": {
    bg: "#fff7ed",
    bgLight: "#ffedd5",
    text: "#1c1917",
    textMuted: "#78716c",
    accent: "#c2410c",
  },
  "gradient-purple": {
    bg: "#4c1d95",
    bgLight: "#5b21b6",
    text: "#ffffff",
    textMuted: "#e9d5ff",
    accent: "#93c5fd",
  },
};

export function getThemeColors(config: PortfolioConfig): ResolvedThemeColors {
  const theme = config.theme ?? createDefaultTheme();
  if (theme.colorScheme === "custom" && theme.customColors) {
    const c = theme.customColors;
    return {
      bg: c.background,
      bgLight: c.secondary,
      text: c.text,
      textMuted: c.text,
      accent: c.accent,
    };
  }
  const key = theme.colorScheme === "custom" ? "navy" : theme.colorScheme;
  return BUILTIN_THEMES[key] ?? BUILTIN_THEMES.navy;
}

export function getEmptyExperienceEntry(): ExperienceEntry {
  return {
    company: "",
    role: "",
    duration: "",
    description: "",
  };
}
