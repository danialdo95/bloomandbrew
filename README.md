# Bloom & Brew Social

Bloom & Brew Social is a Next.js social media application for cafe, coffee, florist, and bouquet communities. It combines a PostgreSQL-backed social platform with Reddit discovery, YouTube inspiration, creator-focused calendar planning, trend analysis, provider-aware content suggestions, and protected admin management views.

## Current Features

### Public Social Experience

- Email/password sign up, sign in, sign out, and Google OAuth
- Editable user profiles, public profile pages, suggested follows, and follow persistence
- For You and Following feeds with stable cursor pagination
- PostgreSQL-backed posts, comments, likes, bookmarks, shares, follows, sessions, and notifications
- Reddit public JSON content and YouTube Data API videos with curated fallback content
- Image and YouTube media links with preview validation and embedded playback
- Image filters, location tagging, source badges, feed skeletons, and new-post polling
- Expandable Bloom comment threads and owner-only post deletion
- Database-backed public calendar events with reusable post ideas

### Admin Management

- Independent admin login and protected dashboard routes
- User search, pagination, profile editing, disabling, and reactivation
- Post search, pagination, hide/restore moderation, and deletion
- Calendar event creation, editing, filtering, status management, visibility controls, and deletion
- Trend keyword analysis using Reddit and recent Bloom posts
- Provider-aware AI Suggestions using DeepSeek or a deterministic local fallback
- Persisted suggestion review flow: `PENDING -> APPROVED -> ADDED_TO_CALENDAR`
- Reddit, YouTube, fallback, and external-interaction integration status views

Chat/calling, live streaming, push-service notifications, password reset, file uploads, and database-backed admin roles remain future work. See the technical specification for the complete status and backlog.

## Technology Stack

- Next.js 16 App Router and React 19
- TypeScript and Tailwind CSS
- Prisma ORM 7 with PostgreSQL and the `@prisma/adapter-pg` driver
- Reddit public JSON API and YouTube Data API
- Custom email/password sessions and Google OAuth
- Optional DeepSeek API with a local trend-template fallback
- Vercel deployment target

## Getting Started

Node.js 20.9 or newer is required.

```bash
npm install
```

Create a local `.env` file. `DATABASE_URL` is required to run the database-backed application. The remaining values enable their corresponding features.

```bash
# Required
DATABASE_URL="postgresql://..."

# Admin access: comma-separated emails of existing user accounts
ADMIN_EMAILS="admin@bloombrew.com"

# Optional external feeds and AI generation
YOUTUBE_API_KEY="your-youtube-api-key"
DEEPSEEK_API_KEY="your-deepseek-api-key"
DEEPSEEK_MODEL="deepseek-v4-flash"

# Optional Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional database pool limit; defaults to 1
DATABASE_POOL_MAX="1"
```

Without `YOUTUBE_API_KEY`, the feed uses curated YouTube fallback content. Without `DEEPSEEK_API_KEY`, AI Suggestions use the local deterministic trend engine. Google OAuth redirects to a configuration error when its credentials are absent; email/password authentication remains available.

Generate the Prisma Client, apply migrations, and optionally load starter data:

```bash
npm run db:generate
npx prisma migrate dev
npx prisma db seed
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Next.js may select another port if `3000` is already in use.

The seeded local admin account is `admin@bloombrew.com` with password `password`. Its email must also be included in `ADMIN_EMAILS`.

## Google OAuth Setup

Create a Google OAuth client with application type **Web application**.

For local development, configure:

```text
Authorized JavaScript origin: http://localhost:3000
Authorized redirect URI:      http://localhost:3000/api/auth/oauth/google/callback
```

For deployment, add the equivalent HTTPS origin and callback for the production domain, then set `NEXT_PUBLIC_APP_URL` to that domain.

## Database

The Prisma schema is located at `prisma/schema.prisma`, migrations are in `prisma/migrations`, and the shared Prisma client is configured in `src/lib/prisma.ts`. The connection pool uses `DATABASE_POOL_MAX` to avoid excessive serverless database connections.

Useful commands:

```bash
npx prisma migrate dev
npx prisma migrate deploy
npx prisma db seed
npm run db:seed:feed
npm run db:studio
npm run db:verify
```

`npm run db:seed:feed` creates an idempotent feed-scale dataset for pagination testing.

## Media Links

The post composer accepts direct image URLs and YouTube watch, Shorts, `youtu.be`, embed, and live URLs. YouTube URLs are normalized by `src/lib/youtube-url.ts`. A post with media cannot be published until the link produces a valid preview.

## Verification

```bash
npm run lint
npm test
npm run build
```

The build script generates Prisma Client before running the optimized Next.js build.

## Deployment on Vercel

Use the Vercel Next.js framework preset with the default install, output, and runtime settings. Set the build command to `npm run build`, configure the required environment variables, and run `npx prisma migrate deploy` against the production database when migrations change.

At minimum, production requires `DATABASE_URL`. Configure `ADMIN_EMAILS`, Google OAuth credentials, `NEXT_PUBLIC_APP_URL`, YouTube, DeepSeek, and `DATABASE_POOL_MAX` according to the features enabled in that environment.

## Technical Specification

See `bloom_and_brew_tech_spec.md` for architecture, API descriptions, assignment coverage, implementation status, known limitations, and recommended next work.
