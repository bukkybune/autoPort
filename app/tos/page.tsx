import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — AutoPort",
  description: "AutoPort terms of service.",
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-16">
      <div className="mx-auto max-w-2xl space-y-8 text-slate-300">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Terms of Service</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: April 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-100">1. Acceptance</h2>
          <p className="text-sm leading-relaxed">
            By creating an account or using AutoPort you agree to these terms. If you do not agree,
            do not use the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-100">2. Use of the service</h2>
          <p className="text-sm leading-relaxed">
            AutoPort is provided for lawful personal and professional use. You may not use it to
            upload, generate, or distribute content that is unlawful, abusive, or infringes on
            third-party rights.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-100">3. Your content</h2>
          <p className="text-sm leading-relaxed">
            You retain ownership of all content you submit. By submitting content you grant
            AutoPort a limited, non-exclusive licence to store and display it solely for the
            purpose of providing the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-100">4. Account termination</h2>
          <p className="text-sm leading-relaxed">
            You may delete your account at any time from Settings. We reserve the right to suspend
            or terminate accounts that violate these terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-100">5. Disclaimer of warranties</h2>
          <p className="text-sm leading-relaxed">
            The service is provided &ldquo;as is&rdquo; without warranties of any kind. We do not
            guarantee uptime, data retention, or fitness for a particular purpose.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-100">6. Limitation of liability</h2>
          <p className="text-sm leading-relaxed">
            To the maximum extent permitted by law, AutoPort shall not be liable for any indirect,
            incidental, or consequential damages arising from use of the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-100">7. Changes to these terms</h2>
          <p className="text-sm leading-relaxed">
            We may update these terms from time to time. Continued use of the service after changes
            are posted constitutes acceptance of the new terms.
          </p>
        </section>

        <div className="border-t border-slate-800 pt-6">
          <Link href="/" className="text-sm text-amber-400 hover:text-amber-300">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
