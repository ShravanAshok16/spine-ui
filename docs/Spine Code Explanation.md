=====================================================================
SPINE UI — COMPLETE CODE EXPLANATION
=====================================================================
Coverage: Sprint 7, Day 1 through Day 5
=====================================================================

=====================================================================
PART 1 — API & CONTEXTS
=====================================================================

--- src/api/client.ts ---
  - Axios instance with baseURL from `import.meta.env.VITE_API_URL`.
  - Request interceptor: Reads 'spine_token' from localStorage, attaches `Authorization: Bearer`.
  - Response interceptor:
    - On 401: Removes token and dispatches `auth:unauthorized`.
    - Normalizes errors: Checks for FluentValidation shape (`data.errors`) and joins messages. Falls back to `data.error` or `data.message`.

--- src/context/AuthContext.tsx ---
  - Holds `token` and `user` state.
  - `useEffect`: Decodes token using `jwt-decode`. Extracts `sub` (id), `email`, `FirstName`, `LastName`.
  - `login(token)`: Saves to localStorage and state.
  - `logout()`: Clears localStorage and state.
  - Listens for 'auth:unauthorized' event to trigger logout.

--- src/context/ThemeContext.tsx ---
  - Initializes theme from localStorage ('spine_theme') or `prefers-color-scheme`.
  - `useEffect`: Toggles `.dark` class on `document.documentElement` and saves to localStorage.

--- src/api/library.ts ---
  - `getMyLibrary()`: GET `/api/UserBooks`.
  - `searchExternalBooks(query)`: GET `/api/Books/search?q=`.
  - `deleteUserBook(id)`: DELETE `/api/UserBooks/{id}`.
  - `batchDeleteBooks(ids)`: POST `/api/UserBooks/batch-delete`.
  - `toggleFavourite(id)`: PATCH `/api/UserBooks/{id}/favourite`.
  - `updateProgress(id, page)`: PATCH `/api/UserBooks/{id}/progress`.
  - `linkSeries(seriesName, bookIds)`: POST `/api/UserBooks/link-series`.

--- src/api/quotes.ts ---
  - `getDailyQuote()`: GET `/api/Quotes/daily`.

=====================================================================
PART 2 — DASHBOARD & LIBRARY
=====================================================================

--- src/pages/Dashboard.tsx ---
  - **Purpose:** The "Morning Coffee" view.
  - `useSearchParams` manages URL state.
  - `greeting`: Calculates "Good morning/evening" based on `new Date().getHours()`. Formats `user.lastName, user.firstName`.
  - `useQuery`: Fetches library with queryKey `['library']`.
  - `readingBooks`: Memoized filter for `status === 'Reading'`.
  - `booksFinishedThisYear`: Dynamic calculation for the Yearly Goal card.
  - `favouriteBooks`: Filters `books.filter(b => b.isFavourite)`.
  - **Renders:** Bento grid with Continue Reading banner (or empty state), Stats Row, Quote Card, Yearly Goal card, Favourites carousel, and Heatmap.

--- src/pages/Library.tsx ---
  - **Purpose:** The "Vault" for heavy management.
  - `selectedBooks`: A `Set<string>` for Batch Selection.
  - `handleBatchDelete`: Calls `batchDeleteBooks`, then invalidates `['library']` and clears the set.
  - **Renders:** `LibraryToolbar`, Grid/List view, SeriesGroup accordions.
  - **Sticky Action Bar:** If `selectedBooks.size > 0`, renders a fixed bottom bar with a "Delete Selected" button.

--- src/components/LibraryToolbar.tsx ---
  - **Status Tabs:** Uses Framer Motion `layoutId="active-pill"` for the sliding background.
  - **View Toggle:** Grid vs List with `whileTap`.
  - **Filters:** Language, Genre, Sort.

=====================================================================
PART 3 — MODALS & ANIMATIONS
=====================================================================

--- src/components/AddBookModal.tsx ---
  - **Framer Motion:** `AnimatePresence` wraps the modal.
  - **Multiselect:** `selectedIds` Set tracks clicked books. Clicking a cover adds a checkmark overlay.
  - **Sticky Bar:** `initial={{ y: 100 }}` animates up when `selectedIds.size > 0`.
  - **handleSearch:** Regex checks for ISBN. If text, calls `searchExternalBooks`.
  - **handleAddSelected:** `Promise.all` of POST requests to `/api/UserBooks/manual`.

--- src/components/UpdateProgressModal.tsx ---
  - **Optimistic Update:** Uses `useMutation` with `onMutate`.
  - Cancels outgoing queries, snapshots the previous state, updates the UI instantly with the new page count, then sends the API request.
  - `onError` rolls back to the snapshot if the API fails.

--- src/components/BookCover.tsx ---
  - **aspect-[2/3]** container.
  - **Fallback Logic:** `showFallback = !book.coverUrl || imageError`. If true, renders a gradient based on the title's char code.
  - **1x1 Pixel Fix:** `handleImageLoad` checks `e.currentTarget.naturalWidth < 10`.
  - **Status Badges:** `statusStyles` maps `status` to color classes.
  - **Delete Button:** Visible on hover, triggers `useMutation(deleteUserBook)`.

--- src/components/SeriesGroup.tsx ---
  - **Chevron Rotate:** `animate={{ rotate: isOpen ? 90 : 0 }}`.
  - **Height Animation:** `AnimatePresence` with `initial={{ height: 0 }}`.

=====================================================================
END OF NOTES
=====================================================================