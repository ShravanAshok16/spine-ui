=====================================================================
SPINE UI — MASTER ARCHITECTURE & DAILY NOTES
=====================================================================
Author: Shravan Ashok
Project: Spine (Book Library & Social Tracker — Frontend)
Coverage: Sprint 7, Day 1 through Day 8
=====================================================================

=====================================================================
PART 0 — COMPLETE SETUP INSTRUCTIONS FROM SCRATCH
=====================================================================

--- 0.1 Prerequisites ---
1. Node.js 20+
2. Backend API running (http://localhost:5208)

--- 0.2 Create the Project ---
Because Vite 9 and TypeScript 7 have a peer-dependency conflict with ESLint, we must bypass the strict resolution:

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
- TanStack Query for server state (caching, optimistic updates).
- React Router v7 for navigation.

--- Contexts ---
1. ThemeContext: 
   - Reads `localStorage.getItem('spine_theme')`, falls back to `prefers-color-scheme`.
   - Toggles `.dark` class on `<html>`.
2. AuthContext: 
   - Stores JWT in `localStorage` (`spine_token`).
   - Decodes the JWT using `jwt-decode` to extract `FirstName` and `LastName`.
   - Listens for `auth:unauthorized` event (fired by Axios 401 interceptor).

--- API Client ---
- Axios instance with base URL from `.env.local`.
- Request Interceptor: Attaches Bearer token.
- Response Interceptor: 
   - On 401: Clears token and dispatches `auth:unauthorized`.
   - Normalizes FluentValidation errors into a single `err.message` string.

--- Auth Fixes ---
- Logout uses `navigate('/login', { replace: true })` to prevent the back-button bypass.

=====================================================================
PART 2 — DAY 2 & 3: LIBRARY GRID & URL STATE
=====================================================================

--- The BookCover Component ---
- Uses a 2:3 aspect ratio.
- **The 1x1 Pixel Fix:** Open Library returns a 1x1 transparent pixel. `onLoad` checks `e.currentTarget.naturalWidth < 10` to trigger the fallback.
- Generated Gradient Fallback: If no cover exists, hashes the title to pick a gradient.

--- URL State Management ---
- Filters are stored in the URL (`?status=Reading`). Survives refresh.
- The `updateParam` helper also saves `view` and `sort` to `localStorage`.

--- Motion (Framer Motion) ---
- `whileTap={{ scale: 0.96 }}` on buttons.
- `layoutId="active-pill"` on the LibraryToolbar status filters.
- `animate-fade-up` CSS animation with staggered delays for the book grid.

=====================================================================
PART 3 — DAY 4: UNIFIED SEARCH & SERIES GROUPING
=====================================================================

--- The Unified Add Book Modal ---
- Regex checks if the query is an ISBN (10 or 13 digits). If ISBN: Instant add.
- If Text: Multiselect search. Selected books stored in a `Set<string>`.
- Sticky Action Bar: Framer Motion slides up from the bottom when `selectedIds.size > 0`.
- Fallback: If search fails, switch to manual form with the query pre-filled.

--- Series Grouping ---
- Backend: `SearchBooksAsync` fetches the "Work" record to extract the `series` name.
- Backend: `AddBookManually` accepts `SeriesName` and creates the record.
- Frontend: `groupedBooks` useMemo groups by `seriesName`. Renders `<SeriesGroup />` accordion.

--- Dynamic Quote API ---
- Backend: Fetches a random quote from `api.quotable.io` (24h in-memory cache).
- Frontend: `QuoteCard` displays `quote.text` and `quote.author`.

=====================================================================
PART 4 — DAY 5: ARCHITECTURE SPLIT & OPTIMISTIC UI
=====================================================================

--- The Two-Mode Architecture ---
1. `/dashboard` (Morning Coffee): High-level stats, Quote, Favourites, Yearly Goal progress.
2. `/library` (The Vault): Heavy management, Search, Filters, Batch Delete, Series Creation.

--- Granular Tracking ---
- Added `OwnershipStatus` enum (Owned, Wishlist, LentOut, Sold, Donated, Lost).
- Added `IsFavourite` boolean.
- Added "Paused" to the reading statuses.

--- Optimistic Updates (TanStack Query) ---
- We use `useMutation` with `onMutate`. 
- When a user clicks "Favourite" or "Update Progress", the UI updates instantly.
- If the API fails, `onError` rolls back the change using the previous snapshot.

--- Batch Delete ---
- Checkboxes appear on hover in the Library page.
- Selecting books triggers a Framer Motion sticky bottom bar.
- API: `POST /api/UserBooks/batch-delete`.

=====================================================================
PART 5 — DAY 6 & 7: DISCOVERY & DETAILS (The Goodreads Refactor)
=====================================================================

--- The Discover Page ---
- Uses Netflix-style horizontal carousels.
- Extracted the `useDiscoverRow` hook OUTSIDE the component to prevent React infinite re-renders (which caused infinite skeletons).
- Fetches 5 rows: Trending Fantasy, Popular in Kannada, Popular in Tamil, Mystery, Romance.
- Edge Fade Mask: A gradient `absolute right-0` div hides the hard edge of the carousel.

--- The Book Details Page ---
- **Instant Load:** Passed the `book` object via `location.state` from Discover. `useQuery` uses `placeholderData` so the UI renders instantly while fetching the full details in the background.
- **The "Try Again" Button:** Because Google Books/OpenLibrary can fail, if `!hasDescription`, we show a retry button that calls `refetch()`.
- **Genres:** Handled both string and array formats from the backend.
- **Buy Links:** Dynamic Amazon and Flipkart search links generated from the ISBN.

=====================================================================
PART 6 — DAY 8: GLOBAL UI & PAGE TRANSITIONS
=====================================================================

--- Global UI Context (`UIContext`) ---
- Lifted the `AddBookModal` state out of individual pages.
- Any component can now use `const { openAddModal } = useUI()`.

--- Floating Action Button (`FloatingAddButton`) ---
- Transformed into a Speed Dial: Search, Scan, Manual.
- Uses `useScroll` from Framer Motion to hide on scroll down and reappear on scroll up.

--- Page Transitions ---
- Wrapped `<Routes>` in `<AnimatePresence mode="wait">`.
- Created `PageTransition.tsx`: Blur Dissolve (opacity 0 -> 1, blur 8px -> 0px). Respects `prefers-reduced-motion`.

--- Mobile Navigation ---
- Transformed from a static bar to a Floating Pill.
- Added Seesaw Tilt: `whileTap={{ scale: 0.85, rotate: -10 }}`.

--- Spring Physics ---
- Modals (`AddBookModal`, `UpdateProgressModal`) now pop in with a spring physics (`stiffness: 400, damping: 25`).
- Inputs now shake on error: `animate={{ x: [-10, 10, -10, 10, 0] }}`.

=====================================================================
PART 7 — PROBLEMS FACED AND HOW WE FIXED THEM
=====================================================================

1. **Back Button Bypass**
   - Cause: `navigate('/login')`.
   - Fix: `navigate('/login', { replace: true })`.

2. **Display Name wrong (shows email prefix)**
   - Cause: Backend JWT didn't include the `FirstName`/`LastName` claims.
   - Fix: Added `new("FirstName", user.FirstName)` to `TokenService.cs`, and restarted the backend.

3. **1x1 Transparent Pixel Covers**
   - Cause: Open Library returns a valid URL but a blank image.
   - Fix: Check `naturalWidth < 10` inside `onLoad`.

4. **Covers missing on Dashboard**
   - Cause: `AddBookManuallyRequest` DTO didn't have a `CoverUrl` field.
   - Fix: Added `CoverUrl` to the DTO and mapped it.

5. **Duplicate Books**
   - Cause: Duplicate check only ran on ISBN.
   - Fix: Added a `Title + Author` check in `AddBookManually`.

6. **Series Showing as "Standalone Books"**
   - Cause: Open Library search doesn't return series data.
   - Fix: Added a secondary call to the Work record inside `SearchBooksAsync`.

7. **Theme Toggle Scrollbar Bug**
   - Cause: Framer Motion's `layoutId` caused the container to expand.
   - Fix: Added `[&::-webkit-scrollbar]:hidden` and `scrollbar-width:none` to the container.

8. **File Locked on Build**
   - Cause: `dotnet watch` held onto the DLL.
   - Fix: `taskkill /F /IM dotnet.exe` and restart.

9. **Infinite Skeletons on Discover**
   - Cause: Defining `useDiscoverRow` inside the component caused React to lose state.
   - Fix: Moved `useDiscoverRow` outside the component.

10. **Missing Book Descriptions**
    - Cause: Backend cached incomplete results and OpenLibrary failed to provide descriptions.
    - Fix: Backend switched priority to Google Books, only caches complete results, and frontend added the "Try Again" button.

11. **Syntax Errors (`apiClient.get/...`)**
    - Cause: Missing backticks and parentheses.
    - Fix: Corrected string interpolation.

=====================================================================
PART 8 — WHAT WENT WELL
=====================================================================
- **Architecture:** Separating the Dashboard from the Library makes the app feel professional.
- **User Experience:** Optimistic UI makes the app feel lightning fast. Global Contexts make the FAB work everywhere.
- **Design System:** Warm Minimalism + Framer Motion gives the app a premium feel.
- **Resilience:** The "Try Again" button and caching strategy ensure the app doesn't break when external APIs fail.

=====================================================================
END OF NOTES
=====================================================================