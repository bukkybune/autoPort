"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Github,
  Palette,
  Sparkles,
  Twitter,
  Wand2,
} from "lucide-react";

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="group relative rounded-2xl border border-slate-800/70 bg-slate-900/40 p-6 sm:p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-[0_0_0_1px_rgba(59,130,246,0.25),0_18px_50px_-20px_rgba(59,130,246,0.35)]">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/25 to-purple-600/20 text-blue-200 ring-1 ring-white/10">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-50">{title}</h3>
      <p className="mt-2 text-slate-400">{description}</p>
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_55%)]" />
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
      <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden />
      <span>{children}</span>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow ? (
        <p className="text-sm font-semibold tracking-wide uppercase text-blue-200/80">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-50">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-lg text-slate-400">{subtitle}</p>
      ) : null}
    </div>
  );
}

export default function LandingPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
          <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading…</p>
        </div>
      </main>
    );
  }

  if (status === "authenticated") {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Redirecting to dashboard…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(59,130,246,0.22),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_90%_10%,rgba(168,85,247,0.20),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_10%_100%,rgba(245,158,11,0.12),transparent_55%)]" />
      </div>

      {/* Hero */}
      <section className="relative w-full px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl pt-16 pb-14 sm:pt-20 sm:pb-20">
          <div className="mx-auto max-w-5xl text-center ap-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
              <Sparkles className="h-4 w-4 text-blue-200" aria-hidden />
              <span>Turn repos into a portfolio</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-50">
              Turn Your Projects into a Portfolio
            </h1>
            <p className="mt-6 text-xl text-slate-400">
              Create a professional portfolio from your repositories in minutes.
              No coding required.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 ap-fade-up-200">
              <Link
                href="/signin"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href="#example"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-7 py-3.5 text-base font-semibold text-slate-100 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                See Example
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 ap-fade-up-400">
              <Badge>100% Free</Badge>
              <Badge>Quick Sign-up</Badge>
              <Badge>Export Ready</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="example"
        className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
      >
        <div className="mx-auto w-full max-w-7xl">
        <div className="ap-fade-up">
          <SectionHeading title="Everything You Need" />
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3 sm:gap-8 ap-fade-up-200">
          <FeatureCard
            title="Automatic Import"
            description="Pull repos from GitHub in seconds. No manual copying—just enter your username."
            icon={<Github className="h-6 w-6" aria-hidden />}
          />
          <FeatureCard
            title="Beautiful Templates"
            description="Choose from professional designs that make your best projects stand out."
            icon={<Palette className="h-6 w-6" aria-hidden />}
          />
          <FeatureCard
            title="Export & Share"
            description="Download your portfolio or publish it online to share with recruiters and clients."
              icon={<Download className="h-6 w-6" aria-hidden />}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
      >
        <div className="mx-auto w-full max-w-7xl">
        <div className="ap-fade-up">
          <SectionHeading
            title="Build Your Portfolio in 3 Steps"
            subtitle="A simple workflow that gets you from code repositories to shareable portfolio fast."
          />
        </div>

          <div className="mt-12 grid gap-6 lg:gap-8 lg:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch ap-fade-up-200">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                1
              </div>
            <h3 className="mt-3 text-xl font-semibold text-slate-50">
              Connect GitHub
            </h3>
            <p className="mt-2 text-slate-400">Enter your username.</p>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <ArrowRight className="h-7 w-7 text-slate-500" aria-hidden />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              2
            </div>
            <h3 className="mt-3 text-xl font-semibold text-slate-50">
              Select &amp; Customize
            </h3>
            <p className="mt-2 text-slate-400">
              Pick projects, edit details.
            </p>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <ArrowRight className="h-7 w-7 text-slate-500" aria-hidden />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              3
            </div>
            <h3 className="mt-3 text-xl font-semibold text-slate-50">
              Export &amp; Share
            </h3>
              <p className="mt-2 text-slate-400">Download or publish.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-10 sm:p-14 shadow-xl shadow-black/30 backdrop-blur ap-fade-up">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-50">
                Ready to showcase your work?
              </h2>
              <p className="mt-3 text-slate-400">Takes less than 5 minutes.</p>
            </div>
            <Link
              href="/signin"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-8 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Create Your Portfolio
              <Wand2 className="h-5 w-5" aria-hidden />
            </Link>
          </div>
        </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-400">
              © 2026 AutoPort
            </div>

            <nav className="flex gap-6 text-sm text-slate-400">
              <Link href="#example" className="hover:text-slate-50 transition-colors">
                About
              </Link>
              <Link href="#how-it-works" className="hover:text-slate-50 transition-colors">
                How It Works
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-50 transition-colors"
              >
                GitHub
              </a>
            </nav>

            <div className="flex gap-4 text-slate-400">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="rounded-lg p-2 hover:bg-white/10 hover:text-slate-50 transition-colors"
              >
                <Github className="h-5 w-5" aria-hidden />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="rounded-lg p-2 hover:bg-white/10 hover:text-slate-50 transition-colors"
              >
                <Twitter className="h-5 w-5" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

