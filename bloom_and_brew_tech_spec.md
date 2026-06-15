# Bloom & Brew Social
## Technical Specification Document
### CSC795 - Social Media Ecosystem Assignment

---

# 1. Project Overview

## Project Title
**Bloom & Brew Social: A Reddit-Powered Cafe & Florist Social Media Prototype**

## Project Description
Bloom & Brew Social is a web-based social media prototype focused on cafe culture, coffee communities, floral inspiration, and florist aesthetics. The application integrates Reddit community data into a custom social feed and layers core social media interactions on top of that feed.

The latest implementation is no longer only a dashboard. It now behaves like a social media application where users can create an account, personalize a profile, publish posts, attach image or YouTube media links, interact with posts, follow suggested creators, receive in-app notifications, use a sidebar calendar, add image filters, and tag locations.

The first database migration steps have also been completed. User accounts, user account status, sessions, user-created posts, post moderation status, comments, likes, saves/bookmarks, shares, notifications, and follow relationships are now stored in PostgreSQL through Prisma ORM. Polls remain browser-local, while chat/calling and live-room features are tracked as backlog items.

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
- Deploy the application online using Vercel

## Next Assignment Enhancement Objective
For the next assignment, the project will be expanded from a social media prototype into an emerging-technology enhanced social platform. The proposed enhancement is an **Admin Insights Dashboard** that uses trend analytics, recommendation logic, and external social media integrations to help users and platform managers understand community behavior and manage the added services.

This enhancement directly supports the assignment objective: analyze the impact of new and emerging technologies in the social media ecosystem, then identify opportunities to add value through new services or richer data.

The next implementation phase should focus on:
- Admin and platform management functionality
- Trend and content insight management
- AI-style content suggestion workflows
- Integration status and external-source management
- Moderation and operational visibility for users, posts, and engagement

---

# 3. Target Users

| User Type | Description |
|---|---|
| Cafe Enthusiasts | Users interested in coffee culture, cafe spaces, and latte art |
| Florist Enthusiasts | Users interested in flowers, bouquets, and plant styling |
| Social Media Users | Users seeking aesthetic inspiration and community interaction |
| Creators | Users who want topic ideas, content prompts, and trend-aware posting support |
| Platform Admins | Users who manage accounts, posts, integrations, trends, and recommendation services |
| Students/Lecturers | Academic demonstration and evaluation users |

---

# 4. System Architecture

```text
Browser UI (Next.js App Router)
        |
        |-- SocialApp client component
        |      |-- authenticated user state
        |      |-- profile state
        |      |-- Reddit + database post feed
        |      |-- database-backed post/follow interactions
        |      |-- localStorage/React state for remaining demo-only interactions
        |
        |-- Next.js API Routes: /api/auth/*
        |      |-- password hashing
        |      |-- HTTP-only session cookie
        |      |-- Session table
        |
        |-- Next.js API Route: /api/reddit
        |      |-- Reddit fetch layer: src/lib/reddit.ts
        |      |-- Fallback post layer: src/lib/fallback-posts.ts
        |
        |-- Next.js API Route: /api/youtube
        |      |-- YouTube Data API search
        |      |-- normalized video posts
        |
        |-- Next.js API Route: /api/posts
        |      |-- Prisma client: src/lib/prisma.ts
        |      |-- PostgreSQL database
        |
        |-- Next.js API Routes: /api/external-posts/*
        |      |-- mirrors Reddit/YouTube identifiers
        |      |-- persists comments, likes, saves, and shares
        |
        |-- Next.js API Route: /api/notifications
        |      |-- database-backed in-app notification list
        |
        |-- Next.js API Routes: /api/users/*
        |      |-- suggested creator lookup
        |      |-- follow/unfollow relationship persistence
        |
        |-- Next.js Route: /users/[username]
        |      |-- public creator profile page
        |
        |-- Trend analysis: src/lib/trends.ts

        |-- Next.js Routes: /admin/*
        |      |-- independent admin login page
        |      |-- protected admin dashboard shell
        |      |-- user management view
        |      |-- post moderation and engagement review view
        |      |-- trend management view
        |      |-- AI-style content suggestions view
        |      |-- Reddit/YouTube integration status view
```

## Data Flow

```text
Reddit API ──→ src/lib/reddit.ts ──→ server-rendered homepage ──┐
YouTube API ─→ /api/youtube ─→ normalized video posts ───────────┼─→ SocialApp feed
PostgreSQL ─→ Prisma ─→ /api/posts ──────────────────────────────┘

User-created posts:
SocialApp composer ─→ POST /api/posts ─→ Prisma ─→ PostgreSQL

External interactions:
Reddit/YouTube post IDs ─→ /api/external-posts/* ─→ Prisma ─→ PostgreSQL

Remaining demo-only state:
polls ─→ localStorage or React state

Admin insight flow:
Reddit + YouTube + Bloom posts ─→ trend analysis ─→ admin dashboard
Admin dashboard ─→ content suggestions, moderation actions, integration status
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
| Video Platform API | YouTube Data API |
| Hosting | Vercel |
| Authentication | Custom database-backed authentication |
| Database | Prisma Postgres / PostgreSQL |
| ORM | Prisma ORM |
| State Management | React Hooks |
| Persistence | PostgreSQL for users, user status, sessions, posts, post status, comments, likes, saves, shares, notifications, external-post interactions, and follows; localStorage/React state for remaining demo features |
| Charts/Analytics | Custom keyword and subreddit analysis |
| Insight Layer | Trend-based content suggestions, admin analytics, and protected admin dashboard views |

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
If Reddit requests fail or return no usable posts, the app uses curated fallback content from `src/lib/fallback-posts.ts`. The current implementation uses Reddit's public JSON endpoint, not Reddit OAuth/API credentials.

---

# 6.2 Social Feed

## Description
The homepage is a social feed powered by Reddit posts, YouTube video suggestions, and PostgreSQL-backed user-created posts.

## Features
- Reddit-seeded posts
- YouTube API video posts
- Database-backed user-created posts
- Unified age sorting across Bloom, Reddit, and YouTube sources
- Text post composer
- Media URL attachment for image links and YouTube links
- Media preview validation before publishing posts with media links
- Media filter selection
- Location tagging
- Like button
- Comment system
- Share counter
- Save/bookmark state
- Embedded YouTube videos inside feed posts
- Composer preview for pasted YouTube watch, Shorts, embed, live, and youtu.be links
- Composer blocks post publishing when a pasted media link cannot be previewed

## Current Persistence Split
- User-created post records are saved to PostgreSQL.
- User-created YouTube links are stored in the existing media URL field and rendered as embedded videos when displayed.
- Reddit posts remain external feed content.
- YouTube video posts remain external feed content.
- Comments on database-backed posts are saved in PostgreSQL.
- Comments on Reddit and YouTube posts are saved in PostgreSQL as external-post interactions.
- Likes and saves on database-backed posts are saved in PostgreSQL.
- Likes and saves on Reddit and YouTube posts are saved in PostgreSQL as external-post interactions.
- Follow/unfollow relationships between Bloom & Brew users are saved in PostgreSQL.
- The Following feed can filter database-backed posts to the signed-in user's own posts and posts from followed creators.
- Shares are saved in PostgreSQL for both Bloom posts and Reddit/YouTube external posts.
- Database-backed notifications are shown in the navbar bell dropdown.

---

# 6.3 Authentication

## Description
The app includes a popup modal for sign in and sign up.

## Features
- Sign in modal
- Sign up modal
- Database-backed account creation
- Password hashing
- HTTP-only session cookie
- Account status display
- Disabled account login blocking
- Disabled account session invalidation
- Sign out
- Login required before key interactions

## Limitation
This is a custom prototype authentication flow. It uses hashed passwords and database-backed sessions, but it does not yet include email verification, OAuth, password reset, rate limiting, or advanced account security controls.

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

The profile card uses an explicit edit mode with Save and Cancel controls. When signed in, profile changes are saved to the authenticated PostgreSQL user record. Posts, comments, likes, and saves use the authenticated user rather than trusting browser-only profile data.

---

# 6.5 Social Interactions

## Description
Users can interact with posts and creators.

## Supported Interactions
- Like posts
- Comment on posts
- Share posts
- Save/bookmark posts
- Delete own Bloom & Brew posts
- Follow/unfollow suggested creators

Likes, comments, saves/bookmarks, shares, notifications, follows, user account status, and post moderation status are persisted in PostgreSQL for Bloom & Brew database-backed content and users. Reddit and YouTube posts remain external feed items, but their likes, comments, saves, and shares are persisted as external-post interactions. Polls are still local/demo features. Chat and live-room features are hidden from the current UI and moved to backlog.

---

# 6.6 Notifications

## Description
The app has two notification mechanisms:

- Database-backed in-app notifications in the navbar bell dropdown
- Browser notification permission request from the notification menu

## Events That Trigger In-App Notifications
- Account created
- User signed in
- User signed out
- Post shared
- Comment added
- Follow status changed
- Location updated

Notifications are no longer configured from the post composer. The composer only handles post content, media, filter, and location inputs.

---

# 6.7 Sidebar Calendar

## Description
The right sidebar now shows a Bloom calendar card instead of the previous chat and live-room demo cards.

## Features
- Weekly calendar grid
- Highlighted cafe/floral events
- Static event prompts for content planning

## Limitation
The calendar is currently static and does not persist user-created events.

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

# 6.9 Streaming Backlog

## Description
The live-room demo is hidden from the current UI and moved to backlog.

## Backlog Scope
- Real video/audio streaming
- Live-room lifecycle state
- Live notifications
- Viewer participation

---

# 6.10 Geolocation

## Description
Users can request browser geolocation and tag a post with coordinates.

## Features
- Uses `navigator.geolocation`
- Updates composer location field
- Uses a location marker indicator in the composer and profile UI
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
- PostgreSQL persistence for users, sessions, posts, comments, likes, and saves

---

# 6.14 Admin Insights Dashboard

## Description
The current feature phase introduces an admin-facing dashboard for managing the new value-added services proposed for the emerging-technology assignment. The dashboard connects existing platform data with trend analytics and AI-style content support.

## Routes

```http
GET /admin
GET /admin/users
GET /admin/posts
GET /admin/trends
GET /admin/ai-suggestions
GET /admin/integrations
GET /admin/login
```

## Purpose
The dashboard will help platform managers monitor users, posts, trends, integrations, and recommendation services from one place. It will also demonstrate how analytics and intelligent content support can enrich an existing social media ecosystem.

## Implemented Dashboard Sections

| Section | Purpose |
|---|---|
| User Management | View registered users, profile details, follower/following counts, and post counts |
| Post Management | Review Bloom & Brew posts, engagement counts, author details, and moderation actions |
| Trend Management | Display trending keywords from Bloom, Reddit, and YouTube content |
| AI Suggestions | Generate content ideas, hashtags, and creator prompts from trending topics |
| Integration Management | Show Reddit and YouTube source status, fallback behavior, and API configuration state |

## Implemented Admin Access Controls

| Control | Current Implementation |
|---|---|
| Independent admin login | `/admin/login` authenticates admins through `/api/admin/login` |
| Dashboard protection | `/admin` dashboard routes perform server-side session and admin checks |
| Admin allowlist | `ADMIN_EMAILS` controls which existing user accounts can access admin pages |
| Seeded admin account | `admin@bloombrew.com` is created by the Prisma seed script for local testing |
| Hidden admin navigation | The main navbar only shows the Admin link to authenticated admin users |
| Non-admin redirect | Signed-in non-admin users are redirected away from `/admin/login` and protected dashboard pages |
| Admin logout | Admin dashboard includes a sign-out action using the existing session logout API |

## Management Actions

| Module | Current Status |
|---|---|
| Users | View users and account metrics implemented; search, pagination, admin edit page, feedback messages, and disable/reactivate status controls implemented |
| Posts | View posts and engagement metrics implemented; search, status filtering, pagination, hide/restore, delete confirmation, and delete moderation controls implemented |
| Trends | View trend signals implemented; featured trend and approval workflows remain backlog |
| AI Suggestions | Rule-style suggestion view implemented; approve, dismiss, reuse, and persistence workflows remain backlog |
| Integrations | Integration status view implemented; richer API health/fallback diagnostics remain backlog |

## Emerging Technology Value
This module uses trend analytics, recommendation logic, and external API integration to show how emerging technologies can improve social media platforms. Instead of only displaying content, the system will help users and admins interpret content patterns and turn them into useful services.

---

# 6.15 Planned AI-Assisted Content Suggestions

## Description
The app already analyzes trending keywords through `src/lib/trends.ts`. The next step is to convert those signals into practical content suggestions for creators and admins.

## Planned Suggestions
- Post topic ideas based on trending keywords
- Suggested cafe/florist hashtags
- Short creator prompts for the post composer
- Trend summaries for admin review
- Suggested content categories such as coffee, bouquet, plants, events, and cafe ambience

## Prototype Scope
The first version can use rule-based recommendation logic from existing trend data. A later version can connect to a generative AI API for richer summaries, captions, and moderation assistance.

---

# 7. Social Media Platform Fundamentals Coverage

| No. | Fundamental | Current Implementation |
|---|---|---|
| 1 | User Sign Up | Sign up popup modal with PostgreSQL user account and session cookie |
| 2 | Profile Personalization | Editable profile card with database-backed name, username, bio, avatar initials, location |
| 3 | News Feed | Age-sorted feed combining PostgreSQL-backed user posts, Reddit posts, and YouTube posts |
| 4 | Push Notifications | Database-backed in-app notification bell plus browser notification permission request |
| 5 | Content Sharing | Composer, PostgreSQL-backed post publishing, share counter, image URL and YouTube URL support |
| 6 | In-App Chat / Calling | Backlog; hidden from current UI |
| 7 | Follow / Friend Requests | Suggested creators with PostgreSQL-backed follow/unfollow |
| 8 | Media Editing | CSS-based image filters in composer |
| 9 | Streaming | Backlog; live-room demo hidden from current UI |
| 10 | Geolocation | Browser geolocation tagging |

---

# 8. Functional Requirements

| ID | Requirement | Status |
|---|---|---|
| FR-01 | System shall fetch Reddit posts | Implemented |
| FR-02 | System shall display images and rich content | Implemented with images and embedded YouTube videos |
| FR-03 | Users shall sign up and sign in | Implemented with PostgreSQL users, hashed passwords, and session cookies |
| FR-04 | Users shall personalize profiles | Implemented with PostgreSQL persistence |
| FR-05 | Users shall publish posts | Implemented with PostgreSQL persistence |
| FR-06 | Users shall like, comment, save, and share posts | Implemented with PostgreSQL persistence for Bloom posts and external Reddit/YouTube posts |
| FR-07 | Users shall follow creators | Implemented with PostgreSQL-backed follow relationships |
| FR-08 | Users shall view trending topics | Implemented |
| FR-09 | Users shall participate in polls | Implemented locally |
| FR-10 | Users shall use in-app chat | Backlog |
| FR-11 | Users shall start/end a live-room demo | Backlog |
| FR-12 | System shall support geolocation tagging | Implemented with browser API |
| FR-13 | System shall be accessible online | Implemented through Vercel deployment |
| FR-14 | System shall support responsive design | Implemented with Tailwind responsive layouts |
| FR-15 | Admins shall manage users, posts, trends, and integrations | Partially implemented; user edit/status controls and post moderation actions exist, while trend/integration workflows remain limited |
| FR-16 | System shall generate content suggestions from trend data | Partially implemented through the AI Suggestions admin view; approval/reuse workflows remain backlog |
| FR-17 | Admins shall monitor external API and fallback status | Partially implemented through the Integration Management admin view |
| FR-18 | Admins shall moderate or remove inappropriate Bloom posts | Implemented for Bloom posts through admin hide/restore and delete controls |

---

# 9. Non-Functional Requirements

| Requirement | Description | Current Approach |
|---|---|---|
| Performance | Page load should remain fast | Reddit fetch is cached/revalidated; fallback data is available |
| Responsiveness | Mobile-friendly UI | Tailwind responsive grid layouts |
| Reliability | Stable API behavior | Fallback posts if Reddit fails; Prisma verification script exists |
| Usability | Easy-to-use interface | Modal auth, social feed, cards, clear actions |
| Deployability | Online hosting | Vercel deployment using the Next.js framework preset |
| Maintainability | Clear file separation | Social components, lib utilities, Prisma config, types, and app routes are separated |
| Explainability | Insight features should be understandable | Planned suggestions should show which trend keyword or source influenced the recommendation |
| Manageability | Added services should be controllable | Protected admin dashboard exposes user, post, trend, AI suggestion, and integration management views; action controls remain the next milestone |

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

### Endpoint

```http
DELETE /api/posts/[id]
```

### Description
Deletes an authenticated user's own Bloom & Brew post. Reddit and YouTube external feed posts cannot be deleted from Bloom & Brew.

The `source` field can be either `reddit` or `fallback`.

---

## 10.3 Internal YouTube API Route

### Endpoint

```http
GET /api/youtube
```

### Description
Fetches cafe, latte art, flower, and bouquet-related videos from the YouTube Data API, normalizes them into the same social feed shape as Reddit and Bloom & Brew posts, and returns them to the homepage feed. If `YOUTUBE_API_KEY` is missing or the API fails, the route returns a fallback feed item explaining that the key is not configured.

### Response Shape

```json
{
  "posts": [
    {
      "id": "youtube_VIDEO_ID",
      "source": "youtube",
      "community": "YouTube",
      "content": "Video title",
      "youtubeVideoId": "VIDEO_ID",
      "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
      "youtubeChannel": "Channel name"
    }
  ],
  "source": "youtube"
}
```

---

## 10.4 Internal Posts API Route

### Endpoint

```http
GET /api/posts
```

### Description
Returns PostgreSQL-backed user-created posts in the social feed format. Public feed requests only return posts with `status = "VISIBLE"` so admin-hidden posts are removed from the user-facing feed without deleting the database record.

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
Creates a new Bloom & Brew post in PostgreSQL for the authenticated user.
The `imageUrl` field currently acts as a media URL. If it contains a supported YouTube URL, the application derives the video id and renders an embedded YouTube iframe instead of an image. Supported formats include `youtube.com/watch?v=...`, `youtube.com/shorts/...`, `youtube.com/embed/...`, `youtube.com/live/...`, and `youtu.be/...`.

### Request Shape

```json
{
  "content": "New cafe and bouquet idea",
  "imageUrl": "https://example.com/image.jpg or https://www.youtube.com/watch?v=VIDEO_ID",
  "filter": "Blush",
  "location": "Kuala Lumpur"
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

## 10.5 Internal Authentication API Routes

### Endpoints

```http
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
PATCH /api/auth/me
```

### Description
These routes manage Bloom & Brew user accounts and sessions. Passwords are hashed before storage, and authenticated sessions are stored in PostgreSQL with an HTTP-only cookie.

### Signup Request Shape

```json
{
  "name": "Bloom Barista",
  "email": "user@example.com",
  "password": "secure-password"
}
```

### Login Request Shape

```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

### Auth User Response Shape

```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "profile": {
      "name": "Bloom Barista",
      "username": "bloombarista",
      "bio": "New to Bloom & Brew Social.",
      "location": "Kuala Lumpur",
      "avatar": "BB"
    }
  }
}
```

---

## 10.6 Internal User Follow API Routes

### Endpoints

```http
GET /api/users/suggestions
POST /api/users/[id]/follow
```

### Description
These routes power the suggested follows card. The suggestions endpoint returns Bloom & Brew users from PostgreSQL and includes whether the authenticated viewer is already following each user. The follow endpoint toggles a PostgreSQL-backed `Follow` record between the authenticated user and the selected creator.

### Suggested Users Response Shape

```json
{
  "people": [
    {
      "id": "user_id",
      "name": "Petal Notes",
      "username": "petalnotes",
      "avatar": "PN",
      "bio": "Flower market notes and bouquet ideas.",
      "isFollowing": false
    }
  ]
}
```

### Follow Toggle Response Shape

```json
{
  "isFollowing": true,
  "username": "petalnotes"
}
```

---

## 10.7 Internal External-Post Interaction API Routes

### Endpoints

```http
POST /api/external-posts/sync
POST /api/external-posts/[id]/comments
POST /api/external-posts/[id]/likes
POST /api/external-posts/[id]/bookmarks
POST /api/external-posts/[id]/shares
```

### Description
These routes persist user interactions for Reddit and YouTube feed items without copying the full third-party post into the Bloom & Brew post table. The app stores the external source, external post id, title, URL, author, and interaction records in PostgreSQL.

---

## 10.8 Internal Notification API Route

### Endpoints

```http
GET /api/notifications
POST /api/notifications
```

### Description
These routes load and create database-backed in-app notifications for the authenticated user.

---

## 10.9 Admin Management API Routes

### Implemented Endpoint

```http
POST /api/admin/login
```

This route validates an existing user account with email and password, checks whether the account email is present in the server-side `ADMIN_EMAILS` allowlist, and creates the existing HTTP-only session cookie only for authorized admin users.

### Planned Management Endpoints

```http
GET /api/admin/users
PATCH /api/admin/users/[id]
GET /api/admin/posts
DELETE /api/admin/posts/[id]
GET /api/admin/trends
GET /api/admin/integrations
POST /api/admin/suggestions
```

### Description
These routes will support the Admin Insights Dashboard. They should return aggregated user, post, engagement, trend, and integration information for management workflows. Dashboard page access is currently restricted to authorized admin users through server-side session checks and the `ADMIN_EMAILS` allowlist. Dedicated management API routes still need the same admin authorization checks before mutation actions are added.

### Planned Response Data

| Endpoint | Data |
|---|---|
| `/api/admin/users` | Users, profiles, post counts, follower counts, following counts, account status |
| `/api/admin/posts` | Bloom posts, authors, comments, likes, saves, shares, created dates |
| `/api/admin/trends` | Trending keywords, source counts, related posts |
| `/api/admin/integrations` | Reddit status, YouTube status, fallback status, last fetch result |
| `/api/admin/suggestions` | Content ideas, hashtag suggestions, trend summaries |

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
- Sidebar calendar
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

# 11.5 Admin Dashboard Pages

## Components
- Admin overview statistics
- User management table
- Post management and moderation table
- Trend keyword panel
- AI-style content suggestion panel
- External integration status cards
- Independent admin login form
- Admin sidebar navigation
- Admin sign-out action

## Implemented Layout
The `/admin` route uses a compact dashboard layout with sidebar navigation for `Users`, `Posts`, `Trends`, `AI Suggestions`, and `Integrations`. Each menu item has its own page instead of placing every management module into one long dashboard page. The UI prioritizes scanning, metrics, tables, and management context rather than marketing-style presentation.

---

# 12. Folder Structure

```text
src/
  app/
    api/
      admin/
        login/
          route.ts
      auth/
        login/
          route.ts
        logout/
          route.ts
        me/
          route.ts
        signup/
          route.ts
      posts/
        [id]/
          bookmarks/
            route.ts
          comments/
            route.ts
          likes/
            route.ts
          shares/
            route.ts
        route.ts
      external-posts/
        [id]/
          bookmarks/
            route.ts
          comments/
            route.ts
          likes/
            route.ts
          shares/
            route.ts
        sync/
          route.ts
      notifications/
        route.ts
      reddit/
        route.ts
      users/
        [id]/
          follow/
            route.ts
        suggestions/
          route.ts
      youtube/
        route.ts
    admin/
      (dashboard)/
        ai-suggestions/
          page.tsx
        integrations/
          page.tsx
        posts/
          page.tsx
        trends/
          page.tsx
        users/
          page.tsx
        layout.tsx
        page.tsx
      _components/
        AdminDashboardFrame.tsx
        AdminPageHeader.tsx
      _lib/
        admin-data.ts
      login/
        AdminLoginForm.tsx
        page.tsx
    community/
      page.tsx
    discover/
      page.tsx
    kaithhealth/
      route.ts
    trends/
      page.tsx
    users/
      [username]/
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
      PublicProfileFollowButton.tsx
      SocialHero.tsx
      SocialSidebar.tsx
      SuggestedFollows.tsx
  lib/
    auth.ts
    external-posts.ts
    fallback-posts.ts
    prisma.ts
    reddit.ts
    social.ts
    trends.ts
    youtube-url.ts
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
| Hosting | Vercel |
| Runtime | Vercel Next.js runtime |
| Build Command | `npm run build` after Vercel installs dependencies |
| Start Command | Managed by Vercel |
| Serving Port | Managed by Vercel |
| Domain | Vercel generated or custom domain |
| Database | Prisma Postgres / PostgreSQL |
| Required Environment Variables | `DATABASE_URL`, `YOUTUBE_API_KEY` |

## Current Build Scripts

```json
{
  "build": "prisma generate && next build",
  "start": "next start"
}
```

Vercel uses the Next.js framework preset for production runtime. The `start` script remains useful for local Node-based serving, but Vercel does not require a manually configured serving port.

---

# 14. Security Considerations

| Concern | Current Handling |
|---|---|
| Reddit API failure | Fallback dataset |
| API abuse | Reddit fetch cache/revalidation |
| Sensitive keys | `DATABASE_URL` and `YOUTUBE_API_KEY` are stored in `.env` locally and must be configured as Vercel environment variables |
| XSS | React escapes rendered text; user content is rendered as text |
| Authentication | Database-backed custom auth with HTTP-only session cookie |
| Password storage | Passwords are hashed before storage |
| Database access | Prisma Client is used only from server-side code/API routes |

## Production Security Recommendation
For a real deployed social network, strengthen the current custom auth with:
- email verification
- password reset
- rate limiting
- OAuth option
- CSRF review for state-changing routes
- stricter server-side authorization checks

---

# 15. Current Implementation Status

## Completed
- Vercel deployment with the Next.js framework preset
- Reddit feed integration with fallback data
- YouTube Data API feed integration with fallback message
- Social feed UI
- Database-backed sign in/sign up modal
- Database-backed profile personalization
- Hashed password storage
- HTTP-only session cookies
- PostgreSQL-backed post creation
- PostgreSQL-backed comments for database posts
- PostgreSQL-backed likes for database posts
- PostgreSQL-backed saves/bookmarks for database posts
- PostgreSQL-backed comments, likes, and saves for Reddit/YouTube external posts
- PostgreSQL-backed share counters for Bloom and external posts
- Themed share modal with copy link, Facebook, Messenger, WhatsApp, email, and device share sheet options
- PostgreSQL-backed follow/unfollow relationships
- Following feed tab for followed creators and the current user's posts
- Follower/following counts in the profile UI
- Public user profile pages at `/users/[username]`
- Feed and suggested-follow links to public profiles
- `GET /api/users/suggestions`
- `POST /api/users/[id]/follow`
- Embedded YouTube video posts in the homepage feed
- User-created posts can embed YouTube links pasted into the composer media field
- `GET /api/posts` and `POST /api/posts`
- `POST /api/posts/[id]/comments`
- `POST /api/posts/[id]/likes`
- `POST /api/posts/[id]/bookmarks`
- `POST /api/posts/[id]/shares`
- `DELETE /api/posts/[id]`
- `POST /api/external-posts/sync`
- `POST /api/external-posts/[id]/comments`
- `POST /api/external-posts/[id]/likes`
- `POST /api/external-posts/[id]/bookmarks`
- `POST /api/external-posts/[id]/shares`
- Prisma schema, migrations, generated client, seed script, and verification script
- Media URL posting, YouTube URL embedding, and CSS filter selection
- Location tagging in the composer
- Database-backed in-app notifications
- `GET /api/notifications`
- `POST /api/notifications`
- In-app notifications and browser notification permission request
- Notification permission moved into the navbar notification menu
- Explicit profile editor with Save and Cancel controls
- Age-sorted combined feed across Bloom, Reddit, and YouTube posts
- Sidebar calendar card
- Trends, Discover, and Community pages
- Admin dashboard shell at `/admin`
- Separate admin management pages for users, posts, trends, AI suggestions, and integrations
- Independent admin login page at `/admin/login`
- `POST /api/admin/login`
- Server-side admin dashboard route protection
- `ADMIN_EMAILS` admin allowlist
- Seeded default admin account for local testing
- Admin navbar link hidden from non-admin users
- Admin dashboard logout action
- Database-backed user account status field with `ACTIVE` and `DISABLED` states
- Admin user edit page for updating user name, email, location, and status
- Database-backed post moderation status field with `VISIBLE` and `HIDDEN` states
- Admin post hide, restore, and delete moderation controls
- Public Bloom post feed filters out hidden posts
- Admin user search with paginated results
- Admin post search and `VISIBLE`/`HIDDEN` status filtering with paginated results
- Admin action feedback for user edits, status changes, and post moderation actions
- Delete confirmation for destructive admin post deletion
- Admin mutation-level authorization checks for user edit/status and post moderation server actions
- Disabled users are blocked from regular login and admin login
- Existing disabled-user sessions are invalidated by the current-user lookup

## Partially Implemented
- Feed persistence: user-created posts persist in PostgreSQL, while Reddit/YouTube content remains externally sourced and is mirrored only for interaction persistence
- YouTube persistence: YouTube video posts are fetched from the API and embedded in the feed, while user interactions are saved locally in PostgreSQL
- Follow personalization: follow records persist in PostgreSQL and power a Following feed, but external Reddit/YouTube posts are not personalized by follows
- User identity: real accounts exist, but there is no email verification, password reset, OAuth, or advanced account security yet
- Authorization: admin allowlist protection exists, but there is no database-backed admin role field yet
- Notifications: in-app notifications are database-backed, with browser permission request but no push service worker
- Media editing: CSS filters only
- Geolocation: coordinate tagging only, no map/location search
- Reddit source: public JSON endpoint with fallback data; OAuth/API credentials are currently deferred
- Trend analysis: keyword extraction exists, but it is not yet connected to admin-managed content suggestions
- User management dashboard: user metrics, search, pagination, edit controls, disable/reactivate controls, and server-action authorization checks exist; dedicated admin management API routes remain incomplete
- Post management dashboard: post and engagement data, search, status filtering, pagination, hide/restore, delete confirmation, delete controls, and server-action authorization checks exist; dedicated admin management API routes remain incomplete
- Trend management dashboard: trend signals can be viewed, but approval/featured workflows are not complete
- AI-assisted content suggestion workflow: suggestion view exists, but approval, dismissal, reuse, and persistence are not complete
- Integration management dashboard: integration status view exists, but richer health/fallback diagnostics are not complete
- Share analytics: share counters persist, but selected platform/method is not yet persisted for analytics

## Not Yet Implemented
- Admin-only management API mutation routes
- Database-backed admin role field
- Share analytics by platform/method
- OAuth login
- Email verification
- Password reset
- Friend request accept/decline workflow
- In-app chat / calling
- Database-backed chat messages
- Real-time chat/calling
- Real push notifications
- File upload/object storage
- Real video/audio streaming
- Live-room UI and lifecycle
- Comprehensive server-side authorization rules for every mutation route

---

# 16. Limitations

- Authentication is custom and intentionally simple for the prototype
- User-created posts, comments, likes, and saves use authenticated user records
- Follow relationships use authenticated user records and are persisted in PostgreSQL
- Reddit/YouTube post content remains externally sourced, but comments, likes, saves, and shares on those items are persisted in PostgreSQL
- Reddit currently uses the public JSON endpoint and can fall back to curated data if production hosting cannot fetch Reddit reliably
- Polls are local-only
- Follow data filters the database-backed Following feed, but does not yet personalize Reddit or YouTube content
- Chat and live-room features are currently hidden and tracked as backlog items
- Admin access is controlled by an `ADMIN_EMAILS` allowlist instead of a database-backed role field
- Admin management pages include search, pagination, server-action authorization checks, user status/edit controls, post moderation controls, and disabled-user enforcement
- Trend keywords are displayed, but there is no approval workflow or content suggestion management yet

---

# 17. Future Improvements

- Add admin-only management API routes with authorization checks
- Add database-backed admin roles
- Add trend approval/featured workflows using the existing keyword analysis utility
- Add AI-style suggestion approval, dismissal, and reuse workflows
- Add richer integration health cards for Reddit and YouTube
- Add share analytics by platform/method
- OAuth login with Auth.js, Supabase Auth, or another provider
- Optional Reddit OAuth/API credentials if public Reddit JSON is blocked in production
- Add followed-first ranking to the For You feed
- Extend PostgreSQL persistence to messages
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

# 18. Recommended Next Implementation Sequence

The next development branch should focus on the management functionality required by the new assignment question.

## Priority 1: Admin Management Hardening
- Move admin mutations into dedicated API/server-action helpers where useful
- Add clearer disabled-account UI messaging after a previously logged-in session is invalidated

## Priority 2: Database-Backed Admin Roles
- Add a user role or admin flag to Prisma
- Migrate admin access from `ADMIN_EMAILS` to database-backed authorization
- Keep `ADMIN_EMAILS` only as a local bootstrap option if needed

## Priority 3: Trend and AI Suggestion Management
- Reuse `src/lib/trends.ts` to generate dashboard trend keywords
- Generate simple content ideas and hashtags from trend keywords
- Allow suggestions to be approved, dismissed, or reused as creator prompts

## Priority 4: Integration Management
- Display Reddit and YouTube source status
- Show whether fallback data is active
- Show missing API key or fetch failure states in a management-friendly format

---

# 19. Conclusion

Bloom & Brew Social is now a deployable social media prototype that combines Reddit-powered community content with core social media interactions. The application demonstrates the required social media platform fundamentals through a frontend demo experience: account creation, profile personalization, feed interactions, content sharing, notifications, following, media editing, calendar-based content prompts, and geolocation. Chat/calling and streaming are documented backlog items for future implementation.

The current version is suitable for academic demonstration and deployment. For the next assignment, the most important expansion is the Admin Insights Dashboard because it connects emerging technologies, richer data, recommendation services, and management functionality in one coherent enhancement. For production use, the remaining local/demo features should be replaced with persistent database storage, stronger account security, role-based authorization, and real-time infrastructure.
