"use client";

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

const BASE = {
  bg: "#06080f",
  bgCard: "rgba(255,255,255,0.04)",
  bgCardHover: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.08)",
  borderHover: "rgba(255,255,255,0.16)",
  text: "#f0f4ff",
  muted: "#94a3b8",
  mutedDim: "#64748b",
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

export function AuroraTemplate({ config }: { config: PortfolioConfig }) {
  const name = config.hero.name || "Portfolio";
  const sortedProjects = [...(config.projects.items || [])].sort((a, b) => a.order - b.order);
  const year = new Date().getFullYear();

  const schemeId = config.theme?.colorScheme ?? "navy";
  const palette = schemeId === "custom"
    ? PALETTES.navy
    : (PALETTES[schemeId as Exclude<ColorSchemeId, "custom">] ?? PALETTES.navy);
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
          background: rgba(6,8,15,0.7);
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
          background: linear-gradient(135deg, #fff 0%, ${C.accent} 50%, ${C.accentPurple} 100%);
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

        @media (prefers-reduced-motion: reduce) {
          .au-blob-1, .au-blob-2, .au-blob-3 { animation: none; }
          .au-in-1, .au-in-2, .au-in-3, .au-in-4, .au-in-5 { animation: none; opacity: 1; }
        }
      `}</style>

      {/* ── Aurora background blobs (fixed to viewport) ── */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div
          className="au-blob-1"
          style={{
            position: "absolute", top: "-10%", left: "-5%",
            width: 700, height: 700, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="au-blob-2"
          style={{
            position: "absolute", top: "20%", right: "-10%",
            width: 600, height: 600, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(45,212,191,0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="au-blob-3"
          style={{
            position: "absolute", bottom: "0%", left: "30%",
            width: 500, height: 500, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(244,114,182,0.12) 0%, transparent 70%)",
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
          {config.projects.enabled && <a href="#projects" className="au-nav-link">Projects</a>}
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
            </div>
            <div className="au-in-5 flex items-center gap-5">
              {config.contact.github && (
                <a href={config.contact.github} target="_blank" rel="noopener noreferrer" className="au-social" aria-label="GitHub">{GH_SVG}</a>
              )}
              {config.contact.linkedin && (
                <a href={config.contact.linkedin} target="_blank" rel="noopener noreferrer" className="au-social" aria-label="LinkedIn">{LI_SVG}</a>
              )}
              {config.contact.twitter && (
                <a href={config.contact.twitter} target="_blank" rel="noopener noreferrer" className="au-social" aria-label="Twitter">{TW_SVG}</a>
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

        {/* ── Projects ── */}
        {config.projects.enabled && sortedProjects.length > 0 && (
          <section className="au-section" id="projects">
            <div className="max-w-4xl mx-auto">
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
              <div className="flex gap-6 justify-center mt-10">
                {config.contact.github && (
                  <a href={config.contact.github} target="_blank" rel="noopener noreferrer" className="au-social" aria-label="GitHub">{GH_SVG}</a>
                )}
                {config.contact.linkedin && (
                  <a href={config.contact.linkedin} target="_blank" rel="noopener noreferrer" className="au-social" aria-label="LinkedIn">{LI_SVG}</a>
                )}
                {config.contact.twitter && (
                  <a href={config.contact.twitter} target="_blank" rel="noopener noreferrer" className="au-social" aria-label="Twitter">{TW_SVG}</a>
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
