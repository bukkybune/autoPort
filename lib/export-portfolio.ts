import type { PortfolioConfig, TemplateId } from "@/app/types/portfolio";
import type { CustomizedProject } from "@/app/types/customize";
import type { ColorSchemeId } from "@/app/types/portfolio";

export type { TemplateId };

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function escapeAttr(s: string): string { return escapeHtml(s); }

/**
 * Allow only http, https, and mailto URL schemes in exported HTML.
 * Blocks javascript:, data:, vbscript:, and other potentially dangerous schemes.
 */
function safeUrl(url: string | undefined | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) return "#";
    return trimmed;
  } catch {
    // Relative URLs are fine; they won't have a protocol
    if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;
    return "#";
  }
}

/**
 * Like safeUrl, but also converts Google Drive share/view/uc links to the
 * thumbnail endpoint which reliably returns raw image bytes (no interstitial).
 */
function safeImageUrl(url: string | undefined | null): string {
  const base = safeUrl(url);
  if (!base || base === "#") return base;
  const m = base.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]+)/)
    ?? base.match(/drive\.google\.com\/uc\?.*[?&]id=([\w-]+)/);
  if (m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=s800`;
  return base;
}

const sorted = (items: CustomizedProject[]) => [...items].sort((a, b) => a.order - b.order);
const year = new Date().getFullYear();

/* ─────────── color scheme helpers ─────────── */

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

function getMPAccent(config: PortfolioConfig): string {
  const s = config.theme?.colorScheme ?? "navy";
  if (s === "custom") return config.theme?.customColors?.accent ?? MP_ACCENTS.navy;
  return MP_ACCENTS[s as Exclude<ColorSchemeId, "custom">] ?? MP_ACCENTS.navy;
}

type CMColors = { accent: string; accentLight: string };
const CM_ACCENTS: Record<Exclude<ColorSchemeId, "custom">, CMColors> = {
  navy:              { accent: "#0369a1", accentLight: "#e0f2fe" },
  purple:            { accent: "#7c3aed", accentLight: "#ede9fe" },
  teal:              { accent: "#0d9488", accentLight: "#ccfbf1" },
  green:             { accent: "#16a34a", accentLight: "#dcfce7" },
  "warm-earth":      { accent: "#b45309", accentLight: "#fef3c7" },
  "ocean-glass":     { accent: "#0284c7", accentLight: "#e0f2fe" },
  "sunset-warm":     { accent: "#c2410c", accentLight: "#ffedd5" },
  "gradient-purple": { accent: "#6d28d9", accentLight: "#ede9fe" },
};

function getCMColors(config: PortfolioConfig): CMColors {
  const s = config.theme?.colorScheme ?? "warm-earth";
  if (s === "custom") {
    const a = config.theme?.customColors?.accent ?? CM_ACCENTS["warm-earth"].accent;
    return { accent: a, accentLight: a + "26" };
  }
  return CM_ACCENTS[s as Exclude<ColorSchemeId, "custom">] ?? CM_ACCENTS["warm-earth"];
}

type AuroraPalette = { accent: string; accentPurple: string; accentPink: string; blob1: string; blob2: string; blob3: string };
const AURORA_PALETTES: Record<Exclude<ColorSchemeId, "custom">, AuroraPalette> = {
  navy:              { accent: "#2dd4bf", accentPurple: "#a78bfa", accentPink: "#f472b6", blob1: "rgba(167,139,250,0.18)", blob2: "rgba(45,212,191,0.15)",  blob3: "rgba(244,114,182,0.12)" },
  purple:            { accent: "#a78bfa", accentPurple: "#e879f9", accentPink: "#c084fc", blob1: "rgba(167,139,250,0.22)", blob2: "rgba(232,121,249,0.16)", blob3: "rgba(192,132,252,0.14)" },
  teal:              { accent: "#2dd4bf", accentPurple: "#38bdf8", accentPink: "#67e8f9", blob1: "rgba(45,212,191,0.22)",  blob2: "rgba(56,189,248,0.16)",  blob3: "rgba(103,232,249,0.13)" },
  green:             { accent: "#4ade80", accentPurple: "#2dd4bf", accentPink: "#a3e635", blob1: "rgba(74,222,128,0.2)",   blob2: "rgba(45,212,191,0.15)",  blob3: "rgba(163,230,53,0.12)"  },
  "warm-earth":      { accent: "#f59e0b", accentPurple: "#f97316", accentPink: "#ef4444", blob1: "rgba(245,158,11,0.2)",  blob2: "rgba(249,115,22,0.15)",  blob3: "rgba(239,68,68,0.12)"   },
  "ocean-glass":     { accent: "#22d3ee", accentPurple: "#38bdf8", accentPink: "#818cf8", blob1: "rgba(34,211,238,0.22)", blob2: "rgba(56,189,248,0.16)",  blob3: "rgba(99,102,241,0.12)"  },
  "sunset-warm":     { accent: "#fbbf24", accentPurple: "#f97316", accentPink: "#f472b6", blob1: "rgba(251,191,36,0.2)",  blob2: "rgba(249,115,22,0.15)",  blob3: "rgba(244,114,182,0.12)" },
  "gradient-purple": { accent: "#a78bfa", accentPurple: "#c084fc", accentPink: "#f472b6", blob1: "rgba(167,139,250,0.22)", blob2: "rgba(192,132,252,0.18)", blob3: "rgba(244,114,182,0.14)" },
};

function getAuroraPalette(config: PortfolioConfig): AuroraPalette {
  const s = config.theme?.colorScheme ?? "navy";
  if (s === "custom") {
    const cc = config.theme?.customColors;
    if (cc) return { accent: cc.accent, accentPurple: cc.secondary, accentPink: cc.primary, blob1: cc.accent + "2e", blob2: cc.secondary + "26", blob3: cc.primary + "1f" };
    return AURORA_PALETTES.navy;
  }
  return AURORA_PALETTES[s as Exclude<ColorSchemeId, "custom">] ?? AURORA_PALETTES.navy;
}

/* ─────────── shared helpers ─────────── */
function projectLinks(p: CustomizedProject, accentColor: string): string {
  const demo = p.demoUrl ? `<a href="${escapeAttr(safeUrl(p.demoUrl))}" target="_blank" rel="noopener noreferrer" style="color:${accentColor};font-size:13px;">Live Demo →</a>` : "";
  const gh = p.showGithubLink && p.githubUrl ? `<a href="${escapeAttr(safeUrl(p.githubUrl))}" target="_blank" rel="noopener noreferrer" style="color:${accentColor};font-size:13px;">GitHub →</a>` : "";
  return [demo, gh].filter(Boolean).join("&nbsp;&nbsp;");
}
function tagsHtml(tags: string[], bg: string, color: string): string {
  return tags.slice(0, 6).map(t => `<span style="display:inline-flex;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:500;background:${bg};color:${color};">${escapeHtml(t)}</span>`).join(" ");
}
function socialLinks(contact: PortfolioConfig["contact"], color: string): string {
  return [
    contact.github   ? `<a href="${escapeAttr(safeUrl(contact.github))}"   target="_blank" rel="noopener noreferrer" style="color:${color};font-size:13px;">GitHub</a>`   : "",
    contact.linkedin ? `<a href="${escapeAttr(safeUrl(contact.linkedin))}" target="_blank" rel="noopener noreferrer" style="color:${color};font-size:13px;">LinkedIn</a>` : "",
    contact.twitter  ? `<a href="${escapeAttr(safeUrl(contact.twitter))}"  target="_blank" rel="noopener noreferrer" style="color:${color};font-size:13px;">Twitter</a>`  : "",
    contact.website  ? `<a href="${escapeAttr(safeUrl(contact.website))}"  target="_blank" rel="noopener noreferrer" style="color:${color};font-size:13px;">Website</a>`  : "",
    contact.medium   ? `<a href="${escapeAttr(safeUrl(contact.medium))}"   target="_blank" rel="noopener noreferrer" style="color:${color};font-size:13px;">Medium</a>`   : "",
    contact.devto    ? `<a href="${escapeAttr(safeUrl(contact.devto))}"    target="_blank" rel="noopener noreferrer" style="color:${color};font-size:13px;">Dev.to</a>`    : "",
    contact.youtube  ? `<a href="${escapeAttr(safeUrl(contact.youtube))}"  target="_blank" rel="noopener noreferrer" style="color:${color};font-size:13px;">YouTube</a>`  : "",
  ].filter(Boolean).join("&nbsp;&nbsp;&nbsp;");
}

/* ═══════════════════════════════════════
   1. MINIMAL PRO  (Brittany Chiang navy)
═══════════════════════════════════════ */
const MP_LIGHT = { bg: "#f0f4f8", bgCard: "#e2e8f0", bgHover: "#cbd5e1", text: "#1a2a4a", muted: "#4a5568", divider: "#cbd5e1" };
const MP_DARK  = { bg: "#0a192f", bgCard: "#112240", bgHover: "#1e3a5f", text: "#ccd6f6", muted: "#8892b0", divider: "#233554" };

function renderMinimalPro(config: PortfolioConfig): string {
  const name = escapeHtml(config.hero.name || "Portfolio");
  const projects = sorted(config.projects.items || []);
  const c = config.contact;
  const accent = getMPAccent(config);
  const isDark = config.theme?.darkMode !== false;
  const MP = isDark ? MP_DARK : MP_LIGHT;

  let html = `<style>
    .social-side,.email-side{display:flex;flex-direction:column;align-items:center;gap:16px;position:fixed;bottom:0;z-index:10;}
    .social-side{left:24px;} .email-side{right:24px;}
    .social-side a,.email-side a{color:${MP.muted};font-size:12px;font-family:Inter,sans-serif;letter-spacing:0.1em;writing-mode:vertical-rl;text-decoration:none;transition:color 0.2s;}
    .social-side a:hover,.email-side a:hover{color:${accent};}
    .v-line{width:1px;height:80px;background:${MP.muted};margin-top:8px;}
    main{max-width:700px;margin:0 auto;padding:0 120px;}
    .section-head{display:flex;align-items:center;gap:12px;margin-bottom:40px;}
    .divider{flex:1;height:1px;background:${MP.divider};}
    .accent{color:${accent};font-family:Inter,sans-serif;}
    .muted{color:${MP.muted};font-family:Inter,sans-serif;}
    .btn{display:inline-flex;align-items:center;padding:12px 28px;border:1px solid ${accent};border-radius:4px;color:${accent};font-family:Inter,sans-serif;font-size:13px;font-weight:600;text-decoration:none;transition:background 0.2s;}
    .btn:hover{background:${accent}14;}
    .btn-muted{display:inline-flex;align-items:center;padding:12px 28px;border:1px solid ${MP.muted};border-radius:4px;color:${MP.muted};font-family:Inter,sans-serif;font-size:13px;font-weight:600;text-decoration:none;transition:all 0.2s;}
    .btn-muted:hover{border-color:${accent};color:${accent};}
    .fade1{opacity:0;animation:fadeUp 0.5s 0.1s forwards;}
    .fade2{opacity:0;animation:fadeUp 0.5s 0.2s forwards;}
    .fade3{opacity:0;animation:fadeUp 0.5s 0.3s forwards;}
    .fade4{opacity:0;animation:fadeUp 0.5s 0.4s forwards;}
    .fade5{opacity:0;animation:fadeUp 0.5s 0.5s forwards;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:none;}}
    @keyframes mp-marquee{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}
    @media(max-width:768px){
      .social-side,.email-side{display:none;}
      main{padding:0 20px;}
      .mp-about-grid{grid-template-columns:1fr!important;}
    }
    @media(prefers-reduced-motion:reduce){.mp-marquee-track{animation:none!important;}}
  </style>`;

  // Sidebar socials
  html += `<div class="social-side">
    ${c.github ? `<a href="${escapeAttr(safeUrl(c.github))}" target="_blank" rel="noopener noreferrer">GH</a>` : ""}
    ${c.linkedin ? `<a href="${escapeAttr(safeUrl(c.linkedin))}" target="_blank" rel="noopener noreferrer">LI</a>` : ""}
    ${c.twitter ? `<a href="${escapeAttr(safeUrl(c.twitter))}" target="_blank" rel="noopener noreferrer">TW</a>` : ""}
    <div class="v-line"></div>
  </div>
  ${c.email ? `<div class="email-side"><a href="mailto:${escapeAttr(c.email)}">${escapeHtml(c.email)}</a><div class="v-line"></div></div>` : ""}`;

  html += `<main>`;

  // Hero
  if (config.hero.enabled) {
    const mpStats = (config.hero.stats ?? []).filter(s => s.value && s.label);
    html += `<section style="min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:80px 0;">
      ${config.hero.availableForWork ? `<div style="display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:9999px;border:1px solid ${accent};color:${accent};font-family:SF Mono,Fira Code,monospace;font-size:12px;margin-bottom:20px;width:fit-content;"><span style="width:7px;height:7px;border-radius:50%;background:${accent};display:inline-block;"></span> Available for Work</div>` : ""}
      <p class="accent fade1" style="font-size:14px;margin-bottom:16px;">Hi, my name is</p>
      <h1 class="fade2" style="font-size:clamp(40px,8vw,72px);font-weight:900;color:${MP.text};line-height:1;margin:0 0 8px;font-family:Inter,sans-serif;">${escapeHtml(config.hero.name || "Your Name")}</h1>
      <h2 class="fade3" style="font-size:clamp(32px,6vw,60px);font-weight:900;color:${MP.muted};line-height:1.1;margin:0 0 24px;font-family:Inter,sans-serif;">${escapeHtml(config.hero.title || "Developer")}</h2>
      ${config.hero.bio ? `<p class="muted fade4" style="max-width:500px;font-size:18px;line-height:1.7;margin-bottom:40px;">${escapeHtml(config.hero.bio)}</p>` : ""}
      <div class="fade5" style="display:flex;gap:16px;flex-wrap:wrap;">
        <a href="#projects" class="btn">Check out my work!</a>
        ${config.hero.ctaText && config.hero.ctaLink ? `<a href="${escapeAttr(safeUrl(config.hero.ctaLink))}" target="_blank" rel="noopener noreferrer" class="btn" style="background:${accent};color:${MP.bg};border-color:${accent};">${escapeHtml(config.hero.ctaText)}</a>` : ""}
        ${config.hero.resumeUrl ? `<a href="${escapeAttr(safeUrl(config.hero.resumeUrl))}" target="_blank" rel="noopener noreferrer" class="btn-muted">Resume ↗</a>` : ""}
      </div>
      ${mpStats.length > 0 ? `<div style="display:flex;flex-wrap:wrap;gap:40px;margin-top:40px;padding-top:28px;border-top:1px solid ${MP.divider};">${mpStats.map(s => `<div><div style="font-size:clamp(28px,4vw,40px);font-weight:900;color:${MP.text};font-family:Inter,sans-serif;">${escapeHtml(s.value)}</div><div style="font-family:Inter,sans-serif;font-size:12px;color:${MP.muted};margin-top:2px;">${escapeHtml(s.label)}</div></div>`).join("")}</div>` : ""}
    </section>`;
  }

  // About
  if (config.about.enabled && (config.about.description || config.about.funFacts)) {
    html += `<section style="padding:80px 0;" id="about">
      <div class="section-head">
        <span class="accent" style="font-size:18px;margin-right:12px;">01.</span>
        <h2 style="font-size:28px;font-weight:700;color:${MP.text};font-family:Inter,sans-serif;margin:0;">About Me</h2>
        <div class="divider"></div>
      </div>
      <div style="display:grid;grid-template-columns:${config.hero.photoUrl ? "1fr 200px" : "1fr"};gap:40px;align-items:start;" class="mp-about-grid">
        <div>
          ${config.about.description ? `<p class="muted" style="font-size:17px;line-height:1.7;margin-bottom:16px;">${escapeHtml(config.about.description)}</p>` : ""}
          ${config.about.funFacts ? `<p class="muted" style="font-size:15px;line-height:1.7;">${escapeHtml(config.about.funFacts)}</p>` : ""}
        </div>
        ${config.hero.photoUrl ? `<div><img src="${escapeAttr(safeImageUrl(config.hero.photoUrl))}" alt="" style="width:200px;height:200px;object-fit:cover;border-radius:8px;filter:grayscale(30%);" /></div>` : ""}
      </div>
    </section>`;
  }

  // Skills
  if (config.skills.enabled && config.skills.categories?.some(cat => cat.skills?.length > 0)) {
    const cats = config.skills.categories.filter(cat => cat.skills?.length > 0).map(cat => `
      <div style="background:${MP.bgCard};border:1px solid ${MP.divider};border-radius:8px;padding:20px;">
        <h3 style="color:${accent};font-size:13px;font-weight:600;margin:0 0 12px;">▹ ${escapeHtml(cat.name)}</h3>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${cat.skills.map(sk => `<span style="color:${MP.muted};font-size:12px;">${escapeHtml(sk.name)}</span>`).join("&nbsp;·&nbsp;")}
        </div>
      </div>`).join("");
    html += `<section style="padding:80px 0;" id="skills">
      <div class="section-head">
        <span class="accent" style="font-size:18px;margin-right:12px;">02.</span>
        <h2 style="font-size:28px;font-weight:700;color:${MP.text};font-family:Inter,sans-serif;margin:0;">Skills</h2>
        <div class="divider"></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;">${cats}</div>
    </section>`;
  }

  // Services
  if (config.services?.enabled && (config.services.items ?? []).length > 0) {
    const svcs = config.services.items.map((svc, i) => `
      <div style="border-left:2px solid ${accent};background:${MP.bgCard};border-radius:0 8px 8px 0;overflow:hidden;margin-bottom:16px;${svc.imageUrl ? "display:grid;grid-template-columns:1fr 1fr;" : ""}">
        <div style="padding:24px;">
          <h3 style="font-size:18px;font-weight:700;color:${MP.text};font-family:Inter,sans-serif;margin:0 0 8px;">${escapeHtml(svc.title)}</h3>
          <p style="color:${MP.muted};font-size:14px;line-height:1.7;margin:0 0 ${svc.link ? "16px" : "0"};">${escapeHtml(svc.description)}</p>
          ${svc.link ? `<a href="${escapeAttr(safeUrl(svc.link))}" target="_blank" rel="noopener noreferrer" class="btn" style="display:inline-flex;padding:8px 18px;font-size:13px;">View →</a>` : ""}
        </div>
        ${svc.imageUrl ? `<img src="${escapeAttr(safeImageUrl(svc.imageUrl))}" alt="" style="width:100%;height:100%;min-height:180px;object-fit:cover;display:block;filter:grayscale(20%);" />` : ""}
      </div>`).join("");
    html += `<section style="padding:80px 0;" id="services">
      <div class="section-head">
        <span class="accent" style="font-size:18px;margin-right:12px;">03.</span>
        <h2 style="font-size:28px;font-weight:700;color:${MP.text};font-family:Inter,sans-serif;margin:0;">Services</h2>
        <div class="divider"></div>
      </div>
      ${svcs}
    </section>`;
  }

  // Projects
  if (config.projects.enabled && projects.length > 0) {
    const projs = projects.map((p) => `<div style="margin-bottom:80px;">
        <p style="color:${accent};font-size:12px;margin-bottom:8px;">Featured Project</p>
        <h3 style="font-size:24px;font-weight:700;color:${MP.text};font-family:Inter,sans-serif;margin:0 0 16px;">${escapeHtml(p.customTitle || p.originalName)}</h3>
        <div style="background:${MP.bgCard};border-radius:8px;padding:20px;margin-bottom:16px;">
          <p style="color:${MP.muted};font-size:15px;line-height:1.7;margin:0;">${escapeHtml(p.customDescription || p.originalDescription || "No description.")}</p>
        </div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px;">${tagsHtml(p.tags, "transparent", MP.muted)}</div>
        <div style="display:flex;gap:16px;">${projectLinks(p, accent)}</div>
      </div>`).join("");
    html += `<section style="padding:80px 0;" id="projects">
      <div class="section-head">
        <span class="accent" style="font-size:18px;margin-right:12px;">03.</span>
        <h2 style="font-size:28px;font-weight:700;color:${MP.text};font-family:Inter,sans-serif;margin:0;">Things I've Built</h2>
        <div class="divider"></div>
      </div>
      ${projs}
    </section>`;
  }

  // Testimonials (MinimalPro)
  if (config.testimonials?.enabled && (config.testimonials.items ?? []).length > 0) {
    const t = config.testimonials.items[0];
    const allT = config.testimonials.items;
    const tCards = allT.map((t, i) => `
      <div style="background:${MP.bgCard};border:1px solid ${MP.divider};border-radius:8px;overflow:hidden;display:${t.avatarUrl ? "grid" : "block"};grid-template-columns:${t.avatarUrl ? "1fr 1fr" : "1fr"};${i > 0 ? "display:none;" : ""}">
        ${t.avatarUrl ? `<img src="${escapeAttr(safeImageUrl(t.avatarUrl))}" alt="" style="width:100%;height:280px;object-fit:cover;display:block;filter:grayscale(20%);" />` : ""}
        <div style="padding:32px;border-left:2px solid ${accent};">
          <p style="font-size:16px;line-height:1.75;color:${MP.muted};font-style:italic;margin:0 0 24px;">"${escapeHtml(t.quote)}"</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:38px;height:38px;border-radius:50%;background:${MP.bgHover};border:1px solid ${accent};display:flex;align-items:center;justify-content:center;font-size:15px;color:${accent};font-weight:700;">${escapeHtml(t.name[0] ?? "?")}</div>
            <div>
              <div style="font-weight:600;color:${MP.text};font-size:14px;font-family:Inter,sans-serif;">${escapeHtml(t.name)}</div>
              <div style="font-size:12px;color:${MP.muted};letter-spacing:0.05em;">${escapeHtml(t.role)}${t.company ? `, ${escapeHtml(t.company)}` : ""}</div>
            </div>
          </div>
        </div>
      </div>`).join("");
    html += `<section style="padding:80px 0;" id="testimonials">
      <div style="overflow:hidden;margin-bottom:32px;" aria-hidden="true"><div class="mp-marquee-track" style="display:flex;white-space:nowrap;animation:mp-marquee 22s linear infinite;"><span style="font-size:clamp(48px,7vw,80px);font-weight:900;color:${MP.text};opacity:0.04;font-family:Inter,sans-serif;">TESTIMONIALS · TESTIMONIALS · &nbsp;</span><span style="font-size:clamp(48px,7vw,80px);font-weight:900;color:${MP.text};opacity:0.04;font-family:Inter,sans-serif;">TESTIMONIALS · TESTIMONIALS · &nbsp;</span></div></div>
      <div class="section-head">
        <span class="accent" style="font-size:18px;margin-right:12px;">0${4 + (config.services?.enabled && config.services.items?.length > 0 ? 1 : 0)}.</span>
        <h2 style="font-size:28px;font-weight:700;color:${MP.text};font-family:Inter,sans-serif;margin:0;">Testimonials</h2>
        <div class="divider"></div>
      </div>
      ${tCards}
    </section>`;
  }

  // Experience
  if (config.experience.enabled && config.experience.items?.length > 0) {
    const exp = config.experience.items.map(e => `
      <div style="background:${MP.bgCard};border-left:2px solid ${accent};padding:20px;border-radius:0 8px 8px 0;margin-bottom:16px;">
        <p style="font-weight:700;color:${MP.text};margin:0 0 4px;">${escapeHtml(e.role)}</p>
        <p style="color:${accent};font-size:13px;margin:0 0 4px;">${escapeHtml(e.company)}</p>
        <p style="color:${MP.muted};font-size:12px;margin:0 0 8px;">${escapeHtml(e.duration)}</p>
        ${e.description ? `<p style="color:${MP.muted};font-size:14px;line-height:1.7;margin:0;">${escapeHtml(e.description)}</p>` : ""}
      </div>`).join("");
    html += `<section style="padding:80px 0;" id="experience">
      <div class="section-head">
        <span class="accent" style="font-size:18px;margin-right:12px;">04.</span>
        <h2 style="font-size:28px;font-weight:700;color:${MP.text};font-family:Inter,sans-serif;margin:0;">Experience</h2>
        <div class="divider"></div>
      </div>
      ${exp}
    </section>`;
  }

  // Contact
  if (config.contact.enabled && c.email) {
    html += `<section style="padding:120px 0;text-align:center;" id="contact">
      <p class="accent" style="font-size:13px;margin-bottom:16px;">What's Next?</p>
      <h2 style="font-size:clamp(36px,5vw,52px);font-weight:700;color:${MP.text};font-family:Inter,sans-serif;margin:0 0 16px;">${escapeHtml(c.headline || "Get In Touch")}</h2>
      <p class="muted" style="max-width:400px;margin:0 auto 40px;font-size:17px;line-height:1.7;">${escapeHtml(c.subtext || "I'm always open to new opportunities. Feel free to reach out!")}</p>
      <a href="mailto:${escapeAttr(c.email)}" class="btn">${escapeHtml(c.ctaLabel || "Say Hello")}</a>
      <div style="margin-top:24px;display:flex;gap:20px;justify-content:center;flex-wrap:wrap;">${socialLinks(c, MP.muted)}</div>
    </section>`;
  }

  html += `<footer style="padding:32px 0;text-align:center;color:${MP.muted};font-size:12px;border-top:1px solid ${MP.divider};">
    <p>© ${year} ${name}. Built with AutoPort.</p>
  </footer>`;

  html += `</main>`;
  return html;
}


/* ═══════════════════════════════════════
   3. CLEAN MINIMAL  (Light theme)
═══════════════════════════════════════ */
const CM_EXPORT_LIGHT = { bg: "#faf9f6", bgAlt: "#f5f3ee", bgCard: "#ede9e3", text: "#2c2c2c", muted: "#5a5a5a", border: "#e5e0d8" };
const CM_EXPORT_DARK  = { bg: "#161616",  bgAlt: "#1e1e1e",  bgCard: "#272727",  text: "#f0f0f0", muted: "#9ca3af", border: "#383838" };

function renderCleanMinimal(config: PortfolioConfig): string {
  const name = escapeHtml(config.hero.name || "Portfolio");
  const projects = sorted(config.projects.items || []);
  const c = config.contact;
  const { accent, accentLight } = getCMColors(config);
  const isDark = config.theme?.darkMode === true;
  const CM = isDark ? CM_EXPORT_DARK : CM_EXPORT_LIGHT;

  let html = `<style>
    @keyframes cm-marquee{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}
    @media(max-width:768px){
      .cm-hero-grid{grid-template-columns:1fr!important;}
      .cm-about-grid{grid-template-columns:1fr!important;}
      .cm-skills-grid{grid-template-columns:1fr!important;}
      .cm-project-card{grid-template-columns:1fr!important;}
      .cm-nav-links{display:none!important;}
      .cm-section{padding:60px 20px!important;}
      .cm-hero-section{padding:80px 20px 60px!important;}
    }
    @media(prefers-reduced-motion:reduce){.cm-marquee-track{animation:none!important;}}
  </style>`;

  // Nav
  const cmNavBg = isDark ? "rgba(22,22,22,0.92)" : "rgba(250,249,246,0.92)";
  html += `<nav style="position:sticky;top:0;z-index:10;background:${cmNavBg};backdrop-filter:blur(12px);border-bottom:1px solid ${CM.border};padding:16px 32px;display:flex;align-items:center;justify-content:space-between;">
    <span style="font-family:Inter,sans-serif;font-weight:700;font-size:15px;color:${CM.text};">${name}</span>
    <div style="display:flex;gap:24px;" class="cm-nav-links">
      ${config.projects.enabled ? `<a href="#work" style="font-family:Inter,sans-serif;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${CM.muted};text-decoration:none;">Work</a>` : ""}
      ${config.contact.enabled ? `<a href="#contact" style="font-family:Inter,sans-serif;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${CM.muted};text-decoration:none;">Contact</a>` : ""}
    </div>
  </nav>`;

  // Hero
  if (config.hero.enabled) {
    const cmStats = (config.hero.stats ?? []).filter(s => s.value && s.label);
    html += `<section style="padding:100px 32px 80px;max-width:960px;margin:0 auto;" class="cm-hero-section">
      <div style="display:grid;grid-template-columns:${config.hero.photoUrl ? "1fr 1fr" : "1fr"};gap:60px;align-items:center;" class="cm-hero-grid">
        <div>
          ${config.hero.availableForWork ? `<div style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:9999px;background:${accentLight};color:${accent};border:1px solid ${accent}40;font-family:Inter,sans-serif;font-size:12px;font-weight:600;margin-bottom:16px;"><span style="width:7px;height:7px;border-radius:50%;background:${accent};display:inline-block;"></span> Available for Work</div><br>` : ""}
          <p style="font-family:Inter,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${accent};margin-bottom:16px;">Hello, I'm</p>
          <h1 style="font-family:Georgia,serif;font-size:clamp(48px,7vw,76px);font-weight:900;line-height:1.05;color:${CM.text};margin:0 0 16px;">${escapeHtml(config.hero.name || "Your Name")}</h1>
          <p style="font-size:22px;color:${CM.muted};font-style:italic;font-family:Georgia,serif;margin:0 0 24px;">${escapeHtml(config.hero.title || "Developer")}</p>
          ${config.hero.bio ? `<p style="font-family:Inter,sans-serif;font-size:17px;line-height:1.75;color:${CM.muted};margin:0 0 36px;">${escapeHtml(config.hero.bio)}</p>` : ""}
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <a href="#work" style="display:inline-block;padding:13px 32px;background:${CM.text};color:${CM.bg};font-family:Inter,sans-serif;font-size:14px;font-weight:700;border-radius:10px;text-decoration:none;">View My Work</a>
            ${config.hero.ctaText && config.hero.ctaLink ? `<a href="${escapeAttr(safeUrl(config.hero.ctaLink))}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:13px 32px;background:transparent;color:${CM.text};font-family:Inter,sans-serif;font-size:14px;font-weight:700;border-radius:10px;text-decoration:none;border:1.5px solid ${CM.text};">${escapeHtml(config.hero.ctaText)}</a>` : ""}
            ${config.hero.resumeUrl ? `<a href="${escapeAttr(safeUrl(config.hero.resumeUrl))}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:13px 32px;background:transparent;color:${CM.muted};font-family:Inter,sans-serif;font-size:14px;font-weight:700;border-radius:10px;text-decoration:none;border:1.5px solid ${CM.border};">Resume ↗</a>` : ""}
          </div>
          ${cmStats.length > 0 ? `<div style="display:flex;flex-wrap:wrap;gap:40px;margin-top:40px;padding-top:28px;border-top:1px solid ${CM.border};">${cmStats.map(s => `<div><div style="font-size:clamp(28px,4vw,40px);font-weight:900;color:${CM.text};font-family:Georgia,serif;">${escapeHtml(s.value)}</div><div style="font-family:Inter,sans-serif;font-size:12px;color:${CM.muted};margin-top:2px;">${escapeHtml(s.label)}</div></div>`).join("")}</div>` : ""}
        </div>
        ${config.hero.photoUrl ? `<div style="position:relative;">
          <div style="position:absolute;inset:-12px;background:${accent}14;border-radius:20px;transform:rotate(2deg);"></div>
          <img src="${escapeAttr(safeImageUrl(config.hero.photoUrl))}" alt="" style="position:relative;width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:18px;border:1px solid ${CM.border};" />
        </div>` : ""}
      </div>
    </section>`;
  }

  // About
  if (config.about.enabled && (config.about.description || config.about.funFacts)) {
    html += `<section style="padding:80px 32px;background:${CM.bgAlt};" id="about" class="cm-section"><div style="max-width:960px;margin:0 auto;">
      <p style="font-family:Inter,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${accent};margin-bottom:12px;">About</p>
      <div style="width:48px;height:3px;background:${accent};border-radius:2px;margin-bottom:28px;"></div>
      <h2 style="font-family:Georgia,serif;font-size:clamp(32px,4vw,48px);font-weight:800;color:${CM.text};margin:0 0 32px;">A bit about me</h2>
      ${config.about.description ? `<p style="font-family:Inter,sans-serif;font-size:17px;line-height:1.75;color:${CM.muted};max-width:680px;margin:0 0 16px;">${escapeHtml(config.about.description)}</p>` : ""}
      ${config.about.funFacts ? `<p style="font-family:Georgia,serif;font-size:16px;line-height:1.7;color:${CM.muted};font-style:italic;">${escapeHtml(config.about.funFacts)}</p>` : ""}
    </div></section>`;
  }

  // Skills
  if (config.skills.enabled && config.skills.categories?.some(cat => cat.skills?.length > 0)) {
    const cats = config.skills.categories.filter(cat => cat.skills?.length > 0).map(cat => `
      <div style="background:${CM.bgAlt};border:1px solid ${CM.border};border-radius:16px;padding:24px;">
        <h3 style="font-family:Inter,sans-serif;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:${accent};margin:0 0 14px;">${escapeHtml(cat.name)}</h3>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${cat.skills.map(sk => `<span style="display:inline-flex;padding:5px 12px;border-radius:9999px;font-family:Inter,sans-serif;font-size:13px;background:${CM.bgCard};color:${CM.muted};border:1px solid ${CM.border};">${escapeHtml(sk.name)}</span>`).join("")}
        </div>
      </div>`).join("");
    html += `<section style="padding:80px 32px;" id="skills" class="cm-section"><div style="max-width:960px;margin:0 auto;">
      <p style="font-family:Inter,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${accent};margin-bottom:12px;">Expertise</p>
      <div style="width:48px;height:3px;background:${accent};border-radius:2px;margin-bottom:28px;"></div>
      <h2 style="font-family:Georgia,serif;font-size:clamp(32px,4vw,48px);font-weight:800;color:${CM.text};margin:0 0 36px;">Skills &amp; Tools</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;" class="cm-skills-grid">${cats}</div>
    </div></section>`;
  }

  // Services (CleanMinimal)
  if (config.services?.enabled && (config.services.items ?? []).length > 0) {
    const svcs = config.services.items.map(svc => `
      <div style="background:${CM.bg};border:1px solid ${CM.border};border-radius:16px;overflow:hidden;margin-bottom:16px;${svc.imageUrl ? "display:grid;grid-template-columns:1fr 1fr;" : ""}">
        <div style="padding:28px;">
          <h3 style="font-family:Georgia,serif;font-size:20px;font-weight:800;color:${CM.text};margin:0 0 12px;">${escapeHtml(svc.title)}</h3>
          <p style="font-family:Inter,sans-serif;font-size:15px;line-height:1.75;color:${CM.muted};margin:0 0 ${svc.link ? "20px" : "0"};">${escapeHtml(svc.description)}</p>
          ${svc.link ? `<a href="${escapeAttr(safeUrl(svc.link))}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:10px 22px;background:${CM.text};color:${CM.bg};font-family:Inter,sans-serif;font-size:13px;font-weight:700;border-radius:8px;text-decoration:none;">View →</a>` : ""}
        </div>
        ${svc.imageUrl ? `<img src="${escapeAttr(safeImageUrl(svc.imageUrl))}" alt="" style="width:100%;height:100%;min-height:200px;object-fit:cover;display:block;" />` : ""}
      </div>`).join("");
    html += `<section style="padding:80px 32px;" id="services" class="cm-section"><div style="max-width:960px;margin:0 auto;">
      <p style="font-family:Inter,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${accent};margin-bottom:12px;">What I Do</p>
      <div style="width:48px;height:3px;background:${accent};border-radius:2px;margin-bottom:28px;"></div>
      <h2 style="font-family:Georgia,serif;font-size:clamp(32px,4vw,48px);font-weight:800;color:${CM.text};margin:0 0 36px;">Services</h2>
      ${svcs}
    </div></section>`;
  }

  // Projects
  if (config.projects.enabled && projects.length > 0) {
    const projs = projects.map(p => `
      <div style="background:${CM.bgAlt};border:1px solid ${CM.border};border-radius:16px;padding:28px;display:grid;grid-template-columns:${p.imageUrl ? "1fr 1fr" : "1fr"};gap:24px;align-items:start;" class="cm-project-card">
        ${p.imageUrl ? `<img src="${escapeAttr(safeImageUrl(p.imageUrl))}" alt="" style="width:100%;height:180px;object-fit:cover;border-radius:12px;border:1px solid ${CM.border};" />` : ""}
        <div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">${tagsHtml(p.tags, accentLight, accent)}</div>
          <h3 style="font-family:Georgia,serif;font-size:22px;font-weight:800;color:${CM.text};margin:0 0 10px;">${escapeHtml(p.customTitle || p.originalName)}</h3>
          <p style="font-family:Inter,sans-serif;font-size:15px;line-height:1.7;color:${CM.muted};margin:0 0 20px;">${escapeHtml(p.customDescription || p.originalDescription || "No description.")}</p>
          <div style="display:flex;gap:12px;">${projectLinks(p, accent)}</div>
        </div>
      </div>`).join("");
    html += `<section style="padding:80px 32px;background:${CM.bgAlt};" id="work" class="cm-section">
      <div style="overflow:hidden;margin-bottom:32px;" aria-hidden="true"><div class="cm-marquee-track" style="display:flex;white-space:nowrap;animation:cm-marquee 22s linear infinite;"><span style="font-size:clamp(48px,7vw,80px);font-weight:900;color:${CM.text};opacity:0.07;font-family:Georgia,serif;">PROJECTS · PROJECTS · PROJECTS · &nbsp;</span><span style="font-size:clamp(48px,7vw,80px);font-weight:900;color:${CM.text};opacity:0.07;font-family:Georgia,serif;">PROJECTS · PROJECTS · PROJECTS · &nbsp;</span></div></div>
      <div style="max-width:960px;margin:0 auto;">
      <p style="font-family:Inter,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${accent};margin-bottom:12px;">Selected Work</p>
      <div style="width:48px;height:3px;background:${accent};border-radius:2px;margin-bottom:28px;"></div>
      <h2 style="font-family:Georgia,serif;font-size:clamp(32px,4vw,48px);font-weight:800;color:${CM.text};margin:0 0 40px;">Projects</h2>
      <div style="display:flex;flex-direction:column;gap:20px;">${projs}</div>
    </div></section>`;
  }

  // Testimonials (CleanMinimal)
  if (config.testimonials?.enabled && (config.testimonials.items ?? []).length > 0) {
    const t = config.testimonials.items[0];
    const tCards = config.testimonials.items.map((tm, i) => `
      <div style="border-radius:24px;overflow:hidden;background:${accent};display:${tm.avatarUrl ? "grid" : "block"};grid-template-columns:${tm.avatarUrl ? "1fr 1fr" : "1fr"};${i > 0 ? "display:none;" : ""}">
        ${tm.avatarUrl ? `<img src="${escapeAttr(safeImageUrl(tm.avatarUrl))}" alt="" style="width:100%;height:340px;object-fit:cover;display:block;" />` : ""}
        <div style="padding:48px 40px;display:flex;flex-direction:column;justify-content:space-between;">
          <p style="font-size:clamp(15px,1.8vw,19px);line-height:1.75;color:#fff;font-style:italic;margin:0 0 32px;font-family:Georgia,serif;">"${escapeHtml(tm.quote)}"</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff;font-weight:700;font-family:Georgia,serif;">${escapeHtml(tm.name[0] ?? "?")}</div>
            <div>
              <div style="font-family:Inter,sans-serif;font-weight:700;color:#fff;font-size:15px;">${escapeHtml(tm.name)}</div>
              <div style="font-family:Inter,sans-serif;font-size:13px;color:rgba(255,255,255,0.8);">${escapeHtml(tm.role)}${tm.company ? `, ${escapeHtml(tm.company)}` : ""}</div>
            </div>
          </div>
        </div>
      </div>`).join("");
    html += `<section style="padding:80px 32px;" id="testimonials" class="cm-section">
      <div style="overflow:hidden;margin-bottom:32px;" aria-hidden="true"><div class="cm-marquee-track" style="display:flex;white-space:nowrap;animation:cm-marquee 22s linear infinite;"><span style="font-size:clamp(48px,7vw,80px);font-weight:900;color:${CM.text};opacity:0.07;font-family:Georgia,serif;">TESTIMONIALS · TESTIMONIALS · &nbsp;</span><span style="font-size:clamp(48px,7vw,80px);font-weight:900;color:${CM.text};opacity:0.07;font-family:Georgia,serif;">TESTIMONIALS · TESTIMONIALS · &nbsp;</span></div></div>
      <div style="max-width:960px;margin:0 auto;">
        <p style="font-family:Inter,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${accent};margin-bottom:12px;">Kind Words</p>
        <div style="width:48px;height:3px;background:${accent};border-radius:2px;margin-bottom:36px;"></div>
        ${tCards}
      </div>
    </section>`;
  }

  // Experience
  if (config.experience.enabled && config.experience.items?.length > 0) {
    const exp = config.experience.items.map(e => `
      <div style="border-left:3px solid ${accent};padding-left:20px;margin-bottom:24px;">
        <p style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:${CM.text};margin:0 0 4px;">${escapeHtml(e.role)}</p>
        <p style="font-family:Inter,sans-serif;font-size:14px;color:${accent};margin:0 0 4px;">${escapeHtml(e.company)}</p>
        <p style="font-family:Inter,sans-serif;font-size:12px;color:${CM.muted};margin:0 0 10px;">${escapeHtml(e.duration)}</p>
        ${e.description ? `<p style="font-family:Inter,sans-serif;font-size:15px;line-height:1.7;color:${CM.muted};margin:0;">${escapeHtml(e.description)}</p>` : ""}
      </div>`).join("");
    html += `<section style="padding:80px 32px;" id="experience" class="cm-section"><div style="max-width:960px;margin:0 auto;">
      <p style="font-family:Inter,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${accent};margin-bottom:12px;">Career</p>
      <div style="width:48px;height:3px;background:${accent};border-radius:2px;margin-bottom:28px;"></div>
      <h2 style="font-family:Georgia,serif;font-size:clamp(32px,4vw,48px);font-weight:800;color:${CM.text};margin:0 0 40px;">Experience</h2>
      ${exp}
    </div></section>`;
  }

  // Contact
  if (config.contact.enabled && c.email) {
    html += `<section style="padding:80px 32px;background:${CM.bgAlt};text-align:center;" id="contact" class="cm-section"><div style="max-width:600px;margin:0 auto;">
      <p style="font-family:Inter,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${accent};margin-bottom:12px;">Get In Touch</p>
      <div style="width:48px;height:3px;background:${accent};border-radius:2px;margin:0 auto 28px;"></div>
      <h2 style="font-family:Georgia,serif;font-size:clamp(32px,4vw,52px);font-weight:900;color:${CM.text};margin:0 0 16px;">${escapeHtml(c.headline || "Let's Connect")}</h2>
      <p style="font-family:Inter,sans-serif;font-size:17px;line-height:1.7;color:${CM.muted};margin:0 0 36px;">${escapeHtml(c.subtext || "I'm always open to interesting conversations and opportunities.")}</p>
      <a href="mailto:${escapeAttr(c.email)}" style="display:inline-block;padding:13px 32px;background:${CM.text};color:${CM.bg};font-family:Inter,sans-serif;font-size:14px;font-weight:700;border-radius:10px;text-decoration:none;">${escapeHtml(c.ctaLabel || "Send a Message")}</a>
      <div style="margin-top:32px;display:flex;gap:24px;justify-content:center;">${socialLinks(c, CM.muted)}</div>
    </div></section>`;
  }

  html += `<footer style="padding:24px 32px;text-align:center;color:${CM.muted};font-family:Inter,sans-serif;font-size:13px;border-top:1px solid ${CM.border};">
    <p>© ${year} ${name}. Built with AutoPort.</p>
  </footer>`;
  return html;
}

/* ═══════════════════════════════════════
   8. AURORA
═══════════════════════════════════════ */
const AR_DARK_BASE  = { bg: "#06080f", text: "#f0f4ff", muted: "#94a3b8", mutedDim: "#64748b", card: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)" };
const AR_LIGHT_BASE = { bg: "#f8faff", text: "#1a1a2e", muted: "#4a5568", mutedDim: "#6b7280", card: "rgba(0,0,0,0.04)", border: "rgba(0,0,0,0.09)" };

function renderAurora(config: PortfolioConfig): string {
  const name = escapeHtml(config.hero.name || "Portfolio");
  const projects = sorted(config.projects.items || []);
  const c = config.contact;
  const pal = getAuroraPalette(config);
  const isDark = config.theme?.darkMode !== false;
  const AR = isDark ? AR_DARK_BASE : AR_LIGHT_BASE;

  let html = `<style>
    .max{max-width:960px;margin:0 auto;padding:80px 24px;}
    .badge{display:inline-flex;align-items:center;padding:4px 12px;border-radius:6px;font-size:11px;font-weight:600;background:${pal.blob1};color:${pal.accent};border:1px solid ${pal.accent}33;}
    .badge-sec{display:inline-flex;align-items:center;padding:4px 12px;border-radius:6px;font-size:11px;font-weight:600;background:${pal.blob2};color:${pal.accentPurple};border:1px solid ${pal.accentPurple}33;}
    .card{background:${AR.card};border:1px solid ${AR.border};border-radius:16px;padding:28px;transition:transform 0.3s,box-shadow 0.3s,border-color 0.3s;}
    .card:hover{transform:translateY(-4px);box-shadow:0 20px 60px ${pal.blob1};border-color:${pal.accent}33;}
    .btn{display:inline-flex;align-items:center;gap:8px;padding:13px 28px;border-radius:10px;font-weight:700;font-size:14px;background:${pal.accent};color:${AR.bg};text-decoration:none;box-shadow:0 0 20px ${pal.blob1};transition:box-shadow 0.3s,transform 0.3s;}
    .btn:hover{box-shadow:0 0 40px ${pal.blob1};transform:translateY(-2px);}
    .btn-sec{display:inline-flex;align-items:center;gap:8px;padding:13px 28px;border-radius:10px;font-weight:700;font-size:14px;background:transparent;color:${pal.accentPurple};border:1px solid ${pal.accentPurple};text-decoration:none;transition:background 0.3s;}
    .btn-sec:hover{background:${pal.blob2};}
    .grid-bg{background-image:linear-gradient(${pal.blob1} 1px,transparent 1px),linear-gradient(90deg,${pal.blob1} 1px,transparent 1px);background-size:48px 48px;}
    @media(max-width:768px){
      .max{padding:60px 20px;}
      .ar-hero-grid{grid-template-columns:1fr!important;}
      .ar-hero-photo{display:none!important;}
      .ar-skills-grid{grid-template-columns:1fr 1fr!important;}
      .ar-projects-grid{grid-template-columns:1fr!important;}
    }
    @media(max-width:480px){
      .ar-skills-grid{grid-template-columns:1fr!important;}
    }
  </style>`;

  html += `<div style="background:${AR.bg};color:${AR.text};font-family:Inter,sans-serif;min-height:100vh;">`;

  if (config.hero.enabled) {
    html += `<section class="grid-bg" style="min-height:100vh;display:flex;align-items:center;padding:80px 24px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:-100px;left:20%;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,${pal.blob1},transparent 70%);filter:blur(80px);pointer-events:none;"></div>
      <div style="position:absolute;bottom:-100px;right:10%;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,${pal.blob2},transparent 70%);filter:blur(80px);pointer-events:none;"></div>
      <div class="max ar-hero-grid" style="display:grid;grid-template-columns:${config.hero.photoUrl ? "1fr 1fr" : "1fr"};gap:48px;align-items:center;position:relative;z-index:1;width:100%;">
        <div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
            <div style="width:8px;height:8px;border-radius:50%;background:${pal.accent};box-shadow:0 0 8px ${pal.accent};"></div>
            <span class="badge">Available for hire</span>
          </div>
          <h1 style="font-size:clamp(52px,9vw,88px);font-weight:900;letter-spacing:-0.04em;line-height:0.95;margin:0 0 10px;background:linear-gradient(135deg,${pal.accent},${pal.accentPurple},${pal.accentPink});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${escapeHtml(config.hero.name || "Your Name")}</h1>
          <p style="font-size:clamp(20px,3vw,28px);font-weight:700;color:${pal.accentPurple};margin:0 0 20px;">${escapeHtml(config.hero.title || "Developer")}</p>
          ${config.hero.bio ? `<p style="font-size:17px;line-height:1.7;color:${AR.muted};margin:0 0 32px;">${escapeHtml(config.hero.bio)}</p>` : ""}
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <a href="#projects" class="btn">View Projects</a>
            ${config.hero.ctaText && config.hero.ctaLink ? `<a href="${escapeAttr(safeUrl(config.hero.ctaLink))}" target="_blank" rel="noopener noreferrer" class="btn-sec">${escapeHtml(config.hero.ctaText)}</a>` : ""}
            ${config.hero.resumeUrl ? `<a href="${escapeAttr(safeUrl(config.hero.resumeUrl))}" target="_blank" rel="noopener noreferrer" class="btn-sec">Resume ↗</a>` : ""}
          </div>
        </div>
        ${config.hero.photoUrl ? `<div style="display:flex;justify-content:flex-end;" class="ar-hero-photo">
          <div style="position:relative;">
            <div style="position:absolute;inset:-2px;border-radius:18px;background:linear-gradient(135deg,${pal.accent},${pal.accentPurple},${pal.accentPink});opacity:0.6;"></div>
            <img src="${escapeAttr(safeImageUrl(config.hero.photoUrl))}" alt="" style="position:relative;width:280px;height:320px;object-fit:cover;border-radius:16px;display:block;" />
          </div>
        </div>` : ""}
      </div>
    </section>`;
  }

  if (config.about.enabled && (config.about.description || config.about.funFacts)) {
    html += `<section id="about"><div class="max">
      <span class="badge" style="margin-bottom:16px;display:inline-flex;">About</span>
      <h2 style="font-size:clamp(32px,5vw,52px);font-weight:900;letter-spacing:-0.03em;color:${AR.text};margin:8px 0 16px;">A bit about me</h2>
      <div style="width:48px;height:3px;background:linear-gradient(90deg,${pal.accent},${pal.accentPurple});border-radius:2px;margin-bottom:24px;"></div>
      ${config.about.description ? `<p style="font-size:17px;line-height:1.75;color:${AR.muted};margin:0 0 16px;max-width:680px;">${escapeHtml(config.about.description)}</p>` : ""}
      ${config.about.funFacts ? `<p style="font-size:15px;line-height:1.7;color:${AR.mutedDim};font-style:italic;margin:0;">${escapeHtml(config.about.funFacts)}</p>` : ""}
    </div></section>`;
  }

  if (config.skills.enabled && config.skills.categories?.some(cat => cat.skills?.length > 0)) {
    const cats = config.skills.categories.filter(cat => cat.skills?.length > 0).map(cat => `
      <div class="card">
        <h3 style="color:${pal.accentPurple};font-size:13px;font-weight:700;margin:0 0 12px;">${escapeHtml(cat.name)}</h3>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${cat.skills.map(sk => `<span class="badge-sec" style="font-size:11px;">${escapeHtml(sk.name)}</span>`).join("")}
        </div>
      </div>`).join("");
    html += `<section id="skills" style="background:${AR.card};"><div class="max">
      <span class="badge-sec" style="margin-bottom:16px;display:inline-flex;">Tech Stack</span>
      <h2 style="font-size:clamp(32px,5vw,52px);font-weight:900;letter-spacing:-0.03em;color:${AR.text};margin:8px 0 32px;">Skills</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;" class="ar-skills-grid">${cats}</div>
    </div></section>`;
  }

  if (config.projects.enabled && projects.length > 0) {
    const projs = projects.map(proj => `
      <div class="card" style="display:flex;flex-direction:column;">
        ${proj.imageUrl ? `<img src="${escapeAttr(safeImageUrl(proj.imageUrl))}" alt="" style="width:100%;height:160px;object-fit:cover;border-radius:10px;margin-bottom:16px;" />` : ""}
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">${tagsHtml(proj.tags, pal.blob1, pal.accent)}</div>
        <h3 style="color:${AR.text};font-size:17px;font-weight:700;margin:0 0 8px;">${escapeHtml(proj.customTitle || proj.originalName)}</h3>
        <p style="color:${AR.muted};font-size:14px;line-height:1.7;flex:1;margin:0 0 16px;">${escapeHtml(proj.customDescription || proj.originalDescription || "No description.")}</p>
        <div style="display:flex;gap:10px;">${projectLinks(proj, pal.accent)}</div>
      </div>`).join("");
    html += `<section id="projects"><div class="max">
      <span class="badge" style="margin-bottom:16px;display:inline-flex;">Work</span>
      <h2 style="font-size:clamp(32px,5vw,52px);font-weight:900;letter-spacing:-0.03em;color:${AR.text};margin:8px 0 32px;">Projects</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;" class="ar-projects-grid">${projs}</div>
    </div></section>`;
  }

  if (config.experience.enabled && config.experience.items?.length > 0) {
    const exp = config.experience.items.map(e => `
      <div class="card" style="border-left:3px solid ${pal.accent};margin-bottom:12px;">
        <p style="font-weight:700;color:${AR.text};margin:0 0 4px;">${escapeHtml(e.role)}</p>
        <p style="color:${pal.accent};font-size:13px;margin:0 0 4px;">${escapeHtml(e.company)}</p>
        <span class="badge-sec" style="margin-bottom:8px;font-size:11px;display:inline-flex;">${escapeHtml(e.duration)}</span>
        ${e.description ? `<p style="color:${AR.muted};font-size:14px;line-height:1.7;margin:8px 0 0;">${escapeHtml(e.description)}</p>` : ""}
      </div>`).join("");
    html += `<section id="experience" style="background:${AR.card};"><div class="max">
      <span class="badge" style="margin-bottom:16px;display:inline-flex;">Career</span>
      <h2 style="font-size:clamp(32px,5vw,52px);font-weight:900;letter-spacing:-0.03em;color:${AR.text};margin:8px 0 32px;">Experience</h2>
      ${exp}
    </div></section>`;
  }

  if (config.contact.enabled && c.email) {
    html += `<section class="grid-bg" id="contact" style="text-align:center;position:relative;overflow:hidden;"><div class="max" style="position:relative;z-index:1;">
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,${pal.blob1},transparent 70%);filter:blur(40px);pointer-events:none;"></div>
      <span class="badge" style="margin-bottom:20px;display:inline-flex;">Let's Connect</span>
      <h2 style="font-size:clamp(36px,6vw,64px);font-weight:900;letter-spacing:-0.03em;background:linear-gradient(135deg,${pal.accent},${pal.accentPurple});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin:8px 0 16px;">${escapeHtml(c.headline || "Get In Touch")}</h2>
      <p style="font-size:17px;line-height:1.7;color:${AR.muted};max-width:440px;margin:0 auto 36px;">${escapeHtml(c.subtext || "Open to new opportunities and collaborations.")}</p>
      <a href="mailto:${escapeAttr(c.email)}" class="btn">${escapeHtml(c.ctaLabel || "Send Message →")}</a>
      <div style="margin-top:32px;display:flex;gap:24px;justify-content:center;">${socialLinks(c, AR.mutedDim)}</div>
    </div></section>`;
  }

  html += `<footer style="padding:32px 24px;text-align:center;color:${AR.mutedDim};font-size:12px;border-top:1px solid ${AR.border};">
    <p>© ${year} ${name}. Built with AutoPort.</p>
  </footer>`;

  html += `</div>`;
  return html;
}

/* ═══════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════ */
export function getFullPageHTML(templateId: TemplateId, config: PortfolioConfig): string {
  const title = escapeAttr(`${config.hero.name || "Portfolio"} - Portfolio`);

  const renderers: Record<TemplateId, (c: PortfolioConfig) => string> = {
    "minimal-pro": renderMinimalPro,
    "clean-minimal": renderCleanMinimal,
    "aurora": renderAurora,
  };

  const render = renderers[templateId] ?? renderMinimalPro;
  const bodyContent = render(config);

  const isDark = config.theme?.darkMode;
  const bodyBg: Record<TemplateId, string> = {
    "minimal-pro":   isDark === false ? MP_LIGHT.bg  : MP_DARK.bg,
    "clean-minimal": isDark === true  ? CM_EXPORT_DARK.bg : CM_EXPORT_LIGHT.bg,
    "aurora":        isDark === false ? AR_LIGHT_BASE.bg  : AR_DARK_BASE.bg,
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    html{scroll-behavior:smooth;box-sizing:border-box;}*,*::before,*::after{box-sizing:inherit;}
    body{margin:0;padding:0;background:${bodyBg[templateId] ?? "#0a192f"};}
    a{text-decoration:none;}
    img{max-width:100%;display:block;}
  </style>
</head>
<body>
${bodyContent}
</body>
</html>`;
}
