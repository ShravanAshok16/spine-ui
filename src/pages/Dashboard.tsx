import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { getMyLibrary } from '../api/library';
import { BookCover } from '../components/BookCover';
import { BookListItem } from '../components/BookListItem';
import { StatsRow } from '../components/StatsRow';
import { EmptyLibrary } from '../components/EmptyLibrary';
import { ContinueReadingBanner } from '../components/ContinueReadingBanner';
import { ReadingHeatmap } from '../components/ReadingHeatmap';
import {
  LibraryToolbar,
  type ViewMode,
  type FilterStatus,
  type SortOption,
} from '../components/LibraryToolbar';
import ThemeToggle from '../components/ThemeToggle';
import { Sidebar } from '../components/Sidebar';

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const { data: books = [], isLoading, isError } = useQuery({
    queryKey: ['library'],
    queryFn: () => getMyLibrary(),
  });

  // Continue Reading
  const continueReadingBook = useMemo(() => {
    const readingBooks = books.filter((b) => b.status === 'Reading');
    if (readingBooks.length === 0) return null;
    return readingBooks.sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    )[0];
  }, [books]);

  // Reading activity for heatmap
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

  // Unique languages + genres
  const { uniqueLanguages, uniqueGenres } = useMemo(() => {
    const langs = new Set<string>();
    const genreSet = new Set<string>();
    books.forEach((book) => {
      if (book.language) langs.add(book.language);
      if (book.genres) {
        book.genres.split(',').forEach((g) => {
          const clean = g.trim();
          if (clean) genreSet.add(clean);
        });
      }
    });
    return {
      uniqueLanguages: Array.from(langs).sort(),
      uniqueGenres: Array.from(genreSet).sort(),
    };
  }, [books]);

  // Filter + sort
  const filteredBooks = useMemo(() => {
    let result = books.filter((b) => {
      const matchesSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
      const matchesLanguage = selectedLanguage === 'All' || b.language === selectedLanguage;
      const matchesGenre =
        selectedGenre === 'All' ||
        (b.genres && b.genres.toLowerCase().includes(selectedGenre.toLowerCase()));
      return matchesSearch && matchesStatus && matchesLanguage && matchesGenre;
    });

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'rating':
          return (b.personalRating ?? 0) - (a.personalRating ?? 0);
        case 'newest':
        default:
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      }
    });

    return result;
  }, [books, search, filterStatus, selectedLanguage, selectedGenre, sortBy]);

  const handleReadingStatClick = () => {
    setFilterStatus('Reading');
  };

  return (
    <div className="min-h-screen flex bg-bg">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6 md:px-8 gap-4 sticky top-0 z-10">
          <div className="flex-1 max-w-lg relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or author..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-all text-sm font-medium shadow-sm hover:shadow-md">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Book</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {isLoading ? (
            <div className="text-center py-20 text-text-muted flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              Loading your library...
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-red-500">Failed to load library.</div>
          ) : books.length === 0 ? (
            <EmptyLibrary onAddClick={() => {}} />
          ) : (
            <>
              {/* Continue Reading Banner */}
              {continueReadingBook && (
                <ContinueReadingBanner
                  book={continueReadingBook}
                  onLogProgress={() => {
                    /* Day 5 will open a modal to log progress */
                    console.log('Log progress for', continueReadingBook.id);
                  }}
                />
              )}

              {/* Stats Row */}
              <StatsRow books={books} />

              {/* Heatmap */}
              <ReadingHeatmap activity={readingActivity} />

              {/* Toolbar */}
              <LibraryToolbar
                viewMode={viewMode}
                setViewMode={setViewMode}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                languages={uniqueLanguages}
                selectedLanguage={selectedLanguage}
                setSelectedLanguage={setSelectedLanguage}
                genres={uniqueGenres}
                selectedGenre={selectedGenre}
                setSelectedGenre={setSelectedGenre}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />

              {/* Book Grid / List */}
              {filteredBooks.length === 0 ? (
                <div className="text-center py-20 text-text-muted bg-surface/50 border border-border rounded-xl">
                  No books found matching your criteria.
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {filteredBooks.map((book, index) => (
                    <BookCover key={book.id} book={book} index={index} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredBooks.map((book) => (
                    <BookListItem key={book.id} book={book} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}