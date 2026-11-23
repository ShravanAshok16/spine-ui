import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2, X } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getMyLibrary, batchDeleteBooks, deleteUserBook } from '../api/library';
import { BookCover } from '../components/BookCover';
import { BookListItem } from '../components/BookListItem';
import { EmptyState } from '../components/EmptyState';
import { LibraryToolbar, type ViewMode, type FilterStatus, type SortOption, type GridSize } from '../components/LibraryToolbar';
import { SeriesGroup } from '../components/SeriesGroup';
import { Sidebar } from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import type { UserBook } from '../api/types';
import { CreateSeriesModal } from '../components/CreateSeriesModal';
import { BookOpen } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState<{ ids: string[], title: string, description: string } | null>(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { openAddModal } = useUI();

  // 🔥 Read from URL, fallback to localStorage, then default
  const viewMode = (searchParams.get('view') as ViewMode) || (localStorage.getItem('spine_lib_view') as ViewMode) || 'grid';
  const gridSize = (searchParams.get('size') as GridSize) || (localStorage.getItem('spine_lib_size') as GridSize) || 'md';
  const filterStatus = (searchParams.get('status') as FilterStatus) || 'All';
  const sortBy = (searchParams.get('sort') as SortOption) || (localStorage.getItem('spine_lib_sort') as SortOption) || 'newest';
  const groupBySeries = searchParams.get('group') === 'true';
  const search = searchParams.get('search') || '';
  const ownership = searchParams.get('ownership') || 'All';
  const minRating = searchParams.get('rating') || 'All';

  const updateParam = (key: string, value: string) => {
    if (key === 'view' || key === 'size' || key === 'sort') {
      localStorage.setItem(`spine_lib_${key}`, value);
    }
    const newParams = new URLSearchParams(searchParams);
    if (value === 'All' || value === '' || (key === 'view' && value === 'grid') || (key === 'size' && value === 'md')) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['library'],
    queryFn: () => getMyLibrary(),
    staleTime: 1000 * 60 * 5, // 🔥 Cache for 5 minutes
  });

  const filteredBooks = useMemo(() => {
    let result = books.filter((b) => {
      const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
      const matchesOwnership = ownership === 'All' || b.ownership === ownership;
      const matchesRating = minRating === 'All' || ((b.personalRating ?? 0) >= parseInt(minRating));
      return matchesSearch && matchesStatus && matchesOwnership && matchesRating;
    });
    
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'title': return a.title.localeCompare(b.title);
        case 'author': return a.author.localeCompare(b.author);
        case 'rating': return (b.personalRating ?? 0) - (a.personalRating ?? 0);
        default: return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      }
    });
    return result;
  }, [books, search, filterStatus, ownership, minRating, sortBy]);

  const groupedBooks = useMemo(() => {
    const groups: Record<string, UserBook[]> = {};
    filteredBooks.forEach((book) => {
      const key = book.seriesName || 'Standalone Books';
      if (!groups[key]) groups[key] = [];
      groups[key].push(book);
    });
    return groups;
  }, [filteredBooks]);

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
      description: `Are you sure you want to delete ${selectedBooks.size} books? They will be moved to the Trash Bin.`
    });
  };

  const handleIndividualDelete = (id: string, title: string) => {
    setDeleteConfig({
      ids: [id],
      title: 'Delete Book?',
      description: `Are you sure you want to delete "${title}"? It will be moved to the Trash Bin.`
    });
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
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const gridClasses: Record<GridSize, string> = {
    sm: "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3",
    md: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6",
    lg: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
  };

  return (
    <div className="h-screen overflow-hidden flex bg-bg">
      <div className="flex-shrink-0 hidden md:block"><Sidebar /></div>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6 md:px-8 gap-4 flex-shrink-0">
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

        <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-32">
          <LibraryToolbar
            viewMode={viewMode} setViewMode={(v) => updateParam('view', v)}
            filterStatus={filterStatus} setFilterStatus={(s) => updateParam('status', s)}
            languages={[]} selectedLanguage="All" setSelectedLanguage={() => {}}
            genres={[]} selectedGenre="All" setSelectedGenre={() => {}}
            sortBy={sortBy} setSortBy={(s) => updateParam('sort', s)}
            groupBySeries={groupBySeries} setGroupBySeries={(g) => updateParam('group', g.toString())}
            onCreateSeries={() => setIsSeriesModalOpen(true)}
            gridSize={gridSize} setGridSize={(s) => updateParam('size', s)}
            ownership={ownership} setOwnership={(o) => updateParam('ownership', o)}
            minRating={minRating} setMinRating={(r) => updateParam('rating', r)}
            isSelectionMode={isSelectionMode} setIsSelectionMode={setIsSelectionMode}
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
            <EmptyState 
              icon={<BookOpen className="w-8 h-8" />}
              title="Your library is empty"
              description="Start building your collection by adding your first book."
              action={{ label: "Add a Book", onClick: openAddModal }}
            />
          ) : groupBySeries ? (
            <div className="flex flex-col gap-6 pb-20">
              {Object.entries(groupedBooks).map(([seriesName, booksInSeries]) => (
                <SeriesGroup key={seriesName} seriesName={seriesName} books={booksInSeries} />
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
                    <input type="checkbox" checked={selectedBooks.has(book.id)} onChange={() => toggleSelection(book.id)} className="w-5 h-5 accent-primary" />
                  )}
                  <div className="flex-1" onClick={() => isSelectionMode ? toggleSelection(book.id) : navigate(`/books/${book.id}`)}> 
                    <BookListItem book={book} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <AnimatePresence>
          {selectedBooks.size > 0 && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur-md border border-border shadow-2xl rounded-full px-4 py-2 flex items-center gap-4 z-50"
            >
              <button onClick={() => { setSelectedBooks(new Set()); setIsSelectionMode(false); }} className="p-2 hover:bg-bg rounded-full transition-colors text-text-muted">
                <X className="w-5 h-5" />
              </button>
              <div className="h-6 w-px bg-border"></div>
              <span className="text-sm font-medium px-2">{selectedBooks.size} selected</span>
              <motion.button whileTap={{ scale: 0.96 }} onClick={handleBatchDelete} disabled={isDeleting} className="bg-red-500 text-white px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-50">
                <Trash2 className="w-4 h-4" /> Delete
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <CreateSeriesModal isOpen={isSeriesModalOpen} onClose={() => setIsSeriesModalOpen(false)} availableBooks={books} />
      <ConfirmDialog isOpen={!!deleteConfig} title={deleteConfig?.title || ''} description={deleteConfig?.description || ''} confirmLabel="Move to Trash" onConfirm={executeDelete} onCancel={() => setDeleteConfig(null)} />
    </div>
  );
}