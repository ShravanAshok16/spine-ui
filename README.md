# Spine UI

A production-grade, responsive React frontend for tracking physical book collections, reading progress, and sharing libraries with friends.

🌐 **Live App:** *(Coming in Sprint 7)*
🔌 **Backend Repo:** [ShravanAshok16/Spine](https://github.com/ShravanAshok16/Spine)

---

## 📌 Current Status

**Phase:** Sprint 7 — Web Frontend Core
**Progress:** `[██████░░░░] 60%`

### ✅ Done
- **Vite + React 19 + TypeScript** foundation.
- **Tailwind CSS v4** with custom "Warm Minimalism" theme.
- **Global State:** AuthContext (JWT decoding), ThemeContext (Day/Night toggle with physics).
- **The Two-Mode Architecture:**
  - `/dashboard`: The "Morning Coffee" view (Greeting, Stats, Favourites Carousel, Quote, Heatmap).
  - `/library`: The "Vault" (Heavy filtering, Series Grouping, Batch Delete, Create Series).
- **Unified Add Book Modal:** ISBN instant-add, Multiselect Title/Author search, Manual fallback.
- **Optimistic UI:** Instant UI updates for favouriting, updating progress, and changing statuses.
- **Granular Tracking:** Ownership statuses (Owned, Wishlist, LentOut, Sold, etc.), Paused reading status, and Favourites.
- **Advanced UI Components:** Framer Motion sliding pills, Jelly Icons, Animated Modals, and Skeleton Loaders.

### 🚧 In Progress
- Preparing for Day 6: Discover & Recommendations Pages.

---

## 🏗️ Project Structure

```text
spine-ui/
├── src/
│ ├── api/ # Axios client, library.ts, quotes.ts, types.ts
│ ├── components/ # AddBookModal, BookCover, Sidebar, UpdateProgressModal, etc.
│ ├── context/ # AuthContext, ThemeContext
│ ├── pages/ # Dashboard, Library, Login, Register
│ ├── App.tsx # Routing (Protected routes)
│ ├── main.tsx # Providers + Sentry init
│ └── index.css # Tailwind theme
├──.env.example
├── vercel.json
└── README.md


spine-ui/
├── src/
│   ├── api/                    # HTTP layer
│   │   ├── client.ts           # axios instance + interceptors
│   │   ├── library.ts          # getMyLibrary
│   │   ├── quotes.ts           # getRandomQuote
│   │   └── types.ts            # DTOs matching backend
│   ├── components/
│   │   ├── ui/                 # Reusable primitives (if added later)
│   │   ├── layout/             # Sidebar, PageShell
│   │   ├── AddBookModal.tsx    # Animated form for adding books
│   │   ├── BookCover.tsx       # 2:3 cover with generated fallback
│   │   ├── BookListItem.tsx    # Horizontal list view card
│   │   ├── ContinueReadingBanner.tsx
│   │   ├── ContinueReadingRow.tsx
│   │   ├── EmptyLibrary.tsx
│   │   ├── LibraryToolbar.tsx  # Filters, sort, view toggle
│   │   ├── QuoteCard.tsx
│   │   ├── ReadingHeatmap.tsx
│   │   ├── StatsRow.tsx
│   │   ├── SpineLogo.tsx       # Custom SVG icon
│   │   └── ThemeToggle.tsx
│   ├── context/
│   │   ├── AuthContext.tsx     # JWT state + user decoding
│   │   └── ThemeContext.tsx    # Dark/Light mode
│   ├── lib/
│   │   └── utils.ts            # cn() helper
│   ├── pages/
│   │   ├── Dashboard.tsx       # The main library view
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── App.tsx                 # Routes (Protected via AuthContext)
│   ├── main.tsx                # Entry point (Providers + Sentry)
│   └── index.css               # Tailwind theme tokens + animations
├── .env.example
├── .env.local                  # gitignored
├── vercel.json                 # (Coming in Day 7)
├── vite.config.ts
└── README.md

##Clone & Install
git clone https://github.com/ShravanAshok16/spine-ui.git
cd spine-ui
npm install

##Configure Environment
cp .env.example .env.local

