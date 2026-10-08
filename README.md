<h1 align="center">GitHub World</h1>

<p align="center"><strong>Your GitHub profile becomes a 3D pixel-art building in an interactive city.</strong></p>

GitHub World combines GitHub developer data with a browser-based 3D city, progression systems, achievements, social interactions, customization, and optional payments.

## What it does

- 3D pixel-art buildings generated from GitHub activity.
- Profile pages, ranks, achievements, streaks, districts, and social interactions.
- Building customization, loadouts, shop items, gifts, and optional ad purchases.
- GitHub OAuth through Supabase Auth.
- PostgreSQL persistence through Supabase and Row Level Security.
- Stripe, AbacatePay, and NOWPayments integrations when configured.
- Scheduled jobs for snapshots, notifications, cleanup, and digests.

## Stack

- Next.js 15.5.27 App Router
- React 19
- Three.js + React Three Fiber + drei
- Supabase Auth/Postgres/Realtime/Storage
- Stripe and optional alternative payment providers
- Tailwind CSS 4

Next.js 15.5.27 is the patched 15.5 maintenance release. Versions below 15.5.27 are affected by September 2026 security fixes, including cache-poisoning issues; the project is pinned to 15.5.27. citeturn771293search0turn771293search4

## Requirements

- Node.js 20.9+
- npm
- A Supabase project for production features
- Provider credentials for the integrations you enable

## Local development

Clone and install:

```bash
git clone https://github.com/krishnashahane/GitHub-World.git
cd GitHub-World
npm install
cp .env.example .env.local
```

Fill in the required environment variables, then run:

```bash
npm run dev
```

Open **http://localhost:3001**.

Production build:

```bash
npm run build
npm start
```

The project uses `npm install` rather than `npm ci` because the previous lockfile tracked an outdated Next.js version and was removed during the security upgrade. A fresh install regenerates a consistent lockfile from the patched dependency set.

## Required production configuration

At minimum configure:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `CRON_SECRET`

Configure payment/email/GitHub secrets only for features you enable.

Never expose `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, webhook secrets, or other server-only credentials through `NEXT_PUBLIC_*` variables.

## Security hardening

- Production cannot silently fall back to Supabase mock mode.
- Authenticated mutation routes resolve GitHub identity from the authenticated GitHub OAuth identity rather than mutable profile metadata.
- Cron endpoints use centralized constant-time secret validation.
- Resend webhooks verify their Svix signature before processing events.
- Stripe and NOWPayments webhooks verify provider signatures.
- Stripe production checkout URLs require an explicit public base URL instead of defaulting to localhost.
- API rate limiting and browser security headers are enabled in middleware/config.
- Service-role Supabase access is kept server-side.
- Uploads are authenticated, ownership-checked, type-limited, and size-limited.
- Exact remote image hosts are allowlisted in Next.js image configuration.

## Database

The `supabase/migrations` directory contains the schema evolution used by the application. Apply migrations to a Supabase project before enabling production features.

After changing database schema or migrations, validate the complete migration chain against a clean Supabase database before deploying.

## Scheduled jobs

Vercel cron jobs are declared in `vercel.json`. They require `CRON_SECRET` and should not be exposed as unauthenticated public endpoints.

## Project structure

```text
admin/          Admin pages and management UI
api/            Route handlers
app/            Next.js application routes
components/     Reusable UI and 3D components
lib/            Auth, Supabase, payments, notifications, game logic
public/         Static assets and models
supabase/       Database migrations
middleware.ts   Rate limiting and security headers
vercel.json     Scheduled jobs
```

## Notes

The repository contains generated TypeScript build metadata in older revisions; `*.tsbuildinfo` and other build artifacts are now ignored.

Some features intentionally degrade in local mock mode, but production requires real Supabase configuration and does not silently pretend to be connected.

## License

MIT
