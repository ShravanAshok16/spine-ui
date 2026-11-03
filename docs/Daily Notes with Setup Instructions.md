=====================================================================
SPINE UI — DAILY NOTES & SETUP INSTRUCTIONS
=====================================================================
Author: Shravan Ashok
Project: Spine (Book Library & Social Tracker - Frontend)
Coverage: Sprint 7, Day 1 through Day 3
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

--- Routing ---
- `/login` (Public)
- `/register` (Public)
- `/dashboard` (Protected via `<ProtectedRoute>`)

--- Auth Fixes ---
- Logout uses `navigate('/login', { replace: true })` to prevent the back-button bypass.
- Login page split-screen with a background image and color overlay.


=====================================================================
PART 2 — DAY 2: LIBRARY GRID & UI
=====================================================================

--- The BookCover Component ---
- Uses a 2:3 aspect ratio.
- Skeleton state while loading.
- **The 1x1 Pixel Fix:** Open Library sometimes returns a valid URL that is a 1x1 transparent pixel. The `onLoad` event checks `e.currentTarget.naturalWidth < 10` to detect this and trigger the fallback.
- Generated Gradient Fallback: If no cover exists, a hash of the title picks a gradient (`from-indigo-500 to-purple-600`, etc.) and overlays the Title, Author, and "Spine" logo.

--- Sidebar ---
- Collapsible (w-64 to w-20).
- Fixed to `h-screen` and `sticky top-0`.
- Logout is pushed to the bottom with `mt-auto`.
- User profile (Avatar + DisplayName + Email) added above the logout button.

--- Filters ---
- Language, Genre, and Status filters.
- View toggle (Grid vs. List).
- Sort dropdown (Newest, Title, Author, Rating).


=====================================================================
PART 3 — DAY 3: URL STATE, MOTION & ADD BOOK
=====================================================================

--- URL State Management ---
- Replaced local `useState` for filters with `useSearchParams`.
- If a user filters by "Reading" (`?status=Reading`) and refreshes, the filter stays active.
- The `updateParam` helper also saves `view` and `sort` to `localStorage` so user preferences persist across sessions.

--- Add Book Modal ---
- Framer Motion: Backdrop fades in (`opacity: 0 -> 1`), modal scales up (`scale: 0.95 -> 1`).
- Two tabs: **ISBN Lookup** (calls `POST /api/UserBooks`) and **Manual Entry** (calls `POST /api/UserBooks/manual`).
- Prevents double-submit by disabling the button while `isLoading` is true.
- Includes `scroll-padding-bottom` to prevent the mobile keyboard from covering inputs.

--- Motion (Framer Motion) ---
- `whileTap={{ scale: 0.96 }}` on buttons for tactile feedback.
- `layoutId="active-pill"` on the LibraryToolbar status filters. When you click a new filter, the indigo background smoothly slides to it.
- `animate-fade-up` CSS animation with staggered delays (`index * 30ms`) for the book grid.

--- Dashboard Layout Updates ---
- Added the **Quote Card** (fetches from `/api/Quotes/random`).
- Added **Avg Pages** to the Stats Row.
- Added **Continue Reading Row** (horizontal scroller for all active books).
- If there is only 1 active book, the row is hidden to avoid duplication with the Banner.


=====================================================================
PART 4 — COMMON ERRORS AND FIXES
=====================================================================

1. Back Button Bypass:
   - Cause: Logout used `navigate('/login')`.
   - Fix: Use `navigate('/login', { replace: true })`.

2. Display Name wrong (shows email prefix):
   - Cause: Backend TokenService didn't include the `DisplayName` claim.
   - Fix: Added `new("DisplayName", user.DisplayName)` to the JWT claims in .NET.

3. Quote Card not rendering:
   - Cause: `UserId` mismatch in the SQL insert, or the .NET claim mapping was failing.
   - Fix: Use subqueries in SQL to attach to the correct email. In the controller, check both `Sub` and `NameIdentifier` claims.

4. TypeScript / ESLint Version Conflict:
   - Cause: Vite 9 defaults to TypeScript 7, but `typescript-eslint` doesn't support it yet.
   - Fix: Use `--legacy-peer-deps` for all npm installs.

5. 1x1 Transparent Pixel Covers:
   - Cause: Open Library returns a valid image URL, but the image is blank.
   - Fix: Check `naturalWidth < 10` inside `onLoad`.


=====================================================================
PART 5 — SECURITY BASICS
=====================================================================

1. .env.local is gitignored.
2. JWT is stored in localStorage (migration to HttpOnly cookies is scheduled for Sprint 8).
3. 401 responses clear the token and fire `auth:unauthorized`.
4. Error messages are normalized; users never see raw backend stack traces.
5. External links use `rel="noopener noreferrer"`.
6. The `AddBookModal` and login forms have `disabled={isLoading}` to prevent double submissions.