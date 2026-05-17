# Bloom & Brew Social
## Technical Specification Document
### CSC795 - Social Media Ecosystem Assignment

---

# 1. Project Overview

## Project Title
**Bloom & Brew Social: A Reddit-Powered Cafe & Florist Social Media Prototype**

## Project Description
Bloom & Brew Social is a web-based social media prototype focused on cafe culture, coffee communities, floral inspiration, and florist aesthetics. The application integrates Reddit community data into a custom social feed and layers core social media interactions on top of that feed.

The latest implementation is no longer only a dashboard. It now behaves like a social media application where users can create a demo account, personalize a profile, publish posts, interact with posts, follow suggested creators, receive in-app notifications, chat, start a live-room demo, add image filters, and tag locations.

The first database migration step has also been completed. User-created posts are now stored in PostgreSQL through Prisma ORM, while demo authentication and secondary interactions such as likes, comments, saves, follows, chat, and notifications remain browser-local.

The application demonstrates:
- Managed communities
- Managed rich content communities
- Social media API integration
- News feed interaction loop
- User identity and profile personalization
- Core social media platform fundamentals
- PostgreSQL-backed post persistence

---

# 2. Objectives

## Main Objectives
- Integrate Reddit social media data into a custom application
- Display cafe and florist-related community content
- Provide social media interactions around that content
- Demonstrate the 10 social media platform fundamentals
- Create a visually engaging BloomThis-inspired interface
- Deploy the application online using Leapcell

---

# 3. Target Users

| User Type | Description |
|---|---|
| Cafe Enthusiasts | Users interested in coffee culture, cafe spaces, and latte art |
| Florist Enthusiasts | Users interested in flowers, bouquets, and plant styling |
| Social Media Users | Users seeking aesthetic inspiration and community interaction |
| Students/Lecturers | Academic demonstration and evaluation users |

---

# 4. System Architecture

```text
Browser UI (Next.js App Router)
        |
        |-- SocialApp client component
        |      |-- demo auth state
        |      |-- profile state
        |      |-- Reddit + database post feed
        |      |-- local-only interactions
        |      |-- localStorage persistence for demo auth/profile/interactions
        |
        |-- Next.js API Route: /api/reddit
        |      |-- Reddit fetch layer: src/lib/reddit.ts
        |      |-- Fallback post layer: src/lib/fallback-posts.ts
        |
        |-- Next.js API Route: /api/posts
        |      |-- Prisma client: src/lib/prisma.ts
        |      |-- PostgreSQL database
        |
        |-- Trend analysis: src/lib/trends.ts
```

## Data Flow

```text
Reddit API ──→ src/lib/reddit.ts ──→ server-rendered homepage ──┐
                                                                ├─→ SocialApp feed
PostgreSQL ─→ Prisma ─→ /api/posts ─────────────────────────────┘

User-created posts:
SocialApp composer ─→ POST /api/posts ─→ Prisma ─→ PostgreSQL

Remaining demo-only state:
auth/profile/interactions/chat/live/polls ─→ localStorage or React state
```

---

# 5. Technology Stack

| Component | Technology |
|---|---|
| Frontend Framework | Next.js 16 App Router |
| UI Library | React 19 |
| Styling | Tailwind CSS |
| Backend/API | Next.js API Routes |
| Social Media API | Reddit public JSON API |
| Hosting | Leapcell |
| Authentication | Demo localStorage authentication |
| Database | Prisma Postgres / PostgreSQL |
| ORM | Prisma ORM |
| State Management | React Hooks |
| Persistence | PostgreSQL for user-created posts; localStorage for demo auth/profile/interactions |
| Charts/Analytics | Custom keyword and subreddit analysis |

---

# 6. Core Features

# 6.1 Reddit Feed Integration

## Description
The application fetches and normalizes Reddit posts from cafe, coffee, flower, florist, and plant-related communities.

## Target Subreddits
- r/Coffee
- r/Cafe
- r/LatteArt
- r/flowers
- r/florists
- r/houseplants

## Data Retrieved

| Field | Description |
|---|---|
| Post Title | Reddit post title |
| Upvotes | Reddit score |
| Comments | Number of Reddit comments |
| Image | Preview image, direct image URL, or thumbnail |
| Author | Reddit username |
| Subreddit | Source community |
| URL | Original content URL |
| Permalink | Reddit discussion link |
| Created At | Reddit post timestamp |

## Reliability
If Reddit requests fail or return no usable posts, the app uses curated fallback content from `src/lib/fallback-posts.ts`.

---

# 6.2 Social Feed

## Description
The homepage is a social feed powered by Reddit posts and PostgreSQL-backed user-created posts.

## Features
- Reddit-seeded posts
- Database-backed user-created posts
- Text post composer
- Image URL attachment
- Media filter selection
- Location tagging
- Like button
- Comment system
- Share counter
- Save/bookmark state

## Current Persistence Split
- User-created post records are saved to PostgreSQL.
- Reddit posts remain external feed content.
- Likes, comments, saves, and shares remain local UI state and are not yet stored in PostgreSQL.

---

# 6.3 Demo Authentication

## Description
The app includes a popup modal for sign in and sign up.

## Features
- Sign in modal
- Sign up modal
- Demo account creation
- Current session stored in localStorage
- Account status display
- Sign out
- Login required before key interactions

## Limitation
This is not production authentication. It is designed for academic demonstration only. Demo users and passwords are stored in the browser through localStorage.

---

# 6.4 Profile Personalization

## Description
Users can personalize their visible profile.

## Editable Fields
- Display name
- Username
- Bio
- Avatar initials
- Location

When signed in, profile changes are saved to the demo user account in localStorage. When a user publishes a post, the visible author information for that post is also written to PostgreSQL through the `/api/posts` route.

---

# 6.5 Social Interactions

## Description
Users can interact with posts and creators.

## Supported Interactions
- Like posts
- Comment on posts
- Share posts
- Save/bookmark posts
- Follow/unfollow suggested creators
- Send demo chat messages
- Start/end a live-room demo

These interactions are currently persisted locally in the browser. Database persistence has only been implemented for post creation so far.

---

# 6.6 Notifications

## Description
The app has two notification mechanisms:

- In-app notification panel
- Browser notification permission request

## Events That Trigger In-App Notifications
- Account created
- User signed in
- User signed out
- Post shared
- Comment added
- Follow status changed
- Live room started/ended
- Location updated

---

# 6.7 In-App Chat

## Description
The app includes a demo chat panel.

## Features
- Pre-seeded conversation
- User can send new chat messages
- Chat UI distinguishes user messages from other messages

## Limitation
Chat is local-only and not real-time across users.

---

# 6.8 Media Editing

## Description
The post composer supports simple image filter selection.

## Filters
- Natural
- Blush
- Cream
- Vintage

Filters are applied through CSS classes for visual media editing.

---

# 6.9 Streaming Demo

## Description
The app includes a live-room card.

## Features
- Start live
- End live
- Visual live status indicator
- In-app notification when live state changes

## Limitation
This does not include real video/audio streaming. It demonstrates the streaming platform concept.

---

# 6.10 Geolocation

## Description
Users can request browser geolocation and tag a post with coordinates.

## Features
- Uses `navigator.geolocation`
- Updates composer location field
- Adds an in-app notification after location update

---

# 6.11 Trending Topics Dashboard

## Description
The app analyzes feed post titles and displays trending keywords.

## Analysis
`src/lib/trends.ts` removes common stop words, counts significant title words, and returns the most frequent terms.

## Views
- Homepage social sidebar trending tags
- `/trends` dashboard
- Popular subreddit analysis

---

# 6.12 Discover Page

## Description
The Discover page allows users to browse Reddit-powered posts outside the main social feed layout.

## Features
- Subreddit filter
- Search by title
- Post cards
- Original Reddit thread links

---

# 6.13 Community Page

## Description
The Community page demonstrates polls and community participation.

## Features
- Poll cards
- Local voting
- Percentage display
- localStorage persistence

---

# 7. Social Media Platform Fundamentals Coverage

| No. | Fundamental | Current Implementation |
|---|---|---|
| 1 | User Sign Up | Sign up popup modal with localStorage demo account |
| 2 | Profile Personalization | Editable profile card with name, username, bio, avatar initials, location |
| 3 | News Feed | Reddit-seeded feed plus PostgreSQL-backed user-created posts |
| 4 | Push Notifications | Browser notification permission request and in-app notification panel |
| 5 | Content Sharing | Composer, PostgreSQL-backed post publishing, share counter, image URL support |
| 6 | In-App Chat / Calling | In-app chat demo; calling not implemented |
| 7 | Follow / Friend Requests | Suggested creators with follow/unfollow |
| 8 | Media Editing | CSS-based image filters in composer |
| 9 | Streaming | Live-room start/end demo |
| 10 | Geolocation | Browser geolocation tagging |

---

# 8. Functional Requirements

| ID | Requirement | Status |
|---|---|---|
| FR-01 | System shall fetch Reddit posts | Implemented |
| FR-02 | System shall display images and rich content | Implemented |
| FR-03 | Users shall sign up and sign in | Implemented as demo localStorage auth |
| FR-04 | Users shall personalize profiles | Implemented |
| FR-05 | Users shall publish posts | Implemented with PostgreSQL persistence |
| FR-06 | Users shall like, comment, save, and share posts | Implemented locally |
| FR-07 | Users shall follow creators | Implemented locally |
| FR-08 | Users shall view trending topics | Implemented |
| FR-09 | Users shall participate in polls | Implemented locally |
| FR-10 | Users shall use in-app chat | Implemented as local demo |
| FR-11 | Users shall start/end a live-room demo | Implemented as local demo |
| FR-12 | System shall support geolocation tagging | Implemented with browser API |
| FR-13 | System shall be accessible online | Implemented through Leapcell deployment |
| FR-14 | System shall support responsive design | Implemented with Tailwind responsive layouts |

---

# 9. Non-Functional Requirements

| Requirement | Description | Current Approach |
|---|---|---|
| Performance | Page load should remain fast | Reddit fetch is cached/revalidated; fallback data is available |
| Responsiveness | Mobile-friendly UI | Tailwind responsive grid layouts |
| Reliability | Stable API behavior | Fallback posts if Reddit fails; Prisma verification script exists |
| Usability | Easy-to-use interface | Modal auth, social feed, cards, clear actions |
| Deployability | Online hosting | Leapcell service with `npm start` and port `3000` |
| Maintainability | Clear file separation | Social components, lib utilities, Prisma config, types, and app routes are separated |

---

# 10. API Specification

## 10.1 Reddit API

### Endpoint Example

```bash
https://www.reddit.com/r/Coffee/hot.json?limit=12
```

### Request Method

```http
GET
```

### Sample Response Fields Used

```json
{
  "id": "abc123",
  "title": "Best Latte Art Today",
  "score": 1520,
  "num_comments": 231,
  "thumbnail": "image_url",
  "author": "coffee_user",
  "subreddit": "Coffee",
  "permalink": "/r/Coffee/comments/abc123/example/",
  "created_utc": 1710000000
}
```

## 10.2 Internal Reddit API Route

### Endpoint

```http
GET /api/reddit
```

### Response Shape

```json
{
  "posts": [],
  "source": "reddit",
  "fetchedAt": "2026-05-14T00:00:00.000Z"
}
```

The `source` field can be either `reddit` or `fallback`.

## 10.3 Internal Posts API Route

### Endpoint

```http
GET /api/posts
```

### Description
Returns PostgreSQL-backed user-created posts in the social feed format.

### Response Shape

```json
{
  "posts": []
}
```

### Endpoint

```http
POST /api/posts
```

### Description
Creates a new Bloom & Brew post in PostgreSQL. Until real authentication is implemented, the route receives the current demo profile from the client and upserts a matching author record.

### Request Shape

```json
{
  "content": "New cafe and bouquet idea",
  "imageUrl": "https://example.com/image.jpg",
  "filter": "Blush",
  "location": "Kuala Lumpur",
  "profile": {
    "name": "Bloom Barista",
    "username": "bloombarista",
    "avatar": "BB",
    "bio": "Cafe and floral moments",
    "location": "Kuala Lumpur"
  }
}
```

### Response Shape

```json
{
  "post": {
    "id": "post_id",
    "author": "Bloom Barista",
    "username": "bloombarista",
    "community": "Bloom & Brew",
    "content": "New cafe and bouquet idea"
  }
}
```

---

# 11. User Interface Design

# 11.1 Homepage / Feed

## Components
- Social media hero section
- Sign in/sign up modal
- Profile personalization card
- Suggested follows
- Post composer
- News feed
- Comments
- Notifications
- Chat
- Live room
- Trending tags

---

# 11.2 Discover Page

## Components
- Reddit feed cards
- Subreddit filter
- Search functionality
- External Reddit thread links

---

# 11.3 Trends Page

## Components
- Engagement statistics
- Trending keyword tags
- Subreddit analysis bars

---

# 11.4 Community Page

## Components
- Poll cards
- Local voting
- Percentage display

---

# 12. Folder Structure

```text
src/
  app/
    api/
      posts/
        route.ts
      reddit/
        route.ts
      youtube/
        route.ts
    community/
      page.tsx
    discover/
      page.tsx
    kaithhealth/
      route.ts
    trends/
      page.tsx
    globals.css
    layout.tsx
    page.tsx
  components/
    DiscoverFeed.tsx
    GalleryGrid.tsx
    Navbar.tsx
    PollCard.tsx
    PostCard.tsx
    SocialApp.tsx
    StatCard.tsx
    TrendTags.tsx
    YouTubeSuggestion.tsx
    social/
      AuthModal.tsx
      FeedPost.tsx
      PostComposer.tsx
      ProfilePanel.tsx
      SocialHero.tsx
      SocialSidebar.tsx
      SuggestedFollows.tsx
  lib/
    fallback-posts.ts
    prisma.ts
    reddit.ts
    social.ts
    trends.ts
  types/
    reddit.ts
    social.ts
prisma/
  migrations/
  schema.prisma
  seed.ts
scripts/
  verify-prisma.ts
prisma.config.ts
```

---

# 13. Deployment Plan

| Item | Platform / Value |
|---|---|
| Hosting | Leapcell |
| Runtime | Node.js |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Serving Port | `3000` |
| Domain | Leapcell generated domain |
| Database | Prisma Postgres / PostgreSQL |
| Required Environment Variable | `DATABASE_URL` |

## Current Production Start Script

```json
{
  "build": "prisma generate && next build",
  "start": "next start"
}
```

---

# 14. Security Considerations

| Concern | Current Handling |
|---|---|
| Reddit API failure | Fallback dataset |
| API abuse | Reddit fetch cache/revalidation |
| Sensitive keys | `DATABASE_URL` is stored in `.env` locally and must be configured as a deployment environment variable |
| XSS | React escapes rendered text; user content is rendered as text |
| Demo authentication | localStorage only; not production-secure |
| Password storage | Plain localStorage demo only; must be replaced for production |
| Database access | Prisma Client is used only from server-side code/API routes |

## Production Security Recommendation
For a real deployed social network, replace localStorage demo authentication with:
- secure server-side authentication
- hashed passwords or OAuth
- database-backed sessions
- server-side authorization checks

---

# 15. Current Implementation Status

## Completed
- Leapcell deployment with `npm start`
- Reddit feed integration with fallback data
- Social feed UI
- Demo sign in/sign up modal
- Profile personalization UI
- PostgreSQL-backed post creation
- `GET /api/posts` and `POST /api/posts`
- Prisma schema, migrations, generated client, seed script, and verification script
- Image URL posting and CSS filter selection
- Location tagging in the composer
- Local likes, comments, shares, and saves
- Local suggested follows
- In-app notifications and browser notification permission request
- Local chat demo
- Live-room state demo
- Trends, Discover, and Community pages

## Partially Implemented
- User identity: demo accounts exist, but real authentication does not
- Profile data: editable locally and copied into DB post author records, but not fully account-backed
- Feed persistence: user-created posts persist in PostgreSQL, but Reddit posts remain external and interactions remain local
- Notifications: in-app only, with browser permission request but no push service worker
- Media editing: CSS filters only
- Geolocation: coordinate tagging only, no map/location search

## Not Yet Implemented
- Real server-side authentication
- Password hashing or OAuth
- Database-backed sessions
- Database-backed comments
- Database-backed likes
- Database-backed saves/bookmarks
- Database-backed follows/friend requests
- Database-backed notifications
- Database-backed chat messages
- Real-time chat/calling
- Real push notifications
- File upload/object storage
- Real video/audio streaming
- Server-side authorization rules

---

# 16. Limitations

- Authentication is demo-only and browser-local
- User-created posts are stored in PostgreSQL, but post ownership is still based on demo profile data until real auth is added
- Comments, likes, bookmarks, follows, polls, notifications, and chat are local-only
- Chat is not real-time between users
- Live room is a state demo, not video/audio streaming
- No server-side user authorization is implemented

---

# 17. Future Improvements

- Real authentication with NextAuth, Supabase Auth, or custom auth
- Extend PostgreSQL persistence to comments, likes, saves, follows, notifications, and messages
- Real-time chat with WebSockets or Supabase Realtime
- File upload for media instead of image URLs
- Push notifications through service workers
- Real video/audio streaming integration
- Sentiment analysis for Reddit posts
- AI-based recommendation engine
- Personalized mood boards
- AI-generated cafe captions
- Mobile application version

---

# 18. Conclusion

Bloom & Brew Social is now a deployable social media prototype that combines Reddit-powered community content with core social media interactions. The application demonstrates the required social media platform fundamentals through a frontend demo experience: account creation, profile personalization, feed interactions, content sharing, notifications, chat, following, media editing, streaming concepts, and geolocation.

The current version is suitable for academic demonstration and deployment. For production use, the localStorage-based demo features should be replaced with real authentication, persistent database storage, and real-time infrastructure.
