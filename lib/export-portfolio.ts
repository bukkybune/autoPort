import type { PortfolioConfig } from "@/app/types/portfolio";
import type { CustomizedProject } from "@/app/types/customize";

export type TemplateId =
  | "minimal-pro"
  | "clean-minimal"
  | "aurora";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function escapeAttr(s: string): string { return escapeHtml(s); }

const sorted = (items: CustomizedProject[]) => [...items].sort((a, b) => a.order - b.order);
const year = new Date().getFullYear();

/* ─────────── shared helpers ─────────── */
function projectLinks(p: CustomizedProject, accentColor: string): string {
  const demo = p.demoUrl ? `<a href="${escapeAttr(p.demoUrl)}" target="_blank" rel="noopener noreferrer" style="color:${accentColor};font-size:13px;">Live Demo →</a>` : "";
  const gh = p.showGithubLink && p.githubUrl ? `<a href="${escapeAttr(p.githubUrl)}" target="_blank" rel="noopener noreferrer" style="color:${accentColor};font-size:13px;">GitHub →</a>` : "";
  return [demo, gh].filter(Boolean).join("&nbsp;&nbsp;");
}
function tagsHtml(tags: string[], bg: string, color: string): string {
  return tags.slice(0, 6).map(t => `<span style="display:inline-flex;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:500;background:${bg};color:${color};">${escapeHtml(t)}</span>`).join(" ");
}
function socialLinks(contact: PortfolioConfig["contact"], color: string): string {
  return [
    contact.github ? `<a href="${escapeAttr(contact.github)}" target="_blank" rel="noopener noreferrer" style="color:${color};font-size:13px;">GitHub</a>` : "",
    contact.linkedin ? `<a href="${escapeAttr(contact.linkedin)}" target="_blank" rel="noopener noreferrer" style="color:${color};font-size:13px;">LinkedIn</a>` : "",
    contact.twitter ? `<a href="${escapeAttr(contact.twitter)}" target="_blank" rel="noopener noreferrer" style="color:${color};font-size:13px;">Twitter</a>` : "",
  ].filter(Boolean).join("&nbsp;&nbsp;&nbsp;");
}

/* ═══════════════════════════════════════
   1. MINIMAL PRO  (Brittany Chiang navy)
═══════════════════════════════════════ */
function renderMinimalPro(config: PortfolioConfig): string {
  const name = escapeHtml(config.hero.name || "Portfolio");
  const projects = sorted(config.projects.items || []);
  const c = config.contact;

  let html = "";

  // Sidebar socials
  html += `<div class="social-side">
    ${c.github ? `<a href="${escapeAttr(c.github)}" target="_blank" rel="noopener noreferrer" class="muted" style="color:#8892b0">GH</a>` : ""}
    ${c.linkedin ? `<a href="${escapeAttr(c.linkedin)}" target="_blank" rel="noopener noreferrer" class="muted" style="color:#8892b0">LI</a>` : ""}
    ${c.twitter ? `<a href="${escapeAttr(c.twitter)}" target="_blank" rel="noopener noreferrer" class="muted" style="color:#8892b0">TW</a>` : ""}
    <div class="v-line"></div>
  </div>
  ${c.email ? `<div class="email-side"><a href="mailto:${escapeAttr(c.email)}">${escapeHtml(c.email)}</a><div class="v-line"></div></div>` : ""}`;

  html += `<main>`;

  // Hero
  if (config.hero.enabled) {
    html += `<section style="min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:80px 0;">
      <p class="accent fade1" style="font-size:14px;margin-bottom:16px;">Hi, my name is</p>
      <h1 class="fade2" style="font-size:clamp(40px,8vw,72px);font-weight:900;color:#ccd6f6;line-height:1;margin:0 0 8px;font-family:Inter,sans-serif;">${escapeHtml(config.hero.name || "Your Name")}</h1>
      <h2 class="fade3" style="font-size:clamp(32px,6vw,60px);font-weight:900;color:#8892b0;line-height:1.1;margin:0 0 24px;font-family:Inter,sans-serif;">${escapeHtml(config.hero.title || "Developer")}</h2>
      ${config.hero.bio ? `<p class="muted fade4" style="max-width:500px;font-size:18px;line-height:1.7;margin-bottom:40px;">${escapeHtml(config.hero.bio)}</p>` : ""}
      <div class="fade5" style="display:flex;gap:16px;flex-wrap:wrap;">
        <a href="#projects" class="btn">Check out my work!</a>
        ${config.hero.ctaText && config.hero.ctaLink ? `<a href="${escapeAttr(config.hero.ctaLink)}" target="_blank" rel="noopener noreferrer" class="btn" style="background:#64ffda;color:#0a192f;border-color:#64ffda;">${escapeHtml(config.hero.ctaText)}</a>` : ""}
      </div>
    </section>`;
  }

  // About
  if (config.about.enabled && (config.about.description || config.about.funFacts)) {
    html += `<section style="padding:80px 0;" id="about">
      <div class="section-head">
        <span class="accent" style="font-size:18px;margin-right:12px;">01.</span>
        <h2 style="font-size:28px;font-weight:700;color:#ccd6f6;font-family:Inter,sans-serif;margin:0;">About Me</h2>
        <div class="divider"></div>
      </div>
      <div style="display:grid;grid-template-columns:${config.hero.photoUrl ? "1fr 200px" : "1fr"};gap:40px;align-items:start;">
        <div>
          ${config.about.description ? `<p class="muted" style="font-size:17px;line-height:1.7;margin-bottom:16px;">${escapeHtml(config.about.description)}</p>` : ""}
          ${config.about.funFacts ? `<p class="muted" style="font-size:15px;line-height:1.7;">${escapeHtml(config.about.funFacts)}</p>` : ""}
        </div>
        ${config.hero.photoUrl ? `<div><img src="${escapeAttr(config.hero.photoUrl)}" alt="" style="width:200px;height:200px;object-fit:cover;border-radius:8px;filter:grayscale(30%);" /></div>` : ""}
      </div>
    </section>`;
  }

  // Skills
  if (config.skills.enabled && config.skills.categories?.some(c => c.skills?.length > 0)) {
    const cats = config.skills.categories.filter(c => c.skills?.length > 0).map(cat => `
      <div style="background:#112240;border:1px solid #1d3461;border-radius:8px;padding:20px;">
        <h3 style="color:#64ffda;font-size:13px;font-weight:600;margin:0 0 12px;">▹ ${escapeHtml(cat.name)}</h3>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${cat.skills.map(sk => `<span style="color:#8892b0;font-size:12px;">${escapeHtml(sk.name)}</span>`).join("&nbsp;·&nbsp;")}
        </div>
      </div>`).join("");
    html += `<section style="padding:80px 0;" id="skills">
      <div class="section-head">
        <span class="accent" style="font-size:18px;margin-right:12px;">02.</span>
        <h2 style="font-size:28px;font-weight:700;color:#ccd6f6;font-family:Inter,sans-serif;margin:0;">Skills</h2>
        <div class="divider"></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;">${cats}</div>
    </section>`;
  }

  // Projects
  if (config.projects.enabled && projects.length > 0) {
    const projs = projects.map((p) => {
      return `<div style="margin-bottom:80px;">
        <p style="color:#64ffda;font-size:12px;margin-bottom:8px;">Featured Project</p>
        <h3 style="font-size:24px;font-weight:700;color:#ccd6f6;font-family:Inter,sans-serif;margin:0 0 16px;">${escapeHtml(p.customTitle || p.originalName)}</h3>
        <div style="background:#112240;border-radius:8px;padding:20px;margin-bottom:16px;">
          <p style="color:#8892b0;font-size:15px;line-height:1.7;margin:0;">${escapeHtml(p.customDescription || p.originalDescription || "No description.")}</p>
        </div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px;">
          ${tagsHtml(p.tags, "transparent", "#8892b0")}
        </div>
        <div style="display:flex;gap:16px;">${projectLinks(p, "#64ffda")}</div>
      </div>`;
    }).join("");
    html += `<section style="padding:80px 0;" id="projects">
      <div class="section-head">
        <span class="accent" style="font-size:18px;margin-right:12px;">03.</span>
        <h2 style="font-size:28px;font-weight:700;color:#ccd6f6;font-family:Inter,sans-serif;margin:0;">Things I've Built</h2>
        <div class="divider"></div>
      </div>
      ${projs}
    </section>`;
  }

  // Experience
  if (config.experience.enabled && config.experience.items?.length > 0) {
    const exp = config.experience.items.map(e => `
      <div style="background:#112240;border-left:2px solid #64ffda;padding:20px;border-radius:0 8px 8px 0;margin-bottom:16px;">
        <p style="font-weight:700;color:#ccd6f6;margin:0 0 4px;">${escapeHtml(e.role)}</p>
        <p style="color:#64ffda;font-size:13px;margin:0 0 4px;">${escapeHtml(e.company)}</p>
        <p style="color:#8892b0;font-size:12px;margin:0 0 8px;">${escapeHtml(e.duration)}</p>
        ${e.description ? `<p style="color:#8892b0;font-size:14px;line-height:1.7;margin:0;">${escapeHtml(e.description)}</p>` : ""}
      </div>`).join("");
    html += `<section style="padding:80px 0;" id="experience">
      <div class="section-head">
        <span class="accent" style="font-size:18px;margin-right:12px;">04.</span>
        <h2 style="font-size:28px;font-weight:700;color:#ccd6f6;font-family:Inter,sans-serif;margin:0;">Experience</h2>
        <div class="divider"></div>
      </div>
      ${exp}
    </section>`;
  }

  // Contact
  if (config.contact.enabled && c.email) {
    html += `<section style="padding:120px 0;text-align:center;" id="contact">
      <p class="accent" style="font-size:13px;margin-bottom:16px;">What's Next?</p>
      <h2 style="font-size:clamp(36px,5vw,52px);font-weight:700;color:#ccd6f6;font-family:Inter,sans-serif;margin:0 0 16px;">${escapeHtml(c.headline || "Get In Touch")}</h2>
      <p class="muted" style="max-width:400px;margin:0 auto 40px;font-size:17px;line-height:1.7;">${escapeHtml(c.subtext || "I'm always open to new opportunities. Feel free to reach out!")}</p>
      <a href="mailto:${escapeAttr(c.email)}" class="btn">${escapeHtml(c.ctaLabel || "Say Hello")}</a>
    </section>`;
  }

  html += `<footer style="padding:32px 0;text-align:center;color:#8892b0;font-size:12px;border-top:1px solid #233554;">
    <p>© ${year} ${name}. Built with AutoPort.</p>
  </footer>`;

  html += `</main>`;
  return html;
}


/* ═══════════════════════════════════════
   3. CLEAN MINIMAL  (Warm Earth light)
═══════════════════════════════════════ */
function renderCleanMinimal(config: PortfolioConfig): string {
  const name = escapeHtml(config.hero.name || "Portfolio");
  const projects = sorted(config.projects.items || []);
  const c = config.contact;

  let html = "";

  // Nav
  html += `<nav style="position:sticky;top:0;z-index:10;background:rgba(250,249,246,0.92);backdrop-filter:blur(12px);border-bottom:1px solid #e5e0d8;padding:16px 32px;display:flex;align-items:center;justify-content:space-between;">
    <span style="font-family:Inter,sans-serif;font-weight:700;font-size:15px;color:#2c2c2c;">${name}</span>
    <div style="display:flex;gap:24px;">
      ${config.projects.enabled ? `<a href="#work" style="font-family:Inter,sans-serif;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#5a5a5a;text-decoration:none;">Work</a>` : ""}
      ${config.contact.enabled ? `<a href="#contact" style="font-family:Inter,sans-serif;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#5a5a5a;text-decoration:none;">Contact</a>` : ""}
    </div>
  </nav>`;

  // Hero
  if (config.hero.enabled) {
    html += `<section style="padding:100px 32px 80px;max-width:960px;margin:0 auto;">
      <div style="display:grid;grid-template-columns:${config.hero.photoUrl ? "1fr 1fr" : "1fr"};gap:60px;align-items:center;">
        <div>
          <p style="font-family:Inter,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#b45309;margin-bottom:16px;">Hello, I'm</p>
          <h1 style="font-family:Georgia,serif;font-size:clamp(48px,7vw,76px);font-weight:900;line-height:1.05;color:#2c2c2c;margin:0 0 16px;">${escapeHtml(config.hero.name || "Your Name")}</h1>
          <p style="font-size:22px;color:#5a5a5a;font-style:italic;font-family:Georgia,serif;margin:0 0 24px;">${escapeHtml(config.hero.title || "Developer")}</p>
          ${config.hero.bio ? `<p style="font-family:Inter,sans-serif;font-size:17px;line-height:1.75;color:#5a5a5a;margin:0 0 36px;">${escapeHtml(config.hero.bio)}</p>` : ""}
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <a href="#work" style="display:inline-block;padding:13px 32px;background:#2c2c2c;color:#faf9f6;font-family:Inter,sans-serif;font-size:14px;font-weight:700;border-radius:10px;text-decoration:none;">View My Work</a>
            ${config.hero.ctaText && config.hero.ctaLink ? `<a href="${escapeAttr(config.hero.ctaLink)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:13px 32px;background:transparent;color:#2c2c2c;font-family:Inter,sans-serif;font-size:14px;font-weight:700;border-radius:10px;text-decoration:none;border:1.5px solid #2c2c2c;">${escapeHtml(config.hero.ctaText)}</a>` : ""}
          </div>
        </div>
        ${config.hero.photoUrl ? `<div style="position:relative;">
          <div style="position:absolute;inset:-12px;background:rgba(180,83,9,0.08);border-radius:20px;transform:rotate(2deg);"></div>
          <img src="${escapeAttr(config.hero.photoUrl)}" alt="" style="position:relative;width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:18px;border:1px solid #e5e0d8;" />
        </div>` : ""}
      </div>
    </section>`;
  }

  // About
  if (config.about.enabled && (config.about.description || config.about.funFacts)) {
    html += `<section style="padding:80px 32px;background:#f5f3ee;" id="about"><div style="max-width:960px;margin:0 auto;">
      <p style="font-family:Inter,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#b45309;margin-bottom:12px;">About</p>
      <div style="width:48px;height:3px;background:#b45309;border-radius:2px;margin-bottom:28px;"></div>
      <h2 style="font-family:Georgia,serif;font-size:clamp(32px,4vw,48px);font-weight:800;color:#2c2c2c;margin:0 0 32px;">A bit about me</h2>
      ${config.about.description ? `<p style="font-family:Inter,sans-serif;font-size:17px;line-height:1.75;color:#5a5a5a;max-width:680px;margin:0 0 16px;">${escapeHtml(config.about.description)}</p>` : ""}
      ${config.about.funFacts ? `<p style="font-family:Georgia,serif;font-size:16px;line-height:1.7;color:#5a5a5a;font-style:italic;">${escapeHtml(config.about.funFacts)}</p>` : ""}
    </div></section>`;
  }

  // Skills
  if (config.skills.enabled && config.skills.categories?.some(c => c.skills?.length > 0)) {
    const cats = config.skills.categories.filter(c => c.skills?.length > 0).map(cat => `
      <div style="background:#f5f3ee;border:1px solid #e5e0d8;border-radius:16px;padding:24px;">
        <h3 style="font-family:Inter,sans-serif;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#b45309;margin:0 0 14px;">${escapeHtml(cat.name)}</h3>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${cat.skills.map(sk => `<span style="display:inline-flex;padding:5px 12px;border-radius:9999px;font-family:Inter,sans-serif;font-size:13px;background:#ede9e3;color:#5a5a5a;border:1px solid #e5e0d8;">${escapeHtml(sk.name)}</span>`).join("")}
        </div>
      </div>`).join("");
    html += `<section style="padding:80px 32px;" id="skills"><div style="max-width:960px;margin:0 auto;">
      <p style="font-family:Inter,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#b45309;margin-bottom:12px;">Expertise</p>
      <div style="width:48px;height:3px;background:#b45309;border-radius:2px;margin-bottom:28px;"></div>
      <h2 style="font-family:Georgia,serif;font-size:clamp(32px,4vw,48px);font-weight:800;color:#2c2c2c;margin:0 0 36px;">Skills & Tools</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;">${cats}</div>
    </div></section>`;
  }

  // Projects
  if (config.projects.enabled && projects.length > 0) {
    const projs = projects.map(p => `
      <div style="background:#f5f3ee;border:1px solid #e5e0d8;border-radius:16px;padding:28px;display:grid;grid-template-columns:${p.imageUrl ? "1fr 1fr" : "1fr"};gap:24px;align-items:start;">
        ${p.imageUrl ? `<img src="${escapeAttr(p.imageUrl)}" alt="" style="width:100%;height:180px;object-fit:cover;border-radius:12px;border:1px solid #e5e0d8;" />` : ""}
        <div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">${tagsHtml(p.tags, "#fef3c7", "#b45309")}</div>
          <h3 style="font-family:Georgia,serif;font-size:22px;font-weight:800;color:#2c2c2c;margin:0 0 10px;">${escapeHtml(p.customTitle || p.originalName)}</h3>
          <p style="font-family:Inter,sans-serif;font-size:15px;line-height:1.7;color:#5a5a5a;margin:0 0 20px;">${escapeHtml(p.customDescription || p.originalDescription || "No description.")}</p>
          <div style="display:flex;gap:12px;">${projectLinks(p, "#b45309")}</div>
        </div>
      </div>`).join("");
    html += `<section style="padding:80px 32px;background:#f5f3ee;" id="work"><div style="max-width:960px;margin:0 auto;">
      <p style="font-family:Inter,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#b45309;margin-bottom:12px;">Selected Work</p>
      <div style="width:48px;height:3px;background:#b45309;border-radius:2px;margin-bottom:28px;"></div>
      <h2 style="font-family:Georgia,serif;font-size:clamp(32px,4vw,48px);font-weight:800;color:#2c2c2c;margin:0 0 40px;">Projects</h2>
      <div style="display:flex;flex-direction:column;gap:20px;">${projs}</div>
    </div></section>`;
  }

  // Experience
  if (config.experience.enabled && config.experience.items?.length > 0) {
    const exp = config.experience.items.map(e => `
      <div style="border-left:3px solid #b45309;padding-left:20px;margin-bottom:24px;">
        <p style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#2c2c2c;margin:0 0 4px;">${escapeHtml(e.role)}</p>
        <p style="font-family:Inter,sans-serif;font-size:14px;color:#b45309;margin:0 0 4px;">${escapeHtml(e.company)}</p>
        <p style="font-family:Inter,sans-serif;font-size:12px;color:#5a5a5a;margin:0 0 10px;">${escapeHtml(e.duration)}</p>
        ${e.description ? `<p style="font-family:Inter,sans-serif;font-size:15px;line-height:1.7;color:#5a5a5a;margin:0;">${escapeHtml(e.description)}</p>` : ""}
      </div>`).join("");
    html += `<section style="padding:80px 32px;" id="experience"><div style="max-width:960px;margin:0 auto;">
      <p style="font-family:Inter,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#b45309;margin-bottom:12px;">Career</p>
      <div style="width:48px;height:3px;background:#b45309;border-radius:2px;margin-bottom:28px;"></div>
      <h2 style="font-family:Georgia,serif;font-size:clamp(32px,4vw,48px);font-weight:800;color:#2c2c2c;margin:0 0 40px;">Experience</h2>
      ${exp}
    </div></section>`;
  }

  // Contact
  if (config.contact.enabled && c.email) {
    html += `<section style="padding:80px 32px;background:#f5f3ee;text-align:center;" id="contact"><div style="max-width:600px;margin:0 auto;">
      <p style="font-family:Inter,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#b45309;margin-bottom:12px;">Get In Touch</p>
      <div style="width:48px;height:3px;background:#b45309;border-radius:2px;margin:0 auto 28px;"></div>
      <h2 style="font-family:Georgia,serif;font-size:clamp(32px,4vw,52px);font-weight:900;color:#2c2c2c;margin:0 0 16px;">${escapeHtml(c.headline || "Let's Connect")}</h2>
      <p style="font-family:Inter,sans-serif;font-size:17px;line-height:1.7;color:#5a5a5a;margin:0 0 36px;">${escapeHtml(c.subtext || "I'm always open to interesting conversations and opportunities.")}</p>
      <a href="mailto:${escapeAttr(c.email)}" style="display:inline-block;padding:13px 32px;background:#2c2c2c;color:#faf9f6;font-family:Inter,sans-serif;font-size:14px;font-weight:700;border-radius:10px;text-decoration:none;">${escapeHtml(c.ctaLabel || "Send a Message")}</a>
      <div style="margin-top:32px;display:flex;gap:24px;justify-content:center;">${socialLinks(c, "#5a5a5a")}</div>
    </div></section>`;
  }

  html += `<footer style="padding:24px 32px;text-align:center;color:#5a5a5a;font-family:Inter,sans-serif;font-size:13px;border-top:1px solid #e5e0d8;">
    <p>© ${year} ${name}. Built with AutoPort.</p>
  </footer>`;
  return html;
}

/* ═══════════════════════════════════════
   8. AURORA
═══════════════════════════════════════ */
function renderAurora(config: PortfolioConfig): string {
  const name = escapeHtml(config.hero.name || "Portfolio");
  const projects = sorted(config.projects.items || []);
  const c = config.contact;

  let html = `<style>
    .max{max-width:960px;margin:0 auto;padding:80px 24px;}
    .badge{display:inline-flex;align-items:center;padding:4px 12px;border-radius:6px;font-size:11px;font-weight:600;background:rgba(255,45,120,0.08);color:#ff2d78;border:1px solid rgba(255,45,120,0.2);}
    .badge-cyan{display:inline-flex;align-items:center;padding:4px 12px;border-radius:6px;font-size:11px;font-weight:600;background:rgba(0,229,255,0.08);color:#00e5ff;border:1px solid rgba(0,229,255,0.2);}
    .card{background:#0d0d14;border:1px solid #1a1a2e;border-radius:16px;padding:28px;transition:transform 0.3s,box-shadow 0.3s,border-color 0.3s;}
    .card:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(255,45,120,0.1);border-color:rgba(255,45,120,0.25);}
    .btn{display:inline-flex;align-items:center;gap:8px;padding:13px 28px;border-radius:10px;font-weight:700;font-size:14px;background:#ff2d78;color:#fff;text-decoration:none;box-shadow:0 0 20px rgba(255,45,120,0.4);transition:box-shadow 0.3s,transform 0.3s;}
    .btn:hover{box-shadow:0 0 40px rgba(255,45,120,0.7);transform:translateY(-2px);}
    .btn-cyan{display:inline-flex;align-items:center;gap:8px;padding:13px 28px;border-radius:10px;font-weight:700;font-size:14px;background:transparent;color:#00e5ff;border:1px solid #00e5ff;text-decoration:none;transition:background 0.3s,box-shadow 0.3s;}
    .btn-cyan:hover{background:rgba(0,229,255,0.08);box-shadow:0 0 30px rgba(0,229,255,0.4);}
    .grid-bg{background-image:linear-gradient(rgba(255,45,120,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,45,120,0.03) 1px,transparent 1px);background-size:48px 48px;}
  </style>`;

  html += `<div style="background:#050508;color:#f0f0ff;font-family:Inter,sans-serif;min-height:100vh;">`;

  if (config.hero.enabled) {
    html += `<section class="grid-bg" style="min-height:100vh;display:flex;align-items:center;padding:80px 24px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:25%;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(255,45,120,0.08),transparent 70%);filter:blur(80px);pointer-events:none;"></div>
      <div class="max" style="display:grid;grid-template-columns:${config.hero.photoUrl ? "1fr 1fr" : "1fr"};gap:48px;align-items:center;position:relative;z-index:1;">
        <div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
            <div style="width:8px;height:8px;border-radius:50%;background:#ff2d78;box-shadow:0 0 8px #ff2d78;"></div>
            <span class="badge">Available for hire</span>
          </div>
          <h1 style="font-size:clamp(52px,9vw,88px);font-weight:900;letter-spacing:-0.04em;line-height:0.95;margin:0 0 10px;text-shadow:0 0 20px rgba(255,45,120,0.8),0 0 60px rgba(255,45,120,0.4);">${escapeHtml(config.hero.name || "Your Name")}</h1>
          <p style="font-size:clamp(20px,3vw,28px);font-weight:700;color:#00e5ff;text-shadow:0 0 20px rgba(0,229,255,0.8);margin:0 0 20px;">${escapeHtml(config.hero.title || "Developer")}</p>
          ${config.hero.bio ? `<p style="font-size:17px;line-height:1.7;color:#a0a0c0;margin:0 0 32px;">${escapeHtml(config.hero.bio)}</p>` : ""}
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <a href="#projects" class="btn">View Projects</a>
            ${config.hero.ctaText && config.hero.ctaLink ? `<a href="${escapeAttr(config.hero.ctaLink)}" target="_blank" rel="noopener noreferrer" class="btn-cyan">${escapeHtml(config.hero.ctaText)}</a>` : ""}
          </div>
        </div>
        ${config.hero.photoUrl ? `<div style="display:flex;justify-content:flex-end;">
          <div style="position:relative;">
            <div style="position:absolute;inset:-2px;border-radius:18px;background:linear-gradient(135deg,#ff2d78,#00e5ff);opacity:0.6;"></div>
            <img src="${escapeAttr(config.hero.photoUrl)}" alt="" style="position:relative;width:280px;height:320px;object-fit:cover;border-radius:16px;display:block;" />
          </div>
        </div>` : ""}
      </div>
    </section>`;
  }

  if (config.about.enabled && (config.about.description || config.about.funFacts)) {
    html += `<section id="about"><div class="max">
      <span class="badge" style="margin-bottom:16px;display:inline-flex;">About</span>
      <h2 style="font-size:clamp(32px,5vw,52px);font-weight:900;letter-spacing:-0.03em;color:#f0f0ff;margin:8px 0;"><span style="display:block;width:48px;height:3px;background:linear-gradient(90deg,#ff2d78,#00e5ff);border-radius:2px;margin-top:12px;"></span></h2>
      <div style="margin-top:16px;">
        ${config.about.description ? `<p style="font-size:17px;line-height:1.75;color:#a0a0c0;margin:0 0 16px;">${escapeHtml(config.about.description)}</p>` : ""}
        ${config.about.funFacts ? `<p style="font-size:15px;line-height:1.7;color:#606080;font-style:italic;margin:0;">${escapeHtml(config.about.funFacts)}</p>` : ""}
      </div>
    </div></section>`;
  }

  if (config.skills.enabled && config.skills.categories?.some(cat => cat.skills?.length > 0)) {
    const cats = config.skills.categories.filter(c => c.skills?.length > 0).map(cat => `
      <div class="card">
        <h3 style="color:#00e5ff;font-size:13px;font-weight:700;margin:0 0 12px;">${escapeHtml(cat.name)}</h3>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${cat.skills.map(sk => `<span class="badge-cyan" style="font-size:11px;">${escapeHtml(sk.name)}</span>`).join("")}
        </div>
      </div>`).join("");
    html += `<section id="skills" style="background:#0d0d14;"><div class="max">
      <span class="badge-cyan" style="margin-bottom:16px;display:inline-flex;">Tech Stack</span>
      <h2 style="font-size:clamp(32px,5vw,52px);font-weight:900;letter-spacing:-0.03em;color:#f0f0ff;margin:8px 0 32px;">Skills</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;">${cats}</div>
    </div></section>`;
  }

  if (config.projects.enabled && projects.length > 0) {
    const projs = projects.map(p => `
      <div class="card" style="display:flex;flex-direction:column;">
        ${p.imageUrl ? `<img src="${escapeAttr(p.imageUrl)}" alt="" style="width:100%;height:160px;object-fit:cover;border-radius:10px;margin-bottom:16px;" />` : ""}
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">${tagsHtml(p.tags, "rgba(255,45,120,0.08)", "#ff2d78")}</div>
        <h3 style="color:#f0f0ff;font-size:17px;font-weight:700;margin:0 0 8px;">${escapeHtml(p.customTitle || p.originalName)}</h3>
        <p style="color:#a0a0c0;font-size:14px;line-height:1.7;flex:1;margin:0 0 16px;">${escapeHtml(p.customDescription || p.originalDescription || "No description.")}</p>
        <div style="display:flex;gap:10px;">${projectLinks(p, "#ff2d78")}</div>
      </div>`).join("");
    html += `<section id="projects"><div class="max">
      <span class="badge" style="margin-bottom:16px;display:inline-flex;">Work</span>
      <h2 style="font-size:clamp(32px,5vw,52px);font-weight:900;letter-spacing:-0.03em;color:#f0f0ff;margin:8px 0 32px;">Projects</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">${projs}</div>
    </div></section>`;
  }

  if (config.experience.enabled && config.experience.items?.length > 0) {
    const exp = config.experience.items.map(e => `
      <div class="card" style="border-left:3px solid #ff2d78;margin-bottom:12px;">
        <p style="font-weight:700;color:#f0f0ff;margin:0 0 4px;">${escapeHtml(e.role)}</p>
        <p style="color:#ff2d78;font-size:13px;margin:0 0 4px;">${escapeHtml(e.company)}</p>
        <span class="badge-cyan" style="margin-bottom:8px;font-size:11px;">${escapeHtml(e.duration)}</span>
        ${e.description ? `<p style="color:#a0a0c0;font-size:14px;line-height:1.7;margin:8px 0 0;">${escapeHtml(e.description)}</p>` : ""}
      </div>`).join("");
    html += `<section id="experience" style="background:#0d0d14;"><div class="max">
      <span class="badge" style="margin-bottom:16px;display:inline-flex;">Career</span>
      <h2 style="font-size:clamp(32px,5vw,52px);font-weight:900;letter-spacing:-0.03em;color:#f0f0ff;margin:8px 0 32px;">Experience</h2>
      ${exp}
    </div></section>`;
  }

  if (config.contact.enabled && c.email) {
    html += `<section class="grid-bg" id="contact" style="text-align:center;position:relative;overflow:hidden;"><div class="max" style="position:relative;z-index:1;">
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(255,45,120,0.08),transparent 70%);filter:blur(40px);"></div>
      <span class="badge" style="margin-bottom:20px;display:inline-flex;">Let's Connect</span>
      <h2 style="font-size:clamp(36px,6vw,64px);font-weight:900;letter-spacing:-0.03em;color:#f0f0ff;text-shadow:0 0 20px rgba(255,45,120,0.8);margin:8px 0 16px;">${escapeHtml(c.headline || "Get In Touch")}</h2>
      <p style="font-size:17px;line-height:1.7;color:#a0a0c0;max-width:440px;margin:0 auto 36px;">${escapeHtml(c.subtext || "Open to new opportunities and collaborations.")}</p>
      <a href="mailto:${escapeAttr(c.email)}" class="btn">${escapeHtml(c.ctaLabel || "Send Message →")}</a>
      <div style="margin-top:32px;display:flex;gap:24px;justify-content:center;">${socialLinks(c, "#606080")}</div>
    </div></section>`;
  }

  html += `<footer style="padding:32px 24px;text-align:center;color:#606080;font-size:12px;border-top:1px solid #1a1a2e;">
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

  // Per-template body background
  const bodyBg: Record<TemplateId, string> = {
    "minimal-pro": "#0a192f",
    "clean-minimal": "#faf9f6",
    "aurora": "#06080f",
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    html{scroll-behavior:smooth;box-sizing:border-box;}*,*::before,*::after{box-sizing:inherit;}
    body{margin:0;padding:0;background:${bodyBg[templateId] ?? "#0a192f"};}
    a{text-decoration:none;}
    img{max-width:100%;display:block;}
    -webkit-background-clip:text{-webkit-background-clip:text;}
  </style>
</head>
<body>
${bodyContent}
</body>
</html>`;
}
