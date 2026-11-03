# Spine UI

A production-grade, responsive React frontend for tracking physical book collections, reading progress, and sharing libraries with friends.

🌐 **Live App:** *(Coming in Sprint 7)*  
🔌 **Backend Repo:** [ShravanAshok16/Spine](https://github.com/ShravanAshok16/Spine)

![Spine Dashboard](public/screenshot-dashboard.png) 
*(Note: Add a screenshot of your dashboard to the public folder and name it `screenshot-dashboard.png` to make this image render)*

---

## 📌 Current Status

**Phase:** Sprint 7 — Web Frontend Core
**Progress:** `[████░░░░░░] 40%`

### ✅ Done
- **Vite + React 19 + TypeScript** foundation.
- **Tailwind CSS v4** with custom "Warm Minimalism" theme tokens.
- **Global ThemeContext** (Dark/Light mode persists via `localStorage`).
- **Global AuthContext** with JWT decoding and auto-logout on 401.
- **Axios Interceptor** (Attaches JWT, normalizes FluentValidation errors).
- **Collapsible Sidebar** (with animated `framer-motion` physics and user profile).
- **Dashboard Layout** (Holy Grail): Header, Search, and Grid/List view toggle.
- **Bento Stats Grid:** Total Books, Reading, Finished, Avg Pages.
- **Continue Reading Hero:** Dynamic banner for the most recent book.
- **Reading Heatmap:** GitHub-style 5-week activity tracker.
- **Quote of the Day:** Fetches a random quote from the user's library.
- **Add Book Modal:** Two tabs (ISBN Lookup & Manual Entry) with backdrop blur and scale-in animation.
- **URL State Management:** Filters (status, language, genre, sort) survive page refreshes via `useSearchParams`.
- **Skeleton Loaders:** Replaced spinners with layout-accurate pulse skeletons.
- **Error Boundaries:** Sentry integration scaffolded.

### 🚧 In Progress
- Preparing for Day 4: Book Details Page (Reviews, Series, Where to Buy).

### 📝 Next Up (Day 4)
- Build the `/books/:id` route.
- Display large cover, title, author, and series info.
- Fetch and display public reviews + average rating.
- Add "Where to Buy" (Amazon/Flipkart) search links.
- Form to submit a new review.

---

## 🏗️ Project Structure

```text
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

