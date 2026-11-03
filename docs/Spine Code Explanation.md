=====================================================================
SPINE UI — COMPLETE LEARNING NOTES ON SOURCE CODE
=====================================================================
Author: Shravan Ashok
Coverage: Sprint 7, Day 1 through Day 3
=====================================================================


=====================================================================
PART 1 — API & CONTEXTS
=====================================================================

--- src/api/client.ts ---
  - Creates Axios instance with baseURL from import.meta.env.VITE_API_URL.
  - Request interceptor: Reads 'spine_token' from localStorage, attaches Authorization header.
  - Response interceptor:
    - On 401: localStorage.removeItem('spine_token'); window.dispatchEvent(new Event('auth:unauthorized'));
    - Normalizes errors: Checks for FluentValidation shape (data.errors) and joins messages. Falls back to data.error or data.message.

--- src/context/AuthContext.tsx ---
  - Holds token and user state.
  - useEffect: Decodes token using jwt-decode. Extracts `sub` (id), `email`, and `DisplayName` claim.
  - login(token): Saves to localStorage and state.
  - logout(): Clears localStorage and state.
  - useEffect: Listens for 'auth:unauthorized' event to trigger logout.

--- src/context/ThemeContext.tsx ---
  - Initializes theme from localStorage ('spine_theme') or prefers-color-scheme.
  - useEffect: Toggles `.dark` class on document.documentElement and saves to localStorage.

--- src/api/quotes.ts ---
  - getRandomQuote(): GET /api/Quotes/random. Returns null on 204 No Content.


=====================================================================
PART 2 — DASHBOARD & FILTERS
=====================================================================

--- src/pages/Dashboard.tsx ---
  - Uses useSearchParams to read filter state from URL (search, view, status, sort, lang, genre).
  - updateParam(key, value): Updates URL params and saves 'view'/'sort' to localStorage.
  - useQuery: Fetches library with queryKey ['library'].
  - readingBooks: Memoized filter for status === 'Reading'.
  - continueReadingBook: The first book in readingBooks (for the banner).
  - otherReadingBooks: readingBooks.slice(1) (for the row).
  - filteredBooks: Applies search, status, language, genre, and sort.
  - Rendering:
    - isLoading: Renders skeleton loaders (Banner, Stats, Heatmap, Grid).
    - Empty: Renders <EmptyLibrary />.
    - Data: Renders <ContinueReadingBanner />, <ContinueReadingRow />, <StatsRow />, <QuoteCard />, <ReadingHeatmap />, <LibraryToolbar />, and the Grid/List.

--- src/components/LibraryToolbar.tsx ---
  - Status tabs: Uses Framer Motion layoutId="active-pill" so the background slides between "All", "Reading", etc.
  - View toggle: Grid vs List with whileTap.
  - Dropdowns: Language, Genre, Sort.

--- src/components/BookCover.tsx ---
  - aspect-[2/3] container.
  - Fallback: If !coverUrl or imageError or naturalWidth < 10, renders a gradient (chosen by title hash) with Title, Author, and "Spine".
  - Status badge (Unread, Reading, Finished, DNF).
  - Genre chip (first genre).
  - Progress bar for "Reading" books.
  - Uses Framer Motion whileHover={{ y: -5 }}.

--- src/components/BookListItem.tsx ---
  - Horizontal layout for list view.
  - Uses the same gradient fallback logic but scaled down.


=====================================================================
PART 3 — MODALS & ANIMATIONS
=====================================================================

--- src/components/AddBookModal.tsx ---
  - Framer Motion: AnimatePresence wraps the modal.
  - Backdrop: initial={{ opacity: 0 }} animate={{ opacity: 1 }}.
  - Modal: initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}.
  - Tabs: 'isbn' and 'manual'.
  - handleIsbnSubmit: POST /api/UserBooks. Invalidates ['library'] query on success.
  - handleManualSubmit: POST /api/UserBooks/manual. Invalidates ['library'] query on success.

--- src/components/Sidebar.tsx ---
  - Collapsible (isCollapsed state).
  - Logout uses navigate('/login', { replace: true }).
  - User profile: Renders user.displayName and user.email.
  - Fixed layout: h-screen, sticky, mt-auto for logout.

--- src/components/ContinueReadingBanner.tsx ---
  - Large hero for the most recent "Reading" book.
  - Progress bar: (currentPage / totalPages) * 100.

--- src/components/ContinueReadingRow.tsx ---
  - Horizontal scroller (overflow-x-auto snap-x).
  - Renders small cards with progress bars.

--- src/components/QuoteCard.tsx ---
  - useQuery with staleTime of 24h.
  - Returns null if no quote exists.
  - Renders text, book title, and page number.

--- src/components/ReadingHeatmap.tsx ---
  - 5-week grid (35 days).
  - Maps activity intensity (0-4) to bg-primary opacity levels.

--- src/components/StatsRow.tsx ---
  - Total Books, Reading, Finished, Avg Pages.
  - Avg Pages: Math.round(total pages / books with pages).

=====================================================================
END OF NOTES
=====================================================================