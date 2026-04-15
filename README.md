# AutoPort

A full-stack developer portfolio builder. Connect your GitHub, select your projects, customize every section, pick a template, and publish a shareable portfolio — no design experience needed.

---

## Features

- **GitHub import** — OAuth connect pulls your public repos (name, description, stars, language). Select which ones to showcase.
- **Full customization** — Edit hero, about, skills, experience, services, testimonials, and contact sections with a live preview panel.
- **3 templates** — Minimal Pro, Clean & Minimal, Aurora. Switch instantly with live preview.
- **8 color themes** — Navy, Purple, Teal, Green, Warm Earth, Ocean Glass, Sunset Warm, Gradient Purple. Custom color support.
- **Publish & share** — One click to publish your portfolio at `/p/your-name`. Public, shareable, no login required to view.
- **Export as HTML** — Download a self-contained HTML file you can host anywhere.
- **Server persistence** — Portfolio config is saved to Supabase so it's always there when you come back.
- **Auth** — Sign in with GitHub, Google, or email/password (bcrypt hashed).
- **Drag-and-drop** — Reorder projects with drag handles.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth v5 (JWT) |
| ORM | Prisma 7 |
| Database | PostgreSQL via Supabase |
| Drag & Drop | @dnd-kit |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- GitHub OAuth app (for GitHub sign-in + repo import)
- Google OAuth app (optional, for Google sign-in)

### 1. Clone and install

```bash
git clone https://github.com/bukkybune/autoPort.git
cd autoPort
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

```env
# Database (Supabase — use the session-mode pooler, port 5432)
DATABASE_URL="postgresql://postgres.xxxx:password@aws-0-region.pooler.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="your-secret"          # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"   # your production URL in prod

# GitHub OAuth (for sign-in)
GITHUB_ID="..."
GITHUB_SECRET="..."

# Google OAuth (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# GitHub OAuth (for repo import — separate app)
GITHUB_REPO_CLIENT_ID="..."
GITHUB_REPO_CLIENT_SECRET="..."

# Token encryption (32-byte base64 key)
GITHUB_TOKEN_ENCRYPTION_KEY="..."     # openssl rand -base64 32
```

### 3. Run database migrations

```bash
# Push schema to your Supabase database
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

> **Note:** Use port `5432` (session-mode pooler) in `DATABASE_URL` for migrations. Port `6543` (transaction mode) works for the app at runtime but blocks Prisma's migration engine.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## GitHub OAuth Apps

You need **two separate** GitHub OAuth apps:

| App | Purpose | Callback URL |
|---|---|---|
| Sign-in app | `GITHUB_ID` / `GITHUB_SECRET` | `http://localhost:3000/api/auth/callback/github` |
| Repo import app | `GITHUB_REPO_CLIENT_ID` / `GITHUB_REPO_CLIENT_SECRET` | `http://localhost:3000/api/connect/github/callback` |

Create them at [github.com/settings/developers](https://github.com/settings/developers).

---

## Project Structure

```
app/
  api/              # Route handlers (auth, portfolio, connect, user)
  components/       # Shared UI + template components
  customize/        # Portfolio editor (live preview, accordion sections)
  dashboard/        # Repo selection + publish controls
  p/[slug]/         # Public portfolio pages (no auth required)
  templates/        # Template picker + export
  settings/         # Account settings
lib/
  auth.ts           # NextAuth config
  prisma.ts         # Prisma client
  export-portfolio.ts  # Standalone HTML generator
  encryption.ts     # AES-256 token encryption
  rate-limit.ts     # In-memory rate limiter
prisma/
  schema.prisma     # Database schema
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local` (use `NEXTAUTH_URL` = your production domain)
4. Update OAuth callback URLs in GitHub and Google consoles to your production domain
5. Deploy — `prisma generate` runs automatically via the `postinstall` script
