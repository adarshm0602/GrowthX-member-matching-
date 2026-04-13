# GrowthX Member Matching — AI-Native Community Platform

AI-powered member matchmaker for GrowthX: Claude analyzes every profile and surfaces the five community members most likely to create real value for you, then drafts the intro message.

## Setup

```bash
git clone <repo-url>
cd GrowthX-member-matching-
npm install
cp .env.example .env.local   # fill in MONGODB_URI, NEXTAUTH_SECRET, ANTHROPIC_API_KEY
npm run seed                 # loads 12 diverse mock members
npm run dev
```

App runs at http://localhost:3000. Seeded members share the password `Password123!`.

### Environment variables

| Key | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string (Atlas or local) |
| `NEXTAUTH_SECRET` | Random 32-byte string for NextAuth JWT signing |
| `NEXTAUTH_URL` | Public base URL of the app |
| `ANTHROPIC_API_KEY` | Claude API key used by the matcher |

## Architecture

- **Next.js 14** (App Router, TypeScript, Tailwind) — UI and API routes colocated.
- **MongoDB + Mongoose** — persisted `Member` and `Match` documents; cached connection for serverless-friendly reuse.
- **NextAuth (Credentials + JWT)** — session carries `id` + `role`; middleware protects `/dashboard`, `/profile`, `/members`, and their APIs.
- **Claude (`claude-sonnet-4-20250514`)** via `@anthropic-ai/sdk` — two prompts:
  1. `generateMatches` returns exactly 5 ranked matches (score 0–100 + reasoning), weighing complementary seeking/offering pairs, shared interests, professional synergy, and role diversity.
  2. `generateOutreach` drafts a warm, personalized 3–4 sentence intro grounded in both profiles and the match reasoning.
- **CI/CD** — GitHub Actions runs lint + build on every PR and deploys to Vercel on push to `main`.

### Key routes

| Route | Purpose |
| --- | --- |
| `POST /api/auth/register` | Create a member (bcrypt-hashed password). |
| `POST /api/match/generate` | Run the Claude matcher, upsert the user's `Match` doc. |
| `GET  /api/match/results` | Return the populated 5 matches. |
| `POST /api/outreach/generate` | Draft + persist an intro message for a specific match. |
| `GET/PUT /api/members[/[id]]` | List directory / read / update own profile. |

## Screenshots

Coming soon.

## Story

Built end-to-end using **Claude Code as the primary development agent** — scaffolding, schema design, AI prompt engineering, UI, auth, and CI were driven through iterative Claude Code sessions. The same model powering the matcher also wrote the app around it.
