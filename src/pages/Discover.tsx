import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { BookCover } from '../components/BookCover';
import { Sidebar } from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { motion } from 'framer-motion';
import { EmptyState } from '../components/EmptyState';
import { Compass, ChevronRight, BookOpen } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

function useDiscoverRow(key: string, params: string) {
  return useQuery({
    queryKey: ['discover', key],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/Books/discover?${params}`);
      return data;
    },
    staleTime: 1000 * 60 * 15,
  });
}

export function DiscoverRow({ title, subtitle, books, isLoading }: { title: string; subtitle: string; books: any[]; isLoading: boolean }) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="h-8 bg-surface rounded w-48 mb-4 animate-pulse"></div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-32 md:w-40 flex-shrink-0 aspect-[2/3] bg-surface rounded-xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  if (books.length === 0) return null;

  return (
    <div className="mb-12 relative group/row">
      <div className="flex items-end justify-between mb-4 px-1">
        <div>
          <h2 className="text-2xl font-serif font-bold text-text tracking-tight">{title}</h2>
          <p className="text-sm text-text-muted mt-1">{subtitle}</p>
        </div>
        <Link to="/library" className="text-sm font-medium text-primary hover:underline flex items-center gap-1 mb-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
          See all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="relative -mx-2">
        <div className="flex gap-5 overflow-x-auto pb-6 pt-2 px-2 snap-x scrollbar-hide">
          {books.map((book: any, i: number) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }} 
              whileHover={{ y: -8, scale: 1.02 }}
              className="w-32 md:w-40 flex-shrink-0 snap-start cursor-pointer group/card relative"
              onClick={() => navigate(`/books/${book.isbn || encodeURIComponent(book.title)}`, { state: { book } })}
            >
              <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-md group-hover/card:shadow-2xl transition-all duration-300 border border-border relative">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center"><BookOpen className="w-8 h-8 text-primary/40" /></div>
                )}
                
                {/* Premium Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <p className="text-white text-xs font-medium line-clamp-2">{book.title}</p>
                  <p className="text-white/70 text-[10px] line-clamp-1 mt-1">{book.author}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="absolute top-0 bottom-6 right-0 w-12 bg-gradient-to-l from-bg to-transparent pointer-events-none"></div>
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
  
  // Pick the first book as the featured hero
  const featuredBook = fantasyBooks.length > 0 ? fantasyBooks[0] : null;

  return (
    <div className="h-screen overflow-hidden flex bg-bg">
      <div className="flex-shrink-0 hidden md:block"><Sidebar /></div>
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-border bg-surface flex items-center justify-between px-6 md:px-8 flex-shrink-0 sticky top-0 z-20 backdrop-blur-md bg-surface/80">
          <div>
            <h1 className="text-2xl font-serif font-bold text-text tracking-tight">Discover</h1>
            <p className="text-sm text-text-muted mt-1">Find your next great read.</p>
          </div>
          <ThemeToggle />
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-20">
          {isLoading ? (
            <div className="space-y-12">
              <div className="h-64 bg-surface rounded-3xl animate-pulse"></div>
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
              
              {/* 🔥 FEATURED HERO SECTION */}
              {featuredBook && (
                <div className="relative w-full h-[340px] rounded-3xl overflow-hidden mb-12 border border-border shadow-lg group">
                  <img src={featuredBook.coverUrl} className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-transparent" />
                  <div className="relative z-10 h-full flex flex-col md:flex-row items-center md:items-end p-8 md:p-10 gap-8">
                    <img src={featuredBook.coverUrl} className="w-32 h-48 md:w-40 md:h-60 rounded-xl shadow-2xl border-2 border-white/20 object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="pb-2 text-center md:text-left">
                      <p className="text-primary font-bold text-xs mb-2 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                        <Compass className="w-4 h-4" /> Featured This Week
                      </p>
                      <h1 className="text-3xl md:text-5xl font-serif font-bold text-text mb-3 leading-tight">{featuredBook.title}</h1>
                      <p className="text-text-muted max-w-lg line-clamp-2 md:line-clamp-3 mb-6">{featuredBook.author}</p>
                      <button onClick={() => navigate(`/books/${featuredBook.isbn || encodeURIComponent(featuredBook.title)}`, { state: { book: featuredBook } })} className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-hover transition-colors shadow-sm">
                        Read Now
                      </button>
                    </div>
                  </div>
                </div>
              )}

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