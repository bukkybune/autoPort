"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, Github, Palette, Download } from "lucide-react";

/* ─── Template mini-mockups ─── */

function MinimalProMockup() {
  return (
    <div style={{ background: "#0a192f", height: "100%", borderRadius: 8, overflow: "hidden", fontFamily: "monospace" }}>
      <div style={{ borderBottom: "1px solid rgba(100,255,218,0.15)", padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 36, height: 3, background: "#64ffda", borderRadius: 2 }} />
        <div style={{ display: "flex", gap: 8 }}>
          {["01", "02", "03"].map((n) => (
            <span key={n} style={{ color: "#64ffda", fontSize: 8, opacity: 0.6 }}>{n}</span>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", height: "calc(100% - 29px)" }}>
        <div style={{ width: 24, borderRight: "1px solid rgba(100,255,218,0.08)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: 12, gap: 6 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ width: 2, height: 12, background: "rgba(100,255,218,0.2)", borderRadius: 1 }} />
          ))}
        </div>
        <div style={{ flex: 1, padding: "16px 12px" }}>
          <div style={{ color: "#64ffda", fontSize: 8, marginBottom: 5 }}>Hi, my name is</div>
          <div style={{ fontFamily: "sans-serif", fontWeight: 800, fontSize: 15, color: "#ccd6f6", letterSpacing: -0.5, marginBottom: 3 }}>Alex Chen.</div>
          <div style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 11, color: "#8892b0", marginBottom: 10 }}>I build for the web.</div>
          <div style={{ fontSize: 7, color: "#8892b0", lineHeight: 1.5, maxWidth: 130, marginBottom: 12 }}>Full-stack developer specializing in React &amp; Node.js.</div>
          <div style={{ display: "flex", gap: 5 }}>
            {["React", "Node.js", "TS"].map((t) => (
              <span key={t} style={{ border: "1px solid rgba(100,255,218,0.35)", color: "#64ffda", padding: "2px 5px", borderRadius: 3, fontSize: 7 }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ width: 20, borderLeft: "1px solid rgba(100,255,218,0.08)", display: "flex", alignItems: "flex-end", paddingBottom: 14, justifyContent: "center" }}>
          <span style={{ color: "#64ffda", fontSize: 6, writingMode: "vertical-rl", letterSpacing: 2, opacity: 0.4 }}>alex@dev.io</span>
        </div>
      </div>
    </div>
  );
}

function CleanMinimalMockup() {
  return (
    <div style={{ background: "#faf9f6", height: "100%", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ borderBottom: "1px solid #e5e0d8", padding: "9px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: -0.2, color: "#2c2c2c" }}>Portfolio</div>
        <div style={{ display: "flex", gap: 10 }}>
          {["Work", "About", "Contact"].map((n) => (
            <span key={n} style={{ color: "#5a5a5a", fontSize: 7 }}>{n}</span>
          ))}
        </div>
      </div>
      <div style={{ padding: "16px 14px" }}>
        <div style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: "0.12em", color: "#b45309", marginBottom: 6 }}>Designer &amp; Developer</div>
        <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 18, color: "#2c2c2c", letterSpacing: -0.6, lineHeight: 1 }}>Alex Chen</div>
        <div style={{ width: 20, height: 2, background: "#b45309", marginTop: 7, marginBottom: 8 }} />
        <div style={{ color: "#5a5a5a", fontSize: 7, lineHeight: 1.6, maxWidth: 140 }}>Building beautiful digital experiences with clean, intentional design.</div>
        <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
          <div style={{ background: "#2c2c2c", color: "#faf9f6", padding: "4px 10px", borderRadius: 5, fontSize: 7, fontWeight: 700 }}>View Work →</div>
          <div style={{ border: "1px solid #2c2c2c", color: "#2c2c2c", padding: "4px 10px", borderRadius: 5, fontSize: 7, fontWeight: 700 }}>Resume</div>
        </div>
      </div>
    </div>
  );
}

function NeonRabelMockup() {
  return (
    <div style={{ background: "#050508", height: "100%", borderRadius: 8, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,45,120,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,45,120,0.05) 1px, transparent 1px)", backgroundSize: "14px 14px" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ borderBottom: "1px solid rgba(255,45,120,0.2)", padding: "9px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 900, fontSize: 10, letterSpacing: -0.2, background: "linear-gradient(90deg,#ff2d78,#00e5ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ALEX.DEV</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["Work", "Skills", "Contact"].map((n) => (
              <span key={n} style={{ color: "rgba(240,240,255,0.4)", fontSize: 7 }}>{n}</span>
            ))}
          </div>
        </div>
        <div style={{ padding: "14px 14px" }}>
          <div style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: "0.12em", color: "#ff2d78", marginBottom: 5 }}>Full-Stack Developer</div>
          <div style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: 16, color: "#f0f0ff", letterSpacing: -0.5, lineHeight: 1.1, textShadow: "0 0 16px rgba(255,45,120,0.4)", whiteSpace: "pre-line" }}>Alex Chen</div>
          <div style={{ marginTop: 10, display: "flex", gap: 4, flexWrap: "wrap" }}>
            {["React", "Node"].map((t) => (
              <span key={t} style={{ background: "rgba(255,45,120,0.12)", border: "1px solid rgba(255,45,120,0.3)", color: "#ff2d78", padding: "2px 6px", borderRadius: 3, fontSize: 7 }}>{t}</span>
            ))}
            <span style={{ background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.3)", color: "#00e5ff", padding: "2px 6px", borderRadius: 3, fontSize: 7 }}>TypeScript</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ background: "linear-gradient(90deg,#ff2d78,#bf5fff)", color: "#fff", padding: "5px 12px", borderRadius: 5, fontSize: 7, fontWeight: 700, display: "inline-block" }}>Get In Touch →</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const TEMPLATES = [
  { id: "minimal-pro", name: "Minimal Pro", desc: "Dark navy, fixed sidebar, numbered sections", Mockup: MinimalProMockup },
  { id: "clean-minimal", name: "Clean Minimal", desc: "Light editorial, warm serif headings", Mockup: CleanMinimalMockup },
  { id: "neon-rabel", name: "Neon Rabel", desc: "Cyberpunk grid, neon pink & cyan accents", Mockup: NeonRabelMockup },
];

export default function LandingPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" role="status" aria-label="Loading" />
      </main>
    );
  }

  const year = new Date().getFullYear();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">

      {/* Background glows — amber only */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(245,158,11,0.13),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_85%_15%,rgba(245,158,11,0.07),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_10%_85%,rgba(245,158,11,0.05),transparent_55%)]" />
      </div>

      {/* ── HERO ── */}
      <section className="relative w-full px-4 sm:px-6 lg:px-8 pt-20 pb-20 sm:pt-28 sm:pb-28">
        <div className="mx-auto max-w-4xl text-center ap-fade-up">

          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-sm text-amber-200/90">
            <Github className="h-4 w-4" aria-hidden />
            <span>Turn GitHub repos into a portfolio</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.06]">
            <span className="text-slate-50">Your GitHub repos.</span>
            <br />
            <span className="text-amber-400">One beautiful portfolio.</span>
          </h1>

          <p className="mt-7 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed ap-fade-up-200">
            Connect GitHub, pick your best projects, choose a template —
            your portfolio is live in minutes. No design skills needed.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 ap-fade-up-200">
            <Link
              href="/signin"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-8 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href="#templates"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-slate-200 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Browse Templates
            </a>
          </div>

          {/* Trust strip */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-500 ap-fade-up-400">
            <span>✦ 100% free</span>
            <span>✦ No credit card</span>
            <span>✦ Export as HTML</span>
            <span>✦ Host anywhere</span>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14 ap-fade-up">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/80 mb-3">Why AutoPort</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-50">Built for developers who ship</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3 ap-fade-up-200">
            {[
              {
                icon: <Github className="h-5 w-5" aria-hidden />,
                title: "One-click GitHub import",
                body: "Connect your account and all your repos are imported instantly. No manual copying, no CSV exports, no API keys to manage.",
              },
              {
                icon: <Palette className="h-5 w-5" aria-hidden />,
                title: "3 distinct templates",
                body: "Minimal Pro, Clean Minimal, Neon Rabel — three professional designs, each crafted for a different aesthetic and industry.",
              },
              {
                icon: <Download className="h-5 w-5" aria-hidden />,
                title: "Export & host anywhere",
                body: "Download as a single HTML file. Host on GitHub Pages, Vercel, Netlify, or any static host — completely free, forever yours.",
              },
            ].map(({ icon, title, body }) => (
              <div
                key={title}
                className="group rounded-2xl border border-slate-800/80 bg-slate-900/50 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-[0_20px_50px_-15px_rgba(245,158,11,0.12)]"
              >
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700/50 bg-slate-800/80 text-amber-400">
                  {icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-50 mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14 ap-fade-up">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/80 mb-3">The process</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-50">Portfolio live in 3 steps</h2>
          </div>

          <div className="relative ap-fade-up-200">
            {/* Connecting line (desktop only) */}
            <div
              className="hidden lg:block absolute h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent"
              style={{ top: 36, left: "calc(16.67% + 28px)", right: "calc(16.67% + 28px)" }}
            />

            <div className="grid gap-6 lg:grid-cols-3">
              {[
                {
                  n: "01",
                  icon: <Github className="h-5 w-5" aria-hidden />,
                  title: "Connect GitHub",
                  body: "Sign in and grant read access. We fetch your repos — names, descriptions, stars, languages — automatically in seconds.",
                },
                {
                  n: "02",
                  icon: <Palette className="h-5 w-5" aria-hidden />,
                  title: "Customize & pick a template",
                  body: "Select which projects to showcase, edit titles and descriptions, reorder with drag & drop, then pick the template that fits you.",
                },
                {
                  n: "03",
                  icon: <Download className="h-5 w-5" aria-hidden />,
                  title: "Export & share",
                  body: "Download a self-contained HTML file. Share it with recruiters, host it on GitHub Pages, or publish it on Vercel for free.",
                },
              ].map(({ n, icon, title, body }) => (
                <div key={n} className="relative rounded-2xl border border-slate-800/70 bg-slate-900/40 p-7 backdrop-blur-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400">
                      {icon}
                    </div>
                    <span className="font-mono text-xs text-amber-500/50 tracking-widest">{n}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-50 mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TEMPLATES ── */}
      <section id="templates" className="w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14 ap-fade-up">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/80 mb-3">Templates</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-50">Choose your style</h2>
            <p className="mt-3 text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
              Three professional designs. Each one is crafted for a different aesthetic and exported as clean, standalone HTML.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 ap-fade-up-200">
            {TEMPLATES.map(({ id, name, desc, Mockup }) => (
              <div
                key={id}
                className="group rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-500/30 hover:shadow-[0_24px_60px_-15px_rgba(245,158,11,0.12)]"
              >
                <div className="h-52 p-3">
                  <Mockup />
                </div>
                <div className="px-5 py-4 border-t border-slate-800/60">
                  <h3 className="font-semibold text-slate-100 text-sm">{name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-20 pb-28">
        <div className="mx-auto max-w-6xl">
          <div className="relative rounded-3xl border border-amber-500/15 bg-gradient-to-br from-amber-500/10 via-slate-900/70 to-slate-900/70 p-10 sm:p-16 overflow-hidden ap-fade-up">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-50">Ready to showcase your work?</h2>
                <p className="mt-3 text-slate-400">Takes less than 5 minutes. No design skills needed.</p>
              </div>
              <Link
                href="/signin"
                className="flex-shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-8 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Create Your Portfolio
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full border-t border-slate-800/50 bg-slate-900/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500">© {year} AutoPort. Built for developers.</div>
          <nav className="flex gap-6 text-sm text-slate-500" aria-label="Footer navigation">
            <a href="#features" className="hover:text-slate-300 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-300 transition-colors">How it works</a>
            <a href="#templates" className="hover:text-slate-300 transition-colors">Templates</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
