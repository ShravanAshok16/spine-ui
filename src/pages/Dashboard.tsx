import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ArrowRight, BookOpen, Flame, Sparkles, Heart, ArrowUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getMyLibrary, getSessionStats } from '../api/library';
import { StatsRow } from '../components/StatsRow';
import { ContinueReadingCard } from '../components/ContinueReadingCard';
import { QuoteCard } from '../components/QuoteCard';
import { Heatmap } from '../components/Heatmap';
import { BookCover } from '../components/BookCover';
import ThemeToggle from '../components/ThemeToggle';
import { Sidebar } from '../components/Sidebar';
import { NotificationBell } from '../components/NotificationBell';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { apiClient } from '../api/client';

export default function Dashboard() {
  const { user } = useAuth();
  const { openAddModal } = useUI();
  const navigate = useNavigate();

  const { data: books = [], isLoading: booksLoading } = useQuery({
    queryKey: ['library'],
    queryFn: () => getMyLibrary(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: sessionStats = [], isLoading: statsLoading } = useQuery({
    queryKey: ['sessionStats'],
    queryFn: getSessionStats,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });

  const { data: goalData } = useQuery({
    queryKey: ['yearlyGoal'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/Users/goal');
      return data;
    }
  });

  const goalTarget = goalData?.goal || 24;

  const readingBooks = useMemo(
    () =>
      books
        .filter((b) => b.status === 'Reading')
        .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()),
    [books]
  );
  
  const continueReadingBook = readingBooks.length > 0 ? readingBooks[0] : null;
  const favouriteBooks = useMemo(() => books.filter((b) => b.isFavourite), [books]);

  // 🔥 NEW: Filter books by Ownership
  const wishlistBooks = useMemo(() => books.filter((b) => b.ownership === 'Wishlist'), [books]);
  const lentOutBooks = useMemo(() => books.filter((b) => b.ownership === 'LentOut'), [books]);

  // 🔥 Excludes Finished books for recommendations
  const recommendedBooks = useMemo(() => {
    return books
      .filter(b => b.status !== 'Finished' && b.status !== 'DNF')
      .sort((a, b) => {
        if (a.ownership === 'Wishlist' && b.ownership !== 'Wishlist') return -1;
        if (b.ownership === 'Wishlist' && a.ownership !== 'Wishlist') return 1;
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      })
      .slice(0, 6);
  }, [books]);

  const booksFinishedThisYear = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return books.filter(
      (b) => b.status === 'Finished' && new Date(b.addedAt).getFullYear() === currentYear
    ).length;
  }, [books]);

  const goalPercentage = Math.min(100, (booksFinishedThisYear / goalTarget) * 100);

  const generateInsight = () => {
    const finishedThisYear = books.filter((b) => b.status === 'Finished').length;
    if (books.length === 0) return "Let's start building your library today.";
    if (finishedThisYear >= goalTarget) return "Incredible! You've hit your yearly goal.";
    if (finishedThisYear > 0) {
      const pace = (finishedThisYear / (new Date().getMonth() + 1)) * 12;
      if (pace > goalTarget)
        return `You're on track to beat your goal! (${finishedThisYear} / ${goalTarget} books).`;
      return `You're ${finishedThisYear} books into your ${goalTarget}-book goal. Keep going!`;
    }
    return 'Ready to dive into a new world? Your books are waiting.';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | Spine</title>
        <meta name="description" content="Your personal reading dashboard on Spine." />
      </Helmet>

      <div className="h-screen overflow-hidden flex bg-bg">
        <div className="flex-shrink-0 hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-20 border-b border-border bg-surface/80 backdrop-blur-md shadow-[0_1px_12px_-4px] shadow-primary/20 flex items-center justify-between px-6 md:px-8 gap-4 flex-shrink-0 relative z-10">
            <div className="flex flex-col min-w-0">
              <h1 className="text-xl md:text-2xl font-serif font-bold text-text truncate">
                {getGreeting()},{' '}
                {user?.lastName
                  ? `${user.lastName}, ${user.firstName}`
                  : user?.firstName || user?.displayName || 'Reader'}
              </h1>
              <p className="text-xs md:text-sm text-text-muted mt-1 truncate">{generateInsight()}</p>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <NotificationBell />
              <ThemeToggle />
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={openAddModal}
                className="hidden md:flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary-hover transition-all text-sm font-medium shadow-sm hover:shadow-md ml-2"
              >
                <Plus className="w-4 h-4" /> Add Book
              </motion.button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-12">
            {booksLoading || statsLoading ? (
              <div className="animate-pulse space-y-8">
                <div className="h-64 bg-surface rounded-2xl border border-border w-full"></div>
              </div>
            ) : (
              <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-12">
                
                {/* 1. TOP SECTION (Continue Reading + Quote + Goal) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {continueReadingBook ? (
                      <ContinueReadingCard book={continueReadingBook} />
                    ) : (
                      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-surface to-surface border border-border rounded-3xl p-6 md:p-10 text-center">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
                        <div className="relative">
                          <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-5 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                          </div>
                          <h3 className="text-xl md:text-2xl font-serif font-bold mb-2">No active reads</h3>
                          <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
                            Pick a book and start your next reading session. Your progress will appear here.
                          </p>
                          <button
                            onClick={openAddModal}
                            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
                          >
                            <Plus className="w-4 h-4" /> Add a Book
                          </button>
                        </div>
                      </div>
                    )}
                    <StatsRow books={books} onReadingClick={() => {}} />
                  </div>

                  <div className="flex flex-col gap-6">
                    <QuoteCard />
                    <div className="bg-surface/80 backdrop-blur-sm border border-border/60 rounded-2xl p-6 flex flex-col justify-between hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Flame className="w-5 h-5 text-orange-500" />
                          <h3 className="font-serif font-bold">Yearly Goal</h3>
                        </div>
                        <p className="text-sm text-text-muted">
                          You've read {booksFinishedThisYear} books this year.
                        </p>
                      </div>
                      <div className="mt-6">
                        <div className="flex justify-between text-xs mb-1.5 font-medium">
                          <span>Progress</span>
                          <span>{booksFinishedThisYear} / {goalTarget}</span>
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

                {/* 2. HEATMAP (Moved Up) */}
                <div className="pt-2">
                  <Heatmap data={sessionStats} />
                </div>

                {/* 3. OWNERSHIP CAROUSELS (Wishlist & Lent Out) */}
                {wishlistBooks.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-serif font-bold flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-500 fill-pink-500" /> Your Wishlist
                      </h2>
                      <Link to="/library?ownership=Wishlist" className="text-sm text-primary hover:underline flex items-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x scrollbar-hide">
                      {wishlistBooks.map((book, i) => (
                        <div key={book.id} className="w-32 md:w-40 flex-shrink-0 snap-start">
                          <BookCover book={book} index={i} onClick={() => navigate(`/books/${book.id}`)} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {lentOutBooks.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-serif font-bold flex items-center gap-2">
                        <ArrowUpRight className="w-5 h-5 text-orange-500" /> Lent Out
                      </h2>
                      <Link to="/library?ownership=LentOut" className="text-sm text-primary hover:underline flex items-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x scrollbar-hide">
                      {lentOutBooks.map((book, i) => (
                        <div key={book.id} className="w-32 md:w-40 flex-shrink-0 snap-start">
                          <BookCover book={book} index={i} onClick={() => navigate(`/books/${book.id}`)} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. FAVOURITES */}
                {favouriteBooks.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-serif font-bold">Your Favourites</h2>
                      <Link to="/library?filter=favourites" className="text-sm text-primary hover:underline flex items-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x scrollbar-hide">
                      {favouriteBooks.map((book, i) => (
                        <div key={book.id} className="w-32 md:w-40 flex-shrink-0 snap-start">
                          <BookCover book={book} index={i} onClick={() => navigate(`/books/${book.id}`)} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. RECOMMENDED FOR YOU */}
                {recommendedBooks.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-serif font-bold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-500" /> Recommended for You
                      </h2>
                      <Link to="/for-you" className="text-sm text-primary hover:underline flex items-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x scrollbar-hide">
                      {recommendedBooks.map((book, i) => (
                        <div key={book.id} className="w-32 md:w-40 flex-shrink-0 snap-start">
                          <BookCover book={book} index={i} onClick={() => navigate(`/books/${book.id}`)} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-center pt-8">
                  <Link
                    to="/library"
                    className="inline-flex items-center gap-2 bg-surface border border-border px-6 py-3 rounded-xl font-medium hover:border-primary transition-colors text-text shadow-sm hover:shadow-md"
                  >
                    Browse Full Library <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}