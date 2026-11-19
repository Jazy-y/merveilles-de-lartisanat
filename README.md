# Merveilles de l'Artisanat de la Tunisie

An e-commerce platform for Tunisian artisans. Customers browse and buy handcrafted jewellery, and book hands-on craft workshops and trainings (mosaic, embroidery, silver jewellery, traditional harissa). The site was built as a freelance client project, with a full admin back office for products, inventory, orders, bookings and users.

**Live demo:** https://merveilles-de-lartisanat.vercel.app · **Stack:** Next.js 15 · React 19 · TypeScript · PostgreSQL · Prisma · NextAuth.js · Tailwind CSS 4

> The live demo runs on Vercel with a fresh database seeded with the shop's public catalogue (products, workshops, trainings). It contains no customer data. Orders placed on the demo are real database records, but no payment is taken: the shop works with cash on delivery.

## Features

**Storefront**
- Product catalogue with category filtering, product pages with image zoom, swiper galleries, reviews and ratings
- Cart (guest and signed-in, synced to the database), wishlist, and cash-on-delivery checkout with order confirmation
- Workshops and trainings with schedules, booking/enrollment forms and availability tracking
- Customer account: profile, addresses, orders, bookings, reviews and password management
- French-language storefront, responsive design, SEO metadata, sitemap and robots.txt

**Admin dashboard** (role-based, `ADMIN` only)
- Products, inventory and stock, workshops, trainings and categories, with image and video uploads
- Orders, workshop bookings and training enrollments with status management
- Users and roles, analytics overview, and an audit log of admin actions

**Security**
- Passwords hashed with bcrypt, JWT sessions (NextAuth.js), role checks in middleware and API routes
- Zod validation, input sanitisation (DOMPurify), CSRF protection on mutations, per-route rate limiting
- Strict security headers (CSP, HSTS, X-Content-Type-Options, frame-ancestors) and upload validation by file signature and size

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router, Route Handlers, middleware), React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui, Radix UI, Lucide, Swiper, Sonner |
| Data | PostgreSQL, Prisma ORM |
| Auth | NextAuth.js (credentials provider, JWT sessions, roles) |
| Media | sharp + file-type validation; Vercel Blob in production, local disk in development |
| Email | Nodemailer (SMTP), used for password resets |
| Hosting | Vercel + Neon Postgres (serverless) |

## Getting started

### Prerequisites
- Node.js 20+
- PostgreSQL 14+ (or Docker)

### Install

```bash
git clone https://github.com/Jazy-y/merveilles-de-lartisanat.git
cd merveilles-de-lartisanat
npm install                # also runs `prisma generate`
cp .env.example .env       # then fill in the values (see below)
docker compose up -d       # optional: local PostgreSQL on :5432
npm run db:push            # create the schema
npm run db:seed            # load the public catalogue (+ admin if ADMIN_* is set)
npm run dev                # http://localhost:3000
```

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `NEXTAUTH_URL` | yes | Public URL of the site |
| `NEXTAUTH_SECRET` | yes | JWT signing secret (`openssl rand -base64 32`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | no | Creates or promotes an admin account when seeding (password: 12+ characters) |
| `BLOB_READ_WRITE_TOKEN` | production | Vercel Blob token for admin uploads |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | no | Password-reset emails |
| `ALLOWED_FRAME_ANCESTORS` | no | Origins allowed to embed the site in an iframe |
| `GOOGLE_VERIFICATION` | no | Google Search Console token |

No secrets are committed; see `.env.example`.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run db:push` | Sync the Prisma schema to the database |
| `npm run db:seed` | Seed the public catalogue (`prisma/seed-data/catalog.json`) |
| `npm run db:studio` | Prisma Studio |

## Deployment (Vercel)

1. Import the repository in Vercel. The framework is detected as Next.js.
2. Add a Postgres database from the Vercel Marketplace (Neon). It provides `DATABASE_URL`.
3. Add a Vercel Blob store. It provides `BLOB_READ_WRITE_TOKEN`.
4. Set `NEXTAUTH_URL` and `NEXTAUTH_SECRET` (and optionally `ADMIN_EMAIL`/`ADMIN_PASSWORD`, SMTP).
5. Deploy. The `vercel-build` script runs `prisma db push`, seeds the catalogue (idempotent upserts) and builds the app.

Uploads go to Vercel Blob in production, because the serverless filesystem is not persistent. Serverless request bodies are limited to 4.5 MB on Vercel, so large video uploads need a direct client-to-Blob upload (see Known limitations).

## Project structure

```
src/
├── app/                 # App Router pages and API route handlers
│   ├── products/ workshops/ trainings/ cart/ checkout/ orders/ profile/ wishlist/
│   ├── admin/           # admin dashboard (products, inventory, orders, bookings, users, analytics)
│   ├── auth/            # sign in / sign up / password reset
│   └── api/             # REST endpoints (products, cart, orders, bookings, uploads, users…)
├── components/          # storefront, admin, profile and shadcn/ui components
└── lib/                 # auth, prisma, validation, rate limiting, CSRF, security headers, storage
prisma/
├── schema.prisma        # data model
├── seed.ts              # catalogue seed (no default credentials)
└── seed-data/catalog.json
middleware.ts            # auth gating, rate limiting, security headers
```

## Known limitations

- **Payments:** checkout supports cash on delivery only; there is no online payment gateway.
- **Email:** password-reset emails need SMTP credentials; without them, reset emails aren't sent.
- **Large video uploads** exceed Vercel's 4.5 MB serverless request limit. They need a client-side upload to Vercel Blob.
- **Language:** the storefront is in French. Locale-prefixed routes (`/en`, `/fr`, `/ar`) exist for some pages, but no translations are implemented.
- **Two admin areas:** the dashboard lives at `/admin`. An older localised admin under `/[locale]/admin` is still present.

## Credits

Built as a freelance project for Merveilles de l'Artisanat de la Tunisie. Product photos and texts belong to the shop.
