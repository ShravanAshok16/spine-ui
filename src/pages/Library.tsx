import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2, X, BookOpen, Plus, Layers } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { getMyLibrary, batchDeleteBooks, deleteUserBook } from '../api/library';
import { apiClient } from '../api/client';
import { BookCover } from '../components/BookCover';
import { BookListItem } from '../components/BookListItem';
import {
  LibraryToolbar,
  type ViewMode,
  type FilterStatus,
  type SortOption,
  type GridSize,
} from '../components/LibraryToolbar';
import { SeriesGroup } from '../components/SeriesGroup';
import { Sidebar } from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import type { UserBook } from '../api/types';
import { CreateSeriesModal } from '../components/CreateSeriesModal';
import { AssignSeriesModal } from '../components/AssignSeriesModal';
import { useUI } from '../context/UIContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [isAssignSeriesOpen, setIsAssignSeriesOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState<{
    ids: string[];
    title: string;
    description: string;
  } | null>(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { openAddModal } = useUI();

  // URL Params for Filters
  const viewMode =
    (searchParams.get('view') as ViewMode) ||
    (localStorage.getItem('spine_lib_view') as ViewMode) ||
    'grid';
  const gridSize =
    (searchParams.get('size') as GridSize) ||
    (localStorage.getItem('spine_lib_size') as GridSize) ||
    'md';
  const filterStatus = (searchParams.get('status') as FilterStatus) || 'All';
  const sortBy =
    (searchParams.get('sort') as SortOption) ||
    (localStorage.getItem('spine_lib_sort') as SortOption) ||
    'newest';
  const groupBySeries = searchParams.get('group') === 'true';
  const search = searchParams.get('search') || '';
  const ownership = searchParams.get('ownership') || 'All';
  const minRating = searchParams.get('rating') || 'All';
  const filterType = searchParams.get('filter');
  const selectedLanguage = searchParams.get('language') || 'All';
  const selectedGenre = searchParams.get('genre') || 'All';

  const updateParam = (key: string, value: string) => {
    if (key === 'view' || key === 'size' || key === 'sort') {
      localStorage.setItem(`spine_lib_${key}`, value);
    }
    const newParams = new URLSearchParams(searchParams);
    if (
      value === 'All' ||
      value === '' ||
      (key === 'view' && value === 'grid') ||
      (key === 'size' && value === 'md')
    ) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['library'],
    queryFn: () => getMyLibrary(),
    staleTime: 1000 * 60 * 5,
  });

  // Dynamic languages & genres extraction
  const existingLanguages = useMemo(() => {
    const langs = new Set<string>();
    books.forEach((b) => {
      if (b.language) langs.add(b.language);
    });
    return Array.from(langs).sort();
  }, [books]);

  const existingGenres = useMemo(() => {
    const genres = new Set<string>();
    books.forEach((b) => {
      if (b.genres) {
        const list = typeof b.genres === 'string' ? b.genres.split(',') : b.genres;
        list.forEach((g: string) => {
          const clean = g.trim();
          if (clean) genres.add(clean);
        });
      }
    });
    return Array.from(genres).sort();
  }, [books]);

  const filteredBooks = useMemo(() => {
    let result = books.filter((b) => {
      if (filterType === 'favourites' && !b.isFavourite) return false;

      const matchesSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
      const matchesOwnership = ownership === 'All' || b.ownership === ownership;
      const matchesRating =
        minRating === 'All' || (b.personalRating ?? 0) >= parseInt(minRating);

      const matchesLanguage =
        selectedLanguage === 'All' || b.language === selectedLanguage;

      const matchesGenre =
        selectedGenre === 'All' ||
        (b.genres &&
          (typeof b.genres === 'string'
            ? b.genres
                .split(',')
                .map((g: string) => g.trim())
                .includes(selectedGenre)
            : Array.isArray(b.genres) &&
              (b.genres as string[]).includes(selectedGenre)));

      return (
        matchesSearch &&
        matchesStatus &&
        matchesOwnership &&
        matchesRating &&
        matchesLanguage &&
        matchesGenre
      );
    });

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'rating':
          return (b.personalRating ?? 0) - (a.personalRating ?? 0);
        default:
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      }
    });

    return result;
  }, [
    books,
    search,
    filterStatus,
    ownership,
    minRating,
    sortBy,
    filterType,
    selectedLanguage,
    selectedGenre,
  ]);

  const groupedBooks = useMemo(() => {
    const groups: Record<string, UserBook[]> = {};
    filteredBooks.forEach((book) => {
      const key = book.seriesName || 'Standalone Books';
      if (!groups[key]) groups[key] = [];
      groups[key].push(book);
    });
    return groups;
  }, [filteredBooks]);

  const existingSeries = useMemo(() => {
    const series = new Set<string>();
    books.forEach((b) => {
      if (b.seriesName && b.seriesName !== 'Standalone Books') {
        series.add(b.seriesName);
      }
    });
    return Array.from(series);
  }, [books]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedBooks);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedBooks(newSet);
  };

  const handleBatchDelete = () => {
    setDeleteConfig({
      ids: Array.from(selectedBooks),
      title: 'Delete Selected Books?',
      description: `Are you sure you want to delete ${selectedBooks.size} books? They will be moved to the Trash Bin.`,
    });
  };

  const handleIndividualDelete = (id: string, title: string) => {
    setDeleteConfig({
      ids: [id],
      title: 'Delete Book?',
      description: `Are you sure you want to delete "${title}"? It will be moved to the Trash Bin.`,
    });
  };

  const handleBatchStatusChange = async (status: string) => {
    try {
      await apiClient.post('/api/UserBooks/batch-status', {
        userBookIds: Array.from(selectedBooks),
        status,
      });
      toast.success(`Updated ${selectedBooks.size} books to ${status}`);
      queryClient.invalidateQueries({ queryKey: ['library'] });
      setSelectedBooks(new Set());
      setIsSelectionMode(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  // 🔥 Individual Status Update
 const handleUpdateIndividualStatus = async (id: string, status: string) => {
  try {
    await apiClient.put(`/api/UserBooks/${id}`, { status });
    queryClient.invalidateQueries({ queryKey: ['library'] });
    toast.success('Status updated');
  } catch (err: any) {
    toast.error('Failed to update status');
  }
};

const handleUpdateIndividualOwnership = async (id: string, ownership: string) => {
  try {
    await apiClient.put(`/api/UserBooks/${id}`, { ownership });
    queryClient.invalidateQueries({ queryKey: ['library'] });
    toast.success('Ownership updated');
  } catch (err: any) {
    console.error(err);
    toast.error(err?.response?.data?.message || 'Failed to update ownership');
  }
};

  const executeDelete = async () => {
    if (!deleteConfig) return;
    setIsDeleting(true);
    try {
      if (deleteConfig.ids.length === 1 && deleteConfig.title === 'Delete Book?') {
        await deleteUserBook(deleteConfig.ids[0]);
      } else {
        await batchDeleteBooks(deleteConfig.ids);
      }
      toast.success('Books moved to Trash');
      queryClient.invalidateQueries({ queryKey: ['library'] });
      setSelectedBooks(new Set());
      setIsSelectionMode(false);
      setDeleteConfig(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const gridClasses: Record<GridSize, string> = {
    sm: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3',
    md: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6',
    lg: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8',
  };

  return (
    <>
      <Helmet>
        <title>My Library | Spine</title>
        <meta
          name="description"
          content="View and manage your personal book collection on Spine."
        />
      </Helmet>

      <div className="h-screen overflow-hidden flex bg-bg">
        <div className="flex-shrink-0 hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md shadow-[0_1px_12px_-4px] shadow-primary/20 flex items-center justify-between px-6 md:px-8 gap-4 flex-shrink-0 relative z-10">
            <div className="flex-1 max-w-lg relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="search"
                value={search}
                onChange={(e) => updateParam('search', e.target.value)}
                placeholder="Search your library..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-32 md:pb-12">
            <LibraryToolbar
              viewMode={viewMode}
              setViewMode={(v) => updateParam('view', v)}
              filterStatus={filterStatus}
              setFilterStatus={(s) => updateParam('status', s)}
              languages={existingLanguages}
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={(l) => updateParam('language', l)}
              genres={existingGenres}
              selectedGenre={selectedGenre}
              setSelectedGenre={(g) => updateParam('genre', g)}
              sortBy={sortBy}
              setSortBy={(s) => updateParam('sort', s)}
              groupBySeries={groupBySeries}
              setGroupBySeries={(g) => updateParam('group', g.toString())}
              onCreateSeries={() => setIsSeriesModalOpen(true)}
              gridSize={gridSize}
              setGridSize={(s) => updateParam('size', s)}
              ownership={ownership}
              setOwnership={(o) => updateParam('ownership', o)}
              minRating={minRating}
              setMinRating={(r) => updateParam('rating', r)}
              isSelectionMode={isSelectionMode}
              setIsSelectionMode={setIsSelectionMode}
            />

            {isLoading ? (
              <div className={`grid ${gridClasses[gridSize]} pb-20`}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="aspect-[2/3] w-full bg-surface rounded-xl border border-border animate-pulse" />
                    <div className="h-4 bg-surface rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-surface rounded w-1/2 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : books.length === 0 ? (
              <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-surface to-surface border border-border rounded-3xl p-10 text-center max-w-2xl mx-auto mt-10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative">
                  <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-2">
                    Your library is waiting
                  </h3>
                  <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
                    Start building your collection by adding your first book to Spine.
                  </p>
                  <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
                  >
                    <Plus className="w-4 h-4" /> Add a Book
                  </button>
                </div>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-20 text-text-muted bg-surface/50 border border-border rounded-2xl mt-8">
                <Search className="w-10 h-10 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium text-text mb-1">No books found</p>
                <p className="text-sm mb-4">
                  Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={() => setSearchParams({})}
                  className="text-primary hover:underline text-sm font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : groupBySeries ? (
              <div className="flex flex-col gap-6 pb-20">
                {Object.entries(groupedBooks).map(([seriesName, booksInSeries]) => (
                  <SeriesGroup
                    key={seriesName}
                    seriesName={seriesName}
                    books={booksInSeries}
                    isSelectionMode={isSelectionMode}
                    selectedBooks={selectedBooks}
                    onToggleSelect={toggleSelection}
                    onRequestDelete={handleIndividualDelete}
                    onUpdateStatus={handleUpdateIndividualStatus}
                    onUpdateOwnership={handleUpdateIndividualOwnership}
                  />
                ))}
              </div>
            ) : viewMode === 'grid' ? (
              <div className={`grid ${gridClasses[gridSize]} pb-20`}>
                {filteredBooks.map((book, index) => (
                  <BookCover
                    key={book.id}
                    book={book}
                    index={index}
                    onClick={() => navigate(`/books/${book.id}`)}
                    onRequestDelete={handleIndividualDelete}
                    onUpdateStatus={handleUpdateIndividualStatus}
                    onUpdateOwnership={handleUpdateIndividualOwnership}
                    isSelected={selectedBooks.has(book.id)}
                    onToggleSelect={() => toggleSelection(book.id)}
                    isSelectionMode={isSelectionMode}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3 pb-20">
                {filteredBooks.map((book) => (
                  <div key={book.id} className="flex items-center gap-4">
                    {isSelectionMode && (
                      <input
                        type="checkbox"
                        checked={selectedBooks.has(book.id)}
                        onChange={() => toggleSelection(book.id)}
                        className="w-5 h-5 accent-primary"
                      />
                    )}
                    <div
                      className="flex-1"
                      onClick={() =>
                        isSelectionMode
                          ? toggleSelection(book.id)
                          : navigate(`/books/${book.id}`)
                      }
                    >
                      <BookListItem book={book} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selection Bar */}
          <AnimatePresence>
            {selectedBooks.size > 0 && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur-md border border-border shadow-2xl rounded-full px-4 py-2 flex items-center gap-3 z-50 overflow-x-auto max-w-[90vw]"
              >
                <button
                  onClick={() => {
                    setSelectedBooks(new Set());
                    setIsSelectionMode(false);
                  }}
                  className="p-2 hover:bg-bg rounded-full transition-colors text-text-muted flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="h-6 w-px bg-border flex-shrink-0" />
                <span className="text-sm font-medium px-2 whitespace-nowrap">
                  {selectedBooks.size} selected
                </span>

                <div className="relative flex-shrink-0">
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleBatchStatusChange(e.target.value);
                      e.target.value = '';
                    }}
                    className="bg-bg border border-border rounded-full pl-4 pr-8 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:border-primary/50 transition-colors appearance-none"
                  >
                    <option value="" disabled>
                      Change Status
                    </option>
                    <option value="Reading">Reading</option>
                    <option value="Finished">Finished</option>
                    <option value="Paused">Paused</option>
                    <option value="Unread">Unread</option>
                    <option value="DNF">DNF</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 1L5 5L9 1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <button
                  onClick={() => setIsAssignSeriesOpen(true)}
                  className="bg-bg border border-border rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2 hover:border-primary transition-colors whitespace-nowrap"
                >
                  <Layers className="w-4 h-4" /> Add to Series
                </button>

                <div className="h-6 w-px bg-border flex-shrink-0" />

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleBatchDelete}
                  disabled={isDeleting}
                  className="bg-red-500 text-white px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <CreateSeriesModal
          isOpen={isSeriesModalOpen}
          onClose={() => setIsSeriesModalOpen(false)}
          availableBooks={books}
        />

        <AssignSeriesModal
          isOpen={isAssignSeriesOpen}
          onClose={() => setIsAssignSeriesOpen(false)}
          selectedBookIds={Array.from(selectedBooks)}
          existingSeries={existingSeries}
          onSuccess={() => {
            setSelectedBooks(new Set());
            setIsSelectionMode(false);
          }}
        />

        <ConfirmDialog
          isOpen={!!deleteConfig}
          title={deleteConfig?.title || ''}
          description={deleteConfig?.description || ''}
          confirmLabel="Move to Trash"
          onConfirm={executeDelete}
          onCancel={() => setDeleteConfig(null)}
        />
      </div>
    </>
  );
}