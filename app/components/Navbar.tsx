"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Menu, X, Zap } from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isAuthenticated = status === "authenticated";
  const isDashboard = pathname?.startsWith("/dashboard");

  const displayName = session?.user?.name ?? session?.user?.email ?? "You";
  const initial = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-slate-800/60 backdrop-blur-md transition-all duration-200 ${
        scrolled ? "bg-slate-950/90" : "bg-transparent"
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 text-[15px] font-bold tracking-tight text-slate-50">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 shadow-sm shadow-amber-500/30">
              <Zap className="h-4 w-4 text-slate-950" aria-hidden />
            </div>
            AutoPort
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <nav className="flex items-center gap-6 text-sm text-slate-400">
                <Link
                  href="/dashboard"
                  className={`transition-colors hover:text-slate-100 ${isDashboard ? "font-medium text-slate-100" : ""}`}
                >
                  Dashboard
                </Link>
              </nav>
            ) : (
              <nav className="flex items-center gap-6 text-sm text-slate-400">
                <a href="#features" className="transition-colors hover:text-slate-100">Features</a>
                <a href="#how-it-works" className="transition-colors hover:text-slate-100">How it works</a>
                <a href="#templates" className="transition-colors hover:text-slate-100">Templates</a>
              </nav>
            )}

            {isAuthenticated && session?.user ? (
              <div className="relative">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-100 transition-colors hover:bg-white/10"
                  onClick={() => setOpen((v) => !v)}
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-[11px] font-bold text-slate-950">
                    {initial}
                  </span>
                  <span className="max-w-[120px] truncate">{displayName}</span>
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-slate-950/95 shadow-xl shadow-black/40 backdrop-blur-md">
                    <button
                      type="button"
                      className="block w-full rounded-t-xl px-3 py-2.5 text-left text-sm text-slate-100 hover:bg-white/5"
                      onClick={() => { setOpen(false); router.push("/dashboard"); }}
                    >
                      Dashboard
                    </button>
                    <button
                      type="button"
                      className="block w-full cursor-not-allowed px-3 py-2.5 text-left text-sm text-slate-500 opacity-60"
                      disabled
                    >
                      Settings (soon)
                    </button>
                    <div className="my-1 border-t border-white/10" />
                    <button
                      type="button"
                      className="block w-full rounded-b-xl px-3 py-2.5 text-left text-sm text-red-300 hover:bg-red-500/10"
                      onClick={handleSignOut}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/signin"
                className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-sm shadow-amber-500/20 transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Get Started Free
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-300 hover:bg-white/5 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-slate-950/95 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1 text-sm">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="rounded-lg px-2 py-2 text-slate-200 transition-colors hover:bg-white/5 hover:text-white"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <a href="#features" className="rounded-lg px-2 py-2 text-slate-200 transition-colors hover:bg-white/5 hover:text-white">Features</a>
                <a href="#how-it-works" className="rounded-lg px-2 py-2 text-slate-200 transition-colors hover:bg-white/5 hover:text-white">How it works</a>
                <a href="#templates" className="rounded-lg px-2 py-2 text-slate-200 transition-colors hover:bg-white/5 hover:text-white">Templates</a>
              </>
            )}
            <div className="mt-2 border-t border-white/10 pt-2">
              {isAuthenticated ? (
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center rounded-lg bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-100 transition-colors hover:bg-white/10"
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              ) : (
                <Link
                  href="/signin"
                  className="block text-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400"
                >
                  Get Started Free
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
