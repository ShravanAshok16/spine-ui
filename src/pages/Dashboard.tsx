import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ArrowRight, BookOpen, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMyLibrary } from '../api/library';
import { StatsRow } from '../components/StatsRow';
import { ContinueReadingBanner } from '../components/ContinueReadingBanner';
import { QuoteCard } from '../components/QuoteCard';
import { ReadingHeatmap } from '../components/ReadingHeatmap';
import { AddBookModal } from '../components/AddBookModal';
import { UpdateProgressModal } from '../components/UpdateProgressModal';
import { BookCover } from '../components/BookCover';
import ThemeToggle from '../components/ThemeToggle';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [progressBook, setProgressBook] = useState<any>(null);

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['library'],
    queryFn: () => getMyLibrary(),
  });

  const readingBooks = useMemo(() => {
    return books.filter((b) => b.status === 'Reading').sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }, [books]);

  const continueReadingBook = readingBooks.length > 0 ? readingBooks[0] : null;
  const favouriteBooks = useMemo(() => books.filter(b => b.isFavourite), [books]);

  // 🔥 Dynamic Yearly Goal Calculation
  const booksFinishedThisYear = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return books.filter(b => 
      b.status === 'Finished' && 
      new Date(b.addedAt).getFullYear() === currentYear
    ).length;
  }, [books]);

  const goalTarget = 24;
  const goalPercentage = Math.min(100, (booksFinishedThisYear / goalTarget) * 100);

  const readingActivity = useMemo(() => {
    const activity: Record<string, number> = {};
    books.forEach((book) => {
      if (book.status === 'Reading' && book.currentPage > 0) {
        const today = new Date().toISOString().split('T')[0];
        activity[today] = Math.min(4, (activity[today] || 0) + 1);
      }
    });
    return activity;
  }, [books]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="h-screen overflow-hidden flex bg-bg">
      <div className="flex-shrink-0 hidden md:block"><Sidebar /></div>

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 border-b border-border bg-surface flex items-center justify-between px-6 md:px-8 gap-4 flex-shrink-0">
          <div className="flex flex-col">
            <h1 className="text-2xl font-serif font-bold text-text">
              {getGreeting()}, {
                user?.lastName 
                  ? `${user.lastName}, ${user.firstName}` 
                  : (user?.firstName || user?.displayName || 'Reader')
              }
            </h1>
            <p className="text-sm text-text-muted mt-1">Ready to dive into a new world?</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-all text-sm font-medium shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Book
            </motion.button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {isLoading ? (
             <div className="animate-pulse space-y-8">
               <div className="h-64 bg-surface rounded-2xl border border-border w-full"></div>
             </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-8 pb-12">
              
              {/* Bento Top Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Col (Hero) */}
                <div className="lg:col-span-2 space-y-6">
                  {continueReadingBook ? (
                    <ContinueReadingBanner
                      book={continueReadingBook}
                      onLogProgress={() => setProgressBook(continueReadingBook)}
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[220px]">
                      <BookOpen className="w-12 h-12 text-primary/40 mb-4" />
                      <h3 className="text-xl font-serif font-bold mb-2">No active reads</h3>
                      <p className="text-sm text-text-muted mb-4">Start a new book to see it here.</p>
                    </div>
                  )}
                  
                  <StatsRow books={books} onReadingClick={() => {}} />
                </div>

                {/* Right Col (Quote & Goal) */}
                <div className="flex flex-col gap-6">
                  <QuoteCard />
                  
                  {/* Reading Goal Card */}
                  <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <h3 className="font-serif font-bold">Yearly Goal</h3>
                      </div>
                      <p className="text-sm text-text-muted">
                        You've read {booksFinishedThisYear} {booksFinishedThisYear === 1 ? 'book' : 'books'} this year.
                      </p>
                    </div>
                    <div className="mt-6">
                      <div className="flex justify-between text-xs mb-1.5 font-medium">
                        <span>Progress</span>
                        <span>{booksFinishedThisYear} / {goalTarget} Books</span>
                      </div>
                      <div className="h-2 bg-bg rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500" 
                          style={{ width: `${goalPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Favourites Row */}
              {favouriteBooks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-serif font-bold">Your Favourites</h2>
                    <Link to="/library" className="text-sm text-primary hover:underline flex items-center gap-1">
                      View All <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="flex gap-6 overflow-x-auto pb-4 snap-x scrollbar-hide">
                    {favouriteBooks.map((book, i) => (
                      <div key={book.id} className="w-32 md:w-40 flex-shrink-0 snap-start">
                        <BookCover book={book} index={i} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Heatmap */}
              <div>
                <ReadingHeatmap activity={readingActivity} />
              </div>
              
              {/* Bottom Action */}
              <div className="text-center pt-8">
                <Link to="/library" className="inline-flex items-center gap-2 bg-surface border border-border px-6 py-3 rounded-xl font-medium hover:border-primary transition-colors text-text shadow-sm hover:shadow-md">
                  Browse Full Library <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <AddBookModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      {progressBook && <UpdateProgressModal book={progressBook} onClose={() => setProgressBook(null)} />}
    </div>
  );
}