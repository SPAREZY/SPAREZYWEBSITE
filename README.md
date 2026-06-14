# Sparezy

Auto spare-parts sourcing for the UAE. One Next.js app with two halves:

- **Customer site** (`/`) — a single, app-style screen where a customer enters their
  car's VIN and the parts they need, then places a free sourcing order.
- **Admin panel** (`/admin`) — a password-protected Kanban board where every order
  appears as a lead to source, quote, and close on WhatsApp.

They connect through `POST /api/requests`: placing an order creates a lead that shows
up on the admin board within ~15 seconds.

## Stack

- Next.js 14 (App Router) · TypeScript · Tailwind CSS
- Prisma + PostgreSQL
- Framer Motion (drawer animation)

## Local development

```bash
npm install
# set DATABASE_URL + ADMIN_PASSWORD in .env (see .env.example)
npx prisma migrate deploy   # create the tables
npm run db:seed             # optional: 6 sample leads
npm run dev                 # http://localhost:3000  and  /admin
```

Default admin password for local dev: `sparezy-admin` (override with `ADMIN_PASSWORD`).

## Deploying on Railway

1. Push this repo to GitHub.
2. Railway → New Project → Deploy from GitHub repo → pick this repo.
3. Add a PostgreSQL database (New → Database → PostgreSQL). Railway provides `DATABASE_URL`.
4. On the app service, set variables:
   - `DATABASE_URL` → reference the Railway Postgres (`${{Postgres.DATABASE_URL}}`)
   - `ADMIN_PASSWORD` → a strong password
5. Build runs `prisma generate && next build`; start runs `prisma migrate deploy && next start`
   (migrations apply at startup, when the database is reachable).

## Environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `ADMIN_PASSWORD` | Password for the `/admin` panel |
