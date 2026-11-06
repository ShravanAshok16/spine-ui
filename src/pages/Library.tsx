import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2, Plus } from 'lucide-react'; // Added Plus
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getMyLibrary, batchDeleteBooks } from '../api/library';
import { BookCover } from '../components/BookCover';
import { BookListItem } from '../components/BookListItem';
import { EmptyLibrary } from '../components/EmptyLibrary';
import { LibraryToolbar, type ViewMode, type FilterStatus, type SortOption } from '../components/LibraryToolbar';
import { SeriesGroup } from '../components/SeriesGroup';
import { Sidebar } from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import type { UserBook } from '../api/types';
import { CreateSeriesModal } from '../components/CreateSeriesModal';

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // URL State
  const viewMode = (searchParams.get('view') as ViewMode) || 'grid';
  const filterStatus = (searchParams.get('status') as FilterStatus) || 'All';
  const sortBy = (searchParams.get('sort') as SortOption) || 'newest';
  const groupBySeries = searchParams.get('group') === 'true';
  const search = searchParams.get('search') || '';
  
  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'All' || value === '' || (key === 'view' && value === 'grid')) newParams.delete(key);
    else newParams.set(key, value);
    setSearchParams(newParams);
  };

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['library'],
    queryFn: () => getMyLibrary(),
  });

  const filteredBooks = useMemo(() => {
    let result = books.filter((b) => {
      const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
    return result;
  }, [books, search, filterStatus]);

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

  const handleBatchDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedBooks.size} books?`)) return;
    setIsDeleting(true);
    try {
      await batchDeleteBooks(Array.from(selectedBooks));
      toast.success('Books removed from library');
      queryClient.invalidateQueries({ queryKey: ['library'] });
      setSelectedBooks(new Set());
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex bg-bg">
      <div className="flex-shrink-0 hidden md:block"><Sidebar /></div>

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* 🔥 ADDED: Create Series Button + Toolbar Layout */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <LibraryToolbar
              viewMode={viewMode} setViewMode={(v) => updateParam('view', v)}
              filterStatus={filterStatus} setFilterStatus={(s) => updateParam('status', s)}
              languages={[]} selectedLanguage="All" setSelectedLanguage={() => {}}
              genres={[]} selectedGenre="All" setSelectedGenre={() => {}}
              sortBy={sortBy} setSortBy={(s) => updateParam('sort', s)}
              groupBySeries={groupBySeries} setGroupBySeries={(g) => updateParam('group', g.toString())}
              onCreateSeries={() => setIsSeriesModalOpen(true)} // 🔥 Pass it here
            />
          </div>

          {/* Content Rendering */}
          {books.length === 0 ? (
            <EmptyLibrary onAddClick={() => {}} />
          ) : groupBySeries ? (
            <div className="flex flex-col gap-6 pb-20">
              {Object.entries(groupedBooks).map(([seriesName, booksInSeries]) => (
                <SeriesGroup key={seriesName} seriesName={seriesName} books={booksInSeries} />
              ))}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-20">
              {filteredBooks.map((book, index) => (
                <div key={book.id} className="relative group/select">
                  <div className="absolute top-2 left-2 z-20 opacity-0 group-hover/select:opacity-100 transition-opacity">
                    <input
                      type="checkbox"
                      checked={selectedBooks.has(book.id)}
                      onChange={() => toggleSelection(book.id)}
                      className="w-5 h-5 accent-primary cursor-pointer rounded-md shadow-sm"
                    />
                  </div>
                  <div className={selectedBooks.has(book.id) ? "opacity-50 grayscale transition-all" : ""}>
                    <BookCover book={book} index={index} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3 pb-20">
              {filteredBooks.map((book) => (
                <div key={book.id} className="flex items-center gap-4">
                  <input type="checkbox" checked={selectedBooks.has(book.id)} onChange={() => toggleSelection(book.id)} className="w-5 h-5 accent-primary" />
                  <div className="flex-1"><BookListItem book={book} /></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky Batch Action Bar */}
        {selectedBooks.size > 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface border border-border shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 animate-fade-up">
            <span className="text-sm font-medium">{selectedBooks.size} selected</span>
            <div className="h-4 w-px bg-border"></div>
            <button onClick={() => setSelectedBooks(new Set())} className="text-sm text-text-muted hover:text-text">Cancel</button>
            <button
              onClick={handleBatchDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Deleting...' : 'Delete Selected'}
            </button>
          </div>
        )}
      </main>

      {/* 🔥 ADDED: Render the Modal */}
      <CreateSeriesModal 
        isOpen={isSeriesModalOpen} 
        onClose={() => setIsSeriesModalOpen(false)} 
        availableBooks={books} 
      />
    </div>
  );
}