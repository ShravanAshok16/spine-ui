import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { BookCover } from '../components/BookCover';
import { Sidebar } from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { motion } from 'framer-motion';
import { EmptyState } from '../components/EmptyState';
import { Compass, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

// Moved outside the component to prevent infinite re-renders
function useDiscoverRow(key: string, params: string) {
  return useQuery({
    queryKey: ['discover', key],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/Books/discover?${params}`);
      return data;
    },
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes to prevent 429s
  });
}

export function DiscoverRow({ title, subtitle, books, isLoading }: { title: string; subtitle: string; books: any[]; isLoading: boolean }) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="h-8 bg-surface rounded w-48 mb-4 animate-pulse"></div>
        <div className="flex gap-6 overflow-hidden">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-32 md:w-40 flex-shrink-0 h-60 bg-surface rounded-xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  if (books.length === 0) return null;

  return (
    <div className="mb-12 relative group/row">
      <div className="flex items-end justify-between mb-4 px-1">
        <div>
          <h2 className="text-2xl font-serif font-bold text-text">{title}</h2>
          <p className="text-sm text-text-muted mt-1">{subtitle}</p>
        </div>
        <Link to="/library" className="text-sm font-medium text-primary hover:underline flex items-center gap-1 mb-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
          See all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="relative -mx-2">
        <div className="flex gap-6 overflow-x-auto pb-4 pt-2 px-2 snap-x scrollbar-hide">
          {books.map((book: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="w-32 md:w-40 flex-shrink-0 snap-start">
              <BookCover 
                book={book} 
                index={i} 
                onClick={() => navigate(`/books/${book.isbn || encodeURIComponent(book.title)}`, { state: { book } })} 
              />
            </motion.div>
          ))}
        </div>
        <div className="absolute top-0 bottom-4 right-0 w-16 bg-gradient-to-l from-bg to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}

export default function Discover() {
  const navigate = useNavigate();

  const { data: fantasyBooks = [], isLoading: fantasyLoading } = useDiscoverRow('fantasy', 'subject=fantasy');
  const { data: kannadaBooks = [], isLoading: kannadaLoading } = useDiscoverRow('kannada', 'lang=kn&subject=fantasy');
  const { data: tamilBooks = [], isLoading: tamilLoading } = useDiscoverRow('tamil', 'lang=ta');
  const { data: mysteryBooks = [], isLoading: mysteryLoading } = useDiscoverRow('mystery', 'subject=mystery');
  const { data: romanceBooks = [], isLoading: romanceLoading } = useDiscoverRow('romance', 'subject=romance');

  const isLoading = fantasyLoading && kannadaLoading && tamilLoading && mysteryLoading && romanceLoading;

  return (
    <div className="h-screen overflow-hidden flex bg-bg">
      <div className="flex-shrink-0 hidden md:block"><Sidebar /></div>
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-border bg-surface flex items-center justify-between px-6 md:px-8 flex-shrink-0 sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-serif font-bold text-text">Discover</h1>
            <p className="text-sm text-text-muted mt-1">Find your next great read.</p>
          </div>
          <ThemeToggle />
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-20">
          {isLoading ? (
            <div className="space-y-12">
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-surface rounded-2xl animate-pulse"></div>)}
            </div>
          ) : fantasyBooks.length === 0 ? (
            <EmptyState 
              icon={<Compass className="w-8 h-8" />}
              title="Nothing to discover yet"
              description="Add a few books to your library so we can find more for you."
              action={{ label: "Go to Library", onClick: () => navigate('/library') }}
            />
          ) : (
            <div className="max-w-7xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden mb-12 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20 p-8 md:p-12">
                <div className="relative z-10 max-w-lg">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-text mb-4">Expand your horizons</h2>
                  <p className="text-text-muted mb-6 text-lg">Explore hand-picked collections of trending books, regional classics, and hidden gems.</p>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
                  <Compass className="w-64 h-64" />
                </div>
              </div>

              <DiscoverRow title="Trending Fantasy" subtitle="Epic worlds and magical adventures" books={fantasyBooks} isLoading={fantasyLoading} />
              <DiscoverRow title="Popular in Kannada" subtitle="Must-reads from Kannada literature" books={kannadaBooks} isLoading={kannadaLoading} />
              <DiscoverRow title="Popular in Tamil" subtitle="Classics and new releases" books={tamilBooks} isLoading={tamilLoading} />
              <DiscoverRow title="Mystery & Thriller" subtitle="Edge-of-your-seat reads" books={mysteryBooks} isLoading={mysteryLoading} />
              <DiscoverRow title="Romance" subtitle="Love stories to warm your heart" books={romanceBooks} isLoading={romanceLoading} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}