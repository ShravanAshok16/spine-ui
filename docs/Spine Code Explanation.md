=====================================================================
SPINE UI — COMPLETE CODE EXPLANATION
=====================================================================
Coverage: Sprint 7, Day 1 through Day 8
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

--- src/context/UIContext.tsx (NEW) ---
  - Manages global state for the `AddBookModal`.
  - Exposes `isAddModalOpen`, `openAddModal()`, and `closeAddModal()`.
  - Wrapped around `<App />` in `main.tsx` or `App.tsx`.

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
PART 2 — PAGES
=====================================================================

--- src/pages/Dashboard.tsx ---
  - **Purpose:** The "Morning Coffee" view.
  - `greeting`: Calculates "Good morning/evening" based on `new Date().getHours()`. Formats `user.lastName, user.firstName`.
  - `generateInsight()`: Analyzes `booksFinishedThisYear` to return a dynamic sentence (e.g., "You're on track to beat your goal!").
  - **Renders:** Bento grid with `ContinueReadingCard`, `StatsRow`, `QuoteCard`, `Yearly Goal` (Segment Bar), Favourites carousel, and `ReadingHeatmap`.
  - Uses `useUI().openAddModal` for the Add Book button.

--- src/pages/Library.tsx ---
  - **Purpose:** The "Vault" for heavy management.
  - `selectedBooks`: A `Set<string>` for Batch Selection.
  - `handleBatchDelete`: Calls `batchDeleteBooks`, then invalidates `['library']`.
  - **Renders:** `LibraryToolbar`, Grid/List view, `SeriesGroup` accordions.
  - **Sticky Action Bar:** If `selectedBooks.size > 0`, renders a fixed bottom bar with a "Delete Selected" button.

--- src/pages/Discover.tsx ---
  - Uses Netflix-style horizontal carousels.
  - `useDiscoverRow`: Extracted outside the component to prevent infinite re-renders. Uses `staleTime: 15 minutes`.
  - `DiscoverRow`: Renders a `<Link>` to "See all". Passes `state: { book }` via `navigate()` to `BookDetails` for instant loading.
  - Renders a Hero Banner and 5 rows of books.

--- src/pages/BookDetails.tsx ---
  - **Instant Load:** `const initialBook = location.state?.book`.
  - `useQuery` with `placeholderData: initialBook` shows data instantly while fetching from `/api/Books/details/{id}` in the background.
  - **UI:** Background blur using `style={{ backgroundImage: url(${book.coverUrl}) }}`.
  - **Missing Data:** If `!hasDescription`, renders a "Try fetching description again" button that calls `refetch()`.

=====================================================================
PART 3 — COMPONENTS & MODALS
=====================================================================

--- src/components/AddBookModal.tsx ---
  - **Framer Motion:** `AnimatePresence` wraps the modal.
  - **Spring Pop:** `transition={{ type: "spring", stiffness: 400, damping: 25 }}`.
  - **Multiselect:** `selectedIds` Set tracks clicked books.
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
  - **Favourite/Delete Buttons:** Only render if `book.status` exists (meaning it is in the user's library, not Discover).

--- src/components/SeriesGroup.tsx ---
  - **Chevron Rotate:** `animate={{ rotate: isOpen ? 90 : 0 }}`.
  - **Height Animation:** `AnimatePresence` with `initial={{ height: 0 }}`.

--- src/components/FloatingAddButton.tsx (NEW) ---
  - **Hide on Scroll:** `useScroll` from Framer Motion. Hides if `latest > previous`.
  - **Speed Dial:** Tapping the FAB opens a menu with Search, Scan, and Manual options.
  - Calls `openAddModal()` from `UIContext`.

--- src/components/PageTransition.tsx (NEW) ---
  - Wraps route content.
  - **Blur Dissolve:** `initial={{ opacity: 0, filter: 'blur(8px)' }}` -> `animate={{ opacity: 1, filter: 'blur(0px)' }}`.
  - Uses `useReducedMotion()` to disable blur if the user has that OS setting enabled.

--- src/components/MobileNav.tsx (NEW) ---
  - **Floating Pill:** Fixed to the bottom center with `rounded-full`.
  - **Seesaw Tilt:** `whileTap={{ scale: 0.85, rotate: -10 }}` on the active icon.

--- src/App.tsx ---
  - Wraps `<Routes>` in `<AnimatePresence mode="wait">`.
  - Passes `location.pathname` as the `key` to force re-renders on navigation.
  - Wraps all protected routes in `<PageTransition>`.
  - Renders `<GlobalModals />` and `<FloatingAddButton />` outside the Routes so they persist.

=====================================================================
END OF NOTES
=====================================================================