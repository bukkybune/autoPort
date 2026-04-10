"use client";

import { useState } from "react";
import type { PortfolioConfig } from "@/app/types/portfolio";
import type { ColorSchemeId } from "@/app/types/portfolio";

const MP_ACCENTS: Record<Exclude<ColorSchemeId, "custom">, string> = {
  navy:              "#64ffda",
  purple:            "#e879f9",
  teal:              "#2dd4bf",
  green:             "#4ade80",
  "warm-earth":      "#f59e0b",
  "ocean-glass":     "#22d3ee",
  "sunset-warm":     "#fb923c",
  "gradient-purple": "#a78bfa",
};

const MP_DARK = {
  bg: "#0a192f",
  bgCard: "#112240",
  bgHover: "#1e3a5f",
  text: "#ccd6f6",
  muted: "#8892b0",
};

const MP_LIGHT = {
  bg: "#f0f4f8",
  bgCard: "#e2e8f0",
  bgHover: "#cbd5e1",
  text: "#1a2a4a",
  muted: "#4a5568",
};

const GH_SVG = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const LI_SVG = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const TW_SVG = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const EXT_SVG = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const GLOBE_SVG = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const MD_SVG = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
  </svg>
);

const DEVTO_SVG = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 448 512" aria-hidden>
    <path d="M120.12 208.29c-3.88-2.9-7.77-4.35-11.65-4.35H91.03v104.47h17.45c3.88 0 7.77-1.45 11.65-4.35 3.88-2.9 5.82-7.25 5.82-13.06v-69.65c-.01-5.8-1.96-10.16-5.83-13.06zM404.1 32H43.9C19.7 32 .06 51.59 0 75.8v360.4C.06 460.41 19.7 480 43.9 480h360.2c24.21 0 43.84-19.59 43.9-43.8V75.8c-.06-24.21-19.7-43.8-43.9-43.8zM154.2 291.19c0 18.81-11.61 47.31-48.36 47.25h-46.4V172.98h47.38c35.44 0 47.36 28.46 47.36 47.28l.02 70.93zm100.68-88.66H201.6v38.42h32.57v29.57H201.6v38.41h53.29v29.57h-62.18c-11.16.29-20.44-8.53-20.72-19.69V193.7c-.27-11.15 8.56-20.41 19.71-20.69h63.19l-.01 29.52zm103.64 115.29c-13.2 30.75-36.85 24.63-47.44 0l-38.53-144.8h32.57l29.71 113.72 29.57-113.72h32.58l-38.46 144.8z"/>
  </svg>
);

const YT_SVG = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export function MinimalProTemplate({ config }: { config: PortfolioConfig }) {
  const name = config.hero.name || "Portfolio";
  const sortedProjects = [...(config.projects.items || [])].sort((a, b) => a.order - b.order);
  const year = new Date().getFullYear();
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const testimonials = config.testimonials?.items ?? [];
  const services = config.services?.items ?? [];

  const isDark = config.theme?.darkMode !== false;
  const MP_BASE = isDark ? MP_DARK : MP_LIGHT;
  const dividerColor = isDark ? "#233554" : "#cbd5e1";

  const schemeId = config.theme?.colorScheme ?? "navy";
  const accentColor = schemeId === "custom"
    ? (config.theme?.customColors?.accent ?? MP_ACCENTS.navy)
    : (MP_ACCENTS[schemeId as Exclude<ColorSchemeId, "custom">] ?? MP_ACCENTS.navy);
  const C = { ...MP_BASE, accent: accentColor };

  return (
    <div style={{ backgroundColor: C.bg, color: C.text, fontFamily: "'SF Mono', 'Fira Code', monospace" }} className="min-h-screen">
      <style>{`
        .mp-link { color: ${C.muted}; transition: color 0.2s, transform 0.2s; display: inline-flex; align-items: center; }
        .mp-link:hover { color: ${C.accent}; transform: translateY(-2px); }
        .mp-divider { flex: 1; height: 1px; background: ${dividerColor}; margin-left: 20px; }
        .mp-project-card { transition: box-shadow 0.3s; }
        .mp-project-card:hover { box-shadow: 0 20px 60px rgba(100,255,218,0.08); }
        .mp-photo { filter: grayscale(100%) contrast(1); transition: filter 0.3s; }
        .mp-photo:hover { filter: none; }
        .mp-photo-frame { position: relative; display: inline-block; }
        .mp-photo-frame::after { content: ''; position: absolute; top: 16px; left: 16px; right: -16px; bottom: -16px; border: 2px solid ${C.accent}; border-radius: 8px; transition: transform 0.3s; }
        .mp-photo-frame:hover::after { transform: translate(-4px, -4px); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .mp-fade-1 { animation: fadeInUp 0.5s ease both 0.1s; }
        .mp-fade-2 { animation: fadeInUp 0.5s ease both 0.2s; }
        .mp-fade-3 { animation: fadeInUp 0.5s ease both 0.3s; }
        .mp-fade-4 { animation: fadeInUp 0.5s ease both 0.4s; }
        .mp-fade-5 { animation: fadeInUp 0.5s ease both 0.5s; }
        .mp-nav-link { color: ${C.muted}; font-size: 13px; letter-spacing: 0.08em; text-decoration: none; transition: color 0.2s; }
        .mp-nav-link:hover { color: ${C.accent}; }
        @keyframes mp-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .mp-marquee-track { display: flex; white-space: nowrap; animation: mp-marquee 22s linear infinite; }
        .mp-available { display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; border-radius: 9999px; font-size: 12px; font-weight: 600; border: 1px solid ${C.accent}; color: ${C.accent}; margin-bottom: 20px; font-family: 'SF Mono', 'Fira Code', monospace; letter-spacing: 0.05em; }
        .mp-stat-num { font-size: clamp(28px,4vw,40px); font-weight: 900; color: ${C.text}; font-family: Inter, sans-serif; }
        .mp-stat-label { font-size: 12px; color: ${C.muted}; margin-top: 2px; letter-spacing: 0.05em; }
        .mp-service-card { background: ${C.bgCard}; border-left: 2px solid ${C.accent}; border-radius: 8px; transition: all 0.3s; overflow: hidden; }
        .mp-service-card:hover { background: ${C.bgHover}; transform: translateX(4px); }
        .mp-t-nav { width: 44px; height: 44px; border-radius: 9999px; border: 1px solid ${dividerColor}; background: ${C.bgCard}; color: ${C.text}; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 18px; }
        .mp-t-nav:hover { border-color: ${C.accent}; color: ${C.accent}; }
        @media (prefers-reduced-motion: reduce) { .mp-marquee-track { animation: none; } }
      `}</style>

      {/* Sticky Nav Bar */}
      <nav
        style={{
          backgroundColor: `${C.bg}f0`,
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${dividerColor}`,
          padding: "18px 48px",
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ color: C.accent, fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 16 }}>
          {name}
        </span>
        <div className="hidden md:flex items-center gap-6">
          {config.about.enabled && <a href="#about" className="mp-nav-link"><span style={{ color: C.accent }}>01.</span> About</a>}
          {config.skills.enabled && <a href="#skills" className="mp-nav-link"><span style={{ color: C.accent }}>02.</span> Skills</a>}
          {config.services?.enabled && services.length > 0 && <a href="#services" className="mp-nav-link"><span style={{ color: C.accent }}>03.</span> Services</a>}
          {config.projects.enabled && <a href="#projects" className="mp-nav-link"><span style={{ color: C.accent }}>0{config.services?.enabled && services.length > 0 ? 4 : 3}.</span> Projects</a>}
          {config.testimonials?.enabled && testimonials.length > 0 && <a href="#testimonials" className="mp-nav-link"><span style={{ color: C.accent }}>0{config.services?.enabled && services.length > 0 ? 5 : 4}.</span> Testimonials</a>}
          {config.experience.enabled && config.experience.items?.length > 0 && <a href="#experience" className="mp-nav-link"><span style={{ color: C.accent }}>0{5 + (config.services?.enabled && services.length > 0 ? 1 : 0) + (config.testimonials?.enabled && testimonials.length > 0 ? 1 : 0)}.</span> Experience</a>}
          <a href="#contact" className="mp-nav-link"><span style={{ color: C.accent }}>0{6 + (config.services?.enabled && services.length > 0 ? 1 : 0) + (config.testimonials?.enabled && testimonials.length > 0 ? 1 : 0)}.</span> Contact</a>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-8 lg:px-16">
        {/* ── Hero ── */}
        {config.hero.enabled && (
          <section className="min-h-screen flex flex-col justify-center py-20">
            {config.hero.availableForWork && (
              <div className="mp-fade-1 mp-available" style={{ display: "inline-flex", width: "fit-content", marginBottom: 20 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.accent, display: "inline-block" }} />
                Available for Work
              </div>
            )}
            <p className="mp-fade-1 text-sm mb-5" style={{ color: C.accent }}>Hi, my name is</p>
            <h1 className="mp-fade-2 font-bold leading-none mb-2" style={{ fontSize: "clamp(40px,8vw,80px)", fontFamily: "Inter, sans-serif", color: C.text }}>
              {config.hero.name || "Your Name"}
            </h1>
            <h2 className="mp-fade-3 font-bold leading-tight mb-6" style={{ fontSize: "clamp(32px,6vw,68px)", fontFamily: "Inter, sans-serif", color: C.muted }}>
              {config.hero.title || "Developer"}
            </h2>
            {config.hero.bio && (
              <p className="mp-fade-4 text-lg max-w-xl mb-12 leading-relaxed" style={{ color: C.muted }}>
                {config.hero.bio}
              </p>
            )}
            <div className="mp-fade-5 flex flex-wrap gap-4">
              <a
                href="#projects"
                className="inline-block px-7 py-4 rounded border-2 text-sm font-medium transition-all duration-300"
                style={{ borderColor: C.accent, color: C.accent }}
              >
                Check out my work!
              </a>
              {config.hero.ctaText && config.hero.ctaLink && (
                <a
                  href={config.hero.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-7 py-4 rounded text-sm font-medium transition-all duration-300"
                  style={{ backgroundColor: C.accent, color: C.bg }}
                >
                  {config.hero.ctaText}
                </a>
              )}
              {config.hero.resumeUrl && (
                <a
                  href={config.hero.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-7 py-4 rounded border text-sm font-medium transition-all duration-300"
                  style={{ borderColor: C.muted, color: C.muted }}
                >
                  Resume ↗
                </a>
              )}
            </div>

            {config.hero.stats && config.hero.stats.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 40, marginTop: 40, paddingTop: 28, borderTop: `1px solid ${dividerColor}` }}>
                {config.hero.stats.map((s, i) => (
                  <div key={i}>
                    <div className="mp-stat-num">{s.value}</div>
                    <div className="mp-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Inline social links row */}
            <div style={{ marginTop: 32, display: "flex", flexDirection: "row", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              {config.contact.github && (
                <a href={config.contact.github} target="_blank" rel="noopener noreferrer" className="mp-link" aria-label="GitHub">{GH_SVG}</a>
              )}
              {config.contact.linkedin && (
                <a href={config.contact.linkedin} target="_blank" rel="noopener noreferrer" className="mp-link" aria-label="LinkedIn">{LI_SVG}</a>
              )}
              {config.contact.twitter && (
                <a href={config.contact.twitter} target="_blank" rel="noopener noreferrer" className="mp-link" aria-label="Twitter / X">{TW_SVG}</a>
              )}
              {config.contact.website && (
                <a href={config.contact.website} target="_blank" rel="noopener noreferrer" className="mp-link" aria-label="Website">{GLOBE_SVG}</a>
              )}
              {config.contact.medium && (
                <a href={config.contact.medium} target="_blank" rel="noopener noreferrer" className="mp-link" aria-label="Medium">{MD_SVG}</a>
              )}
              {config.contact.devto && (
                <a href={config.contact.devto} target="_blank" rel="noopener noreferrer" className="mp-link" aria-label="Dev.to">{DEVTO_SVG}</a>
              )}
              {config.contact.youtube && (
                <a href={config.contact.youtube} target="_blank" rel="noopener noreferrer" className="mp-link" aria-label="YouTube">{YT_SVG}</a>
              )}
              {config.contact.email && (
                <a
                  href={`mailto:${config.contact.email}`}
                  style={{ color: C.muted, fontSize: 12, letterSpacing: "0.1em", fontFamily: "monospace", textDecoration: "none" }}
                >
                  {config.contact.email}
                </a>
              )}
            </div>
          </section>
        )}

        {/* ── About ── */}
        {config.about.enabled && (config.about.description || config.about.funFacts) && (
          <section className="py-24" id="about">
            <div className="flex items-center mb-10">
              <span className="text-xl mr-3" style={{ color: C.accent }}>01.</span>
              <h2 className="text-3xl font-bold" style={{ fontFamily: "Inter, sans-serif", color: C.text }}>About Me</h2>
              <div className="mp-divider" />
            </div>
            <div className="grid md:grid-cols-3 gap-12 items-start">
              <div className="md:col-span-2 space-y-4">
                {config.about.description && (
                  <p className="text-lg leading-relaxed" style={{ color: C.muted }}>{config.about.description}</p>
                )}
                {config.about.funFacts && (
                  <p className="text-base leading-relaxed" style={{ color: C.muted }}>{config.about.funFacts}</p>
                )}
              </div>
              {config.hero.photoUrl && (
                <div className="mp-photo-frame mx-auto md:mx-0">
                  <img
                    src={config.hero.photoUrl}
                    alt={config.hero.name}
                    className="mp-photo rounded w-full max-w-[240px] aspect-square object-cover"
                    style={{ borderRadius: 8 }}
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Skills ── */}
        {config.skills.enabled && config.skills.categories?.some((c) => c.skills?.length > 0) && (
          <section className="py-24" id="skills">
            <div className="flex items-center mb-10">
              <span className="text-xl mr-3" style={{ color: C.accent }}>02.</span>
              <h2 className="text-3xl font-bold" style={{ fontFamily: "Inter, sans-serif", color: C.text }}>Skills</h2>
              <div className="mp-divider" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.skills.categories.filter((c) => c.skills?.length > 0).map((cat) => (
                <div
                  key={cat.name}
                  className="p-6 rounded-lg"
                  style={{ backgroundColor: C.bgCard, border: `1px solid ${dividerColor}` }}
                >
                  <h3 className="text-sm font-semibold mb-4" style={{ color: C.accent }}>{cat.name}</h3>
                  <ul className="space-y-2">
                    {cat.skills.map((sk) => (
                      <li key={sk.name} className="flex items-center gap-2 text-sm" style={{ color: C.muted }}>
                        <span style={{ color: C.accent }}>▹</span> {sk.name}
                        <span className="ml-auto text-xs opacity-60">{sk.level}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Services ── */}
        {config.services?.enabled && services.length > 0 && (
          <section className="py-24" id="services">
            <div className="flex items-center mb-10">
              <span className="text-xl mr-3" style={{ color: C.accent }}>03.</span>
              <h2 className="text-3xl font-bold" style={{ fontFamily: "Inter, sans-serif", color: C.text }}>Services</h2>
              <div className="mp-divider" />
            </div>
            <div className="space-y-5">
              {services.map((svc, i) => (
                <div key={i} className="mp-service-card">
                  {svc.imageUrl ? (
                    <div className="grid md:grid-cols-2 gap-0 items-stretch">
                      <div className="p-6">
                        <h3 className="font-bold text-lg mb-2" style={{ color: C.text, fontFamily: "Inter, sans-serif" }}>{svc.title}</h3>
                        <p className="text-sm leading-relaxed mb-4" style={{ color: C.muted }}>{svc.description}</p>
                        {svc.link && (
                          <a href={svc.link} target="_blank" rel="noopener noreferrer" className="inline-block px-5 py-2 rounded border text-xs font-medium" style={{ borderColor: C.accent, color: C.accent }}>
                            View →
                          </a>
                        )}
                      </div>
                      <img src={svc.imageUrl} alt={svc.title} style={{ width: "100%", height: "100%", minHeight: 200, objectFit: "cover", display: "block", filter: "grayscale(20%)" }} />
                    </div>
                  ) : (
                    <div className="p-6 flex items-center justify-between gap-6">
                      <div>
                        <h3 className="font-bold text-base mb-2" style={{ color: C.text, fontFamily: "Inter, sans-serif" }}>{svc.title}</h3>
                        <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{svc.description}</p>
                      </div>
                      {svc.link && (
                        <a href={svc.link} target="_blank" rel="noopener noreferrer" className="mp-link" style={{ flexShrink: 0 }}>{EXT_SVG}</a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Projects ── */}
        {config.projects.enabled && sortedProjects.length > 0 && (
          <section className="py-24" id="projects">
            <div style={{ overflow: "hidden", marginBottom: 32 }} aria-hidden>
              <div className="mp-marquee-track" style={{ fontSize: "clamp(48px,7vw,80px)", fontWeight: 900, color: C.text, opacity: 0.04, fontFamily: "Inter, sans-serif" }}>
                {"PROJECTS · PROJECTS · PROJECTS · PROJECTS · \u00A0".repeat(2).split("").map((ch, i) => <span key={i}>{ch}</span>)}
              </div>
            </div>
            <div className="flex items-center mb-16">
              <span className="text-xl mr-3" style={{ color: C.accent }}>0{config.services?.enabled && services.length > 0 ? 4 : 3}.</span>
              <h2 className="text-3xl font-bold" style={{ fontFamily: "Inter, sans-serif", color: C.text }}>Things I've Built</h2>
              <div className="mp-divider" />
            </div>
            <div className="space-y-32">
              {sortedProjects.map((project, idx) => (
                <div key={project.id} className="mp-project-card relative grid md:grid-cols-12 gap-4 items-center">
                  <div className={`md:col-span-7 ${idx % 2 === 0 ? "md:col-start-1" : "md:col-start-6 md:row-start-1"}`}>
                    <a href={project.demoUrl || project.githubUrl} target="_blank" rel="noopener noreferrer" className="block relative group">
                      <div className="absolute inset-0 rounded-lg z-10 transition-opacity duration-300 group-hover:opacity-0" style={{ backgroundColor: `${C.bg}99` }} />
                      <img
                        src={project.imageUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=500&fit=crop"}
                        alt={project.customTitle}
                        className="rounded-lg w-full h-56 object-cover"
                        style={{ filter: "grayscale(30%) brightness(0.8)" }}
                      />
                    </a>
                  </div>
                  <div className={`md:col-span-6 z-10 ${idx % 2 === 0 ? "md:col-start-7 md:row-start-1 text-right" : "md:col-start-1 md:row-start-1 text-left"} flex flex-col justify-center`}>
                    <p className="text-xs mb-2" style={{ color: C.accent }}>Featured Project</p>
                    <h3 className="text-2xl font-bold mb-4" style={{ color: C.text, fontFamily: "Inter, sans-serif" }}>
                      <a href={project.demoUrl || project.githubUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:opacity-80" style={{ color: C.text }}>
                        {project.customTitle || project.originalName}
                      </a>
                    </h3>
                    <div className="rounded-lg p-5 mb-4 shadow-2xl" style={{ backgroundColor: C.bgCard }}>
                      <p className="text-sm leading-relaxed" style={{ color: C.muted }}>
                        {project.customDescription || project.originalDescription || "No description."}
                      </p>
                    </div>
                    <div className={`flex flex-wrap gap-3 text-xs mb-4 ${idx % 2 === 0 ? "justify-end" : "justify-start"}`}>
                      {project.tags.slice(0, 6).map((tag) => (
                        <span key={tag} style={{ color: C.muted }}>{tag}</span>
                      ))}
                    </div>
                    <div className={`flex gap-4 ${idx % 2 === 0 ? "justify-end" : "justify-start"}`}>
                      {project.showGithubLink && project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="mp-link">{GH_SVG}</a>
                      )}
                      {project.demoUrl && (
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="mp-link">{EXT_SVG}</a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Testimonials ── */}
        {config.testimonials?.enabled && testimonials.length > 0 && (
          <section className="py-24" id="testimonials">
            <div style={{ overflow: "hidden", marginBottom: 32 }} aria-hidden>
              <div className="mp-marquee-track" style={{ fontSize: "clamp(48px,7vw,80px)", fontWeight: 900, color: C.text, opacity: 0.04, fontFamily: "Inter, sans-serif" }}>
                {"TESTIMONIALS · TESTIMONIALS · \u00A0".repeat(2).split("").map((ch, i) => <span key={i}>{ch}</span>)}
              </div>
            </div>
            <div className="flex items-center mb-10">
              <span className="text-xl mr-3" style={{ color: C.accent }}>0{4 + (config.services?.enabled && services.length > 0 ? 1 : 0)}.</span>
              <h2 className="text-3xl font-bold" style={{ fontFamily: "Inter, sans-serif", color: C.text }}>Testimonials</h2>
              <div className="mp-divider" />
            </div>
            {(() => {
              const t = testimonials[testimonialIdx] ?? testimonials[0];
              return (
                <div className="rounded-lg overflow-hidden" style={{ display: "grid", gridTemplateColumns: t.avatarUrl ? "1fr 1fr" : "1fr", border: `1px solid ${dividerColor}`, background: C.bgCard }}>
                  {t.avatarUrl && (
                    <img src={t.avatarUrl} alt={t.name} className="mp-photo" style={{ width: "100%", height: 320, objectFit: "cover", display: "block" }} />
                  )}
                  <div style={{ padding: "40px 36px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderLeft: `2px solid ${C.accent}` }}>
                    <p style={{ fontSize: "clamp(15px,1.8vw,18px)", lineHeight: 1.75, color: C.muted, fontStyle: "italic", marginBottom: 28 }}>"{t.quote}"</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.bgHover, border: `1px solid ${C.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: C.accent, fontWeight: 700 }}>
                        {t.name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: C.text, fontSize: 14, fontFamily: "Inter, sans-serif" }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: C.muted, letterSpacing: "0.05em" }}>{t.role}{t.company ? `, ${t.company}` : ""}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
            {testimonials.length > 1 && (
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
                <button className="mp-t-nav" onClick={() => setTestimonialIdx((i) => (i - 1 + testimonials.length) % testimonials.length)} aria-label="Previous">‹</button>
                <button className="mp-t-nav" onClick={() => setTestimonialIdx((i) => (i + 1) % testimonials.length)} aria-label="Next">›</button>
              </div>
            )}
          </section>
        )}

        {/* ── Experience ── */}
        {config.experience.enabled && config.experience.items?.length > 0 && (
          <section className="py-24" id="experience">
            <div className="flex items-center mb-10">
              <span className="text-xl mr-3" style={{ color: C.accent }}>0{4 + (config.services?.enabled && services.length > 0 ? 1 : 0) + (config.testimonials?.enabled && testimonials.length > 0 ? 1 : 0)}.</span>
              <h2 className="text-3xl font-bold" style={{ fontFamily: "Inter, sans-serif", color: C.text }}>Experience</h2>
              <div className="mp-divider" />
            </div>
            <div className="space-y-6">
              {config.experience.items.map((entry, i) => (
                <div key={i} className="p-6 rounded-lg border-l-2" style={{ borderColor: C.accent, backgroundColor: C.bgCard }}>
                  <p className="font-semibold text-base" style={{ color: C.text }}>{entry.role}</p>
                  <p className="text-sm mt-1" style={{ color: C.accent }}>{entry.company}</p>
                  <p className="text-xs mt-1 mb-3" style={{ color: C.muted }}>{entry.duration}</p>
                  {entry.description && <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{entry.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Contact ── */}
        {config.contact.enabled && config.contact.email && (
          <section className="py-32 text-center" id="contact">
            <p className="text-sm mb-4" style={{ color: C.accent }}>
              {config.experience.enabled ? "05." : "04."} What's Next?
            </p>
            <h2 className="font-bold mb-6" style={{ fontSize: "clamp(36px,6vw,56px)", fontFamily: "Inter, sans-serif", color: C.text }}>
              {config.contact.headline || "Get In Touch"}
            </h2>
            <p className="text-lg max-w-md mx-auto mb-12 leading-relaxed" style={{ color: C.muted }}>
              {config.contact.subtext || "I'm always open to new opportunities. Feel free to reach out!"}
            </p>
            <a
              href={`mailto:${config.contact.email}`}
              className="inline-block px-8 py-4 rounded border-2 text-sm font-medium transition-all duration-300"
              style={{ borderColor: C.accent, color: C.accent }}
            >
              {config.contact.ctaLabel || "Say Hello"}
            </a>
            <div className="flex gap-5 justify-center mt-10 flex-wrap">
              {config.contact.github && <a href={config.contact.github} target="_blank" rel="noopener noreferrer" className="mp-link" aria-label="GitHub">{GH_SVG}</a>}
              {config.contact.linkedin && <a href={config.contact.linkedin} target="_blank" rel="noopener noreferrer" className="mp-link" aria-label="LinkedIn">{LI_SVG}</a>}
              {config.contact.twitter && <a href={config.contact.twitter} target="_blank" rel="noopener noreferrer" className="mp-link" aria-label="Twitter">{TW_SVG}</a>}
              {config.contact.website && <a href={config.contact.website} target="_blank" rel="noopener noreferrer" className="mp-link" aria-label="Website">{GLOBE_SVG}</a>}
              {config.contact.medium && <a href={config.contact.medium} target="_blank" rel="noopener noreferrer" className="mp-link" aria-label="Medium">{MD_SVG}</a>}
              {config.contact.devto && <a href={config.contact.devto} target="_blank" rel="noopener noreferrer" className="mp-link" aria-label="Dev.to">{DEVTO_SVG}</a>}
              {config.contact.youtube && <a href={config.contact.youtube} target="_blank" rel="noopener noreferrer" className="mp-link" aria-label="YouTube">{YT_SVG}</a>}
            </div>
          </section>
        )}

        <footer className="py-8 text-center text-xs" style={{ color: C.muted, borderTop: `1px solid ${dividerColor}` }}>
          <p>© {year} {name}. Built with AutoPort.</p>
        </footer>
      </main>
    </div>
  );
}
