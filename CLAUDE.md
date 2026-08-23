# CLAUDE.md — Sparezy

Next.js app for Sparezy (auto spare-parts sourcing, UAE), running **live at
sparezy.store on Cloudflare Workers**. Read this before touching anything: the
deploy path and three specific pieces of code are load-bearing and easy to
break by accident.

## Deploying

Pushes to the branch **`claude/determined-gauss-cp6npe`** auto-deploy via GitHub
Actions (`.github/workflows/deploy.yml`, which runs `npm run deploy`).
**Committing and pushing is all that's needed to ship — never run
`wrangler deploy` manually.**

## Stack

- Next 14.2.35 (App Router) · TypeScript · Tailwind · Framer Motion
- `@opennextjs/cloudflare` **1.15.0** — the last release that supports Next 14.
  Do not upgrade it without also upgrading Next.
- Prisma 5.22 with `@prisma/adapter-d1`; datasource provider is **sqlite**.

## Cloudflare setup (owner's account)

- Worker **`sparezy`**, also reachable at `sparezy.sparezy.workers.dev`
- D1 database **`sparezy`**, binding **`DB`**, id `a55873ab-c61d-4361-bdff-0c0c9cd5e578`
- Tables: `PartRequest`, `ActivityLog`, `Quote`, `Setting`
- Secret `ADMIN_PASSWORD` is set. Optional: `WHATSAPP_TOKEN`,
  `WHATSAPP_PHONE_ID`, `RESEND_API_KEY`, `RESEND_FROM`,
  `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID`
- `sparezy.store` is on Cloudflare DNS. **Zoho email (MX records + SPF TXT)
  must never be touched.**
- **No R2.** Nothing writes to the filesystem — the Worker has none.

## Three things that are load-bearing

### 1. `lib/prisma.ts` imports Prisma from `@prisma/client/wasm` on the D1 path

Not from `@prisma/client`. Workers cannot load Prisma's native engine, and the
package's export map lists `node` before `workerd`, so OpenNext picks the wrong
one. It **builds fine** and then 500s on every query with
`Code generation from strings disallowed`. Never "tidy" this import away.

### 2. `lib/lead-query.ts` must not use `mode: "insensitive"`

That's Postgres-only; SQLite/D1 rejects it. SQLite `LIKE` is already
case-insensitive for ASCII, so plain `contains` is correct here.

### 3. Never inline large images as base64 data URIs

`components/store/SparezyLogo.tsx` renders one PNG 30+ times to fake 3D depth.
Inlining it produced ~5.6 MB of HTML per request and caused Cloudflare
**error 1102**. It is now a static file at `public/sparezy-logo-3d.png`.
Landing-page HTML should stay around **76 KB** — if it jumps, something got
inlined.

## Verification rule

**A passing `next build` proves nothing here.** Anything touching the database
or page rendering must be checked with `wrangler dev` (or `npm run preview`)
and a real request before pushing.

Useful checks:

```bash
npm run preview                       # opennextjs build + local Workers runtime
curl -s localhost:8787/ | wc -c       # landing-page HTML size — expect ~76KB
npm run db:migrate:local              # apply migrations/ to local D1
npm run db:migrate:remote             # apply migrations/ to production D1
```

## Notes

- `README.md` still documents the old Railway + Postgres deployment. Cloudflare
  Workers + D1 is the live setup; treat the README's deploy section as stale.
- SQL migrations for D1 live in `migrations/` (applied by wrangler).
  `prisma/migrations/` is the legacy Prisma path.
