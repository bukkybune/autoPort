"use client";

import type { PortfolioConfig } from "@/app/types/portfolio";
import type { ColorSchemeId } from "@/app/types/portfolio";

type CMSchemeColors = { accent: string; accentLight: string };

const CM_ACCENTS: Record<Exclude<ColorSchemeId, "custom">, CMSchemeColors> = {
  navy:              { accent: "#0369a1", accentLight: "#e0f2fe" },
  purple:            { accent: "#7c3aed", accentLight: "#ede9fe" },
  teal:              { accent: "#0d9488", accentLight: "#ccfbf1" },
  green:             { accent: "#16a34a", accentLight: "#dcfce7" },
  "warm-earth":      { accent: "#b45309", accentLight: "#fef3c7" },
  "ocean-glass":     { accent: "#0284c7", accentLight: "#e0f2fe" },
  "sunset-warm":     { accent: "#c2410c", accentLight: "#ffedd5" },
  "gradient-purple": { accent: "#6d28d9", accentLight: "#ede9fe" },
};

const CM_BASE = {
  bg: "#faf9f6",
  bgAlt: "#f5f3ee",
  bgCard: "#ede9e3",
  text: "#2c2c2c",
  muted: "#5a5a5a",
  border: "#e5e0d8",
};

export function CleanMinimalTemplate({ config }: { config: PortfolioConfig }) {
  const name = config.hero.name || "Portfolio";
  const sortedProjects = [...(config.projects.items || [])].sort((a, b) => a.order - b.order);
  const year = new Date().getFullYear();

  const schemeId = config.theme?.colorScheme ?? "warm-earth";
  const schemeColors = schemeId === "custom"
    ? {
        accent: config.theme?.customColors?.accent ?? CM_ACCENTS["warm-earth"].accent,
        accentLight: config.theme?.customColors?.accent
          ? config.theme.customColors.accent + "26"
          : CM_ACCENTS["warm-earth"].accentLight,
      }
    : (CM_ACCENTS[schemeId as Exclude<ColorSchemeId, "custom">] ?? CM_ACCENTS["warm-earth"]);
  const C = { ...CM_BASE, ...schemeColors };

  return (
    <div style={{ backgroundColor: C.bg, color: C.text, fontFamily: "Georgia, 'Playfair Display', serif" }} className="min-h-screen">
      <style>{`
        .cm-nav { position: sticky; top: 0; z-index: 10; background: rgba(250,249,246,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid ${C.border}; }
        .cm-nav-link { font-family: Inter, sans-serif; font-size: 13px; font-weight: 500; color: ${C.muted}; text-transform: uppercase; letter-spacing: 0.1em; transition: color 0.2s; padding: 0 16px; }
        .cm-nav-link:hover { color: ${C.accent}; }
        .cm-section { padding: 96px 24px; }
        .cm-label { font-family: Inter, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: ${C.accent}; margin-bottom: 12px; display: block; }
        .cm-card { background: ${C.bgAlt}; border: 1px solid ${C.border}; border-radius: 16px; padding: 28px; transition: all 0.3s; }
        .cm-card:hover { border-color: ${C.accent}; box-shadow: 0 10px 40px rgba(180,83,9,0.08); transform: translateY(-2px); }
        .cm-skill-pill { display: inline-flex; padding: 5px 14px; border-radius: 9999px; font-family: Inter, sans-serif; font-size: 13px; background: ${C.bgCard}; color: ${C.muted}; border: 1px solid ${C.border}; transition: all 0.2s; }
        .cm-skill-pill:hover { background: ${C.accentLight}; border-color: ${C.accent}; color: ${C.accent}; }
        .cm-btn { display: inline-block; padding: 14px 36px; background: ${C.text}; color: ${C.bg}; font-family: Inter, sans-serif; font-size: 14px; font-weight: 600; border-radius: 10px; transition: all 0.3s; }
        .cm-btn:hover { background: ${C.accent}; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(180,83,9,0.2); }
        .cm-social { font-family: Inter, sans-serif; font-size: 13px; color: ${C.muted}; transition: color 0.2s; }
        .cm-social:hover { color: ${C.accent}; }
        .cm-divider { width: 48px; height: 3px; background: ${C.accent}; border-radius: 2px; margin-bottom: 32px; }
      `}</style>

      {/* Nav */}
      <nav className="cm-nav px-8 py-4 flex items-center justify-between">
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15, color: C.text }}>{name}</span>
        <div className="hidden sm:flex items-center">
          {config.about.enabled && <a href="#about" className="cm-nav-link">About</a>}
          {config.skills.enabled && <a href="#skills" className="cm-nav-link">Skills</a>}
          {config.projects.enabled && <a href="#work" className="cm-nav-link">Work</a>}
          {config.contact.enabled && <a href="#contact" className="cm-nav-link">Contact</a>}
        </div>
      </nav>

      {/* Hero */}
      {config.hero.enabled && (
        <section className="cm-section max-w-4xl mx-auto" style={{ paddingTop: 120, paddingBottom: 80 }}>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="cm-label">Hello, I'm</span>
              <h1
                style={{ fontSize: "clamp(48px,7vw,76px)", fontWeight: 900, lineHeight: 1.05, color: C.text, marginBottom: 16 }}
              >
                {config.hero.name || "Your Name"}
              </h1>
              <p style={{ fontSize: 22, color: C.muted, marginBottom: 24, fontStyle: "italic" }}>{config.hero.title || "Developer"}</p>
              {config.hero.bio && (
                <p style={{ fontSize: 17, lineHeight: 1.7, color: C.muted, marginBottom: 36, fontFamily: "Inter, sans-serif" }}>{config.hero.bio}</p>
              )}
              <div className="flex flex-wrap gap-3">
                <a href="#work" className="cm-btn">View My Work</a>
                {config.hero.ctaText && config.hero.ctaLink && (
                  <a href={config.hero.ctaLink} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "14px 36px", background: "transparent", color: C.text, fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, borderRadius: 10, border: `1.5px solid ${C.text}`, transition: "all 0.3s" }}>
                    {config.hero.ctaText}
                  </a>
                )}
              </div>
            </div>
            {config.hero.photoUrl && (
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-3 rounded-2xl" style={{ background: `${C.accent}15`, transform: "rotate(2deg)" }} />
                  <img src={config.hero.photoUrl} alt={config.hero.name} className="relative rounded-2xl object-cover w-72 h-80" style={{ border: `2px solid ${C.border}` }} />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* About */}
      {config.about.enabled && (config.about.description || config.about.funFacts) && (
        <section className="cm-section" id="about" style={{ backgroundColor: C.bgAlt }}>
          <div className="max-w-4xl mx-auto">
            <span className="cm-label">About</span>
            <div className="cm-divider" />
            <h2 style={{ fontSize: "clamp(32px,4vw,48px)", fontWeight: 800, color: C.text, marginBottom: 32 }}>A bit about me</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-5">
                {config.about.description && <p style={{ fontSize: 17, lineHeight: 1.75, color: C.muted, fontFamily: "Inter, sans-serif" }}>{config.about.description}</p>}
                {config.about.funFacts && <p style={{ fontSize: 16, lineHeight: 1.7, color: C.muted, fontStyle: "italic", fontFamily: "Georgia, serif" }}>{config.about.funFacts}</p>}
              </div>
              {config.hero.photoUrl && (
                <div className="flex justify-center md:justify-end">
                  <img src={config.hero.photoUrl} alt={config.hero.name} className="rounded-2xl w-56 h-56 object-cover" style={{ border: `2px solid ${C.border}` }} />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Skills */}
      {config.skills.enabled && config.skills.categories?.some((c) => c.skills?.length > 0) && (
        <section className="cm-section" id="skills">
          <div className="max-w-4xl mx-auto">
            <span className="cm-label">Expertise</span>
            <div className="cm-divider" />
            <h2 style={{ fontSize: "clamp(32px,4vw,48px)", fontWeight: 800, color: C.text, marginBottom: 40 }}>Skills & Tools</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.skills.categories.filter((c) => c.skills?.length > 0).map((cat) => (
                <div key={cat.name} className="cm-card">
                  <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 14, color: C.accent, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>{cat.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((sk) => <span key={sk.name} className="cm-skill-pill">{sk.name}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects */}
      {config.projects.enabled && sortedProjects.length > 0 && (
        <section className="cm-section" id="work" style={{ backgroundColor: C.bgAlt }}>
          <div className="max-w-4xl mx-auto">
            <span className="cm-label">Selected Work</span>
            <div className="cm-divider" />
            <h2 style={{ fontSize: "clamp(32px,4vw,48px)", fontWeight: 800, color: C.text, marginBottom: 48 }}>Projects</h2>
            <div className="space-y-8">
              {sortedProjects.map((project, idx) => (
                <div key={project.id} className="cm-card grid md:grid-cols-2 gap-8 items-center">
                  {project.imageUrl && (
                    <div className={idx % 2 === 0 ? "" : "md:order-2"}>
                      <img src={project.imageUrl} alt={project.customTitle} className="rounded-xl w-full h-48 object-cover" style={{ border: `1px solid ${C.border}` }} />
                    </div>
                  )}
                  <div className={project.imageUrl && idx % 2 !== 0 ? "md:order-1" : ""}>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.tags.slice(0, 5).map((tag) => (
                        <span key={tag} style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.accent, background: C.accentLight, padding: "3px 10px", borderRadius: 9999 }}>{tag}</span>
                      ))}
                    </div>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 10 }}>{project.customTitle || project.originalName}</h3>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, lineHeight: 1.7, color: C.muted, marginBottom: 20 }}>
                      {project.customDescription || project.originalDescription || "No description."}
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      {project.demoUrl && (
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="cm-btn" style={{ padding: "10px 22px", fontSize: 13 }}>Live Demo →</a>
                      )}
                      {project.showGithubLink && project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "10px 22px", fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: C.muted, border: `1.5px solid ${C.border}`, borderRadius: 10 }}>GitHub</a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Experience */}
      {config.experience.enabled && config.experience.items?.length > 0 && (
        <section className="cm-section" id="experience">
          <div className="max-w-4xl mx-auto">
            <span className="cm-label">Career</span>
            <div className="cm-divider" />
            <h2 style={{ fontSize: "clamp(32px,4vw,48px)", fontWeight: 800, color: C.text, marginBottom: 40 }}>Experience</h2>
            <div className="space-y-6">
              {config.experience.items.map((entry, i) => (
                <div key={i} className="cm-card flex flex-col sm:flex-row gap-6 items-start">
                  <div className="shrink-0 text-right hidden sm:block" style={{ width: 120 }}>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.muted }}>{entry.duration}</p>
                  </div>
                  <div style={{ borderLeft: `3px solid ${C.accent}`, paddingLeft: 20, flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 18, color: C.text, marginBottom: 4 }}>{entry.role}</p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: C.accent, marginBottom: 4 }}>{entry.company}</p>
                    <p className="sm:hidden" style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.muted, marginBottom: 8 }}>{entry.duration}</p>
                    {entry.description && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, lineHeight: 1.7, color: C.muted }}>{entry.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      {config.contact.enabled && config.contact.email && (
        <section className="cm-section" id="contact" style={{ backgroundColor: C.bgAlt }}>
          <div className="max-w-2xl mx-auto text-center">
            <span className="cm-label">Get In Touch</span>
            <div className="cm-divider mx-auto" />
            <h2 style={{ fontSize: "clamp(32px,4vw,52px)", fontWeight: 900, color: C.text, marginBottom: 16 }}>
              {config.contact.headline || "Let's Connect"}
            </h2>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 17, lineHeight: 1.7, color: C.muted, marginBottom: 40 }}>
              {config.contact.subtext || "I'm always open to interesting conversations and opportunities."}
            </p>
            <a href={`mailto:${config.contact.email}`} className="cm-btn">
              {config.contact.ctaLabel || "Send a Message"}
            </a>
            <div className="flex gap-6 justify-center mt-10">
              {config.contact.github && <a href={config.contact.github} target="_blank" rel="noopener noreferrer" className="cm-social">GitHub</a>}
              {config.contact.linkedin && <a href={config.contact.linkedin} target="_blank" rel="noopener noreferrer" className="cm-social">LinkedIn</a>}
              {config.contact.twitter && <a href={config.contact.twitter} target="_blank" rel="noopener noreferrer" className="cm-social">Twitter</a>}
            </div>
          </div>
        </section>
      )}

      <footer className="py-8 text-center" style={{ color: C.muted, fontFamily: "Inter, sans-serif", fontSize: 13, borderTop: `1px solid ${C.border}` }}>
        <p>© {year} {name}. Built with AutoPort.</p>
      </footer>
    </div>
  );
}
