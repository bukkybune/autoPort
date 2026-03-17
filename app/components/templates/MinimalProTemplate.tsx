"use client";

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

const MP_BASE = {
  bg: "#0a192f",
  bgCard: "#112240",
  bgHover: "#1e3a5f",
  text: "#ccd6f6",
  muted: "#8892b0",
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

export function MinimalProTemplate({ config }: { config: PortfolioConfig }) {
  const name = config.hero.name || "Portfolio";
  const sortedProjects = [...(config.projects.items || [])].sort((a, b) => a.order - b.order);
  const year = new Date().getFullYear();

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
        .mp-divider { flex: 1; height: 1px; background: #233554; margin-left: 20px; }
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
      `}</style>

      {/* Sticky Nav Bar */}
      <nav
        style={{
          backgroundColor: `${C.bg}f0`,
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #233554",
          padding: "18px 48px",
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            color: C.accent,
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {name}
        </span>
        <div className="hidden md:flex items-center gap-6">
          <a href="#about" className="mp-nav-link"><span style={{ color: C.accent }}>01.</span> About</a>
          <a href="#skills" className="mp-nav-link"><span style={{ color: C.accent }}>02.</span> Skills</a>
          <a href="#projects" className="mp-nav-link"><span style={{ color: C.accent }}>03.</span> Projects</a>
          <a href="#experience" className="mp-nav-link"><span style={{ color: C.accent }}>04.</span> Experience</a>
          <a href="#contact" className="mp-nav-link"><span style={{ color: C.accent }}>05.</span> Contact</a>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-8 lg:px-16">
        {/* ── Hero ── */}
        {config.hero.enabled && (
          <section className="min-h-screen flex flex-col justify-center py-20">
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
                className="inline-block px-7 py-4 rounded border-2 text-sm font-medium transition-all duration-300 hover:bg-[#64ffda1a]"
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
            </div>

            {/* Inline social links row */}
            <div style={{ marginTop: 32, display: "flex", flexDirection: "row", alignItems: "center", gap: 20 }}>
              {config.contact.github && (
                <a href={config.contact.github} target="_blank" rel="noopener noreferrer" className="mp-link" aria-label="GitHub">{GH_SVG}</a>
              )}
              {config.contact.linkedin && (
                <a href={config.contact.linkedin} target="_blank" rel="noopener noreferrer" className="mp-link" aria-label="LinkedIn">{LI_SVG}</a>
              )}
              {config.contact.twitter && (
                <a href={config.contact.twitter} target="_blank" rel="noopener noreferrer" className="mp-link" aria-label="Twitter">{TW_SVG}</a>
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
                  style={{ backgroundColor: C.bgCard, border: "1px solid #1d3461" }}
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

        {/* ── Projects ── */}
        {config.projects.enabled && sortedProjects.length > 0 && (
          <section className="py-24" id="projects">
            <div className="flex items-center mb-16">
              <span className="text-xl mr-3" style={{ color: C.accent }}>03.</span>
              <h2 className="text-3xl font-bold" style={{ fontFamily: "Inter, sans-serif", color: C.text }}>Things I've Built</h2>
              <div className="mp-divider" />
            </div>
            <div className="space-y-32">
              {sortedProjects.map((project, idx) => (
                <div key={project.id} className="mp-project-card relative grid md:grid-cols-12 gap-4 items-center">
                  {/* Image */}
                  <div className={`md:col-span-7 ${idx % 2 === 0 ? "md:col-start-1" : "md:col-start-6 md:row-start-1"}`}>
                    <a
                      href={project.demoUrl || project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative group"
                    >
                      <div
                        className="absolute inset-0 rounded-lg z-10 transition-opacity duration-300 group-hover:opacity-0"
                        style={{ backgroundColor: `${C.bg}99` }}
                      />
                      <img
                        src={project.imageUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=500&fit=crop"}
                        alt={project.customTitle}
                        className="rounded-lg w-full h-56 object-cover"
                        style={{ filter: "grayscale(30%) brightness(0.8)" }}
                      />
                    </a>
                  </div>
                  {/* Content */}
                  <div
                    className={`md:col-span-6 z-10 ${idx % 2 === 0 ? "md:col-start-7 md:row-start-1 text-right" : "md:col-start-1 md:row-start-1 text-left"} flex flex-col justify-center`}
                  >
                    <p className="text-xs mb-2" style={{ color: C.accent }}>Featured Project</p>
                    <h3 className="text-2xl font-bold mb-4" style={{ color: C.text, fontFamily: "Inter, sans-serif" }}>
                      <a
                        href={project.demoUrl || project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:opacity-80"
                        style={{ color: C.text }}
                      >
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

        {/* ── Experience ── */}
        {config.experience.enabled && config.experience.items?.length > 0 && (
          <section className="py-24" id="experience">
            <div className="flex items-center mb-10">
              <span className="text-xl mr-3" style={{ color: C.accent }}>04.</span>
              <h2 className="text-3xl font-bold" style={{ fontFamily: "Inter, sans-serif", color: C.text }}>Experience</h2>
              <div className="mp-divider" />
            </div>
            <div className="space-y-6">
              {config.experience.items.map((entry, i) => (
                <div
                  key={i}
                  className="p-6 rounded-lg border-l-2 transition-all duration-300 hover:bg-[#112240]"
                  style={{ borderColor: C.accent, backgroundColor: C.bgCard }}
                >
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
              className="inline-block px-8 py-4 rounded border-2 text-sm font-medium transition-all duration-300 hover:bg-[#64ffda1a]"
              style={{ borderColor: C.accent, color: C.accent }}
            >
              {config.contact.ctaLabel || "Say Hello"}
            </a>
          </section>
        )}

        <footer className="py-8 text-center text-xs" style={{ color: C.muted }}>
          <p>© {year} {name}. Built with AutoPort.</p>
        </footer>
      </main>
    </div>
  );
}
