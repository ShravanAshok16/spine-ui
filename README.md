# Spine UI

A production-grade, responsive React frontend for tracking physical book collections, reading progress, and sharing libraries with friends.

🌐 **Live App:** *(Coming soon)*
🔌 **Backend Repo:** [ShravanAshok16/Spine](https://github.com/ShravanAshok16/Spine)

---

## 📌 Current Status

**Phase:** Sprint 7 — Web Frontend Core
**Progress:** `[████████░░] 80%`

### ✅ Done
- **Vite + React 19 + TypeScript** foundation.
- **Tailwind CSS v4** with custom "Warm Minimalism" theme.
- **Global State:** `AuthContext`, `ThemeContext` (Physics toggle), `UIContext` (Global modal).
- **The Two-Mode Architecture:**
  - `/dashboard`: Morning Coffee view (Greeting, Stats, Favourites, Heatmap).
  - `/library`: The Vault (Filters, Batch Delete, Series Grouping).
- **Discovery:** `/discover` (Netflix-style carousels) and `/for-you` (Recommendations).
- **Book Details:** Instant loading via state passing + background fetch for full data.
- **Premium UI:** Framer Motion Page Transitions (Blur Dissolve), Floating Pill Mobile Nav (Seesaw Tilt), Speed Dial FAB.
- **Optimistic UI:** Instant favourite/progress updates.
- **Offline Resilience:** Caching external searches for 15 minutes.

### 🚧 In Progress
- Preparing for Sprint 8 (Reading Sessions, Analytics, Global Search).

---

## 🏗️ Project Structure

```text
spine-ui/
├── src/
│ ├── api/                  # Axios client, library.ts, quotes.ts
│ ├── components/           # BookCover, FloatingAddButton, PageTransition, etc.
│ ├── context/              # AuthContext, ThemeContext, UIContext
│ ├── pages/                # Dashboard, Library, Discover, ForYou, BookDetails
│ ├── App.tsx               # Routing (AnimatePresence + Protected Routes)
│ ├── main.tsx              # Providers + Sentry
│ └── index.css             # Tailwind theme
├──.env.example
├── vite.config.ts
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

