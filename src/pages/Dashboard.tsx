import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMyLibrary } from '../api/library';
import { BookCover } from '../components/BookCover';
import { BookListItem } from '../components/BookListItem';
import { StatsRow } from '../components/StatsRow';
import { EmptyLibrary } from '../components/EmptyLibrary';
import { ContinueReadingBanner } from '../components/ContinueReadingBanner';
import { ContinueReadingRow } from '../components/ContinueReadingRow';
import { QuoteCard } from '../components/QuoteCard';
import { ReadingHeatmap } from '../components/ReadingHeatmap';
import { LibraryToolbar, type ViewMode, type FilterStatus, type SortOption } from '../components/LibraryToolbar';
import { AddBookModal } from '../components/AddBookModal';
import { SeriesGroup } from '../components/SeriesGroup'; // 🔥 NEW
import ThemeToggle from '../components/ThemeToggle';
import { Sidebar } from '../components/Sidebar';
import type { UserBook } from '../api/types'; // 🔥 NEW

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupBySeries, setGroupBySeries] = useState(false); // 🔥 NEW

  const defaultView = (localStorage.getItem('spine_view') as ViewMode) || 'grid';
  const defaultSort = (localStorage.getItem('spine_sort') as SortOption) || 'newest';

  const search = searchParams.get('search') || '';
  const viewMode = (searchParams.get('view') as ViewMode) || defaultView;
  const filterStatus = (searchParams.get('status') as FilterStatus) || 'All';
  const sortBy = (searchParams.get('sort') as SortOption) || defaultSort;
  const selectedLanguage = searchParams.get('lang') || 'All';
  const selectedGenre = searchParams.get('genre') || 'All';

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (key === 'view') localStorage.setItem('spine_view', value);
    if (key === 'sort') localStorage.setItem('spine_sort', value);
    if (value === 'All' || value === '' || (key === 'view' && value === 'grid')) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const { data: books = [], isLoading, isError } = useQuery({
    queryKey: ['library'],
    queryFn: () => getMyLibrary(),
  });

  const readingBooks = useMemo(() => {
    return books.filter((b) => b.status === 'Reading').sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }, [books]);

  const continueReadingBook = readingBooks.length > 0 ? readingBooks[0] : null;
  const otherReadingBooks = readingBooks.slice(1);

  const readingActivity = useMemo(() => {
    const activity: Record<string, number> = {};
    books.forEach((book) => {
      if (book.status === 'Reading' && book.currentPage > 0) {
        const today = new Date().toISOString().split('T')[0];
        activity[today] = Math.min(4, (activity[today] || 0) + 1);
      }
      if (book.status === 'Finished') {
        const dayOffset = Math.floor(Math.random() * 30);
        const d = new Date();
        d.setDate(d.getDate() - dayOffset);
        const key = d.toISOString().split('T')[0];
        activity[key] = Math.min(4, (activity[key] || 0) + 2);
      }
    });
    return activity;
  }, [books]);

  const { uniqueLanguages, uniqueGenres } = useMemo(() => {
    const langs = new Set<string>();
    const genreSet = new Set<string>();
    books.forEach((book) => {
      if (book.language) langs.add(book.language);
      if (book.genres) book.genres.split(',').forEach((g) => { const clean = g.trim(); if (clean) genreSet.add(clean); });
    });
    return { uniqueLanguages: Array.from(langs).sort(), uniqueGenres: Array.from(genreSet).sort() };
  }, [books]);

  const filteredBooks = useMemo(() => {
    let result = books.filter((b) => {
      const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
      const matchesLanguage = selectedLanguage === 'All' || b.language === selectedLanguage;
      const matchesGenre = selectedGenre === 'All' || (b.genres && b.genres.toLowerCase().includes(selectedGenre.toLowerCase()));
      return matchesSearch && matchesStatus && matchesLanguage && matchesGenre;
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
  }, [books, search, filterStatus, selectedLanguage, selectedGenre, sortBy]);

  // 🔥 GROUPING LOGIC
  const groupedBooks = useMemo(() => {
    const groups: Record<string, UserBook[]> = {};
    
    filteredBooks.forEach((book) => {
      // Normalize the series name (e.g., "the stormlight archive series" -> "stormlight archive")
      let key = book.seriesName 
        ? book.seriesName.replace(/the\s+/i, '').replace(/\s+series/i, '').trim()
        : 'Standalone Books';

      // Capitalize for display
      if (key !== 'Standalone Books') {
        key = key.replace(/\b\w/g, l => l.toUpperCase());
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(book);
    });
    
    return groups;
  }, [filteredBooks]);

  return (
    <div className="h-screen overflow-hidden flex bg-bg">
      <div className="flex-shrink-0 hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6 md:px-8 gap-4 flex-shrink-0">
          <div className="flex-1 max-w-lg relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
            <input
              type="search"
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              placeholder="Search by title or author..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <motion.button 
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-all text-sm font-medium shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Book</span>
            </motion.button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {isLoading ? (
            <div className="animate-pulse space-y-8">
              <div className="h-44 bg-surface rounded-2xl border border-border w-full"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-surface rounded-xl border border-border"></div>)}
              </div>
              <div className="h-40 bg-surface rounded-xl border border-border w-full"></div>
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-red-500">Failed to load library.</div>
          ) : (
            <>
              {continueReadingBook && (
                <ContinueReadingBanner book={continueReadingBook} onLogProgress={() => {}} />
              )}
              
              {otherReadingBooks.length > 0 && (
                <ContinueReadingRow books={otherReadingBooks} />
              )}

              <StatsRow books={books} onReadingClick={() => updateParam('status', 'Reading')} />

              <QuoteCard />

              {books.length > 0 && (
                <ReadingHeatmap activity={readingActivity} />
              )}
              
              {books.length > 0 && (
                <LibraryToolbar
                  viewMode={viewMode}
                  setViewMode={(v) => updateParam('view', v)}
                  filterStatus={filterStatus}
                  setFilterStatus={(s) => updateParam('status', s)}
                  languages={uniqueLanguages}
                  selectedLanguage={selectedLanguage}
                  setSelectedLanguage={(l) => updateParam('lang', l)}
                  genres={uniqueGenres}
                  selectedGenre={selectedGenre}
                  setSelectedGenre={(g) => updateParam('genre', g)}
                  sortBy={sortBy}
                  setSortBy={(s) => updateParam('sort', s)}
                  groupBySeries={groupBySeries}
                  setGroupBySeries={setGroupBySeries}
                />
              )}
              
              {books.length === 0 ? (
                <EmptyLibrary onAddClick={() => setIsModalOpen(true)} />
              ) : filteredBooks.length === 0 ? (
                <div className="text-center py-20 text-text-muted bg-surface/50 border border-border rounded-xl">
                  No books found matching your criteria.
                </div>
              ) : groupBySeries ? (
                /* 🔥 GROUPED VIEW */
                <div className="flex flex-col gap-6 pb-12">
                  {Object.entries(groupedBooks).map(([seriesName, booksInSeries]) => {
                    if (seriesName === 'Standalone Books') {
                      return (
                        <div key={seriesName} className="mt-8">
                          <h3 className="text-xl font-serif font-bold mb-4 border-b border-border pb-2">Standalone Books</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {booksInSeries.map((book, i) => (
                              <BookCover key={book.id} book={book} index={i} />
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <SeriesGroup 
                        key={seriesName} 
                        seriesName={seriesName} 
                        books={booksInSeries} 
                      />
                    );
                  })}
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-12">
                  {filteredBooks.map((book, index) => (
                    <BookCover key={book.id} book={book} index={index} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3 pb-12">
                  {filteredBooks.map((book) => (
                    <BookListItem key={book.id} book={book} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <AddBookModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}