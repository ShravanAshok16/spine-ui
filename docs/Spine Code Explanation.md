=====================================================================
SPINE UI — COMPLETE LEARNING NOTES ON SOURCE CODE
=====================================================================
Author: Shravan Ashok
Coverage: Sprint 7, Day 1 through Day 4
=====================================================================


=====================================================================
PART 1 — API & CONTEXTS
=====================================================================

--- src/api/client.ts ---
  - Axios instance with baseURL from VITE_API_URL.
  - Request interceptor: attaches 'spine_token'.
  - Response interceptor: 
    - On 401: clears token, dispatches 'auth:unauthorized'.
    - Normalizes errors: Checks for FluentValidation shape (data.errors) and joins messages.

--- src/context/AuthContext.tsx ---
  - useEffect decodes token using jwt-decode. Extracts `sub`, `email`, and `DisplayName`.
  - login(token): Saves to localStorage and state.
  - logout(): Clears localStorage and state.
  - Listens for 'auth:unauthorized' event.

--- src/context/ThemeContext.tsx ---
  - Reads 'spine_theme' from localStorage or prefers-color-scheme.
  - Toggles `.dark` class on document.documentElement.

--- src/api/library.ts ---
  - getMyLibrary(): GET /api/UserBooks.
  - searchExternalBooks(query): GET /api/Books/search.
  - deleteUserBook(id): DELETE /api/UserBooks/{id}.

--- src/api/quotes.ts ---
  - getDailyQuote(): GET /api/Quotes/daily.


=====================================================================
PART 2 — DASHBOARD & FILTERS
=====================================================================

--- src/pages/Dashboard.tsx ---
  - Uses useSearchParams to read filter state (search, view, status, sort, lang, genre).
  - updateParam(key, value): Updates URL params and saves 'view'/'sort' to localStorage.
  - useQuery: Fetches library with queryKey ['library'].
  - readingBooks: Memoized filter for status === 'Reading'.
  - continueReadingBook: readingBooks[0] (for the banner).
  - otherReadingBooks: readingBooks.slice(1) (for the row).
  - groupedBooks: useMemo that reduces filteredBooks into a Record<string, UserBook[]> keyed by seriesName (or 'Standalone Books').
  - Rendering:
    - isLoading: Skeleton loaders.
    - books.length === 0: <EmptyLibrary />.
    - groupBySeries: Maps over groupedBooks, renders <SeriesGroup /> for series and a flat grid for standalone.
    - Else: <BookCover /> grid or <BookListItem /> list.

--- src/components/LibraryToolbar.tsx ---
  - Status tabs: Uses Framer Motion layoutId="active-pill" so the background slides between filters.
  - Group by Series button: Toggles the view mode.
  - View toggle: Grid vs List with whileTap.
  - Dropdowns: Language, Genre, Sort.

--- src/components/BookCover.tsx ---
  - aspect-[2/3] container.
  - Fallback: Renders a gradient (based on title hash) if no cover.
  - Status badge + Genre chip.
  - Delete button: Visible on hover, calls useMutation(deleteUserBook).
  - Framer Motion whileHover={{ y: -5 }}.

--- src/components/SeriesGroup.tsx ---
  - Framer Motion accordion.
  - initial={{ height: 0 }} animate={{ height: 'auto' }} when expanded.
  - Renders a grid of BookCover inside the accordion body.


=====================================================================
PART 3 — MODALS & ANIMATIONS
=====================================================================

--- src/components/AddBookModal.tsx ---
  - Framer Motion: AnimatePresence wraps the modal and sticky bar.
  - Multiselect: `selectedIds` Set tracks clicked books.
  - handleSearch: Regex checks for ISBN. If text, calls searchExternalBooks.
  - handleAddIsbnDirectly: POST /api/UserBooks.
  - handleAddSelected: Promise.all of POST /api/UserBooks/manual, passing seriesName and seriesPosition.
  - handleManualSubmit: POST /api/UserBooks/manual with all fields.
  - Sticky Bar: initial={{ y: 100 }} animate={{ y: 0 }} slides up when books are selected.

--- src/components/Sidebar.tsx ---
  - Collapsible (isCollapsed state).
  - Logout uses navigate('/login', { replace: true }).
  - User profile: Renders user.displayName, user.email, and the first letter of displayName as an avatar.

--- src/components/ContinueReadingBanner.tsx ---
  - Large hero for the most recent "Reading" book.
  - Progress bar: (currentPage / totalPages) * 100.

--- src/components/ContinueReadingRow.tsx ---
  - Horizontal scroller (overflow-x-auto snap-x).
  - Renders small cards with progress bars.

--- src/components/QuoteCard.tsx ---
  - useQuery with staleTime of 24h.
  - Renders quote.text and quote.author.

--- src/components/ReadingHeatmap.tsx ---
  - 5-week grid (35 days).
  - Maps activity intensity (0-4) to bg-primary opacity levels.

--- src/components/StatsRow.tsx ---
  - Total Books, Reading, Finished, Avg Pages.

=====================================================================
END OF NOTES
=====================================================================