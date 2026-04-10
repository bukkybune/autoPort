import Link from "next/link";
import { Zap, Github, Palette, Download, ChevronRight } from "lucide-react";

export const metadata = { title: "Help & Documentation — AutoPort" };

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-sm font-bold">
        {n}
      </div>
      <div className="pt-0.5">
        <p className="font-semibold text-slate-100 mb-1">{title}</p>
        <div className="text-sm text-slate-400 leading-relaxed space-y-1">{children}</div>
      </div>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-b border-slate-800 py-4 last:border-0">
      <p className="font-medium text-slate-200 mb-1">{q}</p>
      <p className="text-sm text-slate-400 leading-relaxed">{a}</p>
    </div>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-amber-400">{icon}</span>
        <h2 className="font-semibold text-slate-100">{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

export default function HelpPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-10">

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 mb-4">
            <Zap className="h-3.5 w-3.5" /> Documentation
          </div>
          <h1 className="text-3xl font-bold text-slate-50">Help & Documentation</h1>
          <p className="mt-2 text-slate-400">Everything you need to build and export your developer portfolio.</p>
        </div>

        {/* Getting Started */}
        <Card icon={<Github className="h-5 w-5" />} title="Getting Started">
          <Step n={1} title="Create an account">
            <p>Sign up with your email and password, or use Google or GitHub OAuth for one-click sign-in.</p>
          </Step>
          <Step n={2} title="Connect GitHub & select repos">
            <p>From the Dashboard, click <strong className="text-slate-300">Connect GitHub</strong> to authorize AutoPort. Your public repositories will appear — check the ones you want to showcase in your portfolio.</p>
            <p>You can select up to any number of repos. Use the search box to filter by name.</p>
          </Step>
          <Step n={3} title="Customize your portfolio">
            <p>Click <strong className="text-slate-300">Customize Portfolio</strong> to open the live editor. Edit each section in the left panel and see your changes in real time in the preview.</p>
          </Step>
          <Step n={4} title="Export">
            <p>Once you are happy with your portfolio, click <strong className="text-slate-300">Choose Template →</strong> then pick a template and export as a standalone HTML file you can host anywhere.</p>
          </Step>
        </Card>

        {/* Customize sections */}
        <Card icon={<Palette className="h-5 w-5" />} title="Customizing Your Portfolio">
          <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
            <div>
              <p className="font-semibold text-slate-200 mb-1">Sections</p>
              <p>Toggle sections on/off using the checkboxes in the left sidebar. Available sections: Hero, About Me, Skills, Projects, Experience, Contact.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-200 mb-1">Hero</p>
              <p>Set your name, title/role, short bio, profile photo URL, a CTA button, and a Resume URL (paste a link to your hosted PDF — Google Drive, Dropbox, etc.).</p>
            </div>
            <div>
              <p className="font-semibold text-slate-200 mb-1">Projects</p>
              <p>Each project card shows the repo name, description, tags, and optional links. Click the pencil icon on any project to edit its title, description, tags, image URL, and demo URL. Drag the grip handle to reorder projects.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-200 mb-1">Skills</p>
              <p>Add skill categories (e.g. Frontend, Backend, Tools) and individual skills with levels (Beginner, Intermediate, Expert). You can rename categories and add as many skills as you like.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-200 mb-1">Experience</p>
              <p>Add work experience entries with company, role, duration, and description. Enable the section using the sidebar checkbox first.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-200 mb-1">Contact</p>
              <p>Set your email, headline, subtext, and button label — customize the wording to fit your situation (job seeker, freelancer, student, etc.). Add social links: GitHub, LinkedIn, Twitter/X, Website, Medium, Dev.to, YouTube.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-200 mb-1">Theme & Colors</p>
              <p>Choose from three templates: <em>Minimal Pro</em> (inspired by the classic dev portfolio style), <em>Clean & Minimal</em> (editorial serif design), and <em>Aurora</em> (glassmorphism with gradient accents). Select a color scheme or create a fully custom palette. Toggle between Light and Dark mode per template.</p>
            </div>
          </div>
        </Card>

        {/* Export */}
        <Card icon={<Download className="h-5 w-5" />} title="Exporting & Hosting">
          <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
            <p>AutoPort exports your portfolio as a <strong className="text-slate-300">single self-contained HTML file</strong> — no frameworks, no dependencies, no build step. You can host it anywhere:</p>
            <ul className="space-y-1.5 pl-4">
              {[
                "GitHub Pages — push the file to a repo and enable Pages",
                "Netlify Drop — drag and drop the file at netlify.com/drop",
                "Vercel — deploy as a static site",
                "Any web host — upload via FTP or cPanel file manager",
                "Your own domain — works with any static hosting provider",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
                  {item}
                </li>
              ))}
            </ul>
            <p>The exported file includes all styles inline, Google Fonts loaded from CDN, and responsive layouts that work on mobile, tablet, and desktop.</p>
          </div>
        </Card>

        {/* FAQ */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="font-semibold text-slate-100 mb-5">Frequently Asked Questions</h2>
          <div>
            <FAQ
              q="Can I update my portfolio after exporting?"
              a="Yes — just come back to AutoPort, make your changes, and export again. The new file replaces your old one on your hosting provider."
            />
            <FAQ
              q="Do my repos need to be public?"
              a="AutoPort fetches your public repositories via the GitHub API. Private repos are not listed. You can still manually add projects with custom titles and descriptions."
            />
            <FAQ
              q="Can I add projects that aren't GitHub repos?"
              a="Not directly via import, but you can edit any project card to change its title, description, image, and links — effectively turning it into any project you want."
            />
            <FAQ
              q="Where should I host my resume PDF?"
              a="Upload your PDF to Google Drive, Dropbox, or any cloud storage, then paste the shareable link into the Resume URL field in the Hero section. Make sure the link is set to public/anyone with the link."
            />
            <FAQ
              q="Why don't I see a password change option in Settings?"
              a="Password change is only available for email/password accounts. If you signed up with Google or GitHub, your password is managed by that provider."
            />
            <FAQ
              q="Is my data saved between sessions?"
              a="Your portfolio configuration is saved in your browser's session storage while you work and is also persisted across your current session. Exporting saves a permanent copy as an HTML file."
            />
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-center">
          <p className="text-slate-300 mb-4">Ready to build your portfolio?</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
          >
            Go to Dashboard <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </main>
  );
}
