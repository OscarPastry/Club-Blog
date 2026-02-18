# 🏯 Wabi Sabi Weekly — Japanese Club Blog

> The official blog for the **Japanese Club at VIT Chennai (日本語クラブ)**.  
> A newspaper-inspired web application built with **Next.js 16** and **Supabase**.

---

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running Locally](#running-locally)
- [Architecture](#architecture)
  - [Pages & Routing](#pages--routing)
  - [API Routes](#api-routes)
  - [Library Modules](#library-modules)
  - [Components](#components)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Wabi Sabi Weekly** is a blog platform built for VIT Chennai's Japanese Club. It features a vintage newspaper-style design with a creamy paper texture, serif typography (Playfair Display + Noto Serif JP), and Japanese-inspired aesthetics. Content is authored in Markdown via a password-protected editor and stored in a Supabase PostgreSQL database.

---

## Features

| Feature | Description |
|---|---|
| 📰 **Newspaper Layout** | Homepage with lead article + sidebar articles in a classic newspaper grid |
| ✍️ **Secret Editor** | Password-protected CMS at `/secret-editor` for creating, editing, and deleting posts |
| 📝 **Markdown Support** | Write post content in Markdown — rendered to HTML via `remark` + `remark-html` |
| 💬 **Comments** | Readers can leave comments on posts (with optional author names) |
| ❤️ **Likes & Views** | Automatic view counting and like functionality (likes capped at view count) |
| 📂 **Archives Menu** | Slide-out hamburger menu listing all posts for easy navigation |
| 🎌 **Japanese Typography** | Noto Serif JP font + vertical text (`tategaki`) CSS utility |
| 🚀 **Vercel-Ready** | Designed for seamless deployment on Vercel |

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org/) | React framework (App Router) |
| [React 19](https://react.dev/) | UI library |
| [Supabase](https://supabase.com/) | PostgreSQL database & client SDK |
| [Remark](https://github.com/remarkjs/remark) | Markdown → HTML processing |
| [date-fns](https://date-fns.org/) | Date formatting utilities |
| [gray-matter](https://github.com/jonschlinkert/gray-matter) | Front-matter parsing |

---

## Project Structure

```
Club-Blog/
├── app/
│   ├── layout.js                   # Root layout (fonts, metadata)
│   ├── page.js                     # Homepage — lead + sidebar articles
│   ├── globals.css                 # Global styles, CSS variables, utilities
│   ├── Home.module.css             # Homepage-specific styles
│   ├── page.module.css             # Additional page styles
│   ├── components/
│   │   ├── Header.js               # Blog masthead ("Wabi Sabi Weekly")
│   │   ├── Header.module.css
│   │   ├── HamburgerMenu.js        # Slide-out archives navigation
│   │   ├── HamburgerMenu.module.css
│   │   ├── Engagement.js           # Views, likes, and comments widget
│   │   └── Engagement.module.css
│   ├── posts/
│   │   └── [slug]/
│   │       └── page.js             # Individual post page (SSG with dynamic routes)
│   ├── secret-editor/
│   │   └── page.js                 # Password-protected CMS editor
│   └── api/
│       ├── create-post/
│       │   └── route.js            # POST — create a new post
│       ├── post/
│       │   └── route.js            # GET / PUT / DELETE — single post CRUD
│       ├── posts-list/
│       │   └── route.js            # GET — list all posts
│       └── engagement/
│           └── route.js            # GET / POST — views, likes, comments
├── lib/
│   ├── supabase.js                 # Supabase client initialization
│   ├── posts.js                    # Post data fetching & markdown processing
│   └── engagement.js               # Engagement logic (views, likes, comments)
├── public/                         # Static assets (SVG icons)
├── package.json
├── next.config.mjs
├── jsconfig.json
└── eslint.config.mjs
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** (comes with Node.js)
- A **Supabase** project ([create one free](https://supabase.com/dashboard))

### Installation

```bash
# Clone the repository
git clone https://github.com/OscarPastry/Club-Blog.git
cd Club-Blog

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase connection
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Secret Editor password
NEXT_PUBLIC_EDITOR_PASSWORD=your-secret-password
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (found in Project Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous/public API key |
| `NEXT_PUBLIC_EDITOR_PASSWORD` | Password to access the `/secret-editor` CMS page |

> ⚠️ **Note**: `NEXT_PUBLIC_EDITOR_PASSWORD` is exposed to the client. This provides basic access control—not production-grade security. For production, consider server-side authentication.

### Database Setup

Create the following tables in your Supabase project's SQL Editor:

```sql
-- Posts table
CREATE TABLE posts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT 'Editor',
    summary TEXT,
    content TEXT,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_slug TEXT REFERENCES posts(slug) ON DELETE CASCADE,
    author TEXT DEFAULT 'Anonymous',
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Running Locally

```bash
# Development server (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

The app will be available at **http://localhost:3000**.

---

## Architecture

### Pages & Routing

| Route | File | Description |
|---|---|---|
| `/` | `app/page.js` | Homepage with lead article and sidebar — server-rendered |
| `/posts/[slug]` | `app/posts/[slug]/page.js` | Individual post page with markdown content, engagement widget |
| `/secret-editor` | `app/secret-editor/page.js` | Password-protected editor for CRUD operations on posts |

All pages use `revalidate = 0` for fresh data on every request.

### API Routes

| Endpoint | Method | Description |
|---|---|---|
| `/api/create-post` | `POST` | Create a new post (auto-generates a unique slug from the title) |
| `/api/post?id=<slug>` | `GET` | Fetch a single post by slug |
| `/api/post` | `PUT` | Update an existing post |
| `/api/post?id=<slug>` | `DELETE` | Delete a post by slug |
| `/api/posts-list` | `GET` | List all posts sorted by date (newest first) |
| `/api/engagement?slug=<slug>` | `GET` | Get views, likes, and comments for a post |
| `/api/engagement` | `POST` | Perform an engagement action (`view`, `like`, `comment`, `delete-comment`) |

#### Engagement Actions (POST `/api/engagement`)

```json
// Increment view
{ "slug": "post-slug", "action": "view" }

// Like a post (capped at view count)
{ "slug": "post-slug", "action": "like" }

// Add a comment
{ "slug": "post-slug", "action": "comment", "payload": { "text": "...", "author": "Name" } }

// Delete a comment (editor use)
{ "slug": "post-slug", "action": "delete-comment", "payload": { "commentId": 123 } }
```

### Library Modules

| Module | Purpose |
|---|---|
| `lib/supabase.js` | Initializes and exports the Supabase client using environment variables |
| `lib/posts.js` | `getSortedPostsData()`, `getAllPostIds()`, `getPostData(slug)` — fetches post data from Supabase and converts Markdown to HTML |
| `lib/engagement.js` | `getPostEngagement()`, `incrementView()`, `incrementLike()`, `addComment()`, `deleteComment()` — manages engagement data in Supabase |

### Components

| Component | Type | Description |
|---|---|---|
| `Header` | Server | Blog masthead displaying "Wabi Sabi Weekly", week number, theme, and Japanese text |
| `HamburgerMenu` | Client | Slide-out drawer with home link and full post archive list |
| `Engagement` | Client | Interactive widget showing views/likes counters, comment list, and comment submission form |

---

## Deployment

This project is optimized for **Vercel**:

1. Push your repository to GitHub
2. Import the project in [Vercel Dashboard](https://vercel.com/new)
3. Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_EDITOR_PASSWORD`) in Project Settings → Environment Variables
4. Deploy — Vercel will auto-detect Next.js and configure the build

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

This project is private to the Japanese Club at VIT Chennai.  
For inquiries, contact the club's technical team.
