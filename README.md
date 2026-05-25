# Bloom & Brew Social

Bloom & Brew Social is a Next.js social media prototype for cafe, coffee, florist, and bouquet communities. It combines Reddit-powered discovery, YouTube video suggestions, PostgreSQL-backed user posts, profiles, comments, likes, saves, shares, follows, and in-app notifications.

## Features

- Sign up, sign in, sign out, and editable profile cards
- PostgreSQL-backed user posts, comments, likes, bookmarks, shares, follows, sessions, and notifications
- Reddit public JSON feed with curated fallback content
- YouTube Data API feed with fallback content
- Composer media field that supports image URLs and YouTube URLs
- Media preview validation before a post with media can be shared
- Embedded YouTube videos for API videos and user-created posts
- Suggested follows, public profile pages, For You and Following feeds
- Sidebar calendar for cafe/floral content prompts
- Mobile-responsive navigation with a notification bell

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local `.env` file with the required values:

```bash
DATABASE_URL="postgresql://..."
YOUTUBE_API_KEY="your-youtube-api-key"
```

Generate Prisma Client:

```bash
npx prisma generate
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If port `3000` is already in use, Next.js may choose another local port such as `3001`.

## Database

This project uses Prisma ORM with PostgreSQL.

Useful commands:

```bash
npx prisma migrate dev
npx prisma db seed
npx prisma studio
```

The Prisma schema is in `prisma/schema.prisma`, and the app uses the Prisma singleton in `src/lib/prisma.ts`.

## Deployment on Vercel

Leapcell is no longer the target deployment platform for this project. Deploy with Vercel using the Next.js framework preset.

Recommended Vercel settings:

- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Install Command: Vercel default
- Output Directory: Vercel default
- Start Command: Managed by Vercel

Add these environment variables in Vercel:

```bash
DATABASE_URL
YOUTUBE_API_KEY
```

The build script already runs Prisma generation before the Next.js build:

```json
{
  "build": "prisma generate && next build"
}
```

## Media Links

The post composer's media field accepts:

- Direct image URLs
- YouTube watch links, for example `https://www.youtube.com/watch?v=VIDEO_ID`
- YouTube Shorts links, for example `https://youtube.com/shorts/VIDEO_ID`
- `youtu.be`, `/embed`, and `/live` YouTube URLs

YouTube URLs are parsed in `src/lib/youtube-url.ts` and rendered as embedded videos in the feed.
The composer checks that a pasted media link can preview before enabling post sharing. Unsupported YouTube URLs or broken image links are blocked with an inline message.

## Scripts

```bash
npm run dev
npm run build
npm run start
```

## More Detail

See `bloom_and_brew_tech_spec.md` for the full technical specification and current implementation status.
