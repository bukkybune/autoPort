"use client";

import { useState } from "react";
import type { PortfolioConfig } from "@/app/types/portfolio";
import type { ColorSchemeId } from "@/app/types/portfolio";

type AuroraPalette = {
  accent: string;
  accentPurple: string;
  accentPink: string;
  blob1: string;
  blob2: string;
  blob3: string;
};

const PALETTES: Record<Exclude<ColorSchemeId, "custom">, AuroraPalette> = {
  navy:              { accent: "#2dd4bf", accentPurple: "#a78bfa", accentPink: "#f472b6", blob1: "rgba(167,139,250,0.18)", blob2: "rgba(45,212,191,0.15)",  blob3: "rgba(244,114,182,0.12)" },
  purple:            { accent: "#a78bfa", accentPurple: "#e879f9", accentPink: "#c084fc", blob1: "rgba(167,139,250,0.22)", blob2: "rgba(232,121,249,0.16)", blob3: "rgba(192,132,252,0.14)" },
  teal:              { accent: "#2dd4bf", accentPurple: "#38bdf8", accentPink: "#67e8f9", blob1: "rgba(45,212,191,0.22)",  blob2: "rgba(56,189,248,0.16)",  blob3: "rgba(103,232,249,0.13)" },
  green:             { accent: "#4ade80", accentPurple: "#2dd4bf", accentPink: "#a3e635", blob1: "rgba(74,222,128,0.2)",   blob2: "rgba(45,212,191,0.15)",  blob3: "rgba(163,230,53,0.12)"  },
  "warm-earth":      { accent: "#f59e0b", accentPurple: "#f97316", accentPink: "#ef4444", blob1: "rgba(245,158,11,0.2)",  blob2: "rgba(249,115,22,0.15)",  blob3: "rgba(239,68,68,0.12)"   },
  "ocean-glass":     { accent: "#22d3ee", accentPurple: "#38bdf8", accentPink: "#818cf8", blob1: "rgba(34,211,238,0.22)", blob2: "rgba(56,189,248,0.16)",  blob3: "rgba(99,102,241,0.12)"  },
  "sunset-warm":     { accent: "#fbbf24", accentPurple: "#f97316", accentPink: "#f472b6", blob1: "rgba(251,191,36,0.2)",  blob2: "rgba(249,115,22,0.15)",  blob3: "rgba(244,114,182,0.12)" },
  "gradient-purple": { accent: "#a78bfa", accentPurple: "#c084fc", accentPink: "#f472b6", blob1: "rgba(167,139,250,0.22)", blob2: "rgba(192,132,252,0.18)", blob3: "rgba(244,114,182,0.14)" },
};

const DARK_BASE = {
  bg: "#06080f",
  bgCard: "rgba(255,255,255,0.04)",
  bgCardHover: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.08)",
  borderHover: "rgba(255,255,255,0.16)",
  text: "#f0f4ff",
  muted: "#94a3b8",
  mutedDim: "#64748b",
};

const LIGHT_BASE = {
  bg: "#f8faff",
  bgCard: "rgba(0,0,0,0.04)",
  bgCardHover: "rgba(0,0,0,0.07)",
  border: "rgba(0,0,0,0.09)",
  borderHover: "rgba(0,0,0,0.18)",
  text: "#1a1a2e",
  muted: "#4a5568",
  mutedDim: "#6b7280",
};

const GH_SVG = (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const LI_SVG = (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const TW_SVG = (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const EXT_SVG = (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const GLOBE_SVG = (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const MD_SVG = (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
  </svg>
);

const DEVTO_SVG = (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 448 512" aria-hidden>
    <path d="M120.12 208.29c-3.88-2.9-7.77-4.35-11.65-4.35H91.03v104.47h17.45c3.88 0 7.77-1.45 11.65-4.35 3.88-2.9 5.82-7.25 5.82-13.06v-69.65c-.01-5.8-1.96-10.16-5.83-13.06zM404.1 32H43.9C19.7 32 .06 51.59 0 75.8v360.4C.06 460.41 19.7 480 43.9 480h360.2c24.21 0 43.84-19.59 43.9-43.8V75.8c-.06-24.21-19.7-43.8-43.9-43.8zM154.2 291.19c0 18.81-11.61 47.31-48.36 47.25h-46.4V172.98h47.38c35.44 0 47.36 28.46 47.36 47.28l.02 70.93zm100.68-88.66H201.6v38.42h32.57v29.57H201.6v38.41h53.29v29.57h-62.18c-11.16.29-20.44-8.53-20.72-19.69V193.7c-.27-11.15 8.56-20.41 19.71-20.69h63.19l-.01 29.52zm103.64 115.29c-13.2 30.75-36.85 24.63-47.44 0l-38.53-144.8h32.57l29.71 113.72 29.57-113.72h32.58l-38.46 144.8z"/>
  </svg>
);

const YT_SVG = (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export function AuroraTemplate({ config }: { config: PortfolioConfig }) {
  const name = config.hero.name || "Portfolio";
  const sortedProjects = [...(config.projects.items || [])].sort((a, b) => a.order - b.order);
  const year = new Date().getFullYear();
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const testimonials = config.testimonials?.items ?? [];
  const services = config.services?.items ?? [];

  const isDark = config.theme?.darkMode !== false;
  const BASE = isDark ? DARK_BASE : LIGHT_BASE;

  const schemeId = config.theme?.colorScheme ?? "navy";
  let palette: AuroraPalette;
  if (schemeId === "custom") {
    const cc = config.theme?.customColors;
    if (cc) {
      palette = {
        accent: cc.accent,
        accentPurple: cc.secondary,
        accentPink: cc.primary,
        blob1: cc.accent + "2e",
        blob2: cc.secondary + "26",
        blob3: cc.primary + "1f",
      };
    } else {
      palette = PALETTES.navy;
    }
  } else {
    palette = PALETTES[schemeId as Exclude<ColorSchemeId, "custom">] ?? PALETTES.navy;
  }
  const C = { ...BASE, ...palette };

  return (
    <div style={{ backgroundColor: C.bg, color: C.text, fontFamily: "Inter, system-ui, sans-serif" }} className="min-h-screen relative overflow-x-hidden">
      <style>{`
        /* Aurora blobs */
        @keyframes aurora-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(60px, -40px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.95); }
        }
        @keyframes aurora-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-50px, 30px) scale(1.05); }
          66% { transform: translate(40px, -50px) scale(1.08); }
        }
        @keyframes aurora-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 50px) scale(1.12); }
        }
        .au-blob-1 { animation: aurora-1 18s ease-in-out infinite; }
        .au-blob-2 { animation: aurora-2 22s ease-in-out infinite; }
        .au-blob-3 { animation: aurora-3 26s ease-in-out infinite; }

        /* Fade in on load */
        @keyframes au-fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .au-in-1 { animation: au-fadeUp 0.7s ease both 0.1s; opacity: 0; }
        .au-in-2 { animation: au-fadeUp 0.7s ease both 0.25s; opacity: 0; }
        .au-in-3 { animation: au-fadeUp 0.7s ease both 0.4s; opacity: 0; }
        .au-in-4 { animation: au-fadeUp 0.7s ease both 0.55s; opacity: 0; }
        .au-in-5 { animation: au-fadeUp 0.7s ease both 0.7s; opacity: 0; }

        /* Glass card */
        .au-card {
          background: ${C.bgCard};
          border: 1px solid ${C.border};
          border-radius: 20px;
          backdrop-filter: blur(12px);
          transition: background 0.3s, border-color 0.3s, transform 0.3s, box-shadow 0.3s;
        }
        .au-card:hover {
          background: ${C.bgCardHover};
          border-color: ${C.borderHover};
          transform: translateY(-4px);
          box-shadow: 0 24px 64px rgba(0,0,0,0.4);
        }

        /* Nav */
        .au-nav {
          position: sticky; top: 0; z-index: 50;
          background: ${isDark ? "rgba(6,8,15,0.7)" : "rgba(248,250,255,0.8)"};
          backdrop-filter: blur(20px);
          border-bottom: 1px solid ${C.border};
        }
        .au-nav-link {
          font-size: 13px; font-weight: 500; color: ${C.muted};
          transition: color 0.2s; text-decoration: none;
        }
        .au-nav-link:hover { color: ${C.text}; }

        /* Gradient text */
        .au-gradient-text {
          background: linear-gradient(135deg, ${isDark ? "#fff" : C.text} 0%, ${C.accent} 50%, ${C.accentPurple} 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Buttons */
        .au-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 30px; border-radius: 12px; font-weight: 600; font-size: 14px;
          background: linear-gradient(135deg, ${C.accent}, ${C.accentPurple});
          color: #fff;
          box-shadow: 0 0 24px rgba(45,212,191,0.3);
          transition: all 0.3s; text-decoration: none;
        }
        .au-btn-primary:hover {
          box-shadow: 0 0 48px rgba(45,212,191,0.5);
          transform: translateY(-2px);
        }
        .au-btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 30px; border-radius: 12px; font-weight: 600; font-size: 14px;
          background: ${C.bgCard};
          border: 1px solid ${C.border};
          color: ${C.text};
          transition: all 0.3s; text-decoration: none;
        }
        .au-btn-ghost:hover {
          background: ${C.bgCardHover};
          border-color: ${C.borderHover};
          transform: translateY(-2px);
        }

        /* Social link */
        .au-social { color: ${C.muted}; transition: color 0.2s, transform 0.2s; display: inline-flex; }
        .au-social:hover { color: ${C.accent}; transform: translateY(-2px); }

        /* Section */
        .au-section { padding: 96px 24px; }

        /* Skill pill */
        .au-pill {
          display: inline-flex; padding: 5px 14px; border-radius: 9999px;
          font-size: 12px; font-weight: 500;
          background: rgba(45,212,191,0.08);
          color: ${C.accent};
          border: 1px solid rgba(45,212,191,0.2);
          transition: all 0.2s;
        }
        .au-pill:hover { background: rgba(45,212,191,0.14); border-color: rgba(45,212,191,0.35); }

        /* Gradient border accent on section headings */
        .au-heading-line {
          width: 56px; height: 3px; border-radius: 2px;
          background: linear-gradient(90deg, ${C.accent}, ${C.accentPurple});
          margin-bottom: 36px;
        }

        /* Experience accent */
        .au-exp-card {
          border-left: 2px solid transparent;
          background: linear-gradient(${C.bgCard}, ${C.bgCard}) padding-box,
                      linear-gradient(135deg, ${C.accent}, ${C.accentPurple}) border-box;
        }

        @keyframes au-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .au-marquee-track { display: flex; white-space: nowrap; animation: au-marquee 22s linear infinite; }

        .au-available { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 600; background: rgba(45,212,191,0.12); color: ${C.accent}; border: 1px solid rgba(45,212,191,0.25); margin-bottom: 20px; }

        .au-stat-num { font-size: clamp(28px,4vw,40px); font-weight: 900; color: ${C.text}; }
        .au-stat-label { font-size: 12px; color: ${C.mutedDim}; margin-top: 2px; }

        .au-service-card { background: ${C.bgCard}; border: 1px solid ${C.border}; border-radius: 20px; overflow: hidden; backdrop-filter: blur(12px); transition: all 0.3s; }
        .au-service-card:hover { border-color: ${C.borderHover}; transform: translateY(-3px); box-shadow: 0 20px 60px rgba(0,0,0,0.3); }

        .au-t-nav { width: 44px; height: 44px; border-radius: 9999px; border: 1px solid ${C.border}; background: ${C.bgCard}; color: ${C.text}; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 18px; }
        .au-t-nav:hover { border-color: ${C.accent}; color: ${C.accent}; }

        @media (prefers-reduced-motion: reduce) {
          .au-blob-1, .au-blob-2, .au-blob-3 { animation: none; }
          .au-in-1, .au-in-2, .au-in-3, .au-in-4, .au-in-5 { animation: none; opacity: 1; }
          .au-marquee-track { animation: none; }
        }
      `}</style>

      {/* ── Aurora background blobs (fixed to viewport) ── */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div
          className="au-blob-1"
          style={{
            position: "absolute", top: "-10%", left: "-5%",
            width: 700, height: 700, borderRadius: "50%",
            background: `radial-gradient(circle, ${C.blob1} 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
        />
        <div
          className="au-blob-2"
          style={{
            position: "absolute", top: "20%", right: "-10%",
            width: 600, height: 600, borderRadius: "50%",
            background: `radial-gradient(circle, ${C.blob2} 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
        />
        <div
          className="au-blob-3"
          style={{
            position: "absolute", bottom: "0%", left: "30%",
            width: 500, height: 500, borderRadius: "50%",
            background: `radial-gradient(circle, ${C.blob3} 0%, transparent 70%)`,
            filter: "blur(70px)",
          }}
        />
      </div>

      {/* ── Nav ── */}
      <nav className="au-nav px-8 py-4 flex items-center justify-between relative z-10">
        <span style={{ fontWeight: 700, fontSize: 16 }} className="au-gradient-text">{name}</span>
        <div className="hidden sm:flex items-center gap-7">
          {config.about.enabled && <a href="#about" className="au-nav-link">About</a>}
          {config.skills.enabled && <a href="#skills" className="au-nav-link">Skills</a>}
          {config.services?.enabled && services.length > 0 && <a href="#services" className="au-nav-link">Services</a>}
          {config.projects.enabled && <a href="#projects" className="au-nav-link">Projects</a>}
          {config.testimonials?.enabled && testimonials.length > 0 && <a href="#testimonials" className="au-nav-link">Testimonials</a>}
          {config.experience.enabled && config.experience.items?.length > 0 && <a href="#experience" className="au-nav-link">Experience</a>}
          {config.contact.enabled && (
            <a
              href="#contact"
              style={{
                padding: "7px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: "linear-gradient(135deg, rgba(45,212,191,0.15), rgba(167,139,250,0.15))",
                border: `1px solid rgba(45,212,191,0.25)`,
                color: C.accent,
                textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              Contact
            </a>
          )}
        </div>
      </nav>

      <div className="relative z-10">
        {/* ── Hero ── */}
        {config.hero.enabled && (
          <section className="min-h-screen flex flex-col justify-center px-6 py-24 max-w-5xl mx-auto">
            {config.hero.availableForWork && (
              <div className="au-in-1 au-available">
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.accent, display: "inline-block", boxShadow: `0 0 8px ${C.accent}` }} />
                Available for Work
              </div>
            )}
            <p className="au-in-1 text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: C.accent }}>
              Hi, I'm
            </p>
            <h1
              className="au-in-2 au-gradient-text font-black leading-none mb-4"
              style={{ fontSize: "clamp(52px,9vw,96px)", letterSpacing: "-0.03em" }}
            >
              {config.hero.name || "Your Name"}
            </h1>
            <p
              className="au-in-3 font-semibold mb-6"
              style={{ fontSize: "clamp(20px,3vw,32px)", color: C.muted }}
            >
              {config.hero.title || "Developer"}
            </p>
            {config.hero.bio && (
              <p className="au-in-4 text-lg leading-relaxed max-w-xl mb-10" style={{ color: C.muted }}>
                {config.hero.bio}
              </p>
            )}
            <div className="au-in-5 flex flex-wrap gap-4 mb-10">
              <a href="#projects" className="au-btn-primary">View My Work</a>
              {config.hero.ctaText && config.hero.ctaLink && (
                <a href={config.hero.ctaLink} target="_blank" rel="noopener noreferrer" className="au-btn-ghost">
                  {config.hero.ctaText}
                </a>
              )}
              {config.hero.resumeUrl && (
                <a href={config.hero.resumeUrl} target="_blank" rel="noopener noreferrer" className="au-btn-ghost">
                  Resume ↗
                </a>
              )}
            </div>
            {config.hero.stats && config.hero.stats.length > 0 && (
              <div className="au-in-5 flex flex-wrap gap-10 mb-10" style={{ borderTop: `1px solid ${C.border}`, paddingTop: 28 }}>
                {config.hero.stats.map((s, i) => (
                  <div key={i}>
                    <div className="au-stat-num">{s.value}</div>
                    <div className="au-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="au-in-5 flex items-center gap-5 flex-wrap">
              {config.contact.github && (
                <a href={config.contact.github} target="_blank" rel="noopener noreferrer" className="au-social" aria-label="GitHub">{GH_SVG}</a>
              )}
              {config.contact.linkedin && (
                <a href={config.contact.linkedin} target="_blank" rel="noopener noreferrer" className="au-social" aria-label="LinkedIn">{LI_SVG}</a>
              )}
              {config.contact.twitter && (
                <a href={config.contact.twitter} target="_blank" rel="noopener noreferrer" className="au-social" aria-label="Twitter / X">{TW_SVG}</a>
              )}
              {config.contact.website && (
                <a href={config.contact.website} target="_blank" rel="noopener noreferrer" className="au-social" aria-label="Website">{GLOBE_SVG}</a>
              )}
              {config.contact.medium && (
                <a href={config.contact.medium} target="_blank" rel="noopener noreferrer" className="au-social" aria-label="Medium">{MD_SVG}</a>
              )}
              {config.contact.devto && (
                <a href={config.contact.devto} target="_blank" rel="noopener noreferrer" className="au-social" aria-label="Dev.to">{DEVTO_SVG}</a>
              )}
              {config.contact.youtube && (
                <a href={config.contact.youtube} target="_blank" rel="noopener noreferrer" className="au-social" aria-label="YouTube">{YT_SVG}</a>
              )}
              {config.contact.email && (
                <a href={`mailto:${config.contact.email}`} style={{ fontSize: 12, color: C.mutedDim, textDecoration: "none", fontFamily: "monospace", letterSpacing: "0.05em" }}>
                  {config.contact.email}
                </a>
              )}
            </div>
          </section>
        )}

        {/* ── About ── */}
        {config.about.enabled && (config.about.description || config.about.funFacts) && (
          <section className="au-section" id="about">
            <div className="max-w-4xl mx-auto">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.accent }}>About Me</p>
              <h2 className="text-4xl font-bold mb-3" style={{ color: C.text }}>Who I Am</h2>
              <div className="au-heading-line" />
              <div className="grid md:grid-cols-3 gap-10 items-start">
                <div className="md:col-span-2 space-y-4">
                  {config.about.description && (
                    <p className="text-lg leading-relaxed" style={{ color: C.muted }}>{config.about.description}</p>
                  )}
                  {config.about.funFacts && (
                    <p className="text-base leading-relaxed italic" style={{ color: C.mutedDim }}>{config.about.funFacts}</p>
                  )}
                </div>
                {config.hero.photoUrl && (
                  <div className="flex justify-center md:justify-end">
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <div style={{
                        position: "absolute", inset: -2, borderRadius: 20,
                        background: `linear-gradient(135deg, ${C.accent}, ${C.accentPurple}, ${C.accentPink})`,
                        filter: "blur(1px)",
                      }} />
                      <img
                        src={config.hero.photoUrl}
                        alt={config.hero.name}
                        style={{ position: "relative", borderRadius: 18, display: "block", width: 220, height: 240, objectFit: "cover" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Skills ── */}
        {config.skills.enabled && config.skills.categories?.some((c) => c.skills?.length > 0) && (
          <section className="au-section" id="skills">
            <div className="max-w-4xl mx-auto">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.accentPurple }}>Expertise</p>
              <h2 className="text-4xl font-bold mb-3" style={{ color: C.text }}>Skills & Tools</h2>
              <div className="au-heading-line" style={{ background: `linear-gradient(90deg, ${C.accentPurple}, ${C.accentPink})` }} />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {config.skills.categories.filter((c) => c.skills?.length > 0).map((cat) => (
                  <div key={cat.name} className="au-card p-6">
                    <h3 className="text-sm font-semibold mb-4" style={{ color: C.accentPurple }}>{cat.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {cat.skills.map((sk) => (
                        <span key={sk.name} className="au-pill">{sk.name}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Services ── */}
        {config.services?.enabled && services.length > 0 && (
          <section className="au-section" id="services">
            <div className="max-w-4xl mx-auto">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.accentPurple }}>What I Do</p>
              <h2 className="text-4xl font-bold mb-3" style={{ color: C.text }}>Services</h2>
              <div className="au-heading-line" style={{ background: `linear-gradient(90deg, ${C.accentPurple}, ${C.accentPink})` }} />
              <div className="space-y-5">
                {services.map((svc, i) => (
                  <div key={i} className="au-service-card">
                    {svc.imageUrl ? (
                      <div className="grid md:grid-cols-2 gap-0 items-stretch">
                        <div className="p-7 flex flex-col justify-between">
                          <div>
                            <h3 className="text-xl font-bold mb-3" style={{ color: C.text }}>{svc.title}</h3>
                            <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{svc.description}</p>
                          </div>
                          {svc.link && (
                            <a href={svc.link} target="_blank" rel="noopener noreferrer" className="au-btn-primary" style={{ marginTop: 24, padding: "9px 20px", fontSize: 13, display: "inline-flex", width: "fit-content" }}>
                              View {EXT_SVG}
                            </a>
                          )}
                        </div>
                        <img src={svc.imageUrl} alt={svc.title} style={{ width: "100%", height: "100%", minHeight: 220, objectFit: "cover", display: "block" }} />
                      </div>
                    ) : (
                      <div className="p-7 flex items-center justify-between gap-6">
                        <div>
                          <h3 className="text-lg font-bold mb-2" style={{ color: C.text }}>{svc.title}</h3>
                          <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{svc.description}</p>
                        </div>
                        {svc.link && (
                          <a href={svc.link} target="_blank" rel="noopener noreferrer" className="au-btn-ghost" style={{ flexShrink: 0, padding: "8px 16px", fontSize: 13 }}>
                            {EXT_SVG}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Projects ── */}
        {config.projects.enabled && sortedProjects.length > 0 && (
          <section className="au-section" id="projects">
            <div className="max-w-4xl mx-auto">
              <div style={{ overflow: "hidden", marginBottom: 32 }} aria-hidden>
                <div className="au-marquee-track" style={{ fontSize: "clamp(48px,7vw,80px)", fontWeight: 900, color: C.text, opacity: 0.05 }}>
                  {"PROJECTS · PROJECTS · PROJECTS · PROJECTS · \u00A0".repeat(2).split("").map((ch, i) => <span key={i}>{ch}</span>)}
                </div>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.accentPink }}>Work</p>
              <h2 className="text-4xl font-bold mb-3" style={{ color: C.text }}>Projects</h2>
              <div className="au-heading-line" style={{ background: `linear-gradient(90deg, ${C.accentPink}, ${C.accentPurple})` }} />
              <div className="grid sm:grid-cols-2 gap-5">
                {sortedProjects.map((project) => (
                  <div key={project.id} className="au-card p-6 flex flex-col">
                    {project.imageUrl && (
                      <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
                        <img
                          src={project.imageUrl}
                          alt={project.customTitle}
                          style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
                        />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,8,15,0.6) 0%, transparent 60%)" }} />
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="au-pill">{tag}</span>
                      ))}
                    </div>
                    <h3 className="font-bold text-lg mb-2" style={{ color: C.text }}>{project.customTitle || project.originalName}</h3>
                    <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: C.muted }}>
                      {project.customDescription || project.originalDescription || "No description."}
                    </p>
                    <div className="flex gap-3 mt-auto">
                      {project.demoUrl && (
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="au-btn-primary" style={{ padding: "8px 18px", fontSize: 13 }}>
                          Demo {EXT_SVG}
                        </a>
                      )}
                      {project.showGithubLink && project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="au-btn-ghost" style={{ padding: "8px 18px", fontSize: 13 }}>
                          {GH_SVG} GitHub
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Experience ── */}
        {config.experience.enabled && config.experience.items?.length > 0 && (
          <section className="au-section" id="experience">
            <div className="max-w-4xl mx-auto">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.accent }}>Career</p>
              <h2 className="text-4xl font-bold mb-3" style={{ color: C.text }}>Experience</h2>
              <div className="au-heading-line" />
              <div className="space-y-5">
                {config.experience.items.map((entry, i) => (
                  <div key={i} className="au-card au-exp-card p-6">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-bold text-base" style={{ color: C.text }}>{entry.role}</p>
                        <p className="text-sm mt-0.5 font-medium" style={{ color: C.accent }}>{entry.company}</p>
                      </div>
                      <span style={{
                        fontSize: 12, padding: "4px 12px", borderRadius: 9999,
                        background: "rgba(45,212,191,0.08)", color: C.accent,
                        border: "1px solid rgba(45,212,191,0.2)", whiteSpace: "nowrap",
                      }}>{entry.duration}</span>
                    </div>
                    {entry.description && (
                      <p className="text-sm leading-relaxed mt-3" style={{ color: C.muted }}>{entry.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Testimonials ── */}
        {config.testimonials?.enabled && testimonials.length > 0 && (
          <section className="au-section" id="testimonials">
            <div className="max-w-4xl mx-auto">
              <div style={{ overflow: "hidden", marginBottom: 32 }} aria-hidden>
                <div className="au-marquee-track" style={{ fontSize: "clamp(48px,7vw,80px)", fontWeight: 900, color: C.text, opacity: 0.05 }}>
                  {"TESTIMONIALS · TESTIMONIALS · \u00A0".repeat(2).split("").map((ch, i) => <span key={i}>{ch}</span>)}
                </div>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.accent }}>Kind Words</p>
              <h2 className="text-4xl font-bold mb-3" style={{ color: C.text }}>Testimonials</h2>
              <div className="au-heading-line" />
              {(() => {
                const t = testimonials[testimonialIdx] ?? testimonials[0];
                return (
                  <div className="au-card overflow-hidden" style={{ display: "grid", gridTemplateColumns: t.avatarUrl ? "1fr 1fr" : "1fr" }}>
                    {t.avatarUrl && (
                      <img src={t.avatarUrl} alt={t.name} style={{ width: "100%", height: 360, objectFit: "cover", display: "block" }} />
                    )}
                    <div style={{ padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between", background: `linear-gradient(135deg, ${C.accent}22, ${C.accentPurple}22)` }}>
                      <p style={{ fontSize: "clamp(15px,1.8vw,19px)", lineHeight: 1.75, color: C.text, fontStyle: "italic", marginBottom: 32 }}>"{t.quote}"</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg, ${C.accent}, ${C.accentPurple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", fontWeight: 700 }}>
                          {t.name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: C.text, fontSize: 15 }}>{t.name}</div>
                          <div style={{ fontSize: 13, color: C.muted }}>{t.role}{t.company ? `, ${t.company}` : ""}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
              {testimonials.length > 1 && (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
                  <button className="au-t-nav" onClick={() => setTestimonialIdx((i) => (i - 1 + testimonials.length) % testimonials.length)} aria-label="Previous">‹</button>
                  <button className="au-t-nav" onClick={() => setTestimonialIdx((i) => (i + 1) % testimonials.length)} aria-label="Next">›</button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Contact ── */}
        {config.contact.enabled && config.contact.email && (
          <section className="au-section text-center" id="contact">
            <div className="max-w-2xl mx-auto">
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: C.accentPurple }}>Get In Touch</p>
              <h2
                className="au-gradient-text font-black mb-5"
                style={{ fontSize: "clamp(36px,6vw,60px)", letterSpacing: "-0.03em" }}
              >
                {config.contact.headline || "Let's Work Together"}
              </h2>
              <p className="text-lg mb-10 leading-relaxed" style={{ color: C.muted }}>
                {config.contact.subtext || "I'm always open to new opportunities and interesting conversations."}
              </p>
              <a href={`mailto:${config.contact.email}`} className="au-btn-primary" style={{ display: "inline-flex" }}>
                {config.contact.ctaLabel || "Say Hello →"}
              </a>
              <div className="flex gap-6 justify-center mt-10 flex-wrap">
                {config.contact.github && (
                  <a href={config.contact.github} target="_blank" rel="noopener noreferrer" className="au-social" aria-label="GitHub">{GH_SVG}</a>
                )}
                {config.contact.linkedin && (
                  <a href={config.contact.linkedin} target="_blank" rel="noopener noreferrer" className="au-social" aria-label="LinkedIn">{LI_SVG}</a>
                )}
                {config.contact.twitter && (
                  <a href={config.contact.twitter} target="_blank" rel="noopener noreferrer" className="au-social" aria-label="Twitter / X">{TW_SVG}</a>
                )}
                {config.contact.website && (
                  <a href={config.contact.website} target="_blank" rel="noopener noreferrer" className="au-social" aria-label="Website">{GLOBE_SVG}</a>
                )}
                {config.contact.medium && (
                  <a href={config.contact.medium} target="_blank" rel="noopener noreferrer" className="au-social" aria-label="Medium">{MD_SVG}</a>
                )}
                {config.contact.devto && (
                  <a href={config.contact.devto} target="_blank" rel="noopener noreferrer" className="au-social" aria-label="Dev.to">{DEVTO_SVG}</a>
                )}
                {config.contact.youtube && (
                  <a href={config.contact.youtube} target="_blank" rel="noopener noreferrer" className="au-social" aria-label="YouTube">{YT_SVG}</a>
                )}
              </div>
            </div>
          </section>
        )}

        <footer className="py-8 text-center text-xs" style={{ color: C.mutedDim, borderTop: `1px solid ${C.border}` }}>
          <p>© {year} {name}. Built with AutoPort.</p>
        </footer>
      </div>
    </div>
  );
}
