# Bloom & Brew Social
## Technical Specification Document
### CSC795 – Social Media Ecosystem Assignment

---

# 1. Project Overview

## Project Title
**Bloom & Brew Social: A Reddit-Powered Café & Florist Community Platform**

## Project Description
Bloom & Brew Social is a web-based social media application that integrates with the Reddit API to display and analyze café and florist-related community content. The platform enables users to discover trending café aesthetics, floral inspirations, coffee culture discussions, and community engagement through a modern interactive interface.

The application demonstrates:
- Managed Communities
- Managed Rich Content Communities
- Engagement Loop
- Social Media API Integration

---

# 2. Objectives

## Main Objectives
- Integrate Reddit social media data into a custom application
- Display real-time café and florist-related content
- Create a visually engaging social platform
- Demonstrate social media ecosystem concepts
- Deploy the application online

---

# 3. Target Users

| User Type | Description |
|---|---|
| Café Enthusiasts | Users interested in coffee culture |
| Florist Enthusiasts | Users interested in flowers and bouquets |
| Social Media Users | Users seeking aesthetic inspiration |
| Students/Lecturers | Academic demonstration purposes |

---

# 4. System Architecture

```text
Frontend (Next.js)
        ↓
Next.js API Routes
        ↓
Reddit API
        ↓
Data Processing Layer
        ↓
UI Components / Dashboard
```

---

# 5. Technology Stack

| Component | Technology |
|---|---|
| Frontend Framework | Next.js 15 |
| Styling | Tailwind CSS |
| Backend/API | Next.js API Routes |
| Social Media API | Reddit API |
| Hosting | Vercel / Leapcell |
| Authentication | Optional (NextAuth) |
| Database | Optional (Supabase/PostgreSQL) |
| State Management | React Hooks / Zustand |
| Charts & Analytics | Recharts |

---

# 6. Core Features

# 6.1 Reddit Feed Integration

## Description
Fetch and display café and florist-related Reddit posts.

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
| Upvotes | Post score |
| Comments | Number of comments |
| Image | Thumbnail/media |
| Author | Reddit username |
| Subreddit | Community name |
| URL | Original Reddit link |

---

# 6.2 Inspiration Gallery

## Description
Pinterest-style visual gallery displaying:
- Latte art
- Floral arrangements
- Café aesthetics
- Interior inspirations

## Features
- Masonry layout
- Image cards
- Hover animations
- Save/bookmark functionality

---

# 6.3 Trending Topics Dashboard

## Description
Analyze Reddit post titles and display trending keywords.

## Example Trends
- Matcha
- Minimalist Café
- Tulip Bouquet
- Vintage Coffee Shop

## Visualization
- Keyword frequency charts
- Trending tags
- Popular subreddit analysis

---

# 6.4 Engagement System

## Description
Users interact with content through:
- Likes
- Bookmarks
- Comments
- Polls

## Purpose
Demonstrates:
Post → Interact → Feedback → Improve

---

# 6.5 Community Polls

## Example Polls
- Favorite flower type
- Preferred coffee style
- Best café atmosphere

## Features
- Real-time voting
- Percentage display
- Community participation

---

# 7. Functional Requirements

| ID | Requirement |
|---|---|
| FR-01 | System shall fetch Reddit posts |
| FR-02 | System shall display images/videos |
| FR-03 | Users shall bookmark posts |
| FR-04 | Users shall view trending topics |
| FR-05 | Users shall participate in polls |
| FR-06 | System shall be accessible online |
| FR-07 | System shall support responsive design |

---

# 8. Non-Functional Requirements

| Requirement | Description |
|---|---|
| Performance | Page load under 3 seconds |
| Responsiveness | Mobile-friendly UI |
| Scalability | Support multiple subreddit feeds |
| Usability | Easy-to-use interface |
| Reliability | Stable API integration |

---

# 9. API Specification

## Reddit API

### Endpoint Example

```bash
https://www.reddit.com/r/Coffee/hot.json
```

### Request Method

```http
GET
```

### Sample Response Fields

```json
{
  "title": "Best Latte Art Today",
  "score": 1520,
  "num_comments": 231,
  "thumbnail": "image_url",
  "author": "coffee_user"
}
```

---

# 10. User Interface Design

# 10.1 Homepage

## Components
- Hero banner
- Featured café inspirations
- Trending floral content
- Navigation menu

---

# 10.2 Discover Page

## Components
- Reddit feed cards
- Filters by subreddit
- Search functionality

---

# 10.3 Trends Dashboard

## Components
- Analytics charts
- Trending tags
- Engagement statistics

---

# 10.4 Community Page

## Components
- Polls
- Comments
- User interactions

---

# 11. Folder Structure

```text
/app
  /api
    /reddit
  /discover
  /trends
  /community
/components
  Navbar.tsx
  PostCard.tsx
  TrendChart.tsx
/lib
  reddit.ts
/styles
/public
```

---

# 12. Deployment Plan

| Item | Platform |
|---|---|
| Frontend Hosting | Vercel / Leapcell |
| Domain | Generated deployment URL |
| CI/CD | GitHub Integration |

---

# 13. Security Considerations

| Concern | Solution |
|---|---|
| API Abuse | Rate limiting |
| Sensitive Keys | Environment variables |
| XSS | Sanitized rendering |

---

# 14. Future Improvements

- AI-based recommendation engine
- Sentiment analysis
- User authentication
- Personalized mood boards
- AI-generated café captions
- Mobile application version

---

# 15. Conclusion

Bloom & Brew Social is a modern social media ecosystem platform that integrates Reddit community data to create an engaging café and florist experience. The application fulfills the assignment objectives by combining social networking, rich media content, engagement systems, and real-time social media integration into a deployable web application.
