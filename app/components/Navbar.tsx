"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";

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

  const isDashboard = pathname?.startsWith("/dashboard");

  const baseClasses =
    "sticky top-0 z-50 w-full transition-colors border-b border-slate-800 bg-slate-900/95 backdrop-blur";
  const scrolledClasses = scrolled ? "bg-slate-900/95" : "";

  const displayName = session?.user?.name ?? session?.user?.email ?? "You";
  const initial = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className={`${baseClasses} ${scrolledClasses}`}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-amber-300 bg-clip-text text-transparent"
            >
              AutoPort
            </Link>
          </div>

          {/* Right side - Nav links + User info */}
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6 text-sm text-slate-200">
              <Link
                href="#how-it-works"
                className="hover:text-white transition-colors"
              >
                How it works
              </Link>
              <Link
                href="/dashboard"
                className={`hover:text-white transition-colors ${
                  isDashboard ? "text-white font-semibold" : ""
                }`}
              >
                Dashboard
              </Link>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {status === "authenticated" && session?.user ? (
                <div className="relative">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-slate-100 hover:bg-white/10 transition-colors"
                    onClick={() => setOpen((v) => !v)}
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-semibold text-white">
                      {initial}
                    </span>
                    <span className="max-w-[120px] truncate">{displayName}</span>
                  </button>
                  {open && (
                    <div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-slate-950/95 shadow-lg backdrop-blur">
                      <button
                        type="button"
                        className="block w-full px-3 py-2 text-left text-sm text-slate-100 hover:bg-white/5 rounded-t-xl"
                        onClick={() => router.push("/dashboard")}
                      >
                        Dashboard
                      </button>
                      <button
                        type="button"
                        className="block w-full px-3 py-2 text-left text-sm text-slate-500 cursor-not-allowed opacity-60"
                        disabled
                      >
                        Settings (soon)
                      </button>
                      <div className="my-1 border-t border-white/10" />
                      <button
                        type="button"
                        className="block w-full px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10 rounded-b-xl"
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
                  className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition-colors hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-200 hover:bg-white/5 md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-slate-950/95 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-2 text-sm text-slate-200">
            <Link
              href="#how-it-works"
              className="py-1 hover:text-white transition-colors"
            >
              How it works
            </Link>
            <Link
              href="/dashboard"
              className="py-1 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            {status === "authenticated" && session?.user ? (
              <button
                type="button"
                className="mt-2 inline-flex items-center justify-center rounded-lg bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10 transition-colors"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/signin"
                className="mt-2 inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-600 transition-colors"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

