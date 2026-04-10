"use client";

import { useState } from "react";
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

const CM_LIGHT = {
  bg: "#faf9f6",
  bgAlt: "#f5f3ee",
  bgCard: "#ede9e3",
  text: "#2c2c2c",
  muted: "#5a5a5a",
  border: "#e5e0d8",
};

const CM_DARK = {
  bg: "#161616",
  bgAlt: "#1e1e1e",
  bgCard: "#272727",
  text: "#f0f0f0",
  muted: "#9ca3af",
  border: "#383838",
};

export function CleanMinimalTemplate({ config }: { config: PortfolioConfig }) {
  const name = config.hero.name || "Portfolio";
  const sortedProjects = [...(config.projects.items || [])].sort((a, b) => a.order - b.order);
  const year = new Date().getFullYear();
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const testimonials = config.testimonials?.items ?? [];
  const services = config.services?.items ?? [];

  const isDark = config.theme?.darkMode === true;
  const CM_BASE = isDark ? CM_DARK : CM_LIGHT;

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

  const navBg = isDark ? "rgba(22,22,22,0.92)" : "rgba(250,249,246,0.92)";

  return (
    <div style={{ backgroundColor: C.bg, color: C.text, fontFamily: "Georgia, 'Playfair Display', serif" }} className="min-h-screen">
      <style>{`
        .cm-nav { position: sticky; top: 0; z-index: 10; background: ${navBg}; backdrop-filter: blur(12px); border-bottom: 1px solid ${C.border}; }
        .cm-nav-link { font-family: Inter, sans-serif; font-size: 13px; font-weight: 500; color: ${C.muted}; text-transform: uppercase; letter-spacing: 0.1em; transition: color 0.2s; padding: 0 16px; }
        .cm-nav-link:hover { color: ${C.accent}; }
        .cm-section { padding: 96px 24px; }
        .cm-label { font-family: Inter, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: ${C.accent}; margin-bottom: 12px; display: block; }
        .cm-card { background: ${C.bgAlt}; border: 1px solid ${C.border}; border-radius: 16px; padding: 28px; transition: all 0.3s; }
        .cm-card:hover { border-color: ${C.accent}; box-shadow: 0 10px 40px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .cm-skill-pill { display: inline-flex; padding: 5px 14px; border-radius: 9999px; font-family: Inter, sans-serif; font-size: 13px; background: ${C.bgCard}; color: ${C.muted}; border: 1px solid ${C.border}; transition: all 0.2s; }
        .cm-skill-pill:hover { background: ${C.accentLight}; border-color: ${C.accent}; color: ${C.accent}; }
        .cm-btn { display: inline-block; padding: 14px 36px; background: ${C.text}; color: ${C.bg}; font-family: Inter, sans-serif; font-size: 14px; font-weight: 600; border-radius: 10px; transition: all 0.3s; text-decoration: none; }
        .cm-btn:hover { background: ${C.accent}; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
        .cm-btn-outline { display: inline-block; padding: 14px 36px; background: transparent; color: ${C.text}; font-family: Inter, sans-serif; font-size: 14px; font-weight: 600; border-radius: 10px; border: 1.5px solid ${C.border}; transition: all 0.3s; text-decoration: none; }
        .cm-btn-outline:hover { border-color: ${C.accent}; color: ${C.accent}; transform: translateY(-1px); }
        .cm-social { font-family: Inter, sans-serif; font-size: 13px; color: ${C.muted}; transition: color 0.2s; text-decoration: none; }
        .cm-social:hover { color: ${C.accent}; }
        .cm-divider { width: 48px; height: 3px; background: ${C.accent}; border-radius: 2px; margin-bottom: 32px; }
        @keyframes cm-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .cm-marquee-track { display: flex; white-space: nowrap; animation: cm-marquee 22s linear infinite; }
        .cm-available { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 9999px; font-family: Inter, sans-serif; font-size: 12px; font-weight: 600; background: ${C.accentLight}; color: ${C.accent}; border: 1px solid ${C.accent}40; margin-bottom: 20px; }
        .cm-stat-num { font-size: clamp(28px,4vw,40px); font-weight: 900; color: ${C.text}; }
        .cm-stat-label { font-family: Inter, sans-serif; font-size: 12px; color: ${C.muted}; margin-top: 2px; }
        .cm-service-card { background: ${C.bg}; border: 1px solid ${C.border}; border-radius: 16px; overflow: hidden; transition: all 0.3s; }
        .cm-service-card:hover { border-color: ${C.accent}; transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
        .cm-testimonial-card { background: ${C.accent}; border-radius: 24px; overflow: hidden; }
        .cm-testimonial-nav { width: 44px; height: 44px; border-radius: 9999px; border: 1.5px solid ${C.border}; background: ${C.bg}; color: ${C.text}; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 18px; }
        .cm-testimonial-nav:hover { border-color: ${C.accent}; color: ${C.accent}; }
        @media (prefers-reduced-motion: reduce) { .cm-marquee-track { animation: none; } }
      `}</style>

      {/* Nav */}
      <nav className="cm-nav px-8 py-4 flex items-center justify-between">
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15, color: C.text }}>{name}</span>
        <div className="hidden sm:flex items-center">
          {config.about.enabled && <a href="#about" className="cm-nav-link">About</a>}
          {config.skills.enabled && <a href="#skills" className="cm-nav-link">Skills</a>}
          {config.services?.enabled && services.length > 0 && <a href="#services" className="cm-nav-link">Services</a>}
          {config.projects.enabled && <a href="#work" className="cm-nav-link">Work</a>}
          {config.testimonials?.enabled && testimonials.length > 0 && <a href="#testimonials" className="cm-nav-link">Testimonials</a>}
          {config.contact.enabled && <a href="#contact" className="cm-nav-link">Contact</a>}
        </div>
      </nav>

      {/* Hero */}
      {config.hero.enabled && (
        <section className="cm-section max-w-4xl mx-auto" style={{ paddingTop: 120, paddingBottom: 80 }}>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              {config.hero.availableForWork && (
                <div className="cm-available">
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.accent, display: "inline-block", boxShadow: `0 0 6px ${C.accent}` }} />
                  Available for Work
                </div>
              )}
              <span className="cm-label">Hello, I'm</span>
              <h1 style={{ fontSize: "clamp(48px,7vw,76px)", fontWeight: 900, lineHeight: 1.05, color: C.text, marginBottom: 16 }}>
                {config.hero.name || "Your Name"}
              </h1>
              <p style={{ fontSize: 22, color: C.muted, marginBottom: 24, fontStyle: "italic" }}>{config.hero.title || "Developer"}</p>
              {config.hero.bio && (
                <p style={{ fontSize: 17, lineHeight: 1.7, color: C.muted, marginBottom: 36, fontFamily: "Inter, sans-serif" }}>{config.hero.bio}</p>
              )}
              <div className="flex flex-wrap gap-3">
                <a href="#work" className="cm-btn">View My Work</a>
                {config.hero.ctaText && config.hero.ctaLink && (
                  <a href={config.hero.ctaLink} target="_blank" rel="noopener noreferrer" className="cm-btn-outline">
                    {config.hero.ctaText}
                  </a>
                )}
                {config.hero.resumeUrl && (
                  <a href={config.hero.resumeUrl} target="_blank" rel="noopener noreferrer" className="cm-btn-outline">
                    Resume ↗
                  </a>
                )}
              </div>
              {config.hero.stats && config.hero.stats.length > 0 && (
                <div className="flex flex-wrap gap-10 mt-10" style={{ borderTop: `1px solid ${C.border}`, paddingTop: 28 }}>
                  {config.hero.stats.map((s, i) => (
                    <div key={i}>
                      <div className="cm-stat-num">{s.value}</div>
                      <div className="cm-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
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

      {/* Services */}
      {config.services?.enabled && services.length > 0 && (
        <section className="cm-section" id="services">
          <div className="max-w-4xl mx-auto">
            <span className="cm-label">What I Do</span>
            <div className="cm-divider" />
            <h2 style={{ fontSize: "clamp(32px,4vw,48px)", fontWeight: 800, color: C.text, marginBottom: 40 }}>Services</h2>
            <div className="space-y-5">
              {services.map((svc, i) => (
                <div key={i} className="cm-service-card">
                  {svc.imageUrl ? (
                    <div className="grid md:grid-cols-2 gap-0 items-stretch">
                      <div className="p-7 flex flex-col justify-between">
                        <div>
                          <h3 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 12 }}>{svc.title}</h3>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, lineHeight: 1.75, color: C.muted }}>{svc.description}</p>
                        </div>
                        {svc.link && (
                          <a href={svc.link} target="_blank" rel="noopener noreferrer" className="cm-btn" style={{ marginTop: 24, padding: "10px 22px", fontSize: 13, display: "inline-block" }}>
                            View →
                          </a>
                        )}
                      </div>
                      <img src={svc.imageUrl} alt={svc.title} style={{ width: "100%", height: "100%", minHeight: 220, objectFit: "cover", display: "block" }} />
                    </div>
                  ) : (
                    <div className="p-7 flex items-center justify-between gap-6">
                      <div>
                        <h3 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 8 }}>{svc.title}</h3>
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.7, color: C.muted }}>{svc.description}</p>
                      </div>
                      {svc.link && (
                        <a href={svc.link} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, textDecoration: "none", fontSize: 18, transition: "all 0.2s" }}>↗</a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects */}
      {config.projects.enabled && sortedProjects.length > 0 && (
        <section className="cm-section" id="work" style={{ backgroundColor: C.bgAlt }}>
          <div style={{ overflow: "hidden", marginBottom: 40 }} aria-hidden>
            <div className="cm-marquee-track" style={{ fontSize: "clamp(48px,7vw,80px)", fontWeight: 900, color: C.text, opacity: 0.07 }}>
              {"PROJECTS · PROJECTS · PROJECTS · PROJECTS · \u00A0".repeat(2).split("").map((ch, i) => <span key={i}>{ch}</span>)}
            </div>
          </div>
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
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="cm-btn-outline" style={{ padding: "10px 22px", fontSize: 13 }}>GitHub</a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {config.testimonials?.enabled && testimonials.length > 0 && (
        <section className="cm-section" id="testimonials">
          <div style={{ overflow: "hidden", marginBottom: 40 }} aria-hidden>
            <div className="cm-marquee-track" style={{ fontSize: "clamp(48px,7vw,80px)", fontWeight: 900, color: C.text, opacity: 0.07 }}>
              {"TESTIMONIALS · TESTIMONIALS · \u00A0".repeat(2).split("").map((ch, i) => <span key={i}>{ch}</span>)}
            </div>
          </div>
          <div className="max-w-4xl mx-auto">
            <span className="cm-label">Kind Words</span>
            <div className="cm-divider" />
            {(() => {
              const t = testimonials[testimonialIdx] ?? testimonials[0];
              return (
                <div className="cm-testimonial-card" style={{ display: "grid", gridTemplateColumns: t.avatarUrl ? "1fr 1fr" : "1fr" }}>
                  {t.avatarUrl && (
                    <img src={t.avatarUrl} alt={t.name} style={{ width: "100%", height: 360, objectFit: "cover", display: "block" }} />
                  )}
                  <div style={{ padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between", background: C.accent }}>
                    <p style={{ fontSize: "clamp(16px,2vw,20px)", lineHeight: 1.7, color: "#fff", fontStyle: "italic", marginBottom: 32 }}>
                      "{t.quote}"
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", fontWeight: 700 }}>
                        {t.name[0]}
                      </div>
                      <div>
                        <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, color: "#fff", fontSize: 15 }}>{t.name}</div>
                        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                          {t.role}{t.company ? `, ${t.company}` : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
            {testimonials.length > 1 && (
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
                <button
                  className="cm-testimonial-nav"
                  onClick={() => setTestimonialIdx((i) => (i - 1 + testimonials.length) % testimonials.length)}
                  aria-label="Previous"
                >‹</button>
                <button
                  className="cm-testimonial-nav"
                  onClick={() => setTestimonialIdx((i) => (i + 1) % testimonials.length)}
                  aria-label="Next"
                >›</button>
              </div>
            )}
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
            <div className="flex gap-6 justify-center mt-10 flex-wrap">
              {config.contact.github && <a href={config.contact.github} target="_blank" rel="noopener noreferrer" className="cm-social">GitHub</a>}
              {config.contact.linkedin && <a href={config.contact.linkedin} target="_blank" rel="noopener noreferrer" className="cm-social">LinkedIn</a>}
              {config.contact.twitter && <a href={config.contact.twitter} target="_blank" rel="noopener noreferrer" className="cm-social">Twitter</a>}
              {config.contact.website && <a href={config.contact.website} target="_blank" rel="noopener noreferrer" className="cm-social">Website</a>}
              {config.contact.medium && <a href={config.contact.medium} target="_blank" rel="noopener noreferrer" className="cm-social">Medium</a>}
              {config.contact.devto && <a href={config.contact.devto} target="_blank" rel="noopener noreferrer" className="cm-social">Dev.to</a>}
              {config.contact.youtube && <a href={config.contact.youtube} target="_blank" rel="noopener noreferrer" className="cm-social">YouTube</a>}
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
