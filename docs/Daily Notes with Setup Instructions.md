=====================================================================
SPINE UI — DAILY NOTES & SETUP INSTRUCTIONS
=====================================================================
Author: Shravan Ashok
Project: Spine (Book Library & Social Tracker - Frontend)
Coverage: Sprint 7, Day 1 through Day 4
=====================================================================


=====================================================================
PART 0 — COMPLETE SETUP INSTRUCTIONS FROM SCRATCH
=====================================================================

--- 0.1 Prerequisites ---
1. Node.js 20+
2. Backend API running (http://localhost:5208)

--- 0.2 Create the Project ---
Because Vite 9 and TypeScript 7 have a peer-dependency conflict with ESLint, 
we must bypass the strict resolution:

  npm create vite@latest spine-ui -- --template react-ts
  cd spine-ui
  npm install --legacy-peer-deps

  # Install dependencies
  npm install react-router-dom @tanstack/react-query axios react-hook-form zod @hookform/resolvers sonner lucide-react clsx tailwind-merge framer-motion @sentry/react posthog-js jwt-decode

  # Install Tailwind v4
  npm install -D tailwindcss@next @tailwindcss/vite --legacy-peer-deps

--- 0.3 Environment Variables ---
Create .env.local in the root of `spine-ui`:
  VITE_API_URL=http://localhost:5208

--- 0.4 Run the Application ---
  npm run dev
Access at http://localhost:5173


=====================================================================
PART 1 — DAY 1: FOUNDATION & AUTHENTICATION
=====================================================================

--- Architecture ---
- React 19 + Vite + TypeScript
- Tailwind CSS v4 (CSS-based config via @theme)
- TanStack Query for server state (library data, quotes)
- React Router for navigation

--- Contexts ---
1. ThemeContext:
   - Reads `localStorage.getItem('spine_theme')` or system preference.
   - Toggles the `.dark` class on `document.documentElement`.
2. AuthContext:
   - Stores JWT in `localStorage` (`spine_token`).
   - Decodes the JWT using `jwt-decode` to extract the `DisplayName` and `Email`.
   - Listens for the `auth:unauthorized` event (fired by the Axios 401 interceptor).
   - Exposes `login()`, `logout()`, and `user`.

--- API Client ---
- Axios instance with base URL from `.env.local`.
- Request Interceptor: Attaches the Bearer token.
- Response Interceptor: 
  - On 401: Clears token and dispatches `auth:unauthorized`.
  - Normalizes FluentValidation errors into a single `err.message` string.

--- Auth Fixes ---
- Logout uses `navigate('/login', { replace: true })` to prevent the back-button bypass.


=====================================================================
PART 2 — DAY 2: LIBRARY GRID & UI
=====================================================================

--- The BookCover Component ---
- Uses a 2:3 aspect ratio.
- **The 1x1 Pixel Fix:** Open Library sometimes returns a valid URL that is a 1x1 transparent pixel. The `onLoad` event checks `e.currentTarget.naturalWidth < 10` to detect this.
- Generated Gradient Fallback: If no cover exists, a hash of the title picks a gradient (`from-indigo-500 to-purple-600`, etc.) and overlays the Title, Author, and "Spine" logo.

--- Sidebar ---
- Collapsible (w-64 to w-20).
- Fixed to `h-screen` and `sticky top-0`.
- Logout is pushed to the bottom with `mt-auto`.
- User profile (Avatar + DisplayName + Email) above the logout button.

--- Filters ---
- Language, Genre, and Status filters.
- View toggle (Grid vs. List).
- Sort dropdown (Newest, Title, Author, Rating).


=====================================================================
PART 3 — DAY 3: URL STATE, MOTION & ADD BOOK
=====================================================================

--- URL State Management ---
- Replaced local `useState` for filters with `useSearchParams`.
- The `updateParam` helper also saves `view` and `sort` to `localStorage` so user preferences persist across sessions.

--- Motion (Framer Motion) ---
- `whileTap={{ scale: 0.96 }}` on buttons.
- `layoutId="active-pill"` on the LibraryToolbar status filters.
- `animate-fade-up` CSS animation with staggered delays for the book grid.

--- Dashboard Layout Updates ---
- Added the **Quote Card**.
- Added **Avg Pages** to the Stats Row.
- Added **Continue Reading Row** (hidden if there is only 1 active book).


=====================================================================
PART 4 — DAY 4: UNIFIED SEARCH & SERIES GROUPING
=====================================================================

--- The Unified Add Book Modal ---
- Single input detects if the user pasted an ISBN (10 or 13 digits). 
  - If ISBN: Calls POST /api/UserBooks for instant add.
  - If Text: Calls GET /api/Books/search.
- Multiselect: Stores selected books in a `Set<string>`. Shows an indigo checkmark overlay.
- Sticky Action Bar: Framer Motion slides up from the bottom when `selectedIds.size > 0`.
- Fallback: If the search returns 0 results, a button appears to switch to the Manual form with the query pre-filled as the title.

--- Series Grouping ---
- Backend: Updated `SearchBooksAsync` to fetch the specific "Work" record to extract the `series` name (since basic search doesn't return it).
- Backend: Updated `AddBookManually` to accept `SeriesName` and `SeriesPosition`, creating the Series record if it doesn't exist.
- Frontend: Added a "Group by Series" toggle in the LibraryToolbar.
- Frontend: `groupedBooks` useMemo groups by `seriesName`. Renders a Framer Motion accordion (`<SeriesGroup />`) for series, and a flat grid for standalone books.

--- Dynamic Quote API ---
- Backend: Fetches a random book quote from `api.quotable.io` (24h in-memory cache).
- Frontend: `QuoteCard` displays `quote.text` and `quote.author`.


=====================================================================
PART 5 — COMMON ERRORS AND FIXES
=====================================================================

1. Back Button Bypass:
   - Fix: `navigate('/login', { replace: true })`.

2. Display Name wrong:
   - Fix: Added `new("DisplayName", user.DisplayName)` to the JWT claims in .NET.

3. Quote Card not rendering:
   - Fix: Use subqueries in SQL to attach to the correct email. In the controller, check both `Sub` and `NameIdentifier` claims.

4. TypeScript / ESLint Version Conflict:
   - Fix: Use `--legacy-peer-deps` for all npm installs.

5. 1x1 Transparent Pixel Covers:
   - Fix: Check `naturalWidth < 10` inside `onLoad`.

6. Covers missing on Dashboard:
   - Cause: The `AddBookManuallyRequest` DTO didn't have a `CoverUrl` field, so the backend dropped it.
   - Fix: Added `CoverUrl` to the DTO and mapped it in `AddBookManually`.

7. Duplicate Books:
   - Cause: Duplicate check only ran on ISBN.
   - Fix: Added a `Title + Author` check in `AddBookManually` and `AddBookToLibrary`.

8. Series Showing as "Standalone Books":
   - Cause: The Open Library search API doesn't return series data by default.
   - Fix: Added a secondary API call to the Work record inside `SearchBooksAsync` to extract the `series` name and pass it through to the frontend.

9. Series Detection Failing for Some Books (e.g., Stormlight):
   - Cause: Open Library stores series data inconsistently (sometimes in `subjects`, sometimes in the `title`).
   - Fix: Added Regex parsing for both `subjects` array and `title` string to extract "Book X of..." patterns.


=====================================================================
PART 6 — SECURITY BASICS
=====================================================================

1. .env.local is gitignored.
2. JWT is stored in localStorage (migration to HttpOnly cookies is scheduled for Sprint 8).
3. 401 responses clear the token and fire `auth:unauthorized`.
4. Error messages are normalized.
5. External links use `rel="noopener noreferrer"`.
6. Forms have `disabled={isLoading}` to prevent double submissions.